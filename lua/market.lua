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

Balances = Balances or {}                    -- table of balances from users that deposited to this market process
TotalBalances = TotalBalances or "0"         -- total balance deposited to this market process
BalancesVoteA = BalancesVoteA or {}          -- table of balances from users that voted OptionA
BalancesVoteB = BalancesVoteB or {}          -- table of balance from users that voted OptionB
TotalBalanceVoteA = TotalBalanceVoteA or "0" -- total amount of votes for OptionA
TotalBalanceVoteB = TotalBalanceVoteB or "0" -- total amount of votes for OptionB
-- AllVotesTotalBalance = AllVotesTotalBalance or "0" -- total amount of votes for OptionA and OptionB
BASE_UNIT = BASE_UNIT or 10
Denomination = Denomination or 12
MarketInfo = MarketInfo or {}
Creator = Creator or ""
MainProcessId = MainProcessId or ""
VotersProcessId = "566F7MCrrBhr87n7Hs5JKyEQeRlAT9A14G4OWxfS4kQ"

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

local function hasMarketExpired(msg)
    local duration_num = tonumber(MarketInfo.Duration)
    local timestamp = msg["Timestamp"]

    if not timestamp then
        sendErrorMessage(msg, 'Timestamp is required and cannot be nil!')
        return true
    end

    if MarketInfo.Concluded then
        sendErrorMessage(msg, 'Market has already been concluded.')
        return true
    end

    if timestamp > duration_num then
        sendErrorMessage(msg, 'Market duration has already expired.')
        return true
    end
end

Handlers.add("MainProcessId", Handlers.utils.hasMatchingTag("Action", "MainProcessId"), function(msg)
    ao.send({ Target = msg.From, Data = MainProcessId })
end)

Handlers.add("GetProcessOwner", Handlers.utils.hasMatchingTag("Action", "GetProcessOwner"), function(msg)
    ao.send({ Target = msg.From, Data = ao.env.Process.Owner })
end)

Handlers.add("GetOwner", Handlers.utils.hasMatchingTag("Action", "GetOwner"), function(msg)
    ao.send({ Target = msg.From, Data = Owner })
end)

Handlers.add("GetCreator", Handlers.utils.hasMatchingTag("Action", "GetCreator"), function(msg)
    ao.send({ Target = msg.From, Data = Creator })
end)

Handlers.add("GetMarketInfo", Handlers.utils.hasMatchingTag("Action", "GetMarketInfo"), function(msg)
    ao.send({
        Target = msg.From,
        Data = json.encode({
            MarketInfo = MarketInfo,
            BalancesVoteA = BalancesVoteA,
            BalancesVoteB = BalancesVoteB,
            TotalBalanceVoteA = TotalBalanceVoteA,
            TotalBalanceVoteB = TotalBalanceVoteB,
            BASE_UNIT = BASE_UNIT,
            Denomination = Denomination,
            Creator = Creator,
            MainProcessId = MainProcessId,

        })
    })
end)

Handlers.add("GetTokenTxId", Handlers.utils.hasMatchingTag("Action", "GetTokenTxId"), function(msg)
    ao.send({ Target = msg.From, Data = MarketInfo.TokenTxId })
end)

