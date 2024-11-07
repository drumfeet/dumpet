Handlers.add("Demo", Handlers.utils.hasMatchingTag("Action", "Demo"), function(msg)
    print("Demo")
    ao.send({
        Target = msg.From,
        Data = "Demo"
    })
end)
