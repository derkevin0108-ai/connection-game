# Connection — Sprint 1

Browserbasiertes Multiplayer-Partyspiel. Sprint 1 enthält das Skelett:
Raum erstellen, beitreten, Live-Lobby.

## Voraussetzungen

- Node.js 20+ (https://nodejs.org)
- Zwei Terminals

## Setup

```bash
# Terminal 1: Backend
cd server
npm install
npm run dev
# läuft auf http://localhost:3001

# Terminal 2: Frontend
cd client
npm install
npm run dev
# läuft auf http://localhost:5173
```

## Auf zwei Geräten testen

`npm run dev` im Client startet Vite mit `--host`, sodass du im LAN
zugreifen kannst. Vite zeigt im Terminal eine Network-URL, z. B.
`http://192.168.1.42:5173`.

Beide Geräte müssen im selben WLAN sein. Öffne die Network-URL auf dem
Smartphone — der Client verbindet sich automatisch zum Backend auf
derselben IP unter Port 3001.

Falls dein Smartphone das Backend nicht erreicht:
- Firewall auf dem Rechner prüfen (Port 3001 muss erreichbar sein)
- Auf macOS: Systemeinstellungen → Netzwerk → Firewall

## Was Sprint 1 kann

- Raum mit 4-stelligem Code erstellen
- Per Code oder Link (`/join/CODE`) beitreten
- Live-Spielerliste (alle sehen, wenn jemand kommt/geht)
- Reconnect bei Tab-Reload (Spieler-ID im LocalStorage)
- `beforeunload`-Schutz und Wake Lock in der Lobby
- Host-Status, Auto-Host-Wechsel beim Verlassen
- Spieler werden bei Disconnect als "offline" angezeigt, nicht entfernt

## Was kommt als Nächstes (Sprint 2)

- Game Loop: Frage → Antworten → Zuordnen → Reveal → Punkte
- Hardcoded eine Kategorie mit 5 Fragen
- Rater-Rotation
