import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react"
import { useAppContext } from "@/context/AppContext"
import UserIcon from "./icons/UserIcon"
import WalletIcon from "./icons/WalletIcon"
import { Link } from "arnext"

const LoginModal = () => {
  const {
    connectWallet,
    disconnectWallet,
    isConnected,
    setIsConnected,
    userAddress,
    setUserAddress,
  } = useAppContext()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  return (
    <>
      {isConnected &&
      typeof userAddress === "string" &&
      userAddress.length > 0 ? (
        <Flex _hover={{ cursor: "pointer" }} onClick={onOpen}>
          <UserIcon strokeColor="#9F7AEA" size={34} />
        </Flex>
      ) : (
        <Flex
          _hover={{ cursor: "pointer" }}
          onClick={async () => {
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
          }}
        >
          <WalletIcon strokeColor="#9F7AEA" size={34} />
        </Flex>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="#1a2c38" color="gray.200">
          <ModalHeader>
            <Flex justifyContent="center" alignItems="center" gap={2}>
              Wallet Connected
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex flexDirection="column" gap={4}>
              <Flex w="100%" gap={4} flexDirection="column">
                <Text>
                  To enable wallet auto sign, first disconnect your account.
                </Text>
                <Text>
                  Then, sign in with ArConnect and select &apos;Always
                  allow&apos;
                </Text>
              </Flex>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Flex gap={4}>
              <Button bg="#213743" color="white" _hover={{ bg: "#213743" }}>
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`/profile/${userAddress}`}
                >
                  Profile
                </Link>
              </Button>

              <Button
                bg="#213743"
                color="white"
                _hover={{ bg: "#213743" }}
                onClick={async () => {
                  await disconnectWallet()
                  toast({
                    description: "Account disconnected",
                    duration: 2000,
                    isClosable: true,
                    position: "top",
                  })
                  onClose()
                }}
              >
                Disconnect
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default LoginModal
