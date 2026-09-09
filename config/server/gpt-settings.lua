-- AI Chat Settings (Gemini API)
-- Get your API key from: https://ai.google.dev/
Elite3.GPT_Settings = {
    EnableAIChat = true,
    apiKey = "", -- Your Gemini API Key
    model = "gemini-1.5-flash",
    DiscordWebhook = "", -- Optional: Discord webhook for logging
}

-- AI Chat Responses
Elite3.AI_Chat = {
    {
        Questions = {"hello", "hi", "hey"},
        Answer = "Hey! How can I help you today?"
    },
    {
        Questions = {"what is your name", "who are you"},
        Answer = "I'm your CarPlay AI Assistant, powered by Gemini!"
    },
    {
        Questions = {"play music", "music"},
        Answer = "Sure! Which song would you like to play?",
        MusicURL = true
    },
}
