"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light" // Ensure light theme loads first
      enableSystem={false} // Avoid system flickering
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
