import sys
import speech_recognition as sr

def transcribe(audio_path, lang="fa-IR"):
    r = sr.Recognizer()
    try:
        with sr.AudioFile(audio_path) as source:
            audio = r.record(source)
            text = r.recognize_google(audio, language=lang)
            print(text)
    except Exception as e:
        print("")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        lang = sys.argv[2] if len(sys.argv) > 2 else "fa-IR"
        transcribe(sys.argv[1], lang)
