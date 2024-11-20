FROM node:20.18.0

# Crea la directory dell'app
RUN mkdir ./app

# Imposta la directory di lavoro
WORKDIR /app

# Copia i file del progetto
COPY . .

# Copia lo script di configurazione
COPY set-env.sh /app/set-env.sh

# Rendi eseguibile lo script
RUN chmod +x /app/set-env.sh

# Installa Angular CLI globalmente
RUN npm install -g @angular/cli

# Installa le dipendenze del progetto
RUN npm install

# Espone la porta 4200 per il servizio Angular
EXPOSE 4200

# Imposta il comando di avvio del container
# Questo eseguirà lo script di configurazione e poi avvierà il server Angular
CMD ["/bin/bash", "-c", "/app/set-env.sh && ng serve --host 0.0.0.0"]
