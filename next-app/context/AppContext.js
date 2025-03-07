import { useToast } from "@chakra-ui/react"
import { createContext, useContext, useState } from "react"

const AppContext = createContext()
const BASE_UNIT = 10
const DENOMINATION = 12

export const MAIN_PROCESS_ID = "jIRuxblllcBIDUmYbrbbEI90nJs40duNA6wR6NkYVvI"
export const USERTX_PROCESS_ID = "566F7MCrrBhr87n7Hs5JKyEQeRlAT9A14G4OWxfS4kQ"

export const AppContextProvider = ({ children }) => {
  const toast = useToast()
  const [isConnected, setIsConnected] = useState(false)
  const [userAddress, setUserAddress] = useState("")

  const connectWallet = async () => {
    try {
      await globalThis.arweaveWallet.connect([
        "ACCESS_ADDRESS",
        "SIGN_TRANSACTION",
        "ACCESS_PUBLIC_KEY",
        "SIGNATURE",
      ])
      const _userAddress = await globalThis.arweaveWallet.getActiveAddress()
      console.log("_userAddress", _userAddress)
      setUserAddress(_userAddress)
      setIsConnected(true)
      return { success: true, userAddress: _userAddress }
    } catch (e) {
      console.error("connectWallet() error!", e)
      toast({
        title: "Something went wrong.",
        description: `Install wander.app or reload page. ${e}`,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      })
      return { success: false, error: e }
    }
  }

  const disconnectWallet = async () => {
    try {
      await globalThis.arweaveWallet.disconnect()
      setUserAddress("")
      setIsConnected(false)
      return { success: true }
    } catch (e) {
      console.error("disconnectWallet() error!", e)
      toast({
        title: "Something went wrong.",
        description: `Install wander.app or reload page. ${e}`,
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
      return { success: false, error: e }
    }
  }

  const multiplyByPower = (v, denomination = DENOMINATION) => {
    return v * Math.pow(BASE_UNIT, denomination)
  }

  const divideByPower = (v, denomination = DENOMINATION) => {
    return (v / Math.pow(BASE_UNIT, denomination)).toFixed(denomination)
  }

  const handleMessageResultError = (_result) => {
    if (_result.error) {
      toast({
        description: _result.error,
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
      return true
    }

    const errorTag = _result?.Messages?.[0]?.Tags.find(
      (tag) => tag.name.toLowerCase() === "error"
    )
    console.log("errorTag", errorTag)
    if (errorTag) {
      const errorMsg = _result.Messages[0]?.Data ?? errorTag.value
      toast({
        description: errorMsg,
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
      return true
    }
    return false
  }

  return (
    <AppContext.Provider
      value={{
        connectWallet,
        disconnectWallet,
        isConnected,
        setIsConnected,
        userAddress,
        setUserAddress,
        multiplyByPower,
        divideByPower,
        handleMessageResultError,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
