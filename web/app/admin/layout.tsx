import { AppWrapper } from '@/components/providers/app-wrapper'
import React from 'react'

const AdminLayout = ({ children }: { children: React.ReactNode}) => {
  return (
   <AppWrapper >
    {children}
   </AppWrapper>
  )
}

export default AdminLayout