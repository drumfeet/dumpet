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

Handlers.add("Create", Handlers.utils.hasMatchingTag("Action", "Create"), function(msg)
    local success, err = pcall(function()
        -- Check if the sender is already waiting for a response
        for _, v in ipairs(WaitFor) do
            if v == msg.From then
                sendErrorMessage(msg, 'You already have a market in progress!')
                return
            end
        end

        -- prevent multiple creations while waiting for response
        table.insert(WaitFor, msg.From)

        ao.spawn(ao.env.Module.Id, { Tags = { Authority = ao.authorities[1] } })
        local childProcessId = Receive({ Action = "Spawned" }).Process
        print("childProcessId: " .. childProcessId)

        -- Apply Template to childProcessId
        -- Set Owner to empty string
        ao.send({
            Target = childProcessId,
            Action = "Eval",
            Data = [[
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
        })

        -- Store childProcessId in Records
        Records[msg.From] = Records[msg.From] or {} -- Initialize if not exists
        table.insert(Records[msg.From], childProcessId)

        -- Send response to the sender
        ao.send({
            Target = msg.From,
            Data = "Market Created!"
        })

        -- Remove sender from WaitFor
        for i, v in ipairs(WaitFor) do
            if v == msg.From then
                table.remove(WaitFor, i)
                break
            end
        end
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
