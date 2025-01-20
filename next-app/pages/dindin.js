import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("https://dindin.dumpet.fun")
  }, [router])

  return null // No content is displayed on this page
}
