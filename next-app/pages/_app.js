import HeadTag from "@/components/HeadTag"
import { AppContextProvider } from "@/context/AppContext"
import { ArNext } from "arnext"
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function App(props) {
  return (
    <>
      <AppContextProvider>
        <HeadTag />
        <QueryClientProvider client={queryClient}>
          <ArNext {...props} />
        </QueryClientProvider>
      </AppContextProvider>
    </>
  )
}
