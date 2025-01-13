import { ArNext } from "arnext"
import "@/styles/globals.css"
import "@/styles/animations.css"
import { Analytics } from "@vercel/analytics/next"

export default function App(props) {
  return (
    <>
      <ArNext {...props} />
      <Analytics />
    </>
  )
}
