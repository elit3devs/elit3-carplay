RegisterNetEvent('items:client:UseItem', function(itemName)
    if itemName == Elit3.Main.UseWithItem.Item then
        TriggerEvent('elit3:carplay:openUI')
    end
end)

RegisterNetEvent('QBCore:Client:OnJobUpdate', function(jobData)
end)

RegisterNetEvent('esx:setJob', function(job)
end)

RegisterNetEvent('QBCore:Client:OnPlayerUnload', function()
    if isUIOpen then
        SendNUIMessage({ action = 'closeUI' })
    end
end)

AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end

    if activeSounds and next(activeSounds) then
        for netVehId in pairs(activeSounds) do
            xSound:Destroy(-1, netVehId)
            activeSounds[netVehId] = nil
        end
    end
end)
