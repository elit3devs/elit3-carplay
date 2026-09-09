# Elit3 CarPlay v2

A polished FiveM CarPlay resource built for modern server setups, with multi-framework compatibility and a refined in-car interface.

## Features

- Full CarPlay style UI with dark and light presentation support
- Vehicle dashboard with speed and gear display
- Music player with YouTube URL support and queue controls
- Playlist login and saved favorites workflow
- Vehicle controls for doors, windows, engine, headlights, hazards, and neon lighting
- Auto-pilot route assistance using a mapped destination
- Camera support for front and rear vehicle views
- AI assistant support using Gemini configuration
- Snake game, video support, and integrated app-style layout
- Multi-framework compatibility for QBX, QBCore, ESX, vRP, and standalone use

## Requirements

- ox_lib
- oxmysql
- xsound

## Installation

1. Place the resource in your server resources folder
2. Add ensure elit3-carplay to your server.cfg
3. Configure your framework in config/config.lua
4. Restart the server

## Configuration

Edit config/config.lua and configure:
- Elit3.ServerType
- Elit3.Apps
- keybinds and command access
- radio install settings
- vehicle restriction rules

## Supported Frameworks

- QBX Core
- QBCore
- ESX
- vRP
- Standalone

## Release Notes

This v2 update focuses on cleaner project structure, corrected Lua compatibility issues, safer config defaults, and a more professional resource layout for production deployments.
