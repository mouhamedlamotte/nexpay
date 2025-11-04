"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, Settings2, Power, PowerOff, CheckCircle2, XCircle, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { providersApi } from "@/lib/api/providers"
import { ToggleProviderDialog } from "@/components/providers/toggle-provider-dialog"
import type { PaymentProvider } from "@/lib/types"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { TestPaymentDialog } from "@/features/providers/components/test-payment-dialog"

export default function ProvidersPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [toggleProvider, setToggleProvider] = useState<PaymentProvider | null>(null)
  const [testProvider, setTestProvider] = useState<PaymentProvider | null>(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["providers", page, search],
    queryFn: () => providersApi.getAll({ page, limit: 10, search }),
  })

  return (
    <>
      <main className="flex-1 overflow-y-auto p-2 md:p-6 space-y-4">
        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search providers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Secrets</TableHead>
                <TableHead>Webhook</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[140px]">Actions</TableHead>
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
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-24" />
                    </TableCell>
                  </TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No providers found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-1 text-xs">{provider.code}</code>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {provider.hasValidSecretConfig ? (
                          <div className="flex items-center gap-1.5 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-sm">Configured</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-red-500">
                            <XCircle className="h-4 w-4" />
                            <span className="text-sm">Not Configured</span>
                          </div>
                        )}
                        {provider.hastSecretTestPassed ? (
                          <div className="flex items-center gap-1.5 text-green-600">
                            <Zap className="h-4 w-4" />
                            <span className="text-sm">Tested</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-red-500">
                            <Zap className="h-4 w-4" />
                            <span className="text-sm">Not Tested</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {provider.hasValidWebhookConfig ? (
                          <div className="flex items-center gap-1.5 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-sm">Configured</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-red-500">
                            <XCircle className="h-4 w-4" />
                            <span className="text-sm">Not Configured</span>
                          </div>
                        )}
                        {provider.hasWebhookTestPassed ? (
                          <div className="flex items-center gap-1.5 text-green-600">
                            <Zap className="h-4 w-4" />
                            <span className="text-sm">Tested</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-red-500">
                            <Zap className="h-4 w-4" />
                            <span className="text-sm">Not Tested</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={provider.isActive ? "default" : "outline"}>
                        {provider.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(provider.updatedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-end">
                        {provider.isActive && (
                          <Button variant="outline" size="sm" onClick={() => setTestProvider(provider)}>
                            <Zap className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/providers/${provider.code}`)}
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className={cn(
                            provider.isActive
                              ? "bg-destructive hover:bg-destructive/90"
                              : "bg-green-600 hover:bg-green-700",
                          )}
                          onClick={() => setToggleProvider(provider)}
                        >
                          {provider.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </Button>
                      </div>
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

      {/* Toggle Dialog */}
      {toggleProvider && (
        <ToggleProviderDialog
          provider={toggleProvider}
          open={!!toggleProvider}
          onOpenChange={(open) => !open && setToggleProvider(null)}
          onSuccess={() => {
            refetch()
            setToggleProvider(null)
          }}
        />
      )}

      {/* Test Payment Dialog */}
      {testProvider && (
        <TestPaymentDialog
          provider={testProvider}
          open={!!testProvider}
          onOpenChange={(open) => !open && setTestProvider(null)}
        />
      )}
    </>
  )
}
