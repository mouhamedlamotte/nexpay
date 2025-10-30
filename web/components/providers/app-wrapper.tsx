"use client"

import AppLoading from "../app-loading"
import { RequireAuth } from "../require-auth"
import { RequireProject } from "../required-organization"


interface AppWrapperProps {
  children: React.ReactNode
}

export const AppWrapper = ({ children }: AppWrapperProps) => {
  return (
    <RequireAuth>
      <RequireProject>
        <AppLoading />
        {children}
      </RequireProject>
    </RequireAuth>
  )
}
