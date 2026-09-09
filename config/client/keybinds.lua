if Elit3.Main.UseWithKey.Enable then
    RegisterCommand('+carplay', function()
        TriggerEvent('elit3:carplay:openUI')
    end)

    RegisterCommand('-carplay', function()
    end)

    RegisterKeyMapping('+carplay', 'Open CarPlay', 'keyboard', Elit3.Main.UseWithKey.Keybind)
end

if Elit3.Main.UseWithCommand.Enable then
    RegisterCommand(Elit3.Main.UseWithCommand.Command, function()
        TriggerEvent('elit3:carplay:openUI')
    end)
end

if Elit3.Main.UseWithItem.Enable then
    TriggerEvent('items:client:UseItem', Elit3.Main.UseWithItem.Item)
end

RegisterCommand('installradio', function()
    TriggerEvent('elit3:carplay:installRadio')
end)

cache = {
    ped = PlayerPedId(),
    vehicle = GetVehiclePedIsIn(PlayerPedId(), false),
    serverId = GetPlayerServerId(PlayerId())
}

CreateThread(function()
    while true do
        Wait(100)
        cache.ped = PlayerPedId()
        cache.vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
        cache.serverId = GetPlayerServerId(PlayerId())
    end
end)

WEATHER_TYPES = {
    { name = 'CLEAR', hash = GetHashKey('CLEAR') },
    { name = 'CLOUDS', hash = GetHashKey('CLOUDS') },
    { name = 'RAIN', hash = GetHashKey('RAIN') },
    { name = 'SNOW', hash = GetHashKey('SNOW') },
    { name = 'FOGGY', hash = GetHashKey('FOGGY') },
    { name = 'THUNDER', hash = GetHashKey('THUNDER') },
}
