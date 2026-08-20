local currentVersion  = GetResourceMetadata(GetCurrentResourceName(), "version")

CreateThread(function()
    if Elit3.AutoSQL then
        if Elit3.Main.RadioInstall.Enable then
            MySQL.query.await([[
                CREATE TABLE IF NOT EXISTS `install_radio` (
                    `plate` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_general_ci',
                    `radioEnable` INT(11) NULL DEFAULT '0'
                )
                COLLATE='utf8mb4_general_ci'
                ENGINE=InnoDB;
            ]], {})
        end

        if Elit3.Apps.Music_Playlist then
            MySQL.query.await([[
                CREATE TABLE IF NOT EXISTS `elit3_carplay` (
                    `id` INT(11) NOT NULL AUTO_INCREMENT,
                    `identifier` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
                    `musicData` VARCHAR(1500) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
                    PRIMARY KEY (`id`) USING BTREE
                )
                COLLATE='utf8mb4_general_ci'
                ENGINE=InnoDB
                AUTO_INCREMENT=1;
            ]], {})
        end
    end
end)

local activeSounds   = {}
local vehiclePlayers = {}
local vehicleLogins  = {}

function RegisterPlayerInVehicle(netVehId, playerId)
    if not vehiclePlayers[netVehId] then
        vehiclePlayers[netVehId] = {}
    end

    for vehId, players in pairs(vehiclePlayers) do
        if vehId ~= netVehId then
            for i = #players, 1, -1 do
                if players[i] == playerId then
                    table.remove(players, i)
                    break
                end
            end
        end
    end

    local alreadyIn = false
    for _, id in ipairs(vehiclePlayers[netVehId]) do
        if id == playerId then alreadyIn = true break end
    end
    if not alreadyIn then
        table.insert(vehiclePlayers[netVehId], playerId)
    end
end

function UnregisterPlayerFromVehicle(netVehId, playerId)
    if not vehiclePlayers[netVehId] then return end
    for i, id in ipairs(vehiclePlayers[netVehId]) do
        if id == playerId then
            table.remove(vehiclePlayers[netVehId], i)
            return
        end
    end
end

function BroadcastToVehiclePlayers(netVehId, payload)
    if not vehiclePlayers[netVehId] then return end
    for _, playerId in ipairs(vehiclePlayers[netVehId]) do
        TriggerClientEvent("elit3:carplay:syncOpenUI", playerId, payload)
    end
end

local musicActions = {}

function musicActions.play(data, source)
    local playerPed = GetPlayerPed(source)
    local vehicle   = GetVehiclePedIsIn(playerPed, false)
    if not vehicle or not DoesEntityExist(vehicle) then return end

    local netVehId = NetworkGetNetworkIdFromEntity(vehicle)
    if not activeSounds[netVehId] then
        activeSounds[netVehId] = {}
    end

    activeSounds[netVehId].url     = data.musicURL
    activeSounds[netVehId].volume  = data.curVolume
    activeSounds[netVehId].playing = true
    activeSounds[netVehId].loop    = false

    TriggerClientEvent("elit3:carplay:attachMusic", -1, source, netVehId, data.musicURL, data.curVolume)

    SendDiscordLog(tonumber(source), data.musicURL)
end

function musicActions.playSync(data)
    BroadcastToVehiclePlayers(data.soundId, {
        action  = "musicEntry",
        musicID = data.soundId,
    })
end

function musicActions.resume(data)
    local sound = activeSounds[data.soundId]
    if not sound then return end
    sound.playing = true
    xSound:Resume(-1, data.soundId)
    BroadcastToVehiclePlayers(data.soundId, {
        action  = "resume",
        musicID = data.soundId,
    })
end

function musicActions.pause(data)
    local sound = activeSounds[data.soundId]
    if not sound then return end
    sound.playing = false
    xSound:Pause(-1, data.soundId)
    BroadcastToVehiclePlayers(data.soundId, { action = "pause" })
end

function musicActions.volume(data)
    local sound = activeSounds[data.soundId]
    if not sound then return end
    sound.volume = tonumber(data.volume)

    if not Elit3.Music_Outside_Veh then
        for _, playerId in pairs(data.players) do
            xSound:setVolume(playerId, data.soundId, tonumber(data.volume))
        end
    else
        xSound:setVolume(-1, data.soundId, tonumber(data.volume))
    end

    BroadcastToVehiclePlayers(data.soundId, { action = "volume", volume = data.volume })
end

function musicActions.skip(data)
    local sound = activeSounds[data.soundId]
    if not sound then return end
    sound.position = data.time
    xSound:setTimeStamp(-1, data.soundId, data.time)
    BroadcastToVehiclePlayers(data.soundId, { action = "skip", time = data.time })
end

