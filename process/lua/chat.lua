local json = require("json")

local function printData(k, v)
    local _data = { Key = k, Value = v }
    print(_data)
end

local function sendErrorMessage(msg, err, target)
    local targetId = target or msg.From
    ao.send({ Target = targetId, Error = "true", Data = err })
    printData("Error", "Target" .. " " .. targetId .. " " .. err)
end

Chats = Chats or {}

Handlers.add("AddChat", { Action = "AddChat" }, function(msg)
    local userId = msg.From
    local chatMsg = msg.Tags.ChatMsg
    local timestamp = msg["Timestamp"]

    -- insertion at the end of the array table
    table.insert(Chats, {
        ChatMsg = chatMsg,
        UserId = userId,
        Timestamp = timestamp
    })

    -- Keep only the latest 100 messages
    if #Chats > 100 then
        table.remove(Chats, 1) -- Remove the oldest message
    end

    print("AddChat " .. chatMsg)
end)

Handlers.add("List", { Action = "List" }, function(msg)
    local success, err = pcall(function()
        local order = msg.Tags.Order or "desc"
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

        -- Prepare chats for pagination
        local sortedChats = Chats
        if order == "desc" then
            sortedChats = {}
            for i = #Chats, 1, -1 do
                table.insert(sortedChats, Chats[i])
            end
        end

        -- Calculate pagination
        local totalRecords = #sortedChats
        local skip = (page - 1) * limit
        local result = {}

        for i = skip + 1, math.min(skip + limit, totalRecords) do
            table.insert(result, sortedChats[i])
        end

        local hasMore = skip + limit < totalRecords
        local nextPage = hasMore and (page + 1) or nil

        -- Create response
        local response = {
            CurrentPage = page,
            NextPage = nextPage,
            HasMore = hasMore,
            Chats = result,
            TotalRecords = totalRecords
        }

        -- Send response back to user
        ao.send({ Target = msg.From, Data = json.encode(response) })
    end)

    if not success then
        sendErrorMessage(msg, 'An unexpected error occurred: ' .. tostring(err))
    end
end)
