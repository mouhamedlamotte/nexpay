"use client";

import { use, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Power,
  PowerOff,
  XCircle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { providersApi } from "@/lib/api/providers";
import { ConfigureWaveWebhookForm } from "@/features/providers/components/configure-wave-webhook-form";
import { ConfigureOmWebhookForm } from "@/features/providers/components/configure-om-webhook-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { ConfigureSecretsForm } from "@/features/providers/components/configure-secrets-form";
import { TestPaymentDialog } from "@/features/providers/components/test-payment-dialog";
import { cn } from "@/lib/utils";
import { ToggleProviderDialog } from "@/components/providers/toggle-provider-dialog";
import { toast } from "sonner";

export default function ProviderConfigPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [toggleProvider, setToggleProvider] = useState(false);

  const {
    data: provider,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["provider", code],
    queryFn: () => providersApi.getByCode(code),
  });

  const resetSecretsMutation = useMutation({
    mutationFn: () => providersApi.resetSecrets(code),
    onSuccess: () => {
      toast.success("Secrets reset successfully");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reset secrets");
    },
  });

  const resetWebhooksMutation = useMutation({
    mutationFn: () => providersApi.resetWebhookConfig(code),
    onSuccess: () => {
      toast.success("Webhook configuration reset successfully");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reset webhooks");
    },
  });

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!provider?.data) {
    return (
      <div className="flex-1 p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Provider not found</p>
            <Button
              variant="outline"
              className="mt-4 bg-transparent"
              onClick={() => router.push("/admin/providers")}
            >
              Back to Providers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const providerData = provider.data;

  return (
    <main className="flex-1 overflow-y-auto p-2 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/providers")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{providerData.name}</h1>
          <p className="text-sm text-muted-foreground">
            Configure secrets and webhook settings for this provider
          </p>
        </div>
        {providerData.isActive && (
          <Button variant="outline" onClick={() => setShowTestDialog(true)}>
            <Zap className="mr-2 h-4 w-4" />
            Test Payment
          </Button>
        )}

        <Button
          className={cn(
            providerData.isActive
              ? "bg-destructive hover:bg-destructive/90"
              : "bg-green-600 hover:bg-green-700"
          )}
          onClick={() => setToggleProvider(true)}
        >
          {providerData.isActive ? "Deactivate" : "Activate"}
          {providerData.isActive ? (
            <PowerOff className="h-4 w-4" />
          ) : (
            <Power className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Status Indicators */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3 flex-row">
            <CardTitle className="text-sm font-medium">
              Secrets Configuration
            </CardTitle>
            {
              providerData.hasValidSecretConfig && (
                  <Button
                    variant='destructive'
                    size="sm"
                    className="ml-auto"
                    onClick={() => resetSecretsMutation.mutate()}
                  >
                    {resetSecretsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Reset Secrets
                  </Button>
              )
            }
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {providerData.hasValidSecretConfig ? (
                <div className="flex">
                  <div className="inline-flex space-x-4">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-600">Configured</span>
                  </div>
                </div>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Not configured
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 flex-row">
            <CardTitle className="text-sm font-medium">
              Webhook Configuration
            </CardTitle>
              {
              providerData.hasValidWebhookConfig && (
                  <Button
                    variant='destructive'
                    size="sm"
                    className="ml-auto"
                    onClick={() => resetWebhooksMutation.mutate()}
                  >
                    {resetWebhooksMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Reset Webhook Config
                  </Button>
              )
            }
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {providerData.hasValidWebhookConfig ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-600">Configured</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Not configured
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Tabs */}
      <Tabs defaultValue="secrets" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="secrets">Configure Secrets</TabsTrigger>
          <TabsTrigger value="webhook">Configure Webhook</TabsTrigger>
        </TabsList>

        <TabsContent value="secrets" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Secrets Configuration</CardTitle>
              <CardDescription>
                Configure the API credentials and secrets for{" "}
                {providerData.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConfigureSecretsForm
                provider={providerData}
                onSuccess={refetch}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhook" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Configure webhook settings for {providerData.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {code === "wave" && (
                <ConfigureWaveWebhookForm onSuccess={refetch} />
              )}
              {code === "om" && <ConfigureOmWebhookForm onSuccess={refetch} />}
              {code !== "wave" && code !== "om" && (
                <p className="text-sm text-muted-foreground">
                  Webhook configuration is not available for this provider.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {showTestDialog && (
        <TestPaymentDialog
          provider={providerData}
          open={showTestDialog}
          onOpenChange={setShowTestDialog}
        />
      )}
      {/* Toggle Dialog */}
      {toggleProvider && (
        <ToggleProviderDialog
          provider={providerData}
          open={toggleProvider}
          onOpenChange={(open) => !open && setToggleProvider(false)}
          onSuccess={() => {
            refetch();
            setToggleProvider(false);
          }}
        />
      )}
    </main>
  );
}
