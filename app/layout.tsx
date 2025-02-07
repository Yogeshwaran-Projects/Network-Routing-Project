
import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "react-hot-toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "RL-Based Network Routing",
  description: "A final year project demonstrating RL-based network routing",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
     <body className={inter.className}>
  {children}
  <Toaster />
</body>

    </html>
  )
}

