#!/bin/bash
# Toute la chaîne d'images d'un thème de la famille Mille et une nuits (CLAUDE.md, règles 32 et 35).
# Usage : bash business/tools/theme-nuits.sh <thème> [...]   (clé GEMINI_API_KEY dans l'environnement)
# 1. les 4 scènes ; 2. lieux (avec la mosquée), portes et rideau, images brutes du grand tableau ; 3. grand tableau ; 4. calques.
set -e
cd "$(dirname "$0")/.."
export LIEUX_TMP=${LIEUX_TMP:-/tmp/lieux}
python3 tools/variantes-nuits.py "$@"
for k in "$@"; do for n in 2 3 4; do cp landing/img/hd/$k-$n.webp banque/$k-$n.webp; done; done
python3 tools/lieux.py "$@" --lieux mairie,mosquee,salle,jardin,plage,fond &
python3 tools/portes.py "$@" &
python3 tools/long-gen.py /tmp/longraw "$@" --jobs 6
wait
python3 tools/long-assets.py /tmp/longraw "$@"
python3 tools/calques.py "$@" || true
echo "Regarder les images en grand (règle 10), puis python3 business/build-site.py"
