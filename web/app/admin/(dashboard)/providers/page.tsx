"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, Settings2, Power, PowerOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { providersApi } from "@/lib/api/providers"
import { ConfigureProviderDialog } from "@/components/providers/configure-provider-dialog"
import { ToggleProviderDialog } from "@/components/providers/toggle-provider-dialog"
import type { PaymentProvider } from "@/lib/types"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProvidersPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [configureProvider, setConfigureProvider] = useState<PaymentProvider | null>(null)
  const [toggleProvider, setToggleProvider] = useState<PaymentProvider | null>(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["providers", page, search],
    queryFn: () => providersApi.getAll({ page, limit: 10, search }),
  })

  return (
    <div>

      <div className="flex-1 space-y-4 p-6">
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
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[140px]"></TableHead>
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
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-24" />
                    </TableCell>
                  </TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
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
                      <Badge variant={provider.isActive ? "default" : "outline"}>
                        {provider.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(provider.updatedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setConfigureProvider(provider)}>
                          <Settings2 className="mr-2 h-4 w-4" />
                          Configure
                        </Button>
                        <Button
                          variant={provider.isActive ? "outline" : "default"}
                          size="icon"
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
      </div>

      {/* Dialogs */}
      {configureProvider && (
        <ConfigureProviderDialog
          provider={configureProvider}
          open={!!configureProvider}
          onOpenChange={(open) => !open && setConfigureProvider(null)}
          onSuccess={() => {
            refetch()
            setConfigureProvider(null)
          }}
        />
      )}
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
    </div>
  )
}
