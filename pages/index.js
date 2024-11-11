import AppHeader from "@/components/AppHeader"
import TelegramIcon from "@/components/icons/TelegramIcon"
import TwitterIcon from "@/components/icons/TwitterIcon"
import UserIcon from "@/components/icons/UserIcon"
import { useAppContext } from "@/context/AppContext"
import {
  Button,
  ChakraProvider,
  Divider,
  Flex,
  Input,
  useToast,
  Text,
  FormControl,
  FormHelperText,
} from "@chakra-ui/react"
import {
  createDataItemSigner,
  spawn,
  message,
  result,
  results,
  dryrun,
} from "@permaweb/aoconnect"
import { Link } from "arnext"
import { useState } from "react"

const MAIN_PROCESS_ID = "yC4kFwIGERjmLx5qSxEa0MX87sFuqRDFbWUqEedVOZo"

export default function Home() {
  const toast = useToast()
  const [markets, setMarkets] = useState([])

  const {
    connectWallet,
    disconnectWallet,
    isConnected,
    setIsConnected,
    userAddress,
    setUserAddress,
  } = useAppContext()

  const fetchMarkets = async () => {
    try {
      const result = await dryrun({
        process: MAIN_PROCESS_ID,
        tags: [{ name: "Action", value: "List" }],
      })

      console.log(result.Messages[0])
      const jsonData = JSON.parse(result.Messages[0].Data)
      console.log(jsonData)
      setMarkets(jsonData.Markets)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <ChakraProvider>
        <Flex
          flexDirection="column"
          alignItems="center"
          p={5}
          bg="#f3f0fa"
          minH="100vh"
        >
          <AppHeader />

          <Flex
            flexDirection="column"
            gap={4}
            align="center"
            borderRadius="md"
            width="100%"
            maxW="lg"
          >
            <Button width="100%" colorScheme="purple" onClick={fetchMarkets}>
              <Link target="_blank" rel="noopener noreferrer" href="/create">
                Create Bet
              </Link>
            </Button>
            <Button width="100%" colorScheme="purple" onClick={fetchMarkets}>
              Fetch Markets
            </Button>
            {markets.length > 0 && (
              <>
                {markets.map((market, index) => (
                  <Flex key={index} flexDirection="column" w="100%" maxW="lg">
                    <Text>{market.Title}</Text>
                    <Text>{market.Creator}</Text>
                    <Text>{market.BlockHeight}</Text>
                    <Text>{market.Duration}</Text>
                    <Text>{market.OptionA}</Text>
                    <Text>{market.OptionB}</Text>
                    <Text>{market.ProcessId}</Text>
                    <Text>{market.Timestamp}</Text>
                    <Text>{market.TokenTxId}</Text>
                    <Divider />
                  </Flex>
                ))}
              </>
            )}
          </Flex>
        </Flex>
      </ChakraProvider>
    </>
  )
}
