# Elit3 CarPlay

#1 FiveM CarPlay resource with full multi-framework support.

## Features

- Full CarPlay UI with dark/light mode
- Music player with YouTube URL playback
- Car controls (engine, doors, windows, headlights, hazards, neon RGB)
- AI Assistant (Gemini-powered)
- Snake game
- Video player
- Auto Pilot
- Dashboard with speed/gear
- Playlist system with login
- Radio install system
- Multi-framework support (QBX, QBCore, ESX, vRP, Standalone)

## Requirements

- ox_lib
- oxmysql
- xsound

## Installation

1. Download and extract to resources folder
2. Add `ensure elit3-carplay` to server.cfg
3. Edit `config/config.lua` and set your framework type
4. Restart server

## Configuration

Edit `config/config.lua`:
- Set `Elit3.ServerType` to your framework (QBOX, QBCORE, ESX, VRP, or false for standalone)
- Enable/disable features in `Elit3.Apps`
- Configure command, keybind, or item usage

## Framework Support

- ✓ QBX Core
- ✓ QBCore
- ✓ ESX Extended
- ✓ vRP
- ✓ Standalone

## License

No license specified
