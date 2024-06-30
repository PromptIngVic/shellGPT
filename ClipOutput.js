import subprocess
import time

def notify(message):
    subprocess.call(['notify-send', message])

def clear_clipboard():
    # Verwenden von xclip, um die Zwischenablage zu leeren
    subprocess.call(['xclip', '-selection', 'clipboard', '-in', '/dev/null'])

def copy_lines_after_pattern_from_terminal():
    try:
        # Leere die Zwischenablage
        clear_clipboard()

        # Simuliere die Tastenkombination Ctrl+Shift+A
        subprocess.call(["xdotool", "key", "--clearmodifiers", "ctrl+shift+a"])

        # Überprüfe und wiederhole das Markieren, falls erforderlich
        for _ in range(5):
            time.sleep(0.1)
            subprocess.call(["xdotool", "key", "--clearmodifiers", "ctrl+shift+a"])

        # Kopiere den markierten Text mit Ctrl+Shift+C
        subprocess.call(["xdotool", "key", "--clearmodifiers", "ctrl+shift+c"])

        # Warte kurz, um sicherzustellen, dass der Kopiervorgang abgeschlossen ist
        time.sleep(1)

        # Hol den Inhalt der Zwischenablage
        clipboard_content = subprocess.check_output(["xclip", "-selection", "clipboard", "-o"]).decode("utf-8").strip()

        # Teilen Sie den Inhalt in Zeilen auf
        lines = clipboard_content.split('\n')

        # Finden Sie die Zeilen, die nach der Zeile mit "2>/dev/null" kommen, bis zur vorletzten Zeile
        start_copying = False
        filtered_lines = []
        for line in lines:
            if "2>/dev/null" in line:
                start_copying = True
                continue
            if start_copying:
                filtered_lines.append(line)

        # Entfernen Sie die letzte Zeile
        if filtered_lines:
            filtered_lines.pop()

        # Kopieren Sie die gefilterten Zeilen in die Zwischenablage
        if filtered_lines:
            filtered_content = '\n'.join(filtered_lines)
            subprocess.run(f"echo '{filtered_content}' | xclip -selection clipboard", shell=True)
            notify(f"Copied to clipboard: {filtered_content}")
        else:
            notify("No lines to copy after pattern '2>/dev/null'.")
    except Exception as e:
        notify(f"An error occurred: {e}")

# Rufen Sie die Funktion auf
copy_lines_after_pattern_from_terminal()
