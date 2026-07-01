# Twilio AI Voice Agent Service
import os
from twilio.twiml.voice_response import VoiceResponse

class TwilioVoiceAgent:
    def __init__(self):
        self.twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
        
    def generate_twiml_response(self, text):
        response = VoiceResponse()
        response.say(text, voice='alice')
        return str(response)
