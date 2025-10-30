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
import { Loader2, Edit2 } from "lucide-react"
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
  const [editingFields, setEditingFields] = useState<Set<string>>(new Set())

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  // Check which fields have existing values
  const hasExistingSecret = (field: string): boolean => {
    try {
      if (typeof provider.secrets === "string" && provider.secrets.trim() !== "") {
        const parsed = JSON.parse(provider.secrets)
        return !!parsed[field]
      }
      if (typeof provider.secrets === "object" && provider.secrets !== null) {
        return !!(provider.secrets as Record<string, any>)[field]
      }
    } catch (e) {
      return false
    }
    return false
  }

  // Reset form when provider or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({ secrets: {} })
      setEditingFields(new Set())
    }
  }, [provider.id, open, form])

  const toggleEdit = (field: string) => {
    const newEditing = new Set(editingFields)
    if (newEditing.has(field)) {
      newEditing.delete(field)
      // Clear the field value when stopping edit
      form.setValue(`secrets.${field}`, "")
    } else {
      newEditing.add(field)
    }
    setEditingFields(newEditing)
  }

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      // Only send modified fields (non-empty values)
      const modifiedSecrets = Object.entries(values.secrets).reduce((acc, [key, value]) => {
        if (value && value.trim() !== "") {
          acc[key] = value
        }
        return acc
      }, {} as Record<string, string>)

      return providersApi.update({
        providerId: provider.id,
        secrets: modifiedSecrets,
      })
    },
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
              <div>
                <FormLabel>API Secrets</FormLabel>
                <FormDescription>
                  Enter the required API credentials for {provider.name}
                </FormDescription>
              </div>
              
              {provider.secretsFields.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No secrets required for this provider.
                </div>
              ) : (
                <div className="space-y-4">
                  {provider.secretsFields.map((field) => {
                    const hasValue = hasExistingSecret(field)
                    const isEditing = editingFields.has(field)
                    
                    return (
                      <div key={field} className="space-y-2">
                        <FormLabel htmlFor={field} className="text-sm font-medium">
                          {field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          <span className="ml-1 text-destructive">*</span>
                        </FormLabel>
                        
                        {hasValue && !isEditing ? (
                          <div className="flex gap-2">
                            <Input
                              value="••••••••••••••••"
                              disabled
                              className="w-full"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => toggleEdit(field)}
                              title="Edit this secret"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Input
                              id={field}
                              type="password"
                              placeholder={hasValue ? "Enter new value to update" : `Enter ${field}`}
                              {...form.register(`secrets.${field}`)}
                              className="w-full"
                            />
                            {hasValue && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => toggleEdit(field)}
                                title="Cancel editing"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
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