local bint = require('.bint')(256)
local json = require("json")
local utils = {
    add = function(a, b)
        return tostring(bint(a) + bint(b))
    end,
    subtract = function(a, b)
        return tostring(bint(a) - bint(b))
    end,
    toBalanceValue = function(a)
        return tostring(bint(a))
    end,
    toNumber = function(a)
        return bint.tonumber(a)
    end
}

Balances = Balances or {}
TotalBalances = TotalBalances or "0"
BalancesVoteA = BalancesVoteA or {}
BalancesVoteB = BalancesVoteB or {}
TotalBalanceVoteA = TotalBalanceVoteA or "0"
TotalBalanceVoteB = TotalBalanceVoteB or "0"
BASE_UNIT = BASE_UNIT or 10
Denomination = Denomination or 12
MarketInfo = MarketInfo or {}
Creator = Creator or ""

local multiplyByPower = function(v)
    return v * (BASE_UNIT ^ Denomination)
end

local divideByPower = function(v)
    return v / (BASE_UNIT ^ Denomination)
end

local function printData(k, v)
    local _data = { Key = k, Value = v }
    print(_data)
end

local function sendErrorMessage(msg, err, target)
    local targetId = target or msg.From
    ao.send({ Target = targetId, Error = "true", Data = err })
    printData("Error", "Target" .. " " .. targetId .. " " .. err)
end

Handlers.add("GetProcessOwner", Handlers.utils.hasMatchingTag("Action", "GetProcessOwner"), function(msg)
    print("GetProcessOwner")
    ao.send({ Target = msg.From, Data = ao.env.Process.Owner })
end)

Handlers.add("GetOwner", Handlers.utils.hasMatchingTag("Action", "GetOwner"), function(msg)
    print("GetOwner")
    ao.send({ Target = msg.From, Data = Owner })
end)

Handlers.add("GetCreator", Handlers.utils.hasMatchingTag("Action", "GetCreator"), function(msg)
    print("GetCreator")
    ao.send({ Target = msg.From, Data = Creator })
end)

Handlers.add("VoteA", Handlers.utils.hasMatchingTag("Action", "VoteA"), function(msg)
    -- Define the original state variables and set them initially to nil
    local originalSenderBalance = nil
    local originalBalanceVoteA = nil
    local originalTotalBalanceVoteA = nil

    local success, err = pcall(function()
        -- Validate that msg.Tags.Quantity is a valid string representing a number greater than 0
        if type(msg.Tags.Quantity) ~= 'string' or msg.Tags.Quantity:match("^%s*$") then
            sendErrorMessage(msg, "Quantity must be a valid string representing a number greater than 0")
            return
        end

        -- Check if the Quantity is a positive number
        local quantity = tonumber(msg.Tags.Quantity)
        if not quantity or quantity <= 0 then
            sendErrorMessage(msg, "Quantity must be greater than 0")
            return
        end

        -- Check if Balances[msg.From] has enough balance to vote
        local senderBalance = Balances[msg.From] or "0"
        if tonumber(senderBalance) < quantity then
            sendErrorMessage(msg, "Insufficient balance to vote")
            return
        end

        -- Save the original states for rollback purposes
        originalSenderBalance = senderBalance
        originalBalanceVoteA = BalancesVoteA[msg.From] or "0"
        originalTotalBalanceVoteA = TotalBalanceVoteA

        -- Perform balance updates
        Balances[msg.From] = utils.subtract(senderBalance, msg.Tags.Quantity)
        BalancesVoteA[msg.From] = utils.add(originalBalanceVoteA, msg.Tags.Quantity)
        TotalBalanceVoteA = utils.add(originalTotalBalanceVoteA, msg.Tags.Quantity)

        -- Prepare data to be returned
        local _data = {
            From = msg.From,
            Quantity = msg.Tags.Quantity,
            NewBalance = Balances[msg.From],
            BalanceVoteA = BalancesVoteA[msg.From],
            TotalBalanceVoteA = TotalBalanceVoteA
        }
        printData("VoteA _data", _data)

        ao.send({ Target = msg.From, Data = json.encode(_data) })
    end)

    if not success then
        -- Rollback: restore original balances if an error occurred
        if originalSenderBalance then
            Balances[msg.From] = originalSenderBalance
        end
        if originalBalanceVoteA then
            BalancesVoteA[msg.From] = originalBalanceVoteA
        end
        if originalTotalBalanceVoteA then
            TotalBalanceVoteA = originalTotalBalanceVoteA
        end

        sendErrorMessage(msg, 'An unexpected error occurred: ' .. tostring(err))
    end
end)

