
import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "NEXPAY AUTH",
  description: "Auth for NEXPAY payment gateway",
}


export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-500/20 to-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-bl from-purple-400/10 to-blue-400/10 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 h-full">
        <main className="flex-1 overflow-y-auto max-w-5xl mx-auto h-full">
          <div className="max-w-5xl mx-auto h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
