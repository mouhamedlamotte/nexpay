"use client"

import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Plus, MoreVertical, Pencil, Eye, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { settingsApi } from "@/lib/api/settings"
import { CreateWebhookDialog } from "@/components/webhooks/create-webhook-dialog"
import { EditWebhookDialog } from "@/components/webhooks/edit-webhook-dialog"
import { ViewWebhookDialog } from "@/components/webhooks/view-webhook-dialog"
import type { Webhook } from "@/lib/types"
import { format, formatDate } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { use } from "react"
import { useProjectStore } from "@/stores/project.store"
import { toast } from "sonner"

export default function WebhooksPage() {
  const projectId  = useProjectStore(s=>s.currentProject?.id!)
  const [page, setPage] = useState(1)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editWebhook, setEditWebhook] = useState<Webhook | null>(null)
  const [viewWebhook, setViewWebhook] = useState<Webhook | null>(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["webhooks", projectId, page],
    queryFn: () => settingsApi.getWebhooks(projectId, { page, limit: 10 }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => settingsApi.deleteWebhook(projectId, id),
    onSuccess: () => {
      toast.success("Webhook deleted successfully")
      refetch()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete webhook")
    },
  })

  const handleDeleteWebhook = (id: string) => {
    deleteMutation.mutate(id)
  }

  return (
    <div className="space-y-4 flex flex-col overflow-hidden">
      <Button onClick={() => setCreateDialogOpen(true)} className="ml-auto w-full md:w-auto">
        <Plus className="mr-2 h-4 w-4" />
        Nouveau webhook
      </Button>
      <div>
        <Card className="">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Header</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-64" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No webhooks configured.
                  </TableCell>
                </TableRow>
              ) : (
                
                data?.data.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell className="font-mono text-sm">{webhook.url}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-1 text-xs">{webhook.header}</code>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(webhook.createdAt, "dd MMMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewWebhook(webhook)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditWebhook(webhook)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => handleDeleteWebhook(webhook.id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {data.pagination.currentPage} of {data.pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data.pagination.hasPreviousPage}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.pagination.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateWebhookDialog
        projectId={projectId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          refetch()
          setCreateDialogOpen(false)
          toast.success("Webhook added successfully")
        }}
      />
      {editWebhook && (
        <EditWebhookDialog
          projectId={projectId}
          webhook={editWebhook}
          open={!!editWebhook}
          onOpenChange={(open) => !open && setEditWebhook(null)}
          onSuccess={() => {
            refetch()
            setEditWebhook(null)
          }}
        />
      )}
      {viewWebhook && (
        <ViewWebhookDialog
          webhook={viewWebhook}
          open={!!viewWebhook}
          onOpenChange={(open) => !open && setViewWebhook(null)}
        />
      )}
    </div>
  )
}
