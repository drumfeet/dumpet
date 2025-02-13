import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace(
      "https://docs.google.com/forms/d/e/1FAIpQLSdjRBYmBXMngc24EDpDDRRgMvNh_4TbhQCiNcz_mnEnbr6j6g/viewform?usp=header"
    )
  }, [router])

  return null // No content is displayed on this page
}
