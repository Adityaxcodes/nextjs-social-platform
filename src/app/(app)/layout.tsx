import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Providers from "@/components/providers"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function AppLayout({ children }: { children: React.ReactNode }) {

  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return <Providers>{children}</Providers>
}