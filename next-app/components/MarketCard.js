import {
  Flex,
  Text,
  IconButton,
} from "@chakra-ui/react"
import { useMemo } from "react"
import { Link } from "arnext"
import ShareIcon from "@/components/icons/ShareIcon"

export const MarketCard = ({ market, onShare }) => {
  const formatUnixTimestamp = (timestamp) => {
    const date = new Date(Number(timestamp))
    const options = {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use the local timezone
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24-hour format
    }
    return new Intl.DateTimeFormat("en-US", options).format(date)
  }

  const formattedDate = useMemo(() => 
    market.Duration ? formatUnixTimestamp(market.Duration) : "",
    [market.Duration]
  )
  
  return (
    <Flex
      flexDirection="column"
      w="250px"
      border="1px solid"
      borderColor="purple.700"
      paddingX={4}
      paddingBottom={8}
      borderRadius="md"
      textAlign="center"
    >
      <Flex w="100%" justify="flex-end">
        <IconButton
          icon={<ShareIcon strokeColor="#FFFFFF7A" size={14} />}
          colorScheme="whiteAlpha"
          variant="ghost"
          aria-label="Share"
          onClick={() => onShare(market.ProcessId)}
        />
      </Flex>
      <Link href={`/market/${market.ProcessId}`}>
        <Flex flexDirection="column" gap={2}>
          <Text fontSize="md" fontWeight="bold" color="purple.300" isTruncated>
            {market.Title}
          </Text>
          <Text fontSize="sm" isTruncated>{market.OptionA}</Text>
          <Flex justifyContent="center">
            <Text
              fontSize="sm"
              color="gray.400"
              border="1px solid"
              borderColor="purple"
              borderRadius="md"
              paddingX={4}
            >
              versus
            </Text>
          </Flex>
          <Text fontSize="sm" isTruncated>{market.OptionB}</Text>
          <Flex flexDirection="column">
            <Text fontSize="xs" color="gray.400">Expires on:</Text>
            <Text fontSize="xs" color="gray.400">{formattedDate}</Text>
          </Flex>
        </Flex>
      </Link>
    </Flex>
  )
}