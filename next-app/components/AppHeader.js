import {
  Button,
  ChakraProvider,
  Divider,
  Flex,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  MenuDivider,
  useToast,
} from "@chakra-ui/react"
import { Link } from "arnext"
import { Plus } from "lucide-react"
import SidebarIcon from "./icons/SidebarIcon"
import WalletIcon from "./icons/WalletIcon"
import TwitterIcon from "./icons/TwitterIcon"
import TelegramIcon from "./icons/TelegramIcon"
import { ExternalLinkIcon } from "@chakra-ui/icons"
import { useAppContext } from "@/context/AppContext"
import UserIcon from "./icons/UserIcon"

export default function AppHeader() {
  const {
    connectWallet,
    disconnectWallet,
    isConnected,
    setIsConnected,
    userAddress,
    setUserAddress,
  } = useAppContext()

  const toast = useToast()
  return (
    <ChakraProvider>
      {/* <Flex w="full" justify="space-between" align="center" paddingX={[0, 8]}> */}
      <Flex
        justify="space-between"
        w="100%"
        // maxW="1200px"
        paddingY={4}
        paddingX={[0, 8]}
        align="center"
      >
        <Link href="/">
          <Text fontSize="2xl" color="purple.400" fontWeight="bold">
            dumpet
          </Text>
        </Link>
        <Flex gap={4} alignItems="center">
          <Link href="/create">
            <Button
              leftIcon={<Plus />}
              colorScheme="purple"
              bg="#7023b6" // Primary purple
            >
              Create
            </Button>
          </Link>

          <Flex paddingX={[0, 2]}></Flex>

          <Menu>
            <MenuButton as={Button} variant="unstyled">
              <SidebarIcon strokeColor="#9F7AEA" size={28} />
            </MenuButton>
            <MenuList bg="purple.100" color="purple.700">
              <MenuGroup title="Account">
                {isConnected && (
                  <Link href={`/profile/${userAddress}`}>
                    <MenuItem
                      icon={<UserIcon strokeColor="#ded6e5" size={28} />}
                      _hover={{ bg: "red.200" }}
                    >
                      Profile
                    </MenuItem>
                  </Link>
                )}
                <MenuItem
                  icon={<WalletIcon strokeColor="#ded6e5" size={28} />}
                  _hover={{ bg: "red.200" }}
                  onClick={async () => {
                    if (isConnected) {
                      await disconnectWallet()
                      toast({
                        description: "Account disconnected",
                        duration: 2000,
                        isClosable: true,
                        position: "top",
                      })
                    } else {
                      const _connected = await connectWallet()
                      if (_connected.success === false) {
                        return
                      }
                      toast({
                        description: "Account connected",
                        duration: 2000,
                        isClosable: true,
                        position: "top",
                      })
                    }
                  }}
                >
                  {isConnected &&
                  typeof userAddress === "string" &&
                  userAddress.length > 0 ? (
                    <Flex _hover={{ cursor: "pointer" }} flexDir="column">
                      <Text>Disconnect</Text>
                      <Text>
                        {userAddress.slice(0, 5)}....{userAddress.slice(-5)}
                      </Text>
                    </Flex>
                  ) : (
                    <Flex _hover={{ cursor: "pointer" }}>Connect</Flex>
                  )}
                </MenuItem>
              </MenuGroup>
              <MenuDivider />
              <MenuGroup title="Menu">
                <Link href="/duel">
                  <MenuItem
                    icon={<ExternalLinkIcon color="#ded6e5" boxSize={4} />}
                    _hover={{ bg: "red.200" }}
                  >
                    Duel
                  </MenuItem>
                </Link>
                <Link href="/faq">
                  <MenuItem
                    icon={<ExternalLinkIcon color="#ded6e5" boxSize={4} />}
                    _hover={{ bg: "red.200" }}
                  >
                    FAQ
                  </MenuItem>
                </Link>
                <Link href="https://dindin.dumpet.fun">
                  <MenuItem
                    icon={<ExternalLinkIcon color="#ded6e5" boxSize={4} />}
                    _hover={{ bg: "red.200" }}
                  >
                    DINDIN
                  </MenuItem>
                </Link>
                <MenuItem
                  icon={<ExternalLinkIcon color="#ded6e5" boxSize={4} />}
                  _hover={{ bg: "red.200" }}
                  onClick={() => {
                    toast({
                      description: "Coming soon",
                      duration: 2000,
                      isClosable: true,
                      position: "top",
                    })
                  }}
                >
                  Token
                </MenuItem>
              </MenuGroup>
              <MenuDivider />
              <MenuGroup title="Social">
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://x.com/dumpetdotfun"
                >
                  <MenuItem
                    icon={<TwitterIcon strokeColor="#ded6e5" size={20} />}
                    _hover={{ bg: "red.200" }}
                  >
                    Twitter
                  </MenuItem>
                </Link>
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://t.me/dumpetdotfun"
                >
                  <MenuItem
                    icon={<TelegramIcon strokeColor="#ded6e5" size={20} />}
                    _hover={{ bg: "red.200" }}
                  >
                    Telegram
                  </MenuItem>
                </Link>
              </MenuGroup>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
      <Divider borderColor="purple.800" />
      {/* <Flex paddingY={8}></Flex> */}
    </ChakraProvider>
  )
}
