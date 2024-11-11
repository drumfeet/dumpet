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
import { Button, ChakraProvider, Flex, useToast, Text } from "@chakra-ui/react"
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
          </Flex>
        </Flex>
      </ChakraProvider>
    </>
  )
}
