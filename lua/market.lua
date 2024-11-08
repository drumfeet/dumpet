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

WAR_PROCESS_ID = "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10"
DUMPET_PROCESS_ID = "fzkhRptIvW3tJ7Dz7NFgt2DnZTJVKnwtzEOuURjfXrQ"
Balances = Balances or {}
BASE_UNIT = BASE_UNIT or 10
Denomination = Denomination or 12

Creator = Creator or ""
TotalDeposit = TotalDeposit or "0"
MarketInfo = MarketInfo or {}

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

Handlers.add("Deposit", Handlers.utils.hasMatchingTag("Action", "Deposit"), function(msg)
    print("Deposit")
    ao.send({ Target = msg.From, Data = "Deposit" })
end)

Handlers.add("Withdraw", Handlers.utils.hasMatchingTag("Action", "Withdraw"), function(msg)
    print("Withdraw")
    ao.send({ Target = msg.From, Data = "Withdraw" })
end)

Handlers.add("Conclude", Handlers.utils.hasMatchingTag("Action", "Conclude"), function(msg)
    print("Conclude")
    ao.send({ Target = msg.From, Data = "Conclude" })
end)

Handlers.add("GetMarketInfo", Handlers.utils.hasMatchingTag("Action", "GetMarketInfo"), function(msg)
    print("GetMarketInfo")
    ao.send({ Target = msg.From, Data = json.encode(MarketInfo) })
end)

Handlers.add("Credit-Notice", Handlers.utils.hasMatchingTag("Action", "Credit-Notice"), function(msg)
    if msg.From == DUMPET_PROCESS_ID or msg.From == WAR_PROCESS_ID then
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