function musicActions.loop(data)
    local sound = activeSounds[data.soundId]
    if not sound then return end
    sound.loop = not sound.loop
    TriggerClientEvent("elit3:carplay:loopMusic", -1, data.soundId, sound.loop)
    BroadcastToVehiclePlayers(data.soundId, { action = "loop", loop = sound.loop })
end

musicActions["end"] = function(data)
    xSound:Destroy(-1, data.soundId)
    BroadcastToVehiclePlayers(data.soundId, { action = "end" })
    activeSounds[data.soundId] = nil
end

function musicActions.position(data)
    local sound = activeSounds[data.soundId]
    if not sound then return end
    sound.position = data.coords
    xSound:Position(-1, data.soundId, data.coords)
end

function musicActions.destroy(data)
    xSound:Destroy(-1, data.soundId)
end

RegisterNetEvent("elit3:carplay:musicAction")
AddEventHandler("elit3:carplay:musicAction", function(action, data)
    local handler = musicActions[action]
    if handler then
        handler(data, source)
    end
end)

lib.callback.register("elit3:carplay:login", function(source, data)
    local netVehId  = data
    local playerData = GetPlayerData(source)
    local loginInfo  = {
        identifier = playerData.ident,
        username   = playerData.name,
    }

    if not vehicleLogins[netVehId] then
        vehicleLogins[netVehId] = {}
    end
    vehicleLogins[netVehId].login    = loginInfo.identifier
    vehicleLogins[netVehId].username = loginInfo.username

    BroadcastToVehiclePlayers(netVehId, {
        action   = "login",
        login    = loginInfo.identifier,
        username = loginInfo.username,
    })
    return loginInfo
end)

RegisterNetEvent("elit3:carplay:logoutAccount")
AddEventHandler("elit3:carplay:logoutAccount", function(netVehId)
    if vehicleLogins[netVehId] then
        vehicleLogins[netVehId].login = false
        BroadcastToVehiclePlayers(netVehId, { action = "logout" })
    end
end)

lib.callback.register("elit3:carplay:getVeh", function(source)
    local playerPed = GetPlayerPed(source)
    local vehicle   = GetVehiclePedIsIn(playerPed, false)
    local netVehId  = NetworkGetNetworkIdFromEntity(vehicle)

    local loginData = vehicleLogins[netVehId] or false
    local soundData = activeSounds[netVehId]  or false

    RegisterPlayerInVehicle(netVehId, source)
    return netVehId, soundData, loginData
end)

RegisterNetEvent("elit3:carplay:removePlyUI")
AddEventHandler("elit3:carplay:removePlyUI", function()
    local playerPed = GetPlayerPed(source)
    local vehicle   = GetVehiclePedIsIn(playerPed, false)
    local netVehId  = NetworkGetNetworkIdFromEntity(vehicle)
    UnregisterPlayerFromVehicle(netVehId, source)
end)

lib.callback.register("elit3:carplay:saveMusic", function(source, data)
    if data.like then
        local result = MySQL.query.await(
            "INSERT INTO elit3_carplay (identifier, musicData) VALUES (?, ?)",
            { data.login, json.encode(data.data) }
        )
        if activeSounds[data.vehID] then
            activeSounds[data.vehID].like = true
        end
        return result
    else
        MySQL.query.await(
            "DELETE FROM elit3_carplay WHERE id = ?",
            { tonumber(data.musicID) }
        )
        if activeSounds[data.vehID] then
            activeSounds[data.vehID].like = false
        end
        BroadcastToVehiclePlayers(data.vehID, { action = "likeData", data = data })
        return false
    end
end)

RegisterNetEvent("elit3:carplay:likeData")
AddEventHandler("elit3:carplay:likeData", function(data)
    if data.like then
        BroadcastToVehiclePlayers(data.vehID, { action = "likeData", data = data })
    end
end)

lib.callback.register("elit3:carplay:fetchPlaylist", function(source, data)
    if not data.login then return false end
    return MySQL.query.await("SELECT * FROM elit3_carplay WHERE identifier = ?", { data.login })
end)

RegisterNetEvent("elit3:carplay:clearPlaylist")
AddEventHandler("elit3:carplay:clearPlaylist", function(data)
    MySQL.query.await("DELETE FROM elit3_carplay WHERE identifier = ?", { data.login })
    BroadcastToVehiclePlayers(data.vehID, { action = "clearPlaylist" })
end)

lib.callback.register("elit3:carplay:chatGPT", function(source, userMessage)
    return handleAICommand(userMessage)
end)

