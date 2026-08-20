local geminiKey  = GetConvar('elit3_carplay_gemini_key', '')
local geminiModel = GetConvar('elit3_carplay_gemini_model', 'gemini-2.0-flash')

Elit3.GPT_Settings = {
    EnableAIChat = geminiKey ~= '',
    apiKey       = geminiKey,
    model        = geminiModel,
}