Handlers.add("CancelVote", Handlers.utils.hasMatchingTag("Action", "CancelVote"), function(msg)
    if (hasMarketExpired(msg)) then
        return
    end

    -- Define the original state variables and set them initially to nil
    local originalSenderBalance = nil
    local originalBalanceVoteA = nil
    local originalBalanceVoteB = nil
    local originalTotalBalanceVoteA = nil
    local originalTotalBalanceVoteB = nil
    local originalMainProcessBalance = nil

    local success, err = pcall(function()
        -- Check if Balances[msg.From] has enough balance to cancel votes
        local senderBalanceVoteA = BalancesVoteA[msg.From] or "0"
        local senderBalanceVoteB = BalancesVoteB[msg.From] or "0"
        if utils.toNumber(senderBalanceVoteA) <= 0 and utils.toNumber(senderBalanceVoteB) <= 0 then
            sendErrorMessage(msg, "No votes to cancel")
            return
        end

        -- Save the original states for rollback purposes
        originalSenderBalance = Balances[msg.From] or "0"
        originalBalanceVoteA = senderBalanceVoteA
        originalBalanceVoteB = senderBalanceVoteB
        originalTotalBalanceVoteA = TotalBalanceVoteA
        originalTotalBalanceVoteB = TotalBalanceVoteB
        originalMainProcessBalance = Balances[MainProcessId] or "0"

        -- Calculate the total votes being canceled
        local totalVotesToCancel = utils.add(senderBalanceVoteA, senderBalanceVoteB)

        -- Calculate the cancel fee (1 percent of the total votes being canceled)
        local cancelFee = utils.toBalanceValue(math.floor(utils.toNumber(totalVotesToCancel) * 0.01))

        -- Refund the user's canceled vote balances after deducting the fee
        local refundAmount = utils.subtract(totalVotesToCancel, cancelFee)

        -- Update balances for the user and MainProcessId
        Balances[msg.From] = utils.add(Balances[msg.From] or "0", refundAmount)
        Balances[MainProcessId] = utils.add(originalMainProcessBalance, cancelFee)

        -- Nullify user's votes and update total balances
        BalancesVoteA[msg.From] = nil
        BalancesVoteB[msg.From] = nil
        TotalBalanceVoteA = utils.subtract(TotalBalanceVoteA, senderBalanceVoteA)
        TotalBalanceVoteB = utils.subtract(TotalBalanceVoteB, senderBalanceVoteB)

        -- Prepare response data
        local _data = {
            From = msg.From,
            RefundAmount = refundAmount,
            CancelFee = cancelFee,
            NewBalance = Balances[msg.From],
            TotalBalanceVoteA = TotalBalanceVoteA,
            TotalBalanceVoteB = TotalBalanceVoteB,
            MainProcessBalance = Balances[MainProcessId]
        }
        printData("CancelVotes _data", _data)

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
        if originalBalanceVoteB then
            BalancesVoteB[msg.From] = originalBalanceVoteB
        end
        if originalTotalBalanceVoteA then
            TotalBalanceVoteA = originalTotalBalanceVoteA
        end
        if originalTotalBalanceVoteB then
            TotalBalanceVoteB = originalTotalBalanceVoteB
        end
        if originalMainProcessBalance then
            Balances[MainProcessId] = originalMainProcessBalance
        end

        sendErrorMessage(msg, 'An unexpected error occurred: ' .. tostring(err))
    end
end)

Handlers.add("VoteA", Handlers.utils.hasMatchingTag("Action", "VoteA"), function(msg)
    if (hasMarketExpired(msg)) then
        return
    end

    -- Define the original state variables and set them initially to nil
    local originalSenderBalance = nil
    local originalBalanceVoteA = nil
    local originalTotalBalanceVoteA = nil

    local success, err = pcall(function()
        -- Validate that msg.Tags.Quantity is a valid string representing a number greater than 0
        if type(msg.Tags.Quantity) ~= 'string' then
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
            -- TODO: can also included user balances as response
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
    if (hasMarketExpired(msg)) then
        return
    end

    -- Define the original state variables and set them initially to nil
    local originalSenderBalance = nil
    local originalBalanceVoteB = nil
    local originalTotalBalanceVoteB = nil

    local success, err = pcall(function()
        -- Validate that msg.Tags.Quantity is a valid string representing a number greater than 0
        if type(msg.Tags.Quantity) ~= 'string' then
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
        originalBalanceVoteB = BalancesVoteB[msg.From] or "0"
        originalTotalBalanceVoteB = TotalBalanceVoteB

        -- Perform balance updates
        Balances[msg.From] = utils.subtract(senderBalance, msg.Tags.Quantity)
        BalancesVoteB[msg.From] = utils.add(originalBalanceVoteB, msg.Tags.Quantity)
        TotalBalanceVoteB = utils.add(originalTotalBalanceVoteB, msg.Tags.Quantity)

        local _data = {
            From = msg.From,
            Quantity = msg.Tags.Quantity,
            NewBalance = Balances[msg.From],
            BalanceVoteB = BalancesVoteB[msg.From],
            TotalBalanceVoteB = TotalBalanceVoteB
        }
        printData("VoteB _data", _data)

        ao.send({ Target = msg.From, Data = json.encode(_data) })
    end)

    if not success then
        -- Rollback: restore original balances if an error occurred
        if originalSenderBalance then
            Balances[msg.From] = originalSenderBalance
        end
        if originalBalanceVoteB then
            BalancesVoteB[msg.From] = originalBalanceVoteB
        end
        if originalTotalBalanceVoteB then
            TotalBalanceVoteB = originalTotalBalanceVoteB
        end

        sendErrorMessage(msg, 'An unexpected error occurred: ' .. tostring(err))
    end
end)

Handlers.add("AllVotesBalances", Handlers.utils.hasMatchingTag("Action", "AllVotesBalances"), function(msg)
    ao.send({ Target = msg.From, Data = json.encode({ BalancesVoteA = BalancesVoteA, BalancesVoteB = BalancesVoteB }) })
end)

Handlers.add("TotalBalanceAllVotes", Handlers.utils.hasMatchingTag("Action", "TotalBalanceAllVotes"), function(msg)
    ao.send({
        Target = msg.From,
        Data = json.encode({
            TotalBalanceVoteA = TotalBalanceVoteA,
            TotalBalanceVoteB =
                TotalBalanceVoteB,
            TotalBalanceAllVotes = utils.add(TotalBalanceVoteA, TotalBalanceVoteB)
        })
    })
end)

Handlers.add("TotalBalanceVoteA", Handlers.utils.hasMatchingTag("Action", "TotalBalanceVoteA"), function(msg)
    ao.send({ Target = msg.From, Data = TotalBalanceVoteA })
end)

Handlers.add("TotalBalanceVoteB", Handlers.utils.hasMatchingTag("Action", "TotalBalanceVoteB"), function(msg)
    ao.send({ Target = msg.From, Data = TotalBalanceVoteB })
end)

Handlers.add("TotalVotersBalance", Handlers.utils.hasMatchingTag("Action", "TotalVotersBalance"), function(msg)
    ao.send({ Target = msg.From, Data = utils.add(TotalBalanceVoteA, TotalBalanceVoteB) })
end)

Handlers.add("UserBalanceVoteA", Handlers.utils.hasMatchingTag("Action", "UserBalanceVoteA"), function(msg)
    local bal = '0'

    -- If not Recipient is provided, then return the Senders balance
    if (msg.Tags.Recipient) then
        if (BalancesVoteA[msg.Tags.Recipient]) then
            bal = BalancesVoteA[msg.Tags.Recipient]
        end
    elseif msg.Tags.Target and BalancesVoteA[msg.Tags.Target] then
        bal = BalancesVoteA[msg.Tags.Target]
    elseif BalancesVoteA[msg.From] then
        bal = BalancesVoteA[msg.From]
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

Handlers.add("UserBalanceVoteB", Handlers.utils.hasMatchingTag("Action", "UserBalanceVoteB"), function(msg)
    local bal = '0'

    -- If not Recipient is provided, then return the Senders balance
    if (msg.Tags.Recipient) then
        if (BalancesVoteB[msg.Tags.Recipient]) then
            bal = BalancesVoteB[msg.Tags.Recipient]
        end
    elseif msg.Tags.Target and BalancesVoteB[msg.Tags.Target] then
        bal = BalancesVoteB[msg.Tags.Target]
    elseif BalancesVoteB[msg.From] then
        bal = BalancesVoteB[msg.From]
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

Handlers.add("UserBalancesAllVotes", Handlers.utils.hasMatchingTag("Action", "UserBalancesAllVotes"), function(msg)
    local function getBalance(balances, msg)
        if msg.Tags.Recipient and balances[msg.Tags.Recipient] then
            return balances[msg.Tags.Recipient]
        elseif msg.Tags.Target and balances[msg.Tags.Target] then
            return balances[msg.Tags.Target]
        elseif balances[msg.From] then
            return balances[msg.From]
        end
        return "0"
    end

    local balA = getBalance(BalancesVoteA, msg)
    local balB = getBalance(BalancesVoteB, msg)
    local userDepositBalance = getBalance(Balances, msg)

    local account = msg.Tags.Recipient or msg.From
    local _userBalanceAllVotes = utils.add(balA, balB)
    local _data = {
        UserDepositBalance = userDepositBalance,
        BalanceVoteA = balA,
        BalanceVoteB = balB,
        UserBalanceAllVotes = _userBalanceAllVotes,
        Account = account,
    }

    if msg.reply then
        msg.reply({
            UserDepositBalance = userDepositBalance,
            BalanceVoteA = balA,
            BalanceVoteB = balB,
            UserBalanceAllVotes = _userBalanceAllVotes,
            Account = account,
            Data = json.encode(_data)
        })
    else
        Send({
            Target = msg.From,
            UserDepositBalance = userDepositBalance,
            BalanceVoteA = balA,
            BalanceVoteB = balB,
            UserBalanceAllVotes = _userBalanceAllVotes,
            Account = account,
            Data = json.encode(_data)
        })
    end
end)

Handlers.add("Withdraw", Handlers.utils.hasMatchingTag("Action", "Withdraw"), function(msg)
    local success, err = pcall(function()
        -- Validate that msg.Tags.Quantity is a valid string representing a number greater than 0
        if type(msg.Tags.Quantity) ~= 'string' then
            sendErrorMessage(msg, "Quantity must be a valid string representing a number greater than 0")
            return
        end

        -- Check if the Quantity is a positive number
        local quantity = tonumber(msg.Tags.Quantity)
        if not quantity or quantity <= 0 then
            sendErrorMessage(msg, "Quantity must be greater than 0")
            return
        end

        -- Check if Balances[msg.From] has enough balance
        if not Balances[msg.From] then
            sendErrorMessage(msg, 'Account has no balance')
            return
        end

        if utils.toNumber(Balances[msg.From]) < utils.toNumber(msg.Tags.Quantity) then
            sendErrorMessage(msg, 'Insufficient funds')
            return
        end

        ao.send({
            Target = MarketInfo.TokenTxId,
            Action = "Transfer",
            Recipient = msg.From,
            Quantity = msg.Tags.Quantity,
        })
        Balances[msg.From] = utils.subtract(Balances[msg.From], msg.Tags.Quantity)
    end)

    if not success then
        sendErrorMessage(msg, 'An unexpected error occurred: ' .. tostring(err))
    end
end)

Handlers.add("WithdrawRewards", Handlers.utils.hasMatchingTag("Action", "WithdrawRewards"), function(msg)
    local success, err = pcall(function()
        -- only the creator can withdraw rewards
        if msg.From ~= Creator then
            sendErrorMessage(msg, 'Only the creator can withdraw rewards')
            return
        end

        ao.send({
            Target = MarketInfo.AoTokenProcessId,
            Action = "Transfer",
            Recipient = Creator,
            Quantity = msg.Tags.Quantity,
        })
    end)

    if not success then
        sendErrorMessage(msg, 'An unexpected error occurred: ' .. tostring(err))
    end
end)

Handlers.add("Conclude", Handlers.utils.hasMatchingTag("Action", "Conclude"), function(msg)
    local success, err = pcall(function()
        -- Ensure timestamp and duration are valid
        local duration_num = tonumber(MarketInfo.Duration)
        local timestamp = msg["Timestamp"]

        if not timestamp then
            sendErrorMessage(msg, 'Timestamp is required and cannot be nil!')
            return
        end

        if MarketInfo.Concluded then
            sendErrorMessage(msg, 'Market has already been concluded.')
            return
        end

        -- TODO: uncomment this block
        if timestamp < duration_num then
            sendErrorMessage(msg, 'Market duration has not yet expired.')
            return
        end

        -- Determine the winning side
        local winner, winnerBalances, winnerTotal
        local loserBalances, loserTotal

        if utils.toNumber(TotalBalanceVoteA) > utils.toNumber(TotalBalanceVoteB) then
            winner = MarketInfo.OptionA
            winnerBalances = BalancesVoteA
            winnerTotal = TotalBalanceVoteA
            loserBalances = BalancesVoteB
            loserTotal = TotalBalanceVoteB
        else
            winner = MarketInfo.OptionB
            winnerBalances = BalancesVoteB
            winnerTotal = TotalBalanceVoteB
            loserBalances = BalancesVoteA
            loserTotal = TotalBalanceVoteA
        end

        if utils.toNumber(winnerTotal) == 0 or utils.toNumber(loserTotal) == 0 then
            -- distribute back all funds to the voters balances
            for voter, balance in pairs(winnerBalances) do
                Balances[voter] = utils.add(Balances[voter] or "0", balance)
            end

            for voter, balance in pairs(loserBalances) do
                Balances[voter] = utils.add(Balances[voter] or "0", balance)
            end

            sendErrorMessage(msg, 'Market concluded without a winner; funds have been returned to all participants.')
            MarketInfo.Concluded = true
            return
        end

        -- loserBalances will be distributed to the winning voters
        -- Distribute rewards proportionally to winning voters
        for voter, balance in pairs(winnerBalances) do
            local proportion = utils.toNumber(balance) / utils.toNumber(winnerTotal)
            local reward = proportion * utils.toNumber(loserTotal)
            -- add the reward to the voter's balances
            Balances[voter] = utils.add(Balances[voter] or "0", utils.toBalanceValue(reward))
            -- return the voter's original vote balances
            Balances[voter] = utils.add(Balances[voter] or "0", balance)
        end

        -- Mark the market as concluded
        MarketInfo.Concluded = true

        -- Send a success message
        local _data = {
            Message = "Market concluded successfully.",
            Winner = winner,
            RewardPool = loserTotal,
            MarketInfo = MarketInfo,
        }
        ao.send({ Target = msg.From, Data = json.encode(_data) })
    end)

    if not success then
        sendErrorMessage(msg, 'An unexpected error occurred: ' .. tostring(err))
    end
end)

Handlers.add("Credit-Notice", Handlers.utils.hasMatchingTag("Action", "Credit-Notice"), function(msg)
    if (hasMarketExpired(msg)) then
        -- return funds to sender
        ao.send({
            Target = msg.From, -- user token PROCESS_ID
            Action = "Transfer",
            Recipient = msg.Tags.Sender,
            Quantity = msg.Tags.Quantity,
        })
        sendErrorMessage(msg, '', msg.Tags.Sender)
        return
    end

    ao.send({
        Target = VotersProcessId,
        Action = "Upsert",
        ProfileId = msg.Tags.Sender,
        MarketProcessId = MarketInfo.ProcessId,
        Title = MarketInfo
            .Title
    })

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
