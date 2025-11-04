"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { providersApi } from "@/lib/api/providers"
import { Loader2, CheckCircle2, Settings, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import type { ConfigureOmWebhookDto } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

const omWebhookSchema = z
  .object({
    autoConfigure: z.boolean(),
    secret: z.string().optional(),
  })
  .refine(
    (data) => {
      // Secret is required when autoConfigure is false
      if (!data.autoConfigure) {
        return data.secret && data.secret.length >= 20
      }
      return true
    },
    {
      message: "Secret must be at least 20 characters when auto-configure is disabled",
      path: ["secret"],
    },
  )

type OmWebhookFormValues = z.infer<typeof omWebhookSchema>

interface ConfigureOmWebhookFormProps {
  onSuccess: () => void
}

export function ConfigureOmWebhookForm({ onSuccess }: ConfigureOmWebhookFormProps) {
  const form = useForm<OmWebhookFormValues>({
    resolver: zodResolver(omWebhookSchema),
    defaultValues: {
      autoConfigure: false,
      secret: "",
    },
  })

  const autoConfigure = form.watch("autoConfigure")

  const { data: existingConfig } = useQuery({
    queryKey: ["om-webhook-config"],
    queryFn: () => providersApi.getOmWebhookConfig(),
    retry: false,
  })

  useEffect(() => {
    if (existingConfig?.data) {
      form.reset({
        autoConfigure: true,
        secret: existingConfig.data.secretPreview || "",
      })
    }
  }, [existingConfig, form])

  const mutation = useMutation({
    mutationFn: (dto: ConfigureOmWebhookDto) => providersApi.configureOmWebhook(dto),
    onSuccess: () => {
      toast.success("Orange Money webhook configured successfully")
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to configure webhook")
    },
  })

  const onSubmit = (values: OmWebhookFormValues) => {
    const nw : {secret ?: string, autoConfigure: boolean} = {
      autoConfigure: values.autoConfigure,
    }
    if (values.secret) {
      nw.secret = values.secret
    }

    mutation.mutate(nw as ConfigureOmWebhookDto)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="autoConfigure"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Configuration Mode</FormLabel>
              <FormControl>
                <label className="cursor-pointer">
                  <Card
                    className={`p-6 hover:border-primary transition-colors ${
                      field.value ? "ring-2 ring-primary border-primary" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1 border border-border"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Settings className="h-5 w-5 text-primary" />
                          <span className="font-semibold text-lg">Auto-configure webhook in Orange Money</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          When enabled, the webhook secret will be automatically added to your Orange Money account. 
                          You can provide your own secret, or leave it empty to generate one automatically.
                        </p>
                        {field.value && (
                          <div className="flex items-center gap-1 text-primary text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            Auto-configuration enabled
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </label>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!autoConfigure && (
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              Auto-configure is disabled. You must provide a webhook secret and manually add it to your Orange Money dashboard.
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="secret"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Webhook Secret (API Key) {!autoConfigure && <span className="text-destructive">*</span>}
              </FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder={autoConfigure ? "Leave empty to auto-generate" : "om_webhook_secret_abc123xyz (required)"} 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {autoConfigure ? (
                  <>Minimum 20 characters. Leave empty to generate automatically, or provide your own secret.</>
                ) : (
                  <>
                    <span className="text-destructive font-medium">Required.</span> Minimum 20 characters. 
                    You must manually add this secret to your Orange Money dashboard.
                  </>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={mutation.isPending || !form.formState.isValid || !form.formState.isDirty} 
          className="w-full"
        >
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Webhook Configuration
        </Button>
      </form>
    </Form>
  )
}