local json = require("json")

local function decodeMessageData(data)
    local status, decodedData = pcall(json.decode, data)
    if not status or type(decodedData) ~= 'table' then
        return false, nil
    end
    return true, decodedData
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

Markets = Markets or {}
WaitFor = WaitFor or {}
Creators = Creators or {}

local function isSenderWaiting(sender)
    return WaitFor[sender] ~= nil
end

Handlers.add("Create", Handlers.utils.hasMatchingTag("Action", "Create"), function(msg)
    local success, err = pcall(function()
        if isSenderWaiting(msg.From) then
            sendErrorMessage(msg, 'You already have a market in progress!')
            return
        end

        if type(msg.Tags.Title) ~= 'string' or msg.Tags.Title:match("^%s*$") then
            sendErrorMessage(msg, 'Title is required and must be a non-empty string!')
            return
        end

        if type(msg.Tags.Duration) ~= 'string' or msg.Tags.Duration:match("^%s*$") then
            sendErrorMessage(msg, 'Duration is required and must be a non-empty string!')
            return
        end

        if type(msg.Tags.TokenTxId) ~= 'string' or msg.Tags.TokenTxId:match("^%s*$") then
            sendErrorMessage(msg, 'TokenTxId is required and must be a non-empty string!')
            return
        end

        if type(msg.Tags.OptionA) ~= 'string' or msg.Tags.OptionA:match("^%s*$") then
            sendErrorMessage(msg, 'OptionA is required and must be a non-empty string!')
            return
        end

        if type(msg.Tags.OptionB) ~= 'string' or msg.Tags.OptionB:match("^%s*$") then
            sendErrorMessage(msg, 'OptionB is required and must be a non-empty string!')
            return
        end

        -- Prevent multiple creations while waiting for a response
        WaitFor[msg.From] = true

        ao.spawn(ao.env.Module.Id, { Tags = { Authority = ao.authorities[1] } })
        local childProcessId = Receive({ Action = "Spawned" }).Process
        print("childProcessId: " .. childProcessId)

        local marketInfo = {
            Title = msg.Tags.Title,
            Duration = msg.Tags.Duration,
            TokenTxId = msg.Tags.TokenTxId,
            OptionA = msg.Tags.OptionA,
            OptionB = msg.Tags.OptionB,
            ProcessId = childProcessId,
            Creator = msg.From,
            BlockHeight = tostring(msg["Block-Height"]),
            Timestamp = tostring(msg["Timestamp"]),
        }
        printData("marketInfo", marketInfo)

        ao.send({
            Target = childProcessId,
            Action = "Eval",
            Data = string.format([[
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
                    print("OptionA")
                    ao.send({ Target = msg.From, Data = MarketInfo.OptionA })
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
                    print("GetTokenTxId")
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


                MarketInfo = {
                    Title = "]] .. marketInfo.Title .. [[",
                    Duration = "]] .. marketInfo.Duration .. [[",
                    TokenTxId = "]] .. marketInfo.TokenTxId .. [[",
                    OptionA = "]] .. marketInfo.OptionA .. [[",
                    OptionB = "]] .. marketInfo.OptionB .. [[",
                    ProcessId = "]] .. childProcessId .. [[",
                    Creator = "]] .. msg.From .. [[",
                    BlockHeight = "]] .. marketInfo.BlockHeight .. [[",
                    Timestamp = "]] .. marketInfo.Timestamp .. [["
                    }
                TokenProcessId = "]] .. marketInfo.TokenTxId .. [["
                Creator = "]] .. msg.From .. [["
                Owner = ""
            ]])
        })

        Markets[childProcessId] = marketInfo
        printData("Markets[childProcessId]", Markets[childProcessId])

        -- Add childProcessId to the creator's list in Creators table
        Creators[msg.From] = Creators[msg.From] or {}
        -- Creators[msg.From][#Creators[msg.From] + 1] = childProcessId
        table.insert(Creators[msg.From], childProcessId)
        printData("Creators[msg.From] Created: ", Creators[msg.From])

        ao.send({ Target = msg.From, Data = "Market Created!" })

        WaitFor[msg.From] = nil -- Remove sender from WaitFor set
    end)

    if not success then
        sendErrorMessage(msg, 'An unexpected error occurred: ' .. tostring(err))
        WaitFor[msg.From] = nil -- Reset WaitFor in case of error
    end
end)

Handlers.add("List", Handlers.utils.hasMatchingTag("Action", "List"), function(msg)
    local success, err = pcall(function()
        local order = msg.Tags.Order or "asc"
        local limit = tonumber(msg.Tags.Limit) or 10
        local page = tonumber(msg.Tags.Page) or 1

        -- Validate 'Order' parameter
        local validOrders = { asc = true, desc = true }
        if not validOrders[order] then
            sendErrorMessage(msg, 'Invalid Order parameter. Must be "asc" or "desc".')
            return
        end

        -- Validate 'Limit' and 'Page' parameters
        if limit < 1 or page < 1 then
            sendErrorMessage(msg, 'Limit and Page must be positive integers.')
            return
        end

        -- Calculate skip based on page and limit
        local skip = (page - 1) * limit

        -- Sort `Markets` in place if it's an array-like table
        local sortedRecords = {}
        for k, v in pairs(Markets) do
            table.insert(sortedRecords, v)
        end

        table.sort(sortedRecords, function(a, b)
            if order == "asc" then
                return a.BlockHeight < b.BlockHeight
            else
                return a.BlockHeight > b.BlockHeight
            end
        end)

        -- Extract the requested subset of records
        local result = {}
        for i = skip + 1, math.min(#sortedRecords, skip + limit) do
            table.insert(result, sortedRecords[i])
        end

        -- Calculate pagination metadata
        local hasMore = (skip + limit) < #sortedRecords
        local nextPage = hasMore and (page + 1) or nil

        local response = {
            CurrentPage = page,
            NextPage = nextPage,
            HasMore = hasMore,
            Markets = result,
            TotalRecords = #sortedRecords
        }

        ao.send({ Target = msg.From, Data = json.encode(response) })
    end)

    if not success then
        sendErrorMessage(msg, 'An unexpected error occurred: ' .. tostring(err))
    end
end)

Handlers.add("Get", Handlers.utils.hasMatchingTag("Action", "Get"), function(msg)
    assert(type(msg.id) == 'string', 'id is required!')
    ao.send({
        Target = msg.From,
        Record = json.encode(Markets[msg.id])
    })
end)
