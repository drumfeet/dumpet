import "@/styles/globals.css"
import "@/styles/animations.css"
import HeadTag from "@/components/HeadTag"
import { AppContextProvider } from "@/context/AppContext"
import { ArNext } from "arnext"
import { Analytics } from "@vercel/analytics/next"

export default function App(props) {
  return (
    <>
      <AppContextProvider>
        <HeadTag />
        <ArNext {...props} />
        <Analytics />
      </AppContextProvider>
    </>
  )
}
