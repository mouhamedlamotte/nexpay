"use client"

import { useQuery, useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { projectSettingsApi } from "@/lib/api/project-settings"
import { Loader2, Save } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useProjectStore } from "@/stores/project.store"
import { toast } from "sonner"

const formSchema = z.object({
  successUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  failureUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>

export default function RedirectsPage() {
  const projectId = useProjectStore((state) => state.currentProject?.id!)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["redirects", projectId],
    queryFn: () => projectSettingsApi.getRedirects(projectId),
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
      successUrl: data?.data?.successUrl || "",
      failureUrl: data?.data?.failureUrl || "",
    },
  })

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const hasExisting = data?.data && Object.keys(data.data).length > 0
      return hasExisting
        ? projectSettingsApi.updateRedirects(projectId, values)
        : projectSettingsApi.createRedirects(projectId, values)
    },
    onSuccess: () => {
      toast.success("Redirect URLs updated successfully")
      refetch()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update redirect URLs")
    },
  })

  return (

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
                <form onSubmit={form.handleSubmit((values : FormValues) => mutation.mutate(values))} className="space-y-6">
                  {
                    [
                      {
                        name: "successUrl",
                        label: "Success URL",
                        placeholder: "https://example.com/success",
                        description: "Redirect URL after successful payment",
                      },
                      {
                        name: "failureUrl",
                        label: "Failure URL",
                        placeholder: "https://example.com/failure",
                        description: "Redirect URL after failed payment",
                      }
                    ].map(({ name, label, placeholder }) => (
                      <FormField
                        control={form.control}
                        name={name as keyof FormValues}
                        // eslint-disable-next-line
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{label}</FormLabel>
                            <FormControl>
                              <Input className="border-border" placeholder={placeholder} {...field} />
                            </FormControl>
                            <FormDescription></FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))
                  }
                  <Button type="submit" disabled={mutation.isPending || !form.formState.isDirty}>
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
  )
}
