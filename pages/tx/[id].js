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

export default function Home({ _id = null }) {
  const { id } = useParams()
  const [pid, setPid] = useState(_id)
  const [jsonData, setJsonData] = useState()

  useEffect(() => {
    ;(async () => {
      _id ?? setPid(await getID(id, _id))

      // fetch txid from pid
      if (!_id) {
        console.log("_id", _id)
        console.log("id", id)

        try {
          const result = await dryrun({
            process: id,
            tags: [{ name: "Action", value: "GetMarketInfo" }],
          })

          console.log("result", result)
          const jsonData = JSON.parse(result?.Messages[0]?.Data)
          console.log(jsonData)
          setJsonData(jsonData)
        } catch (error) {
          console.error(error)
        }
      }
    })()
  }, [_id, id])

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
            <Text maxW="lg">{jsonData?.ProcessId}</Text>
            <Text maxW="lg">{jsonData?.Creator}</Text>
            <Text maxW="lg">{jsonData?.BlockHeight}</Text>
            <Text maxW="lg">{jsonData?.Timestamp}</Text>

            <Button colorScheme="purple" w="100%" maxW="lg">Deposit</Button>
            <Button colorScheme="purple" w="100%" maxW="lg">Withdraw</Button>
            <Button colorScheme="purple" w="100%" maxW="lg">Conclude</Button>
          </Flex>
        </Flex>
      </ChakraProvider>
    </>
  )
}
