local geminiKey = GetConvar('elit3_carplay_gemini_key', '')
local geminiModel = GetConvar('elit3_carplay_gemini_model', 'gemini-2.0-flash')

Elit3.GPT_Settings = {
    EnableAIChat = geminiKey ~= '',
    apiKey = geminiKey,
    model = geminiModel,
    DiscordWebhook = GetConvar('elit3_carplay_discord_webhook', ''),
}

Elit3.AI_Chat = {
    {
        Questions = { 'hello', 'hi', 'hey', 'welcome', 'greetings' },
        Answer = 'Hey! How can I help you today?'
    },
    {
        Questions = { 'what is your name', 'who are you' },
        Answer = 'I am your CarPlay AI assistant.'
    },
    {
        Questions = { 'play music', 'music', 'play this music' },
        Answer = 'Sure, what would you like to play?',
        MusicURL = true
    },
}
