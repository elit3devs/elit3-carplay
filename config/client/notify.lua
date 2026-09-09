-- Client-side notification function
-- Reference: https://docs.fivem.net/docs/scripting-reference/client-functions/

function Notification(message, type)
    type = type or "info"
    
    -- Support for ox_lib notifications
    if GetResourceState("ox_lib") == "started" then
        lib.notify({
            title = "Elit3 CarPlay",
            description = message,
            type = type,
            position = "top-right",
            duration = 5000
        })
    else
        -- Fallback: TriggerEvent for simple notification
        TriggerEvent("chat:addMessage", {
            args = {"Elit3 CarPlay", message},
            color = {0, 150, 255}
        })
    end
end
