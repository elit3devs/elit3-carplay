WEATHER_TYPES = {
    { hash = -1750463879, name = "CLEAR"      },
    { hash =  916995460,  name = "CLOUDS"     },
    { hash = -1530260698, name = "EXTRASUNNY" },
    { hash = -1148613331, name = "OVERCAST"   },
    { hash =  1420204096, name = "RAIN"       },
    { hash = -1233681761, name = "THUNDER"    },
    { hash = -1368164796, name = "SNOW"       },
    { hash = -1429616491, name = "XMAS"       },
}

function GetVehicleFuel(vehicle)
    return GetVehicleFuelLevel(vehicle)
end

RegisterNUICallback("openMap", function(data, cb)
    ActivateFrontendMenu(GetHashKey("FE_MENU_VERSION_MP_PAUSE"), 0, -1)
end)

function vehicleDoor(action)
    local vehicle = cache.vehicle
    if action == "all" then
        for door = 0, 7 do
            if not IsVehicleDoorDamaged(vehicle, door) then
                SetVehicleDoorOpen(vehicle, door, false, false)
            end
        end
    elseif action == "closeall" then
        for door = 0, 7 do
            if not IsVehicleDoorDamaged(vehicle, door) then
                SetVehicleDoorShut(vehicle, door, false)
            end
        end
    elseif type(action) == "number" then
        local isOpen = GetVehicleDoorAngleRatio(vehicle, action) > 0.1
        if isOpen then
            SetVehicleDoorShut(vehicle, action, false)
        else
            SetVehicleDoorOpen(vehicle, action, false, false)
        end
    elseif action == "engineOn" then
        SetVehicleEngineOn(vehicle, true, false, true)
    elseif action == "engineOff" then
        SetVehicleEngineOn(vehicle, false, false, true)
    end
end

if Elit3.Main.UseWithKey.Enable then
    lib.addKeybind({
        name        = "carplay",
        description = "press " .. Elit3.Main.UseWithKey.Keybind .. " to open car play",
        defaultKey  = Elit3.Main.UseWithKey.Keybind,
        onPressed   = function()
            TriggerEvent("elit3:carplay:openUI")
        end,
    })
end

function InstallRadio(plate, install)
    local progressLabel = install and "Installing" or "Uninstalling"
    ExecuteCommand("e mechanic")

    LocalPlayer.state:set("inv_busy", true, true)
    LocalPlayer.state.invBusy = true

    local qsInventoryEnabled = GetResourceState("qs-inventory") == "started"
    if qsInventoryEnabled then
        exports["qs-inventory"]:setInventoryDisabled(true)
    end

    local success = lib.progressBar({
        duration    = 5000,
        label       = progressLabel .. " Car Play System",
        useWhileDead = false,
        canCancel   = true,
        disable     = { move = true, combat = true, car = true }
    })

    ClearPedTasks(cache.ped)
    LocalPlayer.state:set("inv_busy", false, true)
    LocalPlayer.state.invBusy = false

    if qsInventoryEnabled then
        exports["qs-inventory"]:setInventoryDisabled(false)
    end

    if success then
        TriggerServerEvent("elit3:carplay:addInstall", plate, install)
        Notification(install and "Radio Added to Vehicle" or "Radio Removed from Vehicle")
    else
        Notification("Cancelled")
    end
end

function Notification(msg)
    lib.notify({
        title       = "Car Play",
        description = msg
    })
end

function DisableControls()
    DisableControlAction(0, 24,  true)
    DisableControlAction(0, 257, true)
    DisableControlAction(0, 25,  true)
    DisableControlAction(0, 263, true)
    DisableControlAction(0, 45,  true)
    DisableControlAction(0, 22,  true)
    DisableControlAction(0, 44,  true)
    DisableControlAction(0, 37,  true)
    DisableControlAction(0, 23,  true)
    DisableControlAction(0, 288, true)
    DisableControlAction(0, 289, true)
    DisableControlAction(0, 170, true)
    DisableControlAction(0, 167, true)
    DisableControlAction(0, 26,  true)
    DisableControlAction(0, 73,  true)
    DisableControlAction(2, 199, true)
    DisableControlAction(2, 36,  true)
    DisableControlAction(0, 264, true)
    DisableControlAction(0, 257, true)
    DisableControlAction(0, 140, true)
    DisableControlAction(0, 141, true)
    DisableControlAction(0, 142, true)
    DisableControlAction(0, 143, true)
    DisableControlAction(0, 75,  true)
    DisableControlAction(27, 75, true)

    if IsPauseMenuActive() then
        SetPauseMenuActive(false)
    end

    SetVehicleRadioEnabled(cache.vehicle, false)
end

RegisterCommand("resetcarplay_ui", function()
    SendNUIMessage({ action = "resetUI" })
    Notification("CarPlay UI Reset")
end, false)
