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

      if (!_id) {
        console.log("_id", _id)
        console.log("id", id)

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
    })()
  }, [_id, id])

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
          <Flex
            w="full"
            justify="space-between"
            align="center"
            paddingX={[0, 8]}
          >
            <Text fontSize="3xl" color="#7023b6" fontWeight="bold">
              <Link href="/">Dumpet</Link>
            </Text>
            <Flex gap={4} alignItems="center">
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href="https://t.me/dumpetdotfun"
              >
                <TelegramIcon strokeColor="#7023b6" size={18} />
              </Link>

              <Link
                target="_blank"
                rel="noopener noreferrer"
                href="https://x.com/dumpetdotfun"
              >
                <TwitterIcon strokeColor="#7023b6" size={18} />
              </Link>

              <Flex paddingX={[0, 2]}></Flex>

              <Flex _hover={{ cursor: "pointer" }} _disabled={true}>
                <UserIcon strokeColor="#7023b6" size={34} />
              </Flex>
            </Flex>
          </Flex>
          <Divider />
          <Flex paddingY={8}></Flex>

          <Flex
            flexDirection="column"
            gap={4}
            align="center"
            borderRadius="md"
            width="100%"
            maxW="lg"
          >
            <Text maxW="lg">{pid}</Text>
            <Text maxW="lg">{jsonData?.Title}</Text>
            <Text maxW="lg">{jsonData?.Duration}</Text>
            <Text maxW="lg">{jsonData?.TokenTxId}</Text>
            <Text maxW="lg">{jsonData?.OptionA}</Text>
            <Text maxW="lg">{jsonData?.OptionB}</Text>
            <Text maxW="lg">{jsonData?.ProcessId}</Text>
            <Text maxW="lg">{jsonData?.Creator}</Text>
            <Text maxW="lg">{jsonData?.BlockHeight}</Text>
            <Text maxW="lg">{jsonData?.Timestamp}</Text>

            <Button colorScheme="purple" w="100%" maxW="lg" onClick={deposit}>
              Deposit
            </Button>
            <Button colorScheme="purple" w="100%" maxW="lg">
              Option A
            </Button>
            <Button colorScheme="purple" w="100%" maxW="lg">
              Option B
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
