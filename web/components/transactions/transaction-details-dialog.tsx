"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { Transaction, TransactionStatus } from "@/lib/types"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"

const statusColors: Record<TransactionStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  SUCCEEDED: "default",
  FAILED: "destructive",
  CANCELLED: "secondary",
  EXPIRED: "secondary",
  REFUNDED: "secondary",
}

interface TransactionDetailsDialogProps {
  transaction: Transaction
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionDetailsDialog({ transaction, open, onOpenChange }: TransactionDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Status and Amount */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={statusColors[transaction.status]} className="mt-1">
                {transaction.status}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-2xl font-bold">
                {transaction.amount.toLocaleString()} {transaction.currency}
              </p>
            </div>
          </div>

          <Separator />

          {/* Transaction Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Reference</p>
              <code className="mt-1 block rounded bg-muted px-2 py-1 text-sm">{transaction.reference}</code>
            </div>
            {transaction.providerTransactionId && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Provider Transaction ID</p>
                <code className="mt-1 block rounded bg-muted px-2 py-1 text-sm">
                  {transaction.providerTransactionId}
                </code>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Client Reference</p>
              <p className="mt-1 text-sm">{transaction.clientReference}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">User ID</p>
              <p className="mt-1 text-sm">{transaction.payer?.userId}</p>
            </div>
          </div>

          <Separator />

          {/* Customer Info */}
          <div>
            <h4 className="mb-3 font-semibold">Customer Information</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="mt-1 text-sm">{transaction.payer?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="mt-1 text-sm">{transaction.payer?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="mt-1 text-sm">{transaction.payer?.phone}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created At</p>
              <p className="mt-1 text-sm">{format(new Date(transaction.createdAt), "PPpp")}</p>
            </div>
            {transaction.resolvedAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved At</p>
                <p className="mt-1 text-sm">{format(new Date(transaction.resolvedAt), "PPpp")}</p>
              </div>
            )}
            {transaction.expiresAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expires At</p>
                <p className="mt-1 text-sm">{format(new Date(transaction.expiresAt), "PPpp")}</p>
              </div>
            )}
          </div>

          {/* Metadata */}
          {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="mb-3 font-semibold">Metadata</h4>
                <pre className="rounded-lg bg-muted p-4 text-xs overflow-auto">
                  {JSON.stringify(transaction.metadata, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
