function GetPlayerData(source)
    local playerIdentifiers = GetPlayerIdentifiers(source)
    local discord = nil
    local steam = nil

    for _, id in ipairs(playerIdentifiers) do
        if string.match(id, 'discord:') then
            discord = id
        elseif string.match(id, 'steam:') then
            steam = id
        end
    end

    return {
        ident = discord or steam or 'unknown',
        name = GetPlayerName(source) or 'Player ' .. source
    }
end

function GetPlayer_Job(playerId)
    if GetResourceState('qbx_core') == 'started' then
        local player = exports.qbx_core:GetPlayer(playerId)
        return player and player.PlayerData.job.name or 'unemployed'
    elseif GetResourceState('qb-core') == 'started' then
        local player = exports['qb-core']:GetPlayer(playerId)
        return player and player.PlayerData.job.name or 'unemployed'
    elseif GetResourceState('es_extended') == 'started' then
        local player = exports.es_extended:GetPlayerFromId(playerId)
        return player and player.getJob() or 'unemployed'
    elseif GetResourceState('vRP') == 'started' then
        local user = exports.vRP:getUserId(playerId)
        return user and exports.vRP:getUserGroupByType(user, 'job') or 'unemployed'
    end
    return 'unemployed'
end

function checkOwnedVehicle(plate)
    if GetResourceState('qbx_core') == 'started' then
        local result = MySQL.query.await('SELECT * FROM player_vehicles WHERE plate = ?', { plate })
        return result and #result > 0
    elseif GetResourceState('qb-core') == 'started' then
        local result = MySQL.query.await('SELECT * FROM player_vehicles WHERE plate = ?', { plate })
        return result and #result > 0
    elseif GetResourceState('es_extended') == 'started' then
        local result = MySQL.query.await('SELECT * FROM owned_vehicles WHERE plate = ?', { plate })
        return result and #result > 0
    elseif GetResourceState('vRP') == 'started' then
        local result = MySQL.query.await('SELECT * FROM vrp_user_vehicles WHERE vehicle_plate = ?', { plate })
        return result and #result > 0
    end
    return true
end

function checkRadioItem(playerId)
    if GetResourceState('qbx_core') == 'started' then
        local player = exports.qbx_core:GetPlayer(playerId)
        return player and player.Functions.GetItemByName(Elit3.Main.RadioInstall.Options.RadioItem) ~= nil
    elseif GetResourceState('qb-core') == 'started' then
        local player = exports['qb-core']:GetPlayer(playerId)
        return player and player.Functions.GetItemByName(Elit3.Main.RadioInstall.Options.RadioItem) ~= nil
    elseif GetResourceState('es_extended') == 'started' then
        local player = exports.es_extended:GetPlayerFromId(playerId)
        return player and player.getInventoryItem(Elit3.Main.RadioInstall.Options.RadioItem).count > 0
    elseif GetResourceState('vRP') == 'started' then
        local user = exports.vRP:getUserId(playerId)
        return user and exports.vRP:getInventoryItemAmount(user, Elit3.Main.RadioInstall.Options.RadioItem) > 0
    end
    return true
end

function RadioInstallRemove(playerId, isInstalling)
    if GetResourceState('qbx_core') == 'started' then
        local player = exports.qbx_core:GetPlayer(playerId)
        if player then
            player.Functions.RemoveItem(Elit3.Main.RadioInstall.Options.RadioInstallerItem, 1)
        end
    elseif GetResourceState('qb-core') == 'started' then
        local player = exports['qb-core']:GetPlayer(playerId)
        if player then
            player.Functions.RemoveItem(Elit3.Main.RadioInstall.Options.RadioInstallerItem, 1)
        end
    elseif GetResourceState('es_extended') == 'started' then
        local player = exports.es_extended:GetPlayerFromId(playerId)
        if player then
            player.removeInventoryItem(Elit3.Main.RadioInstall.Options.RadioInstallerItem, 1)
        end
    elseif GetResourceState('vRP') == 'started' then
        local user = exports.vRP:getUserId(playerId)
        if user then
            exports.vRP:tryRemoveInventoryItem(user, Elit3.Main.RadioInstall.Options.RadioInstallerItem, 1)
        end
    end
end

function SendDiscordLog(playerId, musicURL)
    local settings = Elit3.GPT_Settings
    if not settings or not settings.DiscordWebhook or settings.DiscordWebhook == '' then return end

    local playerData = GetPlayerData(playerId)
    local discordId = playerData.ident and string.gsub(playerData.ident, 'discord:', '') or 'Unknown'

    local embed = {
        {
            title = '🎵 Music Played',
            description = 'A player started playing music in their vehicle',
            color = 3447003,
            fields = {
                {
                    name = 'Player',
                    value = playerData.name .. ' (' .. playerId .. ')',
                    inline = true
                },
                {
                    name = 'Discord ID',
                    value = '<@' .. discordId .. '>',
                    inline = true
                },
                {
                    name = 'Music URL',
                    value = '[Link](' .. musicURL .. ')',
                    inline = false
                }
            },
            timestamp = os.date('!%Y-%m-%dT%H:%M:%SZ')
        }
    }

    PerformHttpRequest(settings.DiscordWebhook, function(statusCode, body, headers)
        if statusCode ~= 204 then
            TriggerEvent('chat:addMessage', {
                args = { 'Elit3 CarPlay', 'Failed to send Discord log' },
                color = { 255, 0, 0 }
            })
        end
    end, 'POST', json.encode({ embeds = embed }), { ['Content-Type'] = 'application/json' })
end
