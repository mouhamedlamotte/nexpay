"use client"

import { useQuery, useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { settingsApi } from "@/lib/api/settings"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { use } from "react"
import { useProjectStore } from "@/stores/project.store"

const formSchema = z.object({
  successUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  failureUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  cancelUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>

export default function RedirectsPage() {
  const projectId = useProjectStore((state) => state.currentProject?.id!)
  const { toast } = useToast()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["redirects", projectId],
    queryFn: () => settingsApi.getRedirects(projectId),
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
      successUrl: data?.data?.successUrl || "",
      failureUrl: data?.data?.failureUrl || "",
      cancelUrl: data?.data?.cancelUrl || "",
    },
  })

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const hasExisting = data?.data && Object.keys(data.data).length > 0
      return hasExisting
        ? settingsApi.updateRedirects(projectId, values)
        : settingsApi.createRedirects(projectId, values)
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Redirect URLs updated successfully",
      })
      refetch()
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update redirect URLs",
        variant: "destructive",
      })
    },
  })

  return (
    <div >

      <div className="flex-1 p-6">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Callback Configuration</CardTitle>
            <CardDescription>
              Set the URLs where users will be redirected after payment completion, failure, or cancellation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="successUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Success URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/success" {...field} />
                        </FormControl>
                        <FormDescription>Redirect URL after successful payment</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="failureUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Failure URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/failure" {...field} />
                        </FormControl>
                        <FormDescription>Redirect URL after failed payment</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cancelUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cancel URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/cancel" {...field} />
                        </FormControl>
                        <FormDescription>Redirect URL when payment is cancelled</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
