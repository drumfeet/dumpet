local printData = function(k, v)
    local _data = {
        Key = k,
        Value = v
    }
    print(_data)
end
Handlers.add("Demo", Handlers.utils.hasMatchingTag("Action", "Demo"), function(msg)
    print("Demo")
    printData("msg", msg)
    ao.send({
        Target = msg.From,
        Data = "Demo"
    })
end)
