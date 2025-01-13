import React, { useState } from 'react';
import {
  Clock,
  Hash,
  User,
  Layers,
  Calendar,
  ArrowUpCircle,
  XCircle,
  CheckCircle,
  ExternalLink,
  Wallet,
  Copy
} from 'lucide-react';
import formatUnixTimestamp from '@/utils/FormatUnixTimeStamp';

const InfoItem = ({
  icon: Icon,
  label,
  value,
  copyable = false,
  link = "",
}) => {
  const handleCopy = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(value)
    // You might want to add a toast notification here to inform the user that the value has been copied
  }

  const handleLink = (e) => {
    e.stopPropagation()
    if (link) {
      window.open(link, "_blank")
    }
  }

  return (
    <div className="bg-[#1e1e38] p-3 rounded-md flex items-center space-x-3 border border-[#3a3a6a]">
      <Icon size={20} className="text-gray-300 flex-shrink-0" />
      <div className="flex-grow min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-200 truncate">{value}</p>
      </div>
      <div className="flex-shrink-0 flex space-x-2">
        {copyable && (
          <Copy
            size={16}
            className="text-gray-400 cursor-pointer hover:text-gray-200 transition-colors"
            onClick={handleCopy}
          />
        )}
        {link && (
          <ExternalLink
            size={16}
            className="text-gray-400 cursor-pointer hover:text-gray-200 transition-colors"
            onClick={handleLink}
          />
        )}
      </div>
    </div>
  )
}
  
const ActionButton = ({ text, color, icon: Icon }) => (
  <button
    className={`${color} px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 text-sm`}
  >
    <Icon size={16} />
    {text}
  </button>
)

const InfoContent = ({ title, duration, pid, betTokenId, creator, blockHeight, timestamp }) => {
  const [showBalances, setShowBalances] = useState(false);

  const userBalances = [
    {
      address: "0x1234...5678",
      balance: 10001000100010001000,
      vote: "Option A",
    },
    {
      address: "0x8765...4321",
      balance: 7501000100010001000,
      vote: "Option B",
    },
    { address: "0x2468...1357", balance: 500, vote: "Option A" },
    { address: "0x1357...2468", balance: 250, vote: "Option B" },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-6 rounded-lg space-y-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-center text-gray-200 mb-4">
        {title}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoItem
          icon={Clock}
          label="Expires on"
          value={formatUnixTimestamp(duration).toString()}
        />
        <InfoItem
          icon={Hash}
          label="Market ProcessId"
          value={pid}
          copyable={true}
          link="https://ao.link/#/entity/replacethisprocessid"
        />
        <InfoItem
          icon={Hash}
          label="Bet Token ProcessId"
          value={betTokenId}
          copyable={true}
          link="https://ao.link/#/entity/replacethisprocessid"
        />
        <InfoItem
          icon={User}
          label="Creator"
          value={creator}
          copyable={true}
          link="https://ao.link/#/entity/replacethisprocessid"
        />
        <InfoItem 
          icon={Layers} 
          label="BlockHeight" 
          value={blockHeight} 
        />
        <InfoItem
          icon={Calendar}
          label="Block Timestamp"
          value={formatUnixTimestamp(timestamp).toString()}
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
        <ActionButton
          text="Withdraw AO"
          color="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200"
          icon={ArrowUpCircle}
        />
        <ActionButton
          text="Cancel my votes"
          color="bg-amber-600/20 hover:bg-amber-600/30 text-amber-200"
          icon={XCircle}
        />
        <ActionButton
          text="Conclude"
          color="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200"
          icon={CheckCircle}
        />
      </div>

      <div className="mt-8">
        <button
          onClick={() => setShowBalances(!showBalances)}
          className="w-full bg-slate-700 text-gray-200 px-4 py-2 rounded-md hover:bg-slate-600 transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
        >
          <Wallet size={16} />
          {showBalances ? "Hide" : "Show"} User Balances
        </button>
        
        {showBalances && (
          <div className="mt-4 bg-[#2a2a4a] rounded-md p-3 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["Option A", "Option B"].map((option, index) => (
                <div key={option} className="space-y-2">
                  <h3
                    className={`text-sm font-medium mb-2 ${
                      index === 0 ? "text-red-400" : "text-blue-400"
                    }`}
                  >
                    {option} Votes
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-400">
                          <th className="pb-2 pr-4 font-normal">
                            Wallet Address
                          </th>
                          <th className="pb-2 font-normal">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userBalances
                          .filter((user) => user.vote === option)
                          .map((user, userIndex) => (
                            <tr
                              key={userIndex}
                              className="border-t border-gray-700"
                            >
                              <td className="py-2 pr-4 text-gray-300">
                                <a
                                  href={`https://ao.link/#/entity/${user.address}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  {user.address}
                                </a>
                              </td>
                              <td className="py-2 text-gray-300">
                                {user.balance} $DUMPET
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoContent;