local json = require("json")

Users = Users or {}

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
        if type(msg.Tags.ProfileId) ~= 'string' or msg.Tags.ProfileId:match("^%s*$") then
            sendErrorMessage(msg, 'ProfileId is required and must be a non-empty string!')
            return
        end

        if type(msg.Tags.MarketProcessId) ~= 'string' or msg.Tags.MarketProcessId:match("^%s*$") then
            sendErrorMessage(msg, 'MarketProcessId is required and must be a non-empty string!')
            return
        end

        if type(msg.Tags.Title) ~= 'string' or msg.Tags.Title:match("^%s*$") then
            sendErrorMessage(msg, 'Title is required and must be a non-empty string!')
            return
        end

        local profileId = msg.Tags.ProfileId
        printData("ProfileId", profileId)

        Users[profileId] = Users[profileId] or {}

        -- Upsert logic with insertion at the beginning
        local updated = false
        for _, profile in ipairs(Users[profileId]) do
            if profile.MarketProcessId == msg.Tags.MarketProcessId then
                profile.Title = msg.Tags.Title
                updated = true
                break
            end
        end

        if not updated then
            -- Insert at the first position (index 1)
            table.insert(Users[profileId], 1, {
                Title = msg.Tags.Title,
                MarketProcessId = msg.Tags.MarketProcessId,
            })
        end

        ao.send({ Target = profileId, Data = "Upsert successful" })
    end)
    if not success then
        sendErrorMessage(msg, 'An unexpected error occurred: ' .. tostring(err))
    end
end)

Handlers.add("Users", Handlers.utils.hasMatchingTag("Action", "Users"), function(msg)
    if msg.reply then
        msg.reply({ Data = json.encode(Users) })
    else
        Send({ Target = msg.From, Data = json.encode(Users) })
    end
end)

Handlers.add("User", Handlers.utils.hasMatchingTag("Action", "User"), function(msg)
    if type(msg.Tags.ProfileId) ~= 'string' or msg.Tags.ProfileId:match("^%s*$") then
        sendErrorMessage(msg, 'ProfileId is required and must be a non-empty string!')
        return
    end

    local markets = Users[msg.Tags.ProfileId] or {}
    local _data = json.encode({
        Target = msg.From,
        ProfileId = msg.Tags.ProfileId,
        Markets = markets
    })
    ao.send({ Target = msg.From, Data = _data })
end)