Handlers.add("VoteB", Handlers.utils.hasMatchingTag("Action", "VoteB"), function(msg)

end)

Handlers.add("Withdraw", Handlers.utils.hasMatchingTag("Action", "Withdraw"), function(msg)
    print("Withdraw")
    ao.send({ Target = msg.From, Data = "Withdraw" })
end)

Handlers.add("WithdrawRewards", Handlers.utils.hasMatchingTag("Action", "WithdrawRewards"), function(msg)
    -- only the creator can withdraw rewards
    print("WithdrawRewards")
    ao.send({ Target = msg.From, Data = "WithdrawRewards" })
end)

Handlers.add("Conclude", Handlers.utils.hasMatchingTag("Action", "Conclude"), function(msg)
    print("Conclude")
    ao.send({ Target = msg.From, Data = "Conclude" })
end)

Handlers.add("GetMarketInfo", Handlers.utils.hasMatchingTag("Action", "GetMarketInfo"), function(msg)
    print("GetMarketInfo")
    ao.send({ Target = msg.From, Data = json.encode(MarketInfo) })
end)

Handlers.add("GetTokenTxId", Handlers.utils.hasMatchingTag("Action", "GetTokenTxId"), function(msg)
    ao.send({ Target = msg.From, Data = MarketInfo.TokenTxId })
end)

Handlers.add("Credit-Notice", Handlers.utils.hasMatchingTag("Action", "Credit-Notice"), function(msg)
    if msg.From == MarketInfo.TokenTxId then
        -- if Sender is the process itself
        if msg.Tags.Sender == msg.From then
            local currentVal = Balances[ao.id] or "0"
            Balances[ao.id] = utils.add(currentVal, msg.Tags.Quantity)
            printData("Balances[ao.id]", {
                Action = "Credit-Notice",
                Quantity = msg.Tags.Quantity,
                From = msg.From,
                Sender = msg.Tags.Sender,
                BlockHeight = msg["Block-Height"],
                Timestamp = msg["Timestamp"],
                Balance = Balances[ao.id],
            })
        else
            local currentVal = Balances[msg.Tags.Sender] or "0"
            Balances[msg.Tags.Sender] = utils.add(currentVal, msg.Tags.Quantity)
            printData("Balances[msg.Tags.Sender]", {
                Action = "Credit-Notice",
                Quantity = msg.Tags.Quantity,
                From = msg.From,
                Sender = msg.Tags.Sender,
                BlockHeight = msg["Block-Height"],
                Timestamp = msg["Timestamp"],
                Balance = Balances[ao.id],
            })
        end

        TotalBalances = utils.add(TotalBalances, msg.Tags.Quantity)
    else
        ao.send({
            Target = msg.From, -- user token PROCESS_ID
            Action = "Transfer",
            Recipient = msg.Tags.Sender,
            Quantity = msg.Tags.Quantity,
        })
        sendErrorMessage(msg, 'Invalid token received', msg.Tags.Sender)
    end
end)

Handlers.add('Balance', Handlers.utils.hasMatchingTag("Action", "Balance"), function(msg)
    local bal = '0'

    -- If not Recipient is provided, then return the Senders balance
    if (msg.Tags.Recipient) then
        if (Balances[msg.Tags.Recipient]) then
            bal = Balances[msg.Tags.Recipient]
        end
    elseif msg.Tags.Target and Balances[msg.Tags.Target] then
        bal = Balances[msg.Tags.Target]
    elseif Balances[msg.From] then
        bal = Balances[msg.From]
    end
    if msg.reply then
        msg.reply({
            Balance = bal,
            Ticker = Ticker,
            Account = msg.Tags.Recipient or msg.From,
            Data = bal
        })
    else
        Send({
            Target = msg.From,
            Balance = bal,
            Ticker = Ticker,
            Account = msg.Tags.Recipient or msg.From,
            Data = bal
        })
    end
end)

Handlers.add('Balances', Handlers.utils.hasMatchingTag("Action", "Balances"), function(msg)
    if msg.reply then
        msg.reply({ Data = json.encode(Balances) })
    else
        Send({ Target = msg.From, Data = json.encode(Balances) })
    end
end)
