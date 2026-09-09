-- Framework-specific event handlers
-- These events handle framework-specific behavior

-- QBCore/QBX Item Use
RegisterNetEvent('items:client:UseItem', function(itemName)
    if itemName == Elit3.Main.UseWithItem.Item then
        TriggerEvent('elit3:carplay:openUI')
    end
end)

-- Handle player job updates
RegisterNetEvent('QBCore:Client:OnJobUpdate', function(jobData)
    -- Job updated, can refresh UI if needed
end)

RegisterNetEvent('esx:setJob', function(job)
    -- ESX job update
end)

-- Handle player logout/disconnect cleanup
RegisterNetEvent('QBCore:Client:OnPlayerUnload', function()
    if isUIOpen then
        SendNUIMessage({ action = "closeUI" })
    end
end)

-- Ensure all sounds are cleaned up when resource stops
AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
    
    if next(activeSounds) then
        for netVehId in pairs(activeSounds) do
            xSound:Destroy(-1, netVehId)
            activeSounds[netVehId] = nil
        end
    end
end)
