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
BASE_UNIT = BASE_UNIT or 10
Denomination = Denomination or 12
TotalDeposit = TotalDeposit or "0"
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

Handlers.add("OptionA", Handlers.utils.hasMatchingTag("Action", "OptionA"), function(msg)

    -- TODO: Check if the user has enough balance to buy the option
end)

Handlers.add("OptionB", Handlers.utils.hasMatchingTag("Action", "OptionB"), function(msg)
    print("OptionB")
    ao.send({ Target = msg.From, Data = MarketInfo.OptionB })
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

        TotalDeposit = utils.add(TotalDeposit, msg.Tags.Quantity)
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
