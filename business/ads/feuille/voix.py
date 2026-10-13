# Voix off ElevenLabs avec horodatage des mots : audio/<nom>.mp3 et audio/<nom>.json ([mot, début, fin] en s).
#   ELEVENLABS_API_KEY=… python3 business/ads/feuille/voix.py <nom> <voice_id> "<texte>" [stabilité] [style]
import base64, json, os, sys, urllib.request
nom, vid, txt = sys.argv[1:4]
stab = float(sys.argv[4]) if len(sys.argv) > 4 else .45
style = float(sys.argv[5]) if len(sys.argv) > 5 else .35
body = json.dumps({"text": txt, "model_id": "eleven_multilingual_v2",
  "voice_settings": {"stability": stab, "similarity_boost": .8, "style": style, "use_speaker_boost": True}}).encode()
rq = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_128", body,
  {"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"})
d = json.load(urllib.request.urlopen(rq))
D = os.path.join(os.path.dirname(__file__), "audio")
open(f"{D}/{nom}.mp3", "wb").write(base64.b64decode(d["audio_base64"]))
a = d["alignment"]; ws, cur = [], None
for c, s, e in zip(a["characters"], a["character_start_times_seconds"], a["character_end_times_seconds"]):
    if c.isspace():
        cur = None; continue
    if cur is None:
        cur = [c, s, e]; ws.append(cur)
    else:
        cur[0] += c; cur[2] = e
json.dump(ws, open(f"{D}/{nom}.json", "w"), ensure_ascii=False)
print(nom, round(ws[-1][2], 2), "s :", " ".join(f"{w}@{s:.2f}" for w, s, _ in ws))
