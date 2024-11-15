import {
  Flex,
  Text,
  Button,
  Box,
  ChakraProvider,
  Spacer,
} from "@chakra-ui/react"

export default function HomePage() {
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
        {/* Header Section */}
        <Flex
          justify="space-between"
          w="100%"
          maxW="1200px"
          p={4}
          align="center"
        >
          <Text fontSize="2xl" fontWeight="bold" color="purple.400">
            dumpet.fun
          </Text>
          <Button colorScheme="purple" variant="outline">
            Connect Wallet
          </Button>
        </Flex>

        <Flex
          w="100%"
          maxW="800px"
          bg="purple.500" // Vibrant purple for the banner
          p={4}
          borderRadius="md"
          align="center"
          justify="center"
          mb={6}
        >
          <Text fontSize="lg" fontWeight="bold" textAlign="center">
            CREATE DUMB BET
          </Text>
        </Flex>

        <Box w="250px" bg="#212121" p={4} borderRadius="md" textAlign="center">
          <Text fontSize="md" fontWeight="bold" color="purple.300" mb={2}>
            TITLE
          </Text>
          <Text fontSize="sm" mb={2}>
            OptionA
          </Text>
          <Text fontSize="sm" mb={2}>
            vs
          </Text>
          <Text fontSize="sm" mb={2}>
            OptionB
          </Text>
          <Text fontSize="xs" color="gray.400">
            Timestamp
          </Text>
          <Text fontSize="xs" color="gray.400">
            Duration
          </Text>
        </Box>

        <Flex paddingY={4}></Flex>

        {/* Content Cards */}
        <Flex wrap="wrap" justify="center" gap={4} maxW="1200px">
          {[
            {
              title: "MOODENG PREDICTED...",
              description:
                "Moo Deng has accurately predicted the US election 2024.",
              mcap: "$3,116.13",
              time: "1 week ago",
            },
            {
              title: "Empress Kamaltoe",
              description: "A failed VP according to equity and inclusion.",
              mcap: "$3,116.13",
              time: "2 weeks ago",
            },
            {
              title: "Tonald Drump",
              description: "In the reverse world.",
              mcap: "$3,116.13",
              time: "2 weeks ago",
            },
            {
              title: "AISaf",
              description: "A project based on AI.",
              mcap: "$3,120.39",
              time: "3 weeks ago",
            },
            {
              title: "Duke Memecoin",
              description: "Probably the best decision for a memecoin.",
              mcap: "$3,119.17",
              time: "3 weeks ago",
            },
            {
              title: "SOPHIA",
              description: "Sophia first activated on Feb 14, 2016.",
              mcap: "$3,116.13",
              time: "1 month ago",
            },
          ].map((card, index) => (
            <Box
              key={index}
              w="250px"
              border="1px solid"
              borderColor="purple.700"
              p={4}
              borderRadius="md"
              textAlign="center"
            >
              <Text fontSize="md" fontWeight="bold" color="purple.300" mb={2}>
                {card.title}
              </Text>
              <Text fontSize="sm" mb={2}>
                {card.description}
              </Text>
              <Text fontSize="xs" color="gray.400">
                {card.mcap} | {card.time}
              </Text>
            </Box>
          ))}
        </Flex>
      </Flex>
    </ChakraProvider>
  )
}
