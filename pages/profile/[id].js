import { Link, useParams } from "arnext"
import { useEffect, useState } from "react"
import {
  createDataItemSigner,
  spawn,
  message,
  result,
  results,
  dryrun,
} from "@permaweb/aoconnect"
import {
  Button,
  ChakraProvider,
  Flex,
  useToast,
  Text,
  Divider,
} from "@chakra-ui/react"
import AppHeader from "@/components/AppHeader"
import { useAppContext } from "@/context/AppContext"

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" }
}

const getID = async (id, pid) => `${pid ?? id}`

const MAIN_PROCESS_ID = "yC4kFwIGERjmLx5qSxEa0MX87sFuqRDFbWUqEedVOZo"
export async function getStaticProps({ params: { id } }) {
  return { props: { pid: await getID(id) } }
}

export default function Home({ _id = null }) {
  const toast = useToast()
  const { id } = useParams()
  const [pid, setPid] = useState(_id)
  const [isPending, setIsPending] = useState(false)
  const [userMarkets, setUserMarkets] = useState([])
  const { handleMessageResultError } = useAppContext()

  useEffect(() => {
    ;(async () => {
      _id ?? setPid(await getID(id, _id))
    })()
  }, [])

  useEffect(() => {
    if (pid) {
      ;(async () => {
        await hasWaitFor()
        await fetchMarkets()
      })()
    }
  }, [pid])

  const hasWaitFor = async () => {
    try {
      const _result = await dryrun({
        process: MAIN_PROCESS_ID,
        tags: [
          { name: "Action", value: "HasWaitFor" },
          {
            name: "ProfileId",
            value: pid,
          },
        ],
      })
      const jsonData = JSON.parse(_result?.Messages[0]?.Data)
      setIsPending(jsonData.HasWaitFor)
      toast({
        description: jsonData.HasWaitFor
          ? "Pending market creation"
          : "No pending market creation",
        status: "info",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
    } catch (error) {
      console.error(error)
    }
  }

  const fetchMarkets = async () => {
    try {
      const _result = await dryrun({
        process: MAIN_PROCESS_ID,
        tags: [
          { name: "Action", value: "Creator" },
          {
            name: "ProfileId",
            value: pid,
          },
        ],
      })
      const jsonData = JSON.parse(_result?.Messages[0]?.Data)
      setUserMarkets(jsonData.Markets)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <ChakraProvider>
      <Flex
        direction="column"
        align="center"
        p={4}
        bg="#1a1a2e" // Dark purple background
        minHeight="100vh"
        color="white"
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
          <Flex paddingY={4}></Flex>
          {isPending && (
            <Text color="red.500">You have a pending market creation</Text>
          )}
          <Button
            width="100%"
            colorScheme="purple"
            bg="#7023b6"
            onClick={hasWaitFor}
          >
            Check Pending Market
          </Button>

          <Flex paddingY={8}></Flex>
          {userMarkets?.length > 0 ? (
            <Flex direction="column" width="100%" maxW="lg">
              <Text fontSize="xs" color="gray.400" paddingBottom={2}>
                MARKET TX ID
              </Text>
              {userMarkets.map((record, index) => (
                <Flex
                  key={index}
                  align="center"
                  justify="space-between"
                  py={2}
                  px={4}
                  bg="#1a1a2e"
                  _hover={{ bg: "#3e3e5e" }}
                >
                  <Text
                    as="a"
                    href={`/tx/${record}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="whiteAlpha.800"
                    textDecoration="underline"
                    _hover={{ cursor: "pointer" }}
                  >
                    {record}
                  </Text>
                </Flex>
              ))}
            </Flex>
          ) : (
            <Text color="#7023b6">No market found</Text>
          )}
        </Flex>

        <Flex paddingY={8}></Flex>
      </Flex>
    </ChakraProvider>
  )
}
