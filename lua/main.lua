local json = require("json")
Records = Records or {}
Handlers.add("Create", Handlers.utils.hasMatchingTag("Action", "Create"), function(msg)
    print("Start")

    -- Spawn a process
    Spawn(ao.env.Module.Id, { Tags = { Authority = ao.authorities[1] } })
    Child = Receive({ Action = "Spawned" }).Process

    -- Get Process Id
    print("Spawned Process ID: " .. Child)

    -- Apply Template to Child Process
    -- Set Owner to empty string
    ao.send({
        Target = Child,
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
            end)

            Handlers.add("Withdraw", Handlers.utils.hasMatchingTag("Action", "Withdraw"), function(msg)
                print("Withdraw")
            end)

            Handlers.add("Conclude", Handlers.utils.hasMatchingTag("Action", "Conclude"), function(msg)
                print("Conclude")
            end)
            Creator = "]] .. msg.From .. [["
            Owner = ""
        ]]
    })

    -- Store child process id in Records
    Records[msg.From] = Child

    print("End")
end)

Handlers.add("Delete", Handlers.utils.hasMatchingTag("Action", "Delete"), function(msg)
    print("Delete")
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