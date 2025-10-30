import React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";
import { setCookie } from "cookies-next";
import { useMutation } from "@tanstack/react-query";
import { AuthApi } from "@/lib/api/auth";

const loginSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

const LoginForm = () => {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin/projects";
  const [showPassword, setShowPassword] = React.useState(false);

  const loginMutatation = useMutation({
    mutationFn: AuthApi.login,
    onSuccess: (data) => {
      setCookie("access_token", data.access_token);
      window.location.href = next;
    }
  });

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    loginMutatation.mutateAsync(values);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse e-mail</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Adresse e-mail ou numéro mobile"
                    className="h-12 border-border"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      className="h-12 border-border"
                      placeholder="Mot de passe"
                      disabled={loginMutatation.isPending}
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loginMutatation.isPending}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full h-12" disabled={loginMutatation.isPending}>
            {loginMutatation.isPending ? "Chargement..." : "Suivant"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LoginForm;
