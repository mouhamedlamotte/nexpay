import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: "NEXPAY Checkout",
  description: "Checkout for NEXPAY payment gateway",
}


const ChekoutLayout = ({ children }: { children: React.ReactNode }) => {
  return (
   <>{children}</>
  )
}

export default ChekoutLayout