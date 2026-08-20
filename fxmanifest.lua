fx_version 'cerulean'
game 'gta5'

author 'Elit3'
description 'Elit3 CarPlay'
version '1.0'

ui_page 'ui/index.html'

shared_scripts {
    '@ox_lib/init.lua',
    'config/config.lua',
    'config/language.lua'
}

client_scripts {
    'main/client.lua',
    'config/client/*.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'main/server.lua',
    'config/server/*.lua'
}

files {
    'ui/**'
}

dependencies {
    'oxmysql',
    'ox_lib',
    'xsound'
}
