Elit3.AI_Chat = {
    {
        Questions = { "hello", "hi", "welcome", "hey there", "greetings" },
        Answer    = "Hello! How can I assist you today?",
    },
    {
        Questions = { "What is the Discord for this server?", "Discord for this server", "What is the server Discord?" },
        Answer    = function()
            return "The Discord for this server is " .. (Elit3.ServerInfo.Discord ~= "" and Elit3.ServerInfo.Discord or "not set")
        end,
    },
    {
        Questions = { "What is the Server Name?", "Server Name", "What is Server" },
        Answer    = function()
            return "The Server is " .. (Elit3.ServerInfo.ServerName ~= "" and Elit3.ServerInfo.ServerName or "not set")
        end,
    },
    {
        Questions = { "Open Map", "Show Map", "Display Map" },
        Answer    = "Ok",
        CloseUI   = true,
        action    = function()
            openMap()
        end
    },
    {
        Questions = { "Open All Doors", "Open All Car Doors", "Unlock All Doors" },
        Answer    = "Ok Opened All Doors",
        action    = function()
            vehicleDoor("all")
        end
    },
    {
        Questions = { "Close All Doors", "Close All Car Doors", "Lock All Doors" },
        Answer    = "Ok Closed All Doors",
        action    = function()
            vehicleDoor("closeall")
        end
    },
    {
        Questions = { "Open Hood", "Open Car Hood" },
        Answer    = "Ok Hood is now open",
        action    = function()
            vehicleDoor(4)
        end
    },
    {
        Questions = { "Close Hood", "Close Car Hood" },
        Answer    = "Ok Hood is now closed",
        action    = function()
            vehicleDoor(4)
        end
    },
    {
        Questions = { "Open Trunk", "Open Car Trunk" },
        Answer    = "Ok Trunk is now open",
        action    = function()
            vehicleDoor(5)
        end
    },
    {
        Questions = { "Close Trunk", "Close Car Trunk" },
        Answer    = "Ok Trunk is now closed",
        action    = function()
            vehicleDoor(5)
        end
    },
    {
        Questions = { "Engine Off", "Turn Off Engine", "Switch Off Engine" },
        Answer    = "Ok Engine is now off",
        action    = function()
            vehicleDoor("engineOff")
        end
    },
    {
        Questions = { "Car Name", "Vehicle Name", "What is my car name?" },
        Answer    = function()
            local veh = GetVehiclePedIsIn(PlayerPedId(), false)
            return "Your Vehicle Name is: " .. GetDisplayNameFromVehicleModel(GetEntityModel(veh))
        end,
    },
    {
        Questions = { "Play Music", "Play this Music", "Can you play this" },
        Answer    = "Ok Playing",
        MusicURL  = true,
    },
}
