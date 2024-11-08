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

Records = Records or {}
WaitFor = WaitFor or {}
Creators = Creators or {}

local function isSenderWaiting(sender)
    return WaitFor[sender] ~= nil
end

Handlers.add("Create", Handlers.utils.hasMatchingTag("Action", "Create"), function(msg)
    local success, err = pcall(function()
        if isSenderWaiting(msg.From) then
            sendErrorMessage(msg, 'You already have a market in progress!')
            WaitFor[msg.From] = nil -- Reset WaitFor in case of error
            return
        end

        if type(msg.Tags.Title) ~= 'string' or msg.Tags.Title:match("^%s*$") then
            sendErrorMessage(msg, 'Title is required and must be a non-empty string!')
            WaitFor[msg.From] = nil -- Reset WaitFor in case of error
            return
        end

        if type(msg.Tags.Duration) ~= 'string' or msg.Tags.Duration:match("^%s*$") then
            sendErrorMessage(msg, 'Duration is required and must be a non-empty string!')
            WaitFor[msg.From] = nil -- Reset WaitFor in case of error
            return
        end

        if type(msg.Tags.TokenTxId) ~= 'string' or msg.Tags.TokenTxId:match("^%s*$") then
            sendErrorMessage(msg, 'TokenTxId is required and must be a non-empty string!')
            WaitFor[msg.From] = nil -- Reset WaitFor in case of error
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
                local json = require("json")
                Creator = Creator or ""
                TotalDeposit = TotalDeposit or "0"
                MarketInfo = MarketInfo or {}
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
                MarketInfo = {
                    Title = "]] .. marketInfo.Title .. [[",
                    Duration = "]] .. marketInfo.Duration .. [[",
                    TokenTxId = "]] .. marketInfo.TokenTxId .. [[",
                    ProcessId = "]] .. childProcessId .. [[",
                    Creator = "]] .. msg.From .. [[",
                    BlockHeight = "]] .. marketInfo.BlockHeight .. [[",
                    Timestamp = "]] .. marketInfo.Timestamp .. [["
                    }
                Creator = "]] .. msg.From .. [["
                Owner = ""
            ]])
        })

        Records[childProcessId] = marketInfo
        printData("Records[childProcessId]", Records[childProcessId])

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

        -- Sort `Records` in place if it's an array-like table
        local sortedRecords = {}
        for k, v in pairs(Records) do
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
            Records = result,
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
        Record = json.encode(Records[msg.id])
    })
end)
