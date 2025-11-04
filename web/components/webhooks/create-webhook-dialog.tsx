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
import { toast } from "sonner"
import { Textarea } from "../ui/textarea"

const formSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  description: z.string().optional(),
  header: z.string().min(1, "Header is required"),
  secret: z.string().min(1, "Secret is required"),
})

type FormValues = z.infer<typeof formSchema>

interface CreateWebhookDialogProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateWebhookDialog({ projectId, open, onOpenChange, onSuccess }: CreateWebhookDialogProps) {
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
    onSuccess: () => {
      form.reset()
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create webhook")
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  <FormLabel>Webhook URL</FormLabel>
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
                  <FormLabel>Secret</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter secret key" {...field} />
                  </FormControl>
                  <FormDescription>Secret key for webhook verification</FormDescription>
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
                Create Webhook
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
