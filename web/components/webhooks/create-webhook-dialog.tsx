"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { projectSettingsApi } from "@/lib/api/project-settings"
import { AlertTriangle, Check, Copy, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "../ui/textarea"

const formSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  description: z.string().optional(),
  header: z.string().min(1, "Header is required"),
  secret: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CreateWebhookDialogProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateWebhookDialog({ projectId, open, onOpenChange, onSuccess }: CreateWebhookDialogProps) {
  const [createdWebhook, setCreatedWebhook] = useState<{ id: string; secret: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      description: "",
      header: "x-webhook-secret",
      secret: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (values: FormValues) => projectSettingsApi.createWebhook(projectId, values),
    onSuccess: (response: any) => {
      setCreatedWebhook({
        id: response.data.id,
        secret: response.data.secret,
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create webhook")
    },
  })

  const handleCopySecret = async () => {
    if (createdWebhook?.secret) {
      await navigator.clipboard.writeText(createdWebhook.secret)
      setCopied(true)
      toast.success("Secret copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    form.reset()
    setCreatedWebhook(null)
    setCopied(false)
    onOpenChange(false)
    if (createdWebhook) {
      onSuccess()
    }
  }

  if (createdWebhook) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Webhook Created Successfully</DialogTitle>
            <DialogDescription>
              Your webhook secret is shown below. Copy it now as it won't be shown again.
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This secret will only be shown once. Make sure to copy and store it in a safe place.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Webhook ID</label>
              <div className="mt-1.5 rounded-md bg-muted px-3 py-2 font-mono text-sm">{createdWebhook.id}</div>
            </div>

            <div>
              <label className="text-sm font-medium">Webhook Secret</label>
              <div className="mt-1.5 flex gap-2">
                <div className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-sm break-all">
                  {createdWebhook.secret}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopySecret}
                  className="shrink-0 bg-transparent"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>I've Saved the Secret</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Webhook</DialogTitle>
          <DialogDescription>Add a new webhook endpoint to receive payment events.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/webhook" {...field} />
                  </FormControl>
                  <FormDescription>The endpoint that will receive webhook events</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Webhook description" {...field} />
                  </FormControl>
                  <FormDescription>Add a description to help you remember what this webhook does</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="header"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Header Name</FormLabel>
                  <FormControl>
                    <Input placeholder="x-webhook-secret" {...field} />
                  </FormControl>
                  <FormDescription>The header name for the secret</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret (Optional)</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Leave blank to auto-generate" {...field} />
                  </FormControl>
                  <FormDescription>
                    Secret key for webhook verification. Leave blank to auto-generate a secure secret.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Webhook
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
