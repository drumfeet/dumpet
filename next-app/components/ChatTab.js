import { useAppContext } from "@/context/AppContext"
import { useToast } from "@chakra-ui/react"
import {
  createDataItemSigner,
  message,
  result,
  dryrun,
} from "@permaweb/aoconnect"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendHorizontal, Copy, ExternalLink } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import areArraysEqual from "@/utils/AreArrayEquals"
import formatUnixTimestamp from "@/utils/FormatUnixTimeStamp"

const POLLING_INTERVAL = 5000

export default function ChatTab({ pid = null }) {
  const [chatId, setChatId] = useState(pid)
  const [chatMsg, setChatMsg] = useState("")
  const [messages, setMessages] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const messagesRef = useRef([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const chatEndRef = useRef(null)
  const toast = useToast()
  const { connectWallet } = useAppContext()

  useEffect(() => {
    const fetchMessages = async () => {
      // Only fetch the first page during polling
      if (currentPage === 1) {
        await get()
      }
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, POLLING_INTERVAL)
    return () => clearInterval(interval)
  }, [currentPage])

  const post = async (event) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    const _connected = await connectWallet()
    if (_connected.success === false) {
      return
    }
    if (!chatMsg.trim()) return

    setIsLoading(true)

    try {
      const messageId = await message({
        process: chatId,
        tags: [
          {
            name: "Action",
            value: "AddChat",
          },
          {
            name: "ChatMsg",
            value: chatMsg,
          },
        ],
        signer: createDataItemSigner(globalThis.arweaveWallet),
      })

      const _result = await result({
        message: messageId,
        process: chatId,
      })

      setChatMsg("")
      await get()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error sending message",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const get = async (nextPage = 1, limit = 100) => {
    try {
      const result = await dryrun({
        process: chatId,
        tags: [
          { name: "Action", value: "List" },
          { name: "Page", value: nextPage.toString() },
          { name: "Limit", value: limit.toString() },
          { name: "Order", value: "desc" },
        ],
      })
      if (result?.Messages[0]?.Data) {
        const _jsonData = JSON.parse(result?.Messages[0]?.Data)
        setHasMore(_jsonData.HasMore)

        if (nextPage === 1) {
          if (!areArraysEqual(_jsonData.Chats, messagesRef.current)) {
            setMessages(_jsonData.Chats || [])
            messagesRef.current = _jsonData.Chats || []
          }
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            ...(_jsonData.Chats || []),
          ])
          messagesRef.current = [
            ...messagesRef.current,
            ...(_jsonData.Chats || []),
          ]
        }
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Error fetching messages",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleLoadMore = async () => {
    try {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      setIsLoadingMore(true)
      await get(nextPage)
      setIsLoadingMore(false)
    } catch (error) {
      toast({
        title: "Error retrieving more messages",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      post()
    }
  }

  return (
    <div className="space-y-4 pt-6 text-gray-100">
      <form onSubmit={post} className="space-y-4">
        <Textarea
          placeholder="Type your message..."
          value={chatMsg}
          onKeyPress={handleKeyPress}
          onChange={(e) => setChatMsg(e.target.value)}
          className="w-full bg-[#1e1e38] text-gray-100 border-[#3a3a6a] focus:border-indigo-400"
        />
        <Button
          onClick={async (event) => {
            const button = event.target
            try {
              button.disabled = true
              await post()
            } catch (error) {
              console.error(error)
            } finally {
              button.disabled = false
            }
          }}
          className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300 text-gray-100 font-semibold py-2 px-4 rounded-md shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
        >
          <SendHorizontal size={18} />
          Send chat
        </Button>
      </form>
      <div className="space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="py-2 border-b border-[#3a3a6a] last:border-b-0"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 flex items-center gap-2">
                {msg.UserId?.slice(0, 8)}...{msg.UserId?.slice(-8)}
                <Copy
                  size={12}
                  className="cursor-pointer hover:text-gray-200 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(msg.UserId)
                    toast({
                      description: `${msg.UserId} has been copied!`,
                      status: "success",
                      duration: 2000,
                      isClosable: true,
                      position: "top",
                    })
                  }}
                />
                <ExternalLink
                  size={12}
                  className="cursor-pointer hover:text-gray-200 transition-colors"
                  onClick={() =>
                    window.open(
                      `https://ao.link/#/entity/${msg.UserId}`,
                      "_blank"
                    )
                  }
                />
              </span>
              <span className="text-xs text-gray-400">
                {formatUnixTimestamp(msg.Timestamp)}
              </span>
            </div>
            <p className="text-gray-200 break-words">{msg.ChatMsg}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
