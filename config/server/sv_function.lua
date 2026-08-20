local vRP_ready = false
local vRP = nil

if Elit3.ServerType == "QB" then
    QBCore = exports["qb-core"]:GetCoreObject()
elseif Elit3.ServerType == "ESX" then
    ESX = exports["es_extended"]:getSharedObject()
elseif Elit3.ServerType == "VRP" then
    vRP = exports["vRP"]:getSharedObject()
    vRP_ready = vRP ~= nil
end

local function IsQB()
    return Elit3.ServerType == "QB"
end

local function IsQbox()
    return Elit3.ServerType == "QBOX" or Elit3.ServerType == "Qbox" or Elit3.ServerType == "qbox"
end

local function IsVRP()
    return Elit3.ServerType == "VRP"
end

local function IsESX()
    return Elit3.ServerType == "ESX"
end

local function GetQPlayer(source)
    if IsQbox() then
        return exports.qbx_core:GetPlayer(source)
    end
    if IsQB() and QBCore then
        return QBCore.Functions.GetPlayer(source)
    end
    return nil
end

if Elit3.Main.UseWithItem.Enable then
    local itemName = Elit3.Main.UseWithItem.Item

    if IsESX() and ESX then
        ESX.RegisterUsableItem(itemName, function(source)
            TriggerClientEvent("elit3:carplay:openUI", source)
        end)
    elseif IsQB() and QBCore then
        QBCore.Functions.CreateUseableItem(itemName, function(source)
            TriggerClientEvent("elit3:carplay:openUI", source)
        end)
    elseif IsQbox() then
        exports.qbx_core:CreateUseableItem(itemName, function(source)
            TriggerClientEvent("elit3:carplay:openUI", source)
        end)
    elseif IsVRP() and vRP then
        vRP.registerUsableItem(itemName, function(source)
            TriggerClientEvent("elit3:carplay:openUI", source)
        end)
    end
end

if Elit3.Main.UseWithCommand.Enable then
    lib.addCommand(Elit3.Main.UseWithCommand.Command, {
        help = "Open Car Play",
    }, function(source, _)
        TriggerClientEvent("elit3:carplay:openUI", source)
    end)
end

function GetPlayerData(source)
    if IsQB() or IsQbox() then
        local player = GetQPlayer(source)
        if not player then
            return {
                ident   = GetIdentifier(source, "license"),
                name    = GetPlayerName(source),
                discord = GetIdentifier(source, "discord"),
            }
        end
        local charinfo = player.PlayerData.charinfo or {}
        return {
            ident   = player.PlayerData.citizenid,
            name    = ((charinfo.firstname or "") .. " " .. (charinfo.lastname or "")):gsub("^%s+", ""):gsub("%s+$", ""),
            discord = GetIdentifier(source, "discord"),
        }
    elseif IsESX() and ESX then
        local player = ESX.GetPlayerFromId(source)
        if not player then
            return {
                ident   = GetIdentifier(source, "license"),
                name    = GetPlayerName(source),
                discord = GetIdentifier(source, "discord"),
            }
        end
        return {
            ident   = player.identifier,
            name    = player.getName(),
            discord = GetIdentifier(source, "discord"),
        }
    elseif IsVRP() and vRP then
        local user_id = vRP.getUserId(source)
        if not user_id then
            return {
                ident   = GetIdentifier(source, "license"),
                name    = GetPlayerName(source),
                discord = GetIdentifier(source, "discord"),
            }
        end
        return {
            ident   = tostring(user_id),
            name    = vRP.getUserName(user_id) or GetPlayerName(source),
            discord = GetIdentifier(source, "discord"),
        }
    else
        return {
            ident   = GetIdentifier(source, "license"),
            name    = GetPlayerName(source),
            discord = GetIdentifier(source, "discord"),
        }
    end
end

function GetPlayer_Job(source)
    if IsQB() or IsQbox() then
        local player = GetQPlayer(source)
        return player and player.PlayerData.job and player.PlayerData.job.name or false
    elseif IsESX() and ESX then
        local player = ESX.GetPlayerFromId(source)
        if not player then return false end
        return player.job and player.job.name or false
    elseif IsVRP() and vRP then
        local user_id = vRP.getUserId(source)
        if not user_id then return false end
        local groups = vRP.getUserGroup(user_id)
        if type(groups) == "table" then
            for group, _ in pairs(groups) do
                return group
            end
        elseif type(groups) == "string" then
            return groups
        end
        return false
    else
        return false
    end
end

if Elit3.Main.RadioInstall.Enable and Elit3.Main.RadioInstall.Options.RadioInstallerItem then
    local installerItem = Elit3.Main.RadioInstall.Options.RadioInstallerItem

    if IsESX() and ESX then
        ESX.RegisterUsableItem(installerItem, function(source)
            TriggerClientEvent("elit3:carplay:installRadio", source)
        end)
    elseif IsQB() and QBCore then
        QBCore.Functions.CreateUseableItem(installerItem, function(source)
            TriggerClientEvent("elit3:carplay:installRadio", source)
        end)
    elseif IsQbox() then
        exports.qbx_core:CreateUseableItem(installerItem, function(source)
            TriggerClientEvent("elit3:carplay:installRadio", source)
        end)
    elseif IsVRP() and vRP then
        vRP.registerUsableItem(installerItem, function(source)
            TriggerClientEvent("elit3:carplay:installRadio", source)
        end)
    end
