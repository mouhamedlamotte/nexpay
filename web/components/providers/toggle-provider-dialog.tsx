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
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import type { PaymentProvider } from "@/lib/types"

interface ToggleProviderDialogProps {
  provider: PaymentProvider
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ToggleProviderDialog({ provider, open, onOpenChange, onSuccess }: ToggleProviderDialogProps) {
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: () => providersApi.toggle(provider.id, provider.isActive),
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Provider ${provider.isActive ? "deactivated" : "activated"} successfully`,
      })
      onSuccess()
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to toggle provider status",
        variant: "destructive",
      })
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
