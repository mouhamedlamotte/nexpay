"use client"

import { useEffect } from "react"
import AppLoading from "@/components/app-loading"

export default function HomePage() {

  useEffect(() => {
    typeof window !== "undefined" && window.location.replace("/admin")
  }, [])

  return <AppLoading />
}
