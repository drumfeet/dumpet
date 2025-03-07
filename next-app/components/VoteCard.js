import React from "react"
import { RefreshCcw } from "lucide-react"
import { useAppContext } from "@/context/AppContext"

const VoteCard = ({
  title,
  votes = 0,
  totalVotes = 0,
  onVote,
  onRefresh,
  color,
  tokenSymbol,
  tokenDenomination,
}) => {
  const { divideByPower } = useAppContext()

  return (
    <div
      className={`bg-[#232344] rounded-xl p-6 border-2 ${color.border} ${color.hoverBorder} transition-colors`}
    >
      <h2 className="text-3xl font-bold mb-6 text-center">{title}</h2>
      <p className="text-sm text-gray-300 mb-4">
        Your Total Vote: {divideByPower(votes, tokenDenomination)}{" "}
        {` $${tokenSymbol}`}
      </p>
      <button
        onClick={async (event) => {
          const button = event.target
          try {
            button.disabled = true
            await onVote()
          } catch (error) {
            console.error(error)
          } finally {
            button.disabled = false
          }
        }}
        className={`w-full ${color.bg} ${color.hoverBg} py-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        Vote
      </button>
      <div className="mt-6 pt-6 border-t border-[#2f2f5a]">
        <p className="text-sm text-gray-300 flex items-center justify-center gap-2">
          <button
            className="p-1 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={async (event) => {
              const button = event.currentTarget
              try {
                button.disabled = true
                await onRefresh()
              } catch (error) {
                console.error(error)
              } finally {
                button.disabled = false
              }
            }}
          >
            <RefreshCcw size={16} />
          </button>
          TOTAL VOTES: {divideByPower(totalVotes, tokenDenomination)}{" "}
          {`$${tokenSymbol}`}
        </p>
      </div>
    </div>
  )
}

export default VoteCard
