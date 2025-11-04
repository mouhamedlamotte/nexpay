"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { providersApi } from "@/lib/api/providers"
import { Loader2, CheckCircle2, Shield } from "lucide-react"
import { toast } from "sonner"
import type { ConfigureWaveWebhookDto } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const waveWebhookSchema = z.object({
  authType: z.enum(["sharedSecret", "hmac"], {
    required_error: "Please select an authentication type",
  }),
  secret: z.string().min(20, "Secret must be at least 20 characters long"),
})

type WaveWebhookFormValues = z.infer<typeof waveWebhookSchema>

interface ConfigureWaveWebhookFormProps {
  onSuccess: () => void
}

export function ConfigureWaveWebhookForm({ onSuccess }: ConfigureWaveWebhookFormProps) {
  const form = useForm<WaveWebhookFormValues>({
    resolver: zodResolver(waveWebhookSchema),
    defaultValues: {
      authType: "hmac",
      secret: "",
    },
  })

  const { data: existingConfig } = useQuery({
    queryKey: ["wave-webhook-config"],
    queryFn: () => providersApi.getWaveWebhookConfig(),
    retry: false,
  })

  useEffect(() => {
    if (existingConfig?.data) {
      form.reset({
        authType: existingConfig.data.authType as "sharedSecret" | "hmac",
        secret: existingConfig.data.secretPreview || "",
      })
    }
  }, [existingConfig, form])

  const mutation = useMutation({
    mutationFn: (dto: ConfigureWaveWebhookDto) => providersApi.configureWaveWebhook(dto),
    onSuccess: () => {
      toast.success("Wave webhook configured successfully")
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to configure webhook")
    },
  })

  const onSubmit = (values: WaveWebhookFormValues) => {
    mutation.mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="authType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-semibold">Authentication Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="sharedSecret"
                    className={`cursor-pointer`}
                  >
                    <Card className={cn("p-6 hover:border-primary transition-colors", field.value === "sharedSecret" && "border border-primary")}>
                      <div className="flex items-start gap-4">
                        <RadioGroupItem value="sharedSecret" id="sharedSecret" className="mt-1" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <span className="font-semibold text-lg">Shared Secret</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Simple authentication using a shared secret key. Best for basic webhook verification.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Label>

                  <Label
                    htmlFor="hmac"
                    className={`cursor-pointer`}
                  >
                    <Card className={cn("p-6 hover:border-primary transition-colors", field.value === "hmac" && "border border-primary")}>
                      <div className="flex items-start gap-4">
                        <RadioGroupItem value="hmac" id="hmac" className="mt-1" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <span className="font-semibold text-lg">HMAC</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Advanced cryptographic authentication. Recommended for enhanced security and integrity
                            verification.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Label>
                </RadioGroup>
              </FormControl>
              <FormDescription>Choose the authentication method for webhook verification</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="secret"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Webhook Secret</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="wave_sn_WHS_xz4m6g8rjs9bshxy05xj4khcvjv7j3hcp4fbpvv6met0zdrjvezg"
                  {...field}
                />
              </FormControl>
              <FormDescription>Minimum 20 characters. Get this from your Wave dashboard.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={mutation.isPending || !form.formState.isValid || !form.formState.isDirty} className="w-full">
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Webhook Configuration
        </Button>
      </form>
    </Form>
  )
}
