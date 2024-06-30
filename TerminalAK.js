import subprocess
import tkinter as tk
from tkinter import simpledialog
import time

def notify(title, message):
    command = f'notify-send "{title}" "{message}"'
    subprocess.run(command, shell=True)

def is_terminal_open():
    terminal_processes = ["gnome-terminal", "konsole", "xterm", "xfce4-terminal", "lxterminal", "mate-terminal", "tilix", "alacritty", "termite", "terminator"]
    try:
        result = subprocess.run(['ps', 'aux'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        processes = result.stdout.splitlines()
        for line in processes:
            for term in terminal_processes:
                if term in line:
                    return term
        return None
    except Exception as e:
        notify("Error", f"Error checking terminal process: {e}")
        return None

def get_user_input():
    root = tk.Tk()
    root.withdraw()
    try:
        user_input = simpledialog.askstring(title="Input", prompt="Enter your message:")
    except Exception as e:
        notify("Error", f"Error: {e}")
        user_input = None
    finally:
        root.destroy()
    return user_input

def send_command_to_terminal(term, command):
    retries = 3
    for _ in range(retries):
        try:
            result = subprocess.run(['xdotool', 'search', '--class', term], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            window_ids = result.stdout.splitlines()

            if not window_ids:
                time.sleep(1)
                continue

            for window_id in window_ids:
                subprocess.run(['xdotool', 'windowfocus', window_id])
                subprocess.run(['xdotool', 'type', command])
                subprocess.run(['xdotool', 'key', 'Return'])
                return

            notify("Error", "No terminal window detected after retries.")
            return

        except Exception as e:
            notify("Error", f"Error sending command to terminal: {e}")
            time.sleep(1)

term = is_terminal_open()
if term:
    user_input = get_user_input()
    if user_input:
        command = f'node /home/victor/Desktop/TerminalGPT/assistant.js "{user_input}" 2>/dev/null'

        # Debug: Print the command to ensure it's constructed correctly
        print(f"Executing command: {command}")

        # Execute the command and capture the output directly
        try:
            result = subprocess.run(['node', '/home/victor/Desktop/TerminalGPT/assistant.js', user_input], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            assistant_response = result.stdout.strip() 

            # Debug: Print the assistant response to ensure it's captured correctly
            print(f"Assistant response: {assistant_response}")

            # Add the command to copy the response to the clipboard
            if assistant_response:
                assistant_response_with_clipboard = f'{assistant_response}; echo "{assistant_response}" | xclip -selection clipboard'
            else:
                assistant_response_with_clipboard = assistant_response

            # Send the command to the terminal
            send_command_to_terminal(term, command)

            # Copy the assistant response to the clipboard
            if assistant_response:
                process = subprocess.Popen(['xclip', '-selection', 'clipboard'], stdin=subprocess.PIPE)
                process.communicate(input=assistant_response.encode())
        except Exception as e:
            notify("Error", f"Error executing assistant.js script: {e}")
            print(f"Error executing assistant.js script: {e}")
    else:
        notify("Info", "Input was cancelled or empty.")
else:
    notify("Error", "No terminal window detected. Please open a terminal and try again.")
