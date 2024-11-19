local json = require("json")

Voters = Voters or {}

local function printData(k, v)
    local _data = { Key = k, Value = v }
    print(_data.Key .. ": " .. _data.Value)
end

local function sendErrorMessage(msg, err, target)
    local targetId = target or msg.From
    ao.send({ Target = targetId, Error = "true", Data = err })
    printData("Error", "Target " .. targetId .. ": " .. err)
end

Handlers.add("Upsert", Handlers.utils.hasMatchingTag("Action", "Upsert"), function(msg)
    local success, err = pcall(function()
        if type(msg.Tags.MarketProcessId) ~= 'string' or msg.Tags.MarketProcessId:match("^%s*$") then
            sendErrorMessage(msg, 'MarketProcessId is required and must be a non-empty string!')
            return
        end

        if type(msg.Tags.Title) ~= 'string' or msg.Tags.Title:match("^%s*$") then
            sendErrorMessage(msg, 'Title is required and must be a non-empty string!')
            return
        end

        Voters[msg.From] = Voters[msg.From] or {}

        -- Upsert logic with insertion at the beginning
        local updated = false
        for _, profile in ipairs(Voters[msg.From]) do
            if profile.MarketProcessId == msg.Tags.MarketProcessId then
                profile.Title = msg.Tags.Title
                updated = true
                break
            end
        end

        if not updated then
            -- Insert at the first position (index 1)
            table.insert(Voters[msg.From], 1, {
                Title = msg.Tags.Title,
                MarketProcessId = msg.Tags.MarketProcessId,
            })
        end

        ao.send({ Target = msg.From, Data = "Upsert successful" })
    end)
    if not success then
        sendErrorMessage(msg, 'An unexpected error occurred: ' .. tostring(err))
    end
end)

Handlers.add("Voters", Handlers.utils.hasMatchingTag("Action", "Voters"), function(msg)
    if msg.reply then
        msg.reply({ Data = json.encode(Voters) })
    else
        Send({ Target = msg.From, Data = json.encode(Voters) })
    end
end)

Handlers.add("Voter", Handlers.utils.hasMatchingTag("Action", "Voter"), function(msg)
    if (msg.Tags.ProfileId) then
        if (Voters[msg.Tags.ProfileId]) then
            Send({ Target = msg.From, Data = json.encode(Voters[msg.Tags.ProfileId]) })
        end
    elseif msg.Tags.Target and Voters[msg.Tags.Target] then
        Send({ Target = msg.From, Data = json.encode(Voters[msg.Tags.Target]) })
    elseif Voters[msg.From] then
        Send({ Target = msg.From, Data = json.encode(Voters[msg.Tags.From]) })
    end
end)
