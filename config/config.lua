xSound = exports.xsound
Elit3 = {}
Elit3.AutoSQL = true

Elit3.ServerType = 'QBOX'

Elit3.Main = {
    UseWithCommand = {
        Enable = true,
        Command = 'carplay',
    },
    UseWithKey = {
        Enable = true,
        Keybind = 'J'
    },
    UseWithItem = {
        Enable = false,
        Item = 'carplay'
    },
    Restrict_Radio = {
    },
    RadioInstall = {
        Enable = false,
        Options = {
            RadioItem = 'carplay',
            RadioInstallerItem = 'radioinstaller',
            OnlyOwned = false,
        }
    }
}

Elit3.Apps = {
    Music_Playlist = true,
    AI_Assistant = true,
    Music_Overlay = true,
    Video_Player = true,
    Car_Control = true,
    Car_Info = true,
    Car_Automation = true,
    Game = true,
    Music_Neon_RGB = true
}

Elit3.Default_Music_Volume = 80
Elit3.MarkedLocation_Unit = 'Km'
Elit3.OnlyDriver = false
Elit3.Music_Outside_Veh = true
Elit3.Outside_Music_Distance = 80.0
Elit3.EnableControl = false

Elit3.AutoPilot = {
    MaxSpeed = 200.0,
    DriveStyle = 786859
}

Elit3.ParkingSensor = {
    Enable = true,
    SensorDistance = 3.0
}

Elit3.DebugCamera = false
Elit3.VehCamOffset = {
    [`bus`] = { front = {0.000000, 6.680000, 0.670000} },
    [`bati`] = { front = {0.000000, 0.350000, 0.790000}, back = {0.000000, -1.230000, 0.650000} },
}

Elit3.ServerInfo = {
    ServerName = 'My Server',
    Discord    = 'https://discord.gg/yourserver',
}

Elit3.Default_Playlist = {
}

Elit3.RestrictionMethod = 'BL'

Elit3.AddVehicle = {
    `hydra`,
    `jet`,
}
