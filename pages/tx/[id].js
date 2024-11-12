import { Link, useParams } from "arnext"
import { useEffect, useState } from "react"
import {
  Button,
  ChakraProvider,
  Divider,
  Flex,
  Input,
  useToast,
  Text,
  Heading,
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
import TelegramIcon from "@/components/icons/TelegramIcon"
import TwitterIcon from "@/components/icons/TwitterIcon"
import UserIcon from "@/components/icons/UserIcon"
import AppHeader from "@/components/AppHeader"

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" }
}

const getID = async (id, pid) => `${pid ?? id}`

export async function getStaticProps({ params: { id } }) {
  return { props: { pid: await getID(id) } }
}

const DUMPET_TOKEN_TXID = "fzkhRptIvW3tJ7Dz7NFgt2DnZTJVKnwtzEOuURjfXrQ"

export default function Home({ _id = null }) {
  const { id } = useParams()
  const [pid, setPid] = useState(_id)
  const [tokenTxId, setTokenTxId] = useState("")
  const [jsonData, setJsonData] = useState()
  const [walletAddress, setWalletAddress] = useState("")

  useEffect(() => {
    ;(async () => {
      _id ?? setPid(await getID(id, _id))
    })()
  }, [])

  useEffect(() => {
    console.log("pid", pid)
    if (pid) {
      ;(async () => {
        await getMarketInfo()
      })()
    }
  }, [pid])

  const getMarketInfo = async () => {
    try {
      const result = await dryrun({
        process: id,
        tags: [{ name: "Action", value: "GetMarketInfo" }],
      })

      console.log("result", result)
      const _jsonData = JSON.parse(result?.Messages[0]?.Data)
      console.log("_jsonData", _jsonData)
      setJsonData(_jsonData)
      setTokenTxId(_jsonData?.TokenTxId)
      console.log("TokenTxId", _jsonData?.TokenTxId)
    } catch (error) {
      console.error(error)
    }
  }

  const deposit = async () => {
    try {
      const messageId = await message({
        process: DUMPET_TOKEN_TXID,
        tags: [
          {
            name: "Action",
            value: "Transfer",
          },
          {
            name: "Quantity",
            value: "2000000000000",
          },
          {
            name: "Recipient",
            value: pid,
          },
        ],
        signer: createDataItemSigner(globalThis.arweaveWallet),
      })
      console.log("messageId", messageId)

      const _result = await result({
        message: messageId,
        process: DUMPET_TOKEN_TXID,
      })
      console.log("_result", _result)
    } catch (error) {
      console.error(error)
    }
  }

  const getTokenTxId = async () => {
    try {
      const result = await dryrun({
        process: pid,
        tags: [{ name: "Action", value: "GetTokenTxId" }],
      })
      console.log("result", result)
      // const jsonData = JSON.parse(result?.Messages[0]?.Data)
      // console.log("jsonData", jsonData)
    } catch (error) {
      console.error(error)
    }
  }

  const getBalances = async () => {
    try {
      const result = await dryrun({
        process: pid,
        tags: [{ name: "Action", value: "Balances" }],
      })
      const jsonData = JSON.parse(result?.Messages[0]?.Data)
      console.log("jsonData", jsonData)
    } catch (error) {
      console.error(error)
    }
  }

  const getBalance = async () => {
    console.log("walletAddress", walletAddress)
    try {
      const result = await dryrun({
        process: pid,
        tags: [
          { name: "Action", value: "Balance" },
          { name: "Recipient", value: walletAddress },
        ],
      })
      const jsonData = JSON.parse(result?.Messages[0]?.Data)
      console.log("jsonData", jsonData)
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
            <FormControl>
              <FormHelperText fontSize="xs">Market ProcessId</FormHelperText>
              <Text maxW="lg">{pid}</Text>
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">Title</FormHelperText>
              <Text maxW="lg">{jsonData?.Title}</Text>
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">Duration</FormHelperText>
              <Text maxW="lg">{jsonData?.Duration}</Text>
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">Token TxId</FormHelperText>
              <Text maxW="lg">{jsonData?.TokenTxId}</Text>
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">OptionA</FormHelperText>
              <Text maxW="lg">{jsonData?.OptionA}</Text>
              <Button colorScheme="purple" w="100%" maxW="lg">
                Vote A
              </Button>
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">OptionB</FormHelperText>
              <Text maxW="lg">{jsonData?.OptionB}</Text>
              <Button colorScheme="purple" w="100%" maxW="lg">
                Vote B
              </Button>
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">Creator</FormHelperText>
              <Text maxW="lg">{jsonData?.Creator}</Text>
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">BlockHeight</FormHelperText>
              <Text maxW="lg">{jsonData?.BlockHeight}</Text>
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">Timestamp</FormHelperText>
              <Text maxW="lg">{jsonData?.Timestamp}</Text>
            </FormControl>

            <Button colorScheme="purple" w="100%" maxW="lg" onClick={deposit}>
              Deposit
            </Button>
            <Button colorScheme="purple" w="100%" maxW="lg">
              Withdraw
            </Button>
            <Button colorScheme="purple" w="100%" maxW="lg">
              Conclude
            </Button>
            <Button
              colorScheme="purple"
              w="100%"
              maxW="lg"
              onClick={getTokenTxId}
            >
              getTokenTxId
            </Button>
            <Button
              colorScheme="purple"
              w="100%"
              maxW="lg"
              onClick={getBalances}
            >
              Get Balances
            </Button>
            <Input
              placeholder="User Wallet Address"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
            />
            <Button
              colorScheme="purple"
              w="100%"
              maxW="lg"
              onClick={getBalance}
            >
              Get User Balance
            </Button>
          </Flex>
        </Flex>
      </ChakraProvider>
    </>
  )
}
