import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Providers from "@/components/providers"

export default async function AppLayout({ children }) {

  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  return <Providers>{children}</Providers>
}