end

function checkOwnedVehicle(plate)
    if IsQB() or IsQbox() then
        local result = MySQL.query.await(
            "SELECT * FROM player_vehicles WHERE plate = ? LIMIT 1",
            { plate }
        )
        return result and #result > 0
    elseif IsESX() then
        local result = MySQL.query.await(
            "SELECT * FROM owned_vehicles WHERE plate = ? LIMIT 1",
            { plate }
        )
        return result and #result > 0
    elseif IsVRP() then
        local result = MySQL.query.await(
            "SELECT * FROM vrp_user_vehicles WHERE plate = ? LIMIT 1",
            { plate }
        )
        return result and #result > 0
    end
    return false
end

function checkRadioItem(source)
    local itemName = Elit3.Main.RadioInstall.Options.RadioItem

    if GetResourceState("ox_inventory") == "started" then
        local amount = exports.ox_inventory:Search(source, "count", itemName)
        return amount and tonumber(amount) >= 1
    elseif GetResourceState("qs-inventory") == "started" then
        local amount = exports["qs-inventory"]:GetItemTotalAmount(source, itemName)
        return amount and tonumber(amount) >= 1
    elseif IsQB() then
        return exports["qb-inventory"]:HasItem(source, itemName, 1)
    elseif IsQbox() then
        local player = GetQPlayer(source)
        if not player then return false end
        return exports["qbx_inventory"]:GetItemBySlot(source, itemName) ~= nil
    elseif IsESX() and ESX then
        local player = ESX.GetPlayerFromId(source)
        if not player then return false end
        return player.getInventoryItem(itemName).count >= 1
    elseif IsVRP() and vRP then
        local user_id = vRP.getUserId(source)
        if not user_id then return false end
        return vRP.getItemAmount(user_id, itemName) >= 1
    end

    return false
end

function addItem(source)
    local itemName = Elit3.Main.RadioInstall.Options.RadioItem

    if GetResourceState("ox_inventory") == "started" then
        if exports.ox_inventory:CanCarryItem(source, itemName, 1) then
            exports.ox_inventory:AddItem(source, itemName, 1)
        end
    elseif GetResourceState("qs-inventory") == "started" then
        exports["qs-inventory"]:AddItem(source, itemName, 1)
    elseif IsQB() or IsQbox() then
        local player = GetQPlayer(source)
        if player then player.Functions.AddItem(itemName, 1) end
    elseif IsESX() and ESX then
        local player = ESX.GetPlayerFromId(source)
        if player then player.addInventoryItem(itemName, 1) end
    elseif IsVRP() and vRP then
        local user_id = vRP.getUserId(source)
        if user_id then vRP.giveItem(user_id, itemName, 1) end
    end
end

function removeItem(source)
    local itemName = Elit3.Main.RadioInstall.Options.RadioItem

    if GetResourceState("ox_inventory") == "started" then
        exports.ox_inventory:RemoveItem(source, itemName, 1)
    elseif GetResourceState("qs-inventory") == "started" then
        exports["qs-inventory"]:RemoveItem(source, itemName, 1)
    elseif IsQB() or IsQbox() then
        local player = GetQPlayer(source)
        if player then player.Functions.RemoveItem(itemName, 1) end
    elseif IsESX() and ESX then
        local player = ESX.GetPlayerFromId(source)
        if player then player.removeInventoryItem(itemName, 1) end
    elseif IsVRP() and vRP then
        local user_id = vRP.getUserId(source)
        if user_id then vRP.tryTakeItem(user_id, itemName, 1) end
    end
end

function RadioInstallRemove(source, install)
    if install then
        removeItem(source)
    else
        addItem(source)
    end
end

function SendDiscordLog(source, musicURL)
    local webhookURL = GetConvar('elit3_carplay_webhook', '')
    if webhookURL == '' then return end

    local player = GetPlayerData(source)
    local embed  = {
        {
            title       = "Started Playing",
            color       = 16776960,
            footer      = { text = os.date("%c") },
            description = "Player: "          .. (player.name or "Unknown")
                       .. "\nPlayer ID: "     .. source
                       .. "\nPlayer Identifier: " .. (player.ident or "Unknown")
                       .. "\nPlayer Discord: " .. replaceDiscordID(player.discord or "N/A")
                       .. "\nMusic Played: "  .. musicURL,
        }
    }
    PerformHttpRequest(
        webhookURL,
        function() end,
        "POST",
        json.encode({ username = "Elit3 CarPlay", embeds = embed }),
        { ["Content-Type"] = "application/json" }
    )
end
