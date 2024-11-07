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
