"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Webhook } from "@/lib/types"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"

interface ViewWebhookDialogProps {
  webhook: Webhook
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewWebhookDialog({ webhook, open, onOpenChange }: ViewWebhookDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Webhook Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">URL</p>
            <p className="mt-1 font-mono text-sm">{webhook.url}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Header Name</p>
            <code className="mt-1 block rounded bg-muted px-2 py-1 text-sm">{webhook.header}</code>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Secret</p>
            <code className="mt-1 block rounded bg-muted px-2 py-1 text-sm">••••••••</code>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p className="mt-1 text-sm">{webhook.description || "No description"}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created At</p>
              <p className="mt-1 text-sm">{format(new Date(webhook.createdAt), "PPpp")}</p>
            </div>
            {
              webhook.updatedAt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                  <p className="mt-1 text-sm">{format(new Date(webhook.updatedAt), "PPpp")}</p>
                </div>
              )
            }
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
