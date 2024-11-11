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
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Divider,
  TableContainer,
  IconButton,
} from "@chakra-ui/react"
import { AddIcon, DeleteIcon, EditIcon, UpDownIcon } from "@chakra-ui/icons"
import AppHeader from "@/components/AppHeader"

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

  useEffect(() => {
    ;(async () => {
      _id ?? setPid(await getID(id, _id))
    })()
  }, [])

  useEffect(() => {
    console.log("pid", pid)
    if (pid) {
      ;(async () => {
        await hasWaitFor()
        await fetchMarkets()
      })()
    }
  }, [pid])

  const handleMessageResultError = (_result) => {
    const errorTag = _result?.Messages?.[0]?.Tags.find(
      (tag) => tag.name === "Error"
    )
    console.log("errorTag", errorTag)
    if (errorTag) {
      toast({
        description: _result.Messages[0].Data,
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
      return true
    }
    return false
  }

  const hasWaitFor = async () => {
    console.log("hasWaitFor")
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
      console.log("_result", _result)
      if (handleMessageResultError(_result)) return
      const jsonData = JSON.parse(_result?.Messages[0]?.Data)
      console.log("jsonData", jsonData)
      setIsPending(jsonData.HasWaitFor)
      if (jsonData.HasWaitFor) {
        toast({
          description: "Market creation is pending",
          status: "info",
          duration: 2000,
          isClosable: true,
          position: "top",
        })
      } else {
        toast({
          description: "No pending market creation",
          status: "info",
          duration: 2000,
          isClosable: true,
          position: "top",
        })
      }
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
      console.log("_result", _result)
      if (handleMessageResultError(_result)) return
      const jsonData = JSON.parse(_result?.Messages[0]?.Data)
      console.log("jsonData", jsonData)
      setUserMarkets(jsonData.Markets)
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
            {isPending && <Text color="red.500">Pending market creation</Text>}
            <Button width="100%" colorScheme="purple" onClick={hasWaitFor}>
              hasWaitFor
            </Button>
            {userMarkets?.length > 0 ? (
              <>
                <TableContainer width="100%" maxW="lg">
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Market Tx Id</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {userMarkets.map((record, index) => (
                        <Tr key={index}>
                          <Td textAlign="left">
                            <Text
                              as="a"
                              href={`/tx/${record}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              color="#7023b6"
                              textDecoration="underline"
                              _hover={{ cursor: "pointer" }}
                            >
                              {record}
                            </Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <>
                <Text color="#7023b6">No market found</Text>
                <Flex paddingY={8}></Flex>
              </>
            )}
          </Flex>
        </Flex>
      </ChakraProvider>
    </>
  )
}
