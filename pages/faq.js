import AppHeader from "@/components/AppHeader"
import SubHeader from "@/components/SubHeader"
import { useAppContext } from "@/context/AppContext"
import {
  Button,
  ChakraProvider,
  Flex,
  useToast,
  Text,
  Code,
} from "@chakra-ui/react"
import { dryrun } from "@permaweb/aoconnect"
import { Link } from "arnext"
import { useEffect, useState } from "react"

const MAIN_PROCESS_ID = "jIRuxblllcBIDUmYbrbbEI90nJs40duNA6wR6NkYVvI"

export default function Home() {
  const toast = useToast()
  const [markets, setMarkets] = useState([])
  const [randomMarket, setRandomMarket] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [nextPage, setNextPage] = useState(1)

  const { handleMessageResultError } = useAppContext()

  useEffect(() => {
    ;(async () => {})()
  }, [])

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
        <SubHeader />
        <Flex paddingY={8}></Flex>

        <Flex gap={4} flexDirection="column" color="whiteAlpha.800">
          <Text>dumpet.fun is a popularity contest betting platform.</Text>
          <Text>
            Step 1: Select an active market to participate in or create your
            own.
          </Text>
          <Text>
            Step 2: Deposit the specified token to become eligible for voting.
          </Text>
          <Text>
            Step 3: Vote for your preferred option or vote with your bias.
          </Text>
          <Text>
            Step 4: Once the market duration ends, anyone can conclude the
            market process.
          </Text>
          <Text>Step 5: The option with the highest votes wins.</Text>
          <Text>
            The tokens from losing votes are distributed proportionally to the
            winners.
          </Text>
          <Text>
            A 1% fee applies if you cancel your vote before the market
            concludes.
          </Text>
          <Text>
            You can claim a one-time airdrop if your wallet did not previously
            hold a DUMPET token balance.
          </Text>
          <Text>
            DUMPET token and all market processes are spawned with{" "}
            <Code>Owner=&quot;&quot;</Code>
          </Text>
          <Text>
            The market process will earn any mined AO rewards from user
            deposits, if applicable.
          </Text>
          <Text>
            The market creator will be able to withdraw this from the process
            when the AO mainnet launches.
          </Text>
          <Text>
            This feature provides greater economic incentive for market
            creators.
          </Text>
          <Text>
            The range of possible bet ideas are endless. There are NO RULES!
          </Text>
          <Text>Forget reality, it&apos;s all about the vote deposits.</Text>
          <Text>I am ready to dumpet!</Text>
        </Flex>
        <Flex paddingY={8}></Flex>

        <Flex paddingY={8}></Flex>
      </Flex>
    </ChakraProvider>
  )
}
