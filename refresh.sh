#!/bin/sh
# Rafraîchit les données WCPredictor depuis le JSON officiel puis relance le modèle IA.
# Usage : ./refresh.sh
# Cron quotidien (ex: toutes les 2h) :
#   0 */2 * * * cd /chemin/vers/WCPredictor && ./refresh.sh >> logs/refresh.log 2>&1

set -e

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Démarrage du refresh..."

docker compose --profile tools run --rm scraper
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Scraping terminé."

docker compose --profile tools run --rm ai-service
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Modèle IA terminé."

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Refresh complet."
