^n:: ; Strg + N Hotkey
; Prüfen, ob das aktuelle aktive Fenster eine CMD-Fenster ist
if WinActive("ahk_class ConsoleWindowClass") {
    ; Position und Größe des CMD-Fensters erhalten
    WinGetPos, CmdX, CmdY, CmdWidth, CmdHeight, ahk_class ConsoleWindowClass

    ; Neue GUI-Position berechnen
    Zeilenhöhe := 20
    CmdHöhe := 30
    GuiPosX := CmdX + 10
    GuiPosY := CmdY + CmdHeight - CmdHöhe - Zeilenhöhe

    ; Ein benutzerdefiniertes Eingabefenster erstellen, das wie eine CMD aussieht
    Gui, New, +AlwaysOnTop +ToolWindow -Caption +Border
    Gui, Font, s10 cBlack, Fixedsys ; Schriftart auf eine feste Breite einstellen
    Gui, Color, Black
    Gui, Add, Text, x10 y10 cWhite, Geben Sie Ihren Befehl ein:
    Gui, Add, Edit, vBenutzerEingabe r1 w300 Background0xF0F0F0 cBlack ; Hellgrauer Hintergrund für die Edit-Box
    Gui, Add, Button, gSubmitButton Default, OK
    Gui, Show, x%GuiPosX% y%GuiPosY%, Eingabeaufforderung

    ; Nach der GUI-Erstellung sofort zurückkehren
    return

    ; Etikett für den Button-Klick definieren
    SubmitButton:
    Gui, Submit

    ; GUI nach Eingabe ausblenden
    Gui, Destroy

    ; Prüfen, ob die Eingabe leer oder abgebrochen ist
    if (BenutzerEingabe = "") {
        return
    }

    ; Run assistant.js mit dem Eingabebefehl ausführen
    RunWait, %ComSpec% /c node "path\to\assistant.js" "%BenutzerEingabe%", , Hide UseErrorLevel
    if (ErrorLevel) {
        MsgBox, Ein Fehler ist aufgetreten. Bitte überprüfen Sie das Skript.
        return
    }

    ; Ausgabe aus der assistant.js lesen
    FileRead, AssistentAusgabe, path\to\shellGPT\output.txt
    ; Prüfen, ob die Datei korrekt gelesen wurde
    if (!AssistentAusgabe) {
        MsgBox, Keine Ausgabe vom Assistenten.
        return
    }

    ; Ausgabe trimmen, um führende/abschließende Leerzeichen oder Zeilenumbrüche zu entfernen
    AssistentAusgabe := Trim(AssistentAusgabe)

    ; Korrektes Handling von Backslashes für die CMD
    ; Doppelte Backslashes durch einfache ersetzen
    AssistentAusgabe := StrReplace(AssistentAusgabe, "\\", "\")

    ; Zusätzlicher Schritt: Zeichenkorrektur für Sonderzeichen
    AssistentAusgabe := StrReplace(AssistentAusgabe, "ß", "\\")

    ; Zeichenweise Eingabe mit Verzögerung
    Loop, Parse, AssistentAusgabe
    {
        Send, {Raw}%A_LoopField% ; Zeichenweise Eingabe
        Sleep, 50 ; Verzögerung zwischen den Zeichen, hier 50ms
    }
    ; Abschließendes Enter senden
    Send, {Enter}

    ; Warten, um sicherzustellen, dass die Eingabe vollständig verarbeitet wird
    Sleep, 100
    return
} else {
    ; Wenn es kein CMD-Fenster ist, eine Nachricht anzeigen
    MsgBox, Das aktuelle Fenster ist keine Eingabeaufforderung.
}
return
