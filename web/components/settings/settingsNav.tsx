"use client"

import { cn } from '@/lib/utils';
import { Link2, Link as LinkIcon, User } from 'lucide-react';
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import React from 'react'

const Links: { name: string; href: string, icon?: any}[] = [
  {
    icon : User,
    name: "Mon profile",
    href: "/admin/settings",
  },
  {
    icon : Link2,
    name : "Callbacks de redirection",
    href: "/admin/settings/redirects",
  },
  {
    icon : LinkIcon,
    name : "Webhooks",
    href: "/admin/settings/webhooks",
  },
]

export const SettingsNav = () => {



  const pathname = usePathname()
  return (
    <nav
    className="grid gap-4 text-sm text-muted-foreground" x-chunk="dashboard-04-chunk-0"
  >
    {
      Links.map((link) => (
                <>
                {
                  <Link
                  key={link.name}
                  href={link.href}
                  className={cn("hover:text-muted-foreground w-full py-2 rounded-md lex items-center gap-4 text-foreground flex px-2.5", link.href===pathname && "bg-primary text-foreground")}
                >
                  <link.icon className="h-5 w-5" />
                  {link.name}
                </Link>
                }
              </>
      ))
    }
  </nav>
  )
}