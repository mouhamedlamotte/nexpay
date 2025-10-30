"use client"

import LoginForm from "@/components/auth/login-form"
import { Card } from "@/components/ui/card"

export default function LoginPage() {

  return (
    <div className="py-10 flex items-center justify-center min-h-screen">
        <Card className="">
          <div className="w-full md:w-1/2 p-8 md:px-12 relative flex flex-col justify-center items-start md:min-w-lg">
            <div className="mb-8">
              <h1 className="text-2xl font-bold">Se connecter</h1>
              <p className="text-muted-foreground">pour accéder à {process.env.APP_NAME || 'NEXPAY'}</p>
            </div>

            <LoginForm />
          </div>

        </Card>
    </div>
  )
}
