"use client"

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
import { providersApi } from "@/lib/api/providers"
import { Loader2 } from "lucide-react"
import type { PaymentProvider } from "@/lib/types"
import { toast } from "sonner"

interface ToggleProviderDialogProps {
  provider: PaymentProvider
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ToggleProviderDialog({ provider, open, onOpenChange, onSuccess }: ToggleProviderDialogProps) {

  const mutation = useMutation({
    mutationFn: () => providersApi.toggle(provider.code, provider.isActive),
    onSuccess: () => {
      toast.success(provider.isActive ? "Provider deactivated successfully" : "Provider activated successfully")
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to toggle provider")
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{provider.isActive ? "Deactivate" : "Activate"} Provider</DialogTitle>
          <DialogDescription>
            Are you sure you want to {provider.isActive ? "deactivate" : "activate"}{" "}
            <strong>{provider.name}</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {provider.isActive ? "Deactivate" : "Activate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
