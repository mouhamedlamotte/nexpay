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
import { Form, FormLabel, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { providersApi } from "@/lib/api/providers"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Trash2 } from "lucide-react"
import type { PaymentProvider } from "@/lib/types"
import { useEffect, useState } from "react"

const formSchema = z.object({
  secrets: z.record(z.string()),
})

type FormValues = z.infer<typeof formSchema>

interface ConfigureProviderDialogProps {
  provider: PaymentProvider
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ConfigureProviderDialog({ provider, open, onOpenChange, onSuccess }: ConfigureProviderDialogProps) {
  const { toast } = useToast()
  const [secretFields, setSecretFields] = useState<Array<{ key: string; value: string }>>(
    Object.entries(
      typeof provider.secrets === "string" && provider.secrets.trim() !== ""
        ? JSON.parse(provider.secrets)
        : {}
    ).map(([key, value]) => ({ key, value: value as string })),
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      secrets: JSON.parse(JSON.stringify(provider.secrets || {})),
    },
  })

  useEffect(() => {
    const secrets = secretFields.reduce(
      (acc, field) => {
        if (field.key) acc[field.key] = field.value
        return acc
      },
      {} as Record<string, string>,
    )
    form.setValue("secrets", secrets)
  }, [secretFields, form])

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      providersApi.update({
        providerId: provider.id,
        secrets: values.secrets,
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Provider configuration updated successfully",
      })
      onSuccess()
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update provider configuration",
        variant: "destructive",
      })
    },
  })

  const addSecretField = () => {
    setSecretFields([...secretFields, { key: "", value: "" }])
  }

  const removeSecretField = (index: number) => {
    setSecretFields(secretFields.filter((_, i) => i !== index))
  }

  const updateSecretField = (index: number, field: "key" | "value", value: string) => {
    const updated = [...secretFields]
    updated[index][field] = value
    setSecretFields(updated)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure {provider.name}</DialogTitle>
          <DialogDescription>Update API credentials and secrets for this payment provider.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>API Secrets</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={addSecretField}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Secret
                </Button>
              </div>
              <FormDescription>
                Add key-value pairs for API credentials (e.g., client_id, client_secret, api_key)
              </FormDescription>
              {secretFields.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No secrets configured. Click "Add Secret" to add credentials.
                </div>
              ) : (
                <div className="space-y-3">
                  {secretFields.map((field, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Key (e.g., client_id)"
                        value={field.key}
                        onChange={(e) => updateSecretField(index, "key", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Value"
                        type="password"
                        value={field.value}
                        onChange={(e) => updateSecretField(index, "value", e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSecretField(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Configuration
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
