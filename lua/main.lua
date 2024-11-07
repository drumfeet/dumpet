local json = require("json")

local function decodeMessageData(data)
    local status, decodedData = pcall(json.decode, data)

    if not status or type(decodedData) ~= 'table' then
        return false, nil
    end

    return true, decodedData
end

local printData = function(k, v)
    local _data = {
        Key = k,
        Value = v
    }
    print(_data)
end

local sendErrorMessage = function(msg, err, target)
    if not target then
        ao.send({ Target = msg.From, Error = "true", Data = err })
        printData("Error", "Target" .. " " .. msg.From .. " " .. err)
    else
        ao.send({ Target = target, Error = "true", Data = err })
        printData("Error", "Target" .. " " .. target .. " " .. err)
    end
end

Records = Records or {}
WaitFor = WaitFor or {}

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

        -- Prevent multiple creations while waiting for a response
        WaitFor[msg.From] = true

        ao.spawn(ao.env.Module.Id, { Tags = { Authority = ao.authorities[1] } })
        local childProcessId = Receive({ Action = "Spawned" }).Process
        print("childProcessId: " .. childProcessId)

        ao.send({
            Target = childProcessId,
            Action = "Eval",
            Data = string.format([[
                Creator = Creator or ""

                Handlers.add("GetProcessOwner", Handlers.utils.hasMatchingTag("Action", "GetProcessOwner"), function(msg)
                    print("GetProcessOwner")
                    print("ao.env.Process.Owner: " .. ao.env.Process.Owner)
                    ao.send({
                        Target = msg.From,
                        Data = ao.env.Process.Owner
                    })
                end)

                Handlers.add("GetOwner", Handlers.utils.hasMatchingTag("Action", "GetOwner"), function(msg)
                    print("GetOwner")
                    print("Owner: " .. Owner)
                    ao.send({
                        Target = msg.From,
                        Data = Owner
                    })
                end)

                Handlers.add("GetCreator", Handlers.utils.hasMatchingTag("Action", "GetCreator"), function(msg)
                    print("GetCreator")
                    print("Creator: " .. Creator)
                    ao.send({
                        Target = msg.From,
                        Data = Creator
                    })
                end)

                Handlers.add("Deposit", Handlers.utils.hasMatchingTag("Action", "Deposit"), function(msg)
                    print("Deposit")
                    ao.send({
                        Target = msg.From,
                        Data = "Deposit"
                    })
                end)

                Handlers.add("Withdraw", Handlers.utils.hasMatchingTag("Action", "Withdraw"), function(msg)
                    print("Withdraw")
                    ao.send({
                        Target = msg.From,
                        Data = "Withdraw"
                    })
                end)

                Handlers.add("Conclude", Handlers.utils.hasMatchingTag("Action", "Conclude"), function(msg)
                    print("Conclude")
                    ao.send({
                        Target = msg.From,
                        Data = "Conclude"
                    })
                end)

                Creator = "]] .. msg.From .. [["
                Owner = ""
            ]]
            )
        })

 
        Records[msg.From] = Records[msg.From] or {}
        Records[msg.From][#Records[msg.From] + 1] = {
            Title = msg.Tags.Title,
            Duration = msg.Tags.Duration,
            TokenTxId = msg.Tags.TokenTxId,
            ProcessId = childProcessId
        }

        ao.send({ Target = msg.From, Data = "Market Created!" })

        WaitFor[msg.From] = nil -- Remove sender from WaitFor set
    end)

    if not success then
        sendErrorMessage(msg, 'An unexpected error occurred: ' .. tostring(err))
    end
end)


Handlers.add("List", Handlers.utils.hasMatchingTag("Action", "List"), function(msg)
    print("List")
end)

Handlers.add("Get", Handlers.utils.hasMatchingTag("Action", "Get"), function(msg)
    assert(type(msg.id) == 'string', 'id is required!')
    ao.send({
        Target = msg.From,
        Record = json.encode(Records[msg.id])
    })
end)
