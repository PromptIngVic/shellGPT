import pyaudio
import wave
import subprocess
import threading
from plyer import notification
import os

def record_audio(output_filename='audio_input.wav'):
    chunk = 2048  # Record in chunks of 2048 samples
    sample_format = pyaudio.paInt16  # 16 bits per sample
    channels = 1
    fs = 44100  # Record at 44100 samples per second

    p = pyaudio.PyAudio()  # Create an interface to PortAudio

    notification.notify(
        title='Audio Recording',
        message='Recording... Press ENTER to stop'
    )

    stream = p.open(format=sample_format,
                    channels=channels,
                    rate=fs,
                    frames_per_buffer=chunk,
                    input=True)

    frames = []  # Initialize array to store frames

    # Define a function to record audio in a separate thread
    def record():
        while not stop_recording:
            data = stream.read(chunk)
            frames.append(data)

    # Flag to stop recording
    global stop_recording
    stop_recording = False

    # Start recording thread
    recording_thread = threading.Thread(target=record)
    recording_thread.start()

    # Wait for user input to stop recording
    input()

    # Set flag to stop recording
    stop_recording = True
    # Wait for recording thread to finish
    recording_thread.join()

    # Stop and close the stream
    stream.stop_stream()
    stream.close()
    # Terminate the PortAudio interface
    p.terminate()

    notification.notify(
        title='Audio Recording',
        message='Finished recording'
    )

    # Save the recorded data as a WAV file
    wf = wave.open(output_filename, 'wb')
    wf.setnchannels(channels)
    wf.setsampwidth(p.get_sample_size(sample_format))
    wf.setframerate(fs)
    wf.writeframes(b''.join(frames))
    wf.close()

    # Call James.py script with the output file
    subprocess.run(['python3', '/home/victor/Desktop/TerminalGPT/James.py', output_filename])  # Ensure correct filename and path

    # Delete the audio file after execution
    os.remove(output_filename)

if __name__ == "__main__":
    record_audio()
