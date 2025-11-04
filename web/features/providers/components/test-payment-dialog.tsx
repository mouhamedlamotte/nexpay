"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { Loader2, Copy, Check, ExternalLink, Zap } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { providersApi } from "@/lib/api/providers"
import type { PaymentProvider, TestPaymentResponse } from "@/lib/types"
import { useProjectStore } from "@/stores/project.store"
import { toast } from "sonner"
import Link from "next/link"
import QRCode from "react-qr-code"

const testPaymentSchema = z.object({
  amount: z.coerce.number().min(10, "Amount must be at least 10"),
  phone: z
    .string()
    .regex(/^\+?[0-9]{8,15}$/, "Invalid phone number format").optional(),
  projectId: z.string().min(1, "Project ID is required"),
})

type TestPaymentFormData = z.infer<typeof testPaymentSchema>

interface TestPaymentDialogProps {
  provider: PaymentProvider
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TestPaymentDialog({ provider, open, onOpenChange }: TestPaymentDialogProps) {
  const projectId = useProjectStore(s=>s.currentProject?.id)
  const [paymentResult, setPaymentResult] = useState<TestPaymentResponse | null>(null)
  const [copied, setCopied] = useState(false)

  const form = useForm<TestPaymentFormData>({
    resolver: zodResolver(testPaymentSchema),
    defaultValues: {
      amount: 10,
      phone: "+22177000000",
      projectId,
    },
  })

  const testMutation = useMutation({
    mutationFn: (data: TestPaymentFormData) => providersApi.testPayment(provider.code, data),
    onSuccess: (response) => {

      setPaymentResult(response.data)
      toast.success("Payment session created successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to initiate test payment")
    },
  })

  const handleSubmit = (data: TestPaymentFormData) => {
    testMutation.mutate(data)
  }

  const handleCopyUrl = () => {
    if (paymentResult?.checkoutUrl) {
      navigator.clipboard.writeText(paymentResult.checkoutUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("URL copied to clipboard")
    }
  }

  const handleReset = () => {
    setPaymentResult(null)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Test Payment - {provider.name}</DialogTitle>
          <DialogDescription>
            {paymentResult
              ? "Payment session created successfully. Use the QR code or URL to complete the payment."
              : "Enter test payment details to initiate a payment session"}
          </DialogDescription>
        </DialogHeader>

            
        {!paymentResult ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5000" {...field} />
                    </FormControl>
                    <FormDescription>Amount to pay (minimum 100)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+22177123456" {...field} />
                    </FormControl>
                    <FormDescription>Phone number of the payer (with country code)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={testMutation.isPending}>
                  {testMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Test Payment
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-6">
            {/* QR Code */}
            <div className="flex justify-center rounded-lg borde p-6">
            <div className="rounded-lg bg-white p-4">
              <QRCode value={paymentResult.checkoutUrl} size={200} level="L" />
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Expires At</p>
                <p className="text-sm text-destructive">{new Date(paymentResult.expiresAt).toLocaleString()}</p>
              </div>

              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Checkout URL</p>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyUrl}>
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => window.open(paymentResult.checkoutUrl, "_blank")}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="break-all text-xs text-muted-foreground">{paymentResult.checkoutUrl}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleReset}>
              <Zap className="mr-2 h-4 w-4" />  Test Again
              </Button>
              <Button variant="destructive" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button>
                <Link href={paymentResult.checkoutUrl} target="_blank">
                  Pay Now
                </Link>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
