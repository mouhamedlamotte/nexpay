"use client";

import type React from "react";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { providersApi } from "@/lib/api/providers";
import { Edit2, Loader2 } from "lucide-react";
import type { PaymentProvider } from "@/lib/types";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormLabel, FormDescription } from "@/components/ui/form"


const formSchema = z.object({
  secrets: z.record(z.string()),
})

type FormValues = z.infer<typeof formSchema>

interface ConfigureSecretsFormProps {
  provider: PaymentProvider;
  onSuccess: () => void;
}

export function ConfigureSecretsForm({
  provider,
  onSuccess,
}: ConfigureSecretsFormProps) {
  const [editingFields, setEditingFields] = useState<Set<string>>(new Set());

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  // Check which fields have existing values
  const hasExistingSecret = (field: string): boolean => {
    try {
      const secrets = provider.secrets as unknown;
      if (typeof secrets === "string" && (secrets as string).trim() !== "") {
        const parsed = JSON.parse(secrets as string);
        return !!parsed?.[field];
      }
      if (typeof secrets === "object" && secrets !== null) {
        return !!(secrets as Record<string, any>)[field];
      }
    } catch (e) {
      return false;
    }
    return false;
  };


  const toggleEdit = (field: string) => {
    const newEditing = new Set(editingFields);
    if (newEditing.has(field)) {
      newEditing.delete(field);
      // Clear the field value when stopping edit
      form.setValue(`secrets.${field}`, "");
    } else {
      newEditing.add(field);
    }
    setEditingFields(newEditing);
  };

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      // Only send modified fields (non-empty values)
      const modifiedSecrets = Object.entries(values.secrets).reduce(
        (acc, [key, value]) => {
          if (value && value.trim() !== "") {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, string>
      );

      return providersApi.updateSecrets(provider.code, modifiedSecrets);
    },
    onSuccess: () => {
      toast.success("Provider configuration updated successfully");
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to update provider configuration"
      );
    },
  });

  return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
            <div className="space-y-4">
              <div>
                <FormLabel>API Secrets</FormLabel>
                <FormDescription>
                  Enter the required API credentials for {provider.name}
                </FormDescription>
              </div>
              
              {provider.secretsFields.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No secrets required for this provider.
                </div>
              ) : (
                <div className="space-y-4">
                  {provider.secretsFields.map((field) => {
                    const hasValue = hasExistingSecret(field)
                    const isEditing = editingFields.has(field)
                    
                    return (
                      <div key={field} className="space-y-2">
                        <FormLabel htmlFor={field} className="text-sm font-medium">
                          {field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          <span className="ml-1 text-destructive">*</span>
                        </FormLabel>
                        
                        {hasValue && !isEditing ? (
                          <div className="flex gap-2">
                            <Input
                              value="••••••••••••••••"
                              disabled
                              className="w-full"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => toggleEdit(field)}
                              title="Edit this secret"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Input
                              id={field}
                              type="password"
                              placeholder={hasValue ? "Enter new value to update" : `Enter ${field}`}
                              {...form.register(`secrets.${field}`)}
                              className="w-full"
                            />
                            {hasValue && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => toggleEdit(field)}
                                title="Cancel editing"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <div>
              <Button type="submit" disabled={mutation.isPending || !form.formState.isValid || !form.formState.isDirty}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Configuration
              </Button>
            </div>
          </form>
        </Form>
  );
}