function handleAICommand(userMessage)
    local settings = Elit3.GPT_Settings
    if not settings.EnableAIChat then return end
    if settings.apiKey == "" then return "Error: Missing AI API Key." end

    local apiURL = "https://generativelanguage.googleapis.com/v1beta/models/"
                 .. settings.model .. ":generateContent?key=" .. settings.apiKey

    local requestBody = {
        contents = {
            {
                parts = { { text = userMessage } }
            }
        }
    }

    local response    = nil
    local isDone      = false

    PerformHttpRequest(apiURL, function(statusCode, body, headers)
        if statusCode == 200 then
            local decoded = body and json.decode(body)
            if decoded
                and decoded.candidates
                and decoded.candidates[1]
                and decoded.candidates[1].content
                and decoded.candidates[1].content.parts then
                response = decoded.candidates[1].content.parts[1].text
            else
                print("[Elit3 CarPlay] Invalid AI response format.")
                response = "Error: AI response format issue."
            end
        else
            local errorMessages = {
                [400] = "Bad Request: Check the API request format.",
                [401] = "Invalid API Key. Check your API key.",
                [404] = "Not Found: Check the API URL or model name.",
                [429] = "Rate Limit Exceeded. Try again later.",
                [500] = "Internal Server Error. Server might be down.",
            }
            local msg = errorMessages[statusCode] or ("Unknown Error: " .. statusCode)
            print("[Elit3 CarPlay] " .. msg)
            response = "Error: Unable to process request."
        end
        isDone = true
    end, "POST", json.encode(requestBody), { ["Content-Type"] = "application/json" })

    while not isDone do Wait(0) end
    return response or "Error: No response from AI."
end

lib.callback.register("elit3:carplay:checkInstall", function(source, plate)
    local result = MySQL.query.await("SELECT * FROM install_radio WHERE plate = ?", { plate })
    if result and #result > 0 and result[1].radioEnable then
        return true
    end
    return false
end)

lib.callback.register("elit3:carplay:checkOwnedVehicle", function(source, plate)
    return checkOwnedVehicle(plate)
end)

RegisterNetEvent("elit3:carplay:addInstall")
AddEventHandler("elit3:carplay:addInstall", function(plate, install)
    local playerId     = source
    local isOwned      = checkOwnedVehicle(plate)
    local options      = Elit3.Main.RadioInstall.Options

    if install then
        if not checkRadioItem(playerId) then
            TriggerClientEvent("elit3:carplay:notify", playerId, Elit3.Language.no_radio_item)
            return
        end
        if options.OnlyOwned and Elit3.ServerType ~= false and not isOwned then
            return
        end

        RadioInstallRemove(playerId, true)

        local exists = MySQL.scalar.await(
            "SELECT COUNT(*) FROM install_radio WHERE plate = ?", { plate })

        if exists > 0 then
            MySQL.update.await(
                "UPDATE install_radio SET radioEnable = ? WHERE plate = ?", { install, plate })
        else
            MySQL.insert.await(
                "INSERT INTO install_radio (plate, radioEnable) VALUES (?, ?)", { plate, install })
        end
    else
        MySQL.query.await("DELETE FROM install_radio WHERE plate = ?", { plate })
        RadioInstallRemove(playerId, false)
    end
end)

function IsValueInList(list, value)
    if not list or #list == 0 then return false end
    for _, entry in ipairs(list) do
        if entry == value then return true end
    end
    return false
end

function PlayerPassesRestrictions(playerId, restrictionList)
    local playerJob         = GetPlayer_Job(playerId)
    local playerIdentifiers = GetPlayerIdentifiers(playerId)

    if IsValueInList(restrictionList, playerJob) then return true end

    for _, restriction in ipairs(restrictionList) do
        if IsPlayerAceAllowed(playerId, restriction) then return true end
    end

    for _, identifier in ipairs(playerIdentifiers) do
        if IsValueInList(restrictionList, identifier) then return true end
    end

    if GetResourceState("Badger_Discord_API") == "started" then
        local discordRoles = exports.Badger_Discord_API:GetDiscordRoles(playerId)
        if discordRoles then
            for _, roleId in ipairs(discordRoles) do
                if IsValueInList(restrictionList, roleId) then return true end
            end
        end
    end

    return false
end

lib.callback.register("elit3:carplay:permsCheck", function(source)
    local restrictions = Elit3.Main.Restrict_Radio
    if not restrictions or #restrictions == 0 then return true end
    return PlayerPassesRestrictions(source, restrictions)
end)

function replaceDiscordID(discordStr)
    return discordStr:gsub("discord:(%d+)", "<@%1>")
end

function GetIdentifier(playerId, identifierType)
    for _, identifier in pairs(GetPlayerIdentifiers(playerId)) do
        if string.find(identifier, identifierType) then
            return identifier
        end
    end
    return nil
end

AddEventHandler("entityRemoved", function(entity)
    local netId = NetworkGetNetworkIdFromEntity(entity)
    if not netId or netId == 0 then return end
    if activeSounds[netId] then
        xSound:Destroy(-1, netId)
        activeSounds[netId] = nil
    end
end)

AddEventHandler("onResourceStop", function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
    if next(activeSounds) then
        for netVehId in pairs(activeSounds) do
            xSound:Destroy(-1, netVehId)
            activeSounds[netVehId] = nil
        end
    end
end)