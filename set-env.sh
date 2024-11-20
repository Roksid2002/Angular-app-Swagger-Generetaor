#!/bin/bash

echo "====== STARTING CONTAINER ======"
echo "IMPORTANTE: Devi impostare la variabile d'ambiente 'API_URL' prima di avviare l'app."
echo "Ad esempio, specifica 'http://example.com' come URL."

# Controlla se `API_URL` è vuota
if [[ -z "$API_URL" ]]; then
    echo "Errore: La variabile 'API_URL' non è impostata! Impostala per continuare."
    exit 1
fi

# Percorso del file environment.ts
ENV_FILE="src/environments/environment.ts"

# Verifica che il file esista
if [[ ! -f "$ENV_FILE" ]]; then
    echo "Errore: Il file $ENV_FILE non esiste!"
    exit 1
fi

# Modifica il valore di apiUrl
sed -i "s|apiUrl: '.*'|apiUrl: '$API_URL'|g" "$ENV_FILE"

echo "File environment.ts aggiornato con apiUrl: $API_URL"

# Avvia l'app Angular
echo "Avvio di ng serve..."
exec ng serve --host 0.0.0.0 --port 4200
