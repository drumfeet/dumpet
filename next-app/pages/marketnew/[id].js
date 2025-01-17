import { useParams } from "arnext"
import { useEffect, useState } from "react"
import { ChakraProvider, Flex } from "@chakra-ui/react"
import AppHeader from "@/components/AppHeader"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import Head from "next/head"
import MarketPage from "@/components/MarketPage"
ChartJS.register(ArcElement, Tooltip, Legend) // Register the required components

const getID = async (id, pid) => `${pid ?? id}`

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" }
}

export async function getStaticProps({ params: { id } }) {
  return { props: { pid: await getID(id) } }
}

export default function Home({ _id = null }) {
  const { id } = useParams()
  const [pid, setPid] = useState(_id)

  useEffect(() => {
    ;(async () => {
      _id ?? setPid(await getID(id, _id))
    })()
  }, [])

  const meta = {
    title: "dumpet.fun",
    description: "Popularity contest duel platform",
    image: "T2q7IO67TYEhuk1CIPVxHX9MdEmzTUocZjScmdWTHK0",
  }

  return (
    <ChakraProvider>
      <Head>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${meta.title}`} />
        <meta name="twitter:description" content={meta.description} />
        <meta
          name="twitter:image"
          content={`https://arweave.net/${meta.image}`}
        />
        <meta property="og:title" content={`${meta.title}`} />
        <meta name="og:description" content={meta.description} />
        <meta name="og:image" content={`https://arweave.net/${meta.image}`} />
        <link rel="icon" href=".././favicon.ico" />
      </Head>
      <Flex
        direction="column"
        align="center"
        paddingX={4}
        bg="#1a1a2e"
        color="white"
        flex={1}
      >
        <AppHeader />
        <Flex paddingY={8}></Flex>
      </Flex>
      <MarketPage pid={pid} />
    </ChakraProvider>
  )
}
