function Notification(message, type)
    type = type or 'info'

    if GetResourceState('ox_lib') == 'started' then
        lib.notify({
            title = 'Elit3 CarPlay',
            description = message,
            type = type,
            position = 'top-right',
            duration = 5000
        })
    else
        TriggerEvent('chat:addMessage', {
            args = { 'Elit3 CarPlay', message },
            color = { 0, 150, 255 }
        })
    end
end
