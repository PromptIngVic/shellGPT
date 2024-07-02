import subprocess
from openai import OpenAI
from playsound import playsound

# Ensure you replace 'your_api_key_here' with your actual OpenAI API key
client = OpenAI(api_key='')

# Whisper API call to transcribe audio
try:
    with open("audio_input.wav", "rb") as audio_file:
        whisper_response = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )
    print(f"Whisper Response: {whisper_response}")  # Add this line
    transcription_text = whisper_response.text
    print(f"Transcription: {transcription_text}")
except Exception as e:
    print(f"Error during transcription: {e}")
    transcription_text = None

if transcription_text:
    try:
        result = subprocess.run(
            f'node /home/victor/Desktop/TerminalGPT/Test.js "{transcription_text}"',
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            shell=True
        )
        assistant_response = result.stdout.strip()
        print(f"Assistant Response: {assistant_response}")  # Debugging: print stdout
        print(f"Error Output: {result.stderr}")  # Debugging: print stderr
    except subprocess.CalledProcessError as e:
        print(f"An error occurred while running Node.js script: {e}")
        assistant_response = None

    if assistant_response:
        try:
            # TTS API call using the assistant response text
            response = client.audio.speech.create(
                model="tts-1",
                voice="onyx",
                input=assistant_response,
            )
            response.stream_to_file("output.mp3")
            # Play the output.mp3 file
            playsound("output.mp3")
        except Exception as e:
            print(f"An error occurred during TTS or playing sound: {e}")
else:
    print("No transcription text available to process.")
