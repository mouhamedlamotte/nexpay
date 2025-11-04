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
import { Loader2 } from "lucide-react"
import type { Webhook } from "@/lib/types"
import { useEffect } from "react"
import { toast } from "sonner"
import { Textarea } from "../ui/textarea"

const formSchema = z.object({
  url: z.string().url("Must be a valid URL").optional(),
  header: z.string().min(1, "Header is required").optional(),
  description: z.string().optional(),
  secret: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface EditWebhookDialogProps {
  projectId: string
  webhook: Webhook
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditWebhookDialog({ projectId, webhook, open, onOpenChange, onSuccess }: EditWebhookDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: webhook.url,
      header: webhook.header,
      description: webhook.description,
      secret: "",
    },
  })

  useEffect(() => {
    form.reset({
      url: webhook.url,
      header: webhook.header,
      secret: "",
      description: webhook.description,
    })
  }, [webhook, form])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => projectSettingsApi.updateWebhook(projectId, webhook.id, values),
    onSuccess: () => {
      toast.success("Webhook updated successfully")
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update webhook")
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Webhook</DialogTitle>
          <DialogDescription>Update webhook configuration.</DialogDescription>
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
                    <Input {...field} />
                  </FormControl>
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
                        <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Webhook description" {...field} />
                  </FormControl>
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
                    <Input type="password" placeholder="Leave empty to keep current" {...field} />
                  </FormControl>
                  <FormDescription>Only fill if you want to update the secret</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending || !form.formState.isDirty || !form.formState.isValid}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
