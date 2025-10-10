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
import { settingsApi } from "@/lib/api/settings"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import type { Webhook } from "@/lib/types"
import { useEffect } from "react"

const formSchema = z.object({
  url: z.string().url("Must be a valid URL").optional(),
  header: z.string().min(1, "Header is required").optional(),
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
  const { toast } = useToast()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: webhook.url,
      header: webhook.header,
      secret: "",
    },
  })

  useEffect(() => {
    form.reset({
      url: webhook.url,
      header: webhook.header,
      secret: "",
    })
  }, [webhook, form])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => settingsApi.updateWebhook(projectId, webhook.id, values),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Webhook updated successfully",
      })
      onSuccess()
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update webhook",
        variant: "destructive",
      })
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
              <Button type="submit" disabled={mutation.isPending}>
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
