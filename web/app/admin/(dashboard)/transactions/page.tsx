"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, Filter, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { transactionsApi } from "@/lib/api/transactions"
import { TransactionDetailsDialog } from "@/components/transactions/transaction-details-dialog"
import type { Transaction, TransactionStatus } from "@/lib/types"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { use } from "react"
import { useProjectStore } from "@/stores/project.store"

const statusColors: Record<TransactionStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  SUCCEEDED: "default",
  FAILED: "destructive",
  CANCELLED: "secondary",
  EXPIRED: "secondary",
  REFUNDED: "secondary",
}

export default function TransactionsPage() {
  const projectId  = useProjectStore((state) => state.currentProject?.id!)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<TransactionStatus | "all">("all")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", projectId, page, search, status],
    queryFn: () =>
      transactionsApi.getAll(projectId, {
        page,
        limit: 10,
        search,
        status: status !== "all" ? status : undefined,
      }),
  })

  return (
    <>

    <main className="flex-1 overflow-y-auto p-2 md:p-6 space-y-4">

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={(value) => setStatus(value as TransactionStatus | "all")}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SUCCEEDED">Succeeded</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
              <SelectItem value="REFUNDED">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
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
                  <TableCell colSpan={6} className="h-24 text-center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-1 text-xs">{transaction.reference}</code>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.payer.name}</div>
                        <div className="text-sm text-muted-foreground">{transaction.payer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {transaction.amount.toLocaleString()} {transaction.currency}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[transaction.status]}>{transaction.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(transaction.createdAt), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedTransaction(transaction)}>
                        <Eye className="h-4 w-4" />
                      </Button>
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
      </main>

      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <TransactionDetailsDialog
          transaction={selectedTransaction}
          open={!!selectedTransaction}
          onOpenChange={(open) => !open && setSelectedTransaction(null)}
        />
      )}
    </>
  )
}
