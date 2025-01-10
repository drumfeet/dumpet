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
        <Flex paddingY={8}></Flex>

        <Flex gap={4} flexDirection="column" color="whiteAlpha.800">
          <Text>dumpet.fun is a popularity contest duel platform.</Text>
          <Text>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.arconnect.io"
              style={{ textDecoration: "underline" }}
            >
              ArConnect
            </Link>{" "}
            wallet is required.
          </Text>
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
          <Text>
            Market creators can set the duration between 8 minutes and 8 days.
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
          <Text as="s">
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
            The range of possible duel ideas are endless. There are NO RULES!
          </Text>
          <Text>Forget reality, it&apos;s all about the voter deposits.</Text>
          <Text>Are you ready to dumpet?</Text>
        </Flex>
        <Flex paddingY={8}></Flex>
        <Text as="b"> Dumpet is experimental. Use at your own risk.</Text>
        <Text>
          Unexpected issues may occur, and we may not be able to recover any
          losses.
        </Text>
        <Flex paddingY={8}></Flex>
      </Flex>
    </ChakraProvider>
  )
}
