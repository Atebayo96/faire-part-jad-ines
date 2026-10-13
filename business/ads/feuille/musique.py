# Musique ElevenLabs (instrumentale) : audio/<nom>.mp3
#   ELEVENLABS_API_KEY=… python3 business/ads/feuille/musique.py <nom> <durée s> "<consigne>"
import json, os, sys, urllib.request, urllib.error
nom, sec, prompt = sys.argv[1], float(sys.argv[2]), sys.argv[3]
body = json.dumps({"prompt": prompt, "music_length_ms": int(sec * 1000), "force_instrumental": True}).encode()
rq = urllib.request.Request("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", body,
  {"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"})
try: data = urllib.request.urlopen(rq, timeout=300).read()
except urllib.error.HTTPError as e: sys.exit(e.read().decode()[:400])
open(os.path.join(os.path.dirname(__file__), "audio", nom + ".mp3"), "wb").write(data); print(nom, len(data), "octets")
