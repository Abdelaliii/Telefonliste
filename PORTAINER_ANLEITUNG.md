# 🚀 Anleitung: Telefonverzeichnis in GitHub & Portainer bereitstellen

Diese Anleitung erklärt Schritt für Schritt, wie Sie das **Telefon- und Kontaktverzeichnis** auf **GitHub** hochladen und als **Zentrale Multi-User Anwendung in Portainer** bereitstellen.

---

## 🎯 Das gelöste Problem

**Bisheriges Problem:**
Wenn die Anwendung als reine Datei in einem Ordner oder Browser lief, speicherte sie Kontakte lokal im Browser des jeweiligen Mitarbeiters (`localStorage`). Änderungen eines Kollegen waren für andere Kollegen nicht sichtbar.

**Neue Lösung mit Portainer & Docker:**
Die Anwendung läuft nun als zentraler **Webservice mit eigenem Node.js Backend**. Alle Mitarbeiter rufen die Anwendung einfach über den Webbrowser auf (z. B. `http://euer-server-ip:3000`).
* Alle neuen Kontakte, Bearbeitungen und Löschungen werden **sofort in einer zentralen Datei (`data/contacts.json`) auf dem Server gespeichert**.
* Das System synchronisiert sich automatisch alle 8 Sekunden im Hintergrund, sodass **alle Mitarbeiter immer denselben aktuellen Stand sehen**.
* Dank des Docker Volumes (`telefonverzeichnis_data`) bleiben alle Daten dauerhaft erhalten, selbst wenn der Server oder Container neu gestartet wird!

---

##  Schritt 1: Projekt in GitHub hochladen

1. **GitHub Repository erstellen:**
   * Gehen Sie auf [GitHub.com](https://github.com) und erstellen Sie ein neues **privates** oder **öffentliches** Repository (z. B. `telefonverzeichnis`).

2. **Code in GitHub pushen (über Terminal oder Antigravity / Git):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Multi-User Telefonverzeichnis für Portainer"
   git branch -M main
   git remote add origin https://github.com/IHR_BENUTZERNAME/telefonverzeichnis.git
   git push -u origin main
   ```

---

## 🐳 Schritt 2: Anwendung in Portainer bereitstellen (Stack/Docker Compose)

1. Öffnen Sie Ihre **Portainer-Weboberfläche** (z. B. `https://portainer.ihre-firma.local:9443`).
2. Wählen Sie Ihre Docker-Umgebung aus (z. B. **primary** oder **local**).
3. Klicken Sie im linken Menü auf **Stacks** und dann auf **+ Add stack**.

### Option A: Direkt über GitHub (Empfohlen)
1. **Name:** `telefonverzeichnis`
2. **Build method:** Wählen Sie **Repository**.
3. **Repository URL:** `https://github.com/IHR_BENUTZERNAME/telefonverzeichnis.git`
4. **Repository reference:** `refs/heads/main`
5. **Compose path:** `docker-compose.yml`
6. Klicken Sie unten auf **Deploy the stack**.

*Portainer lädt den Code automatisch aus GitHub, baut den Docker-Container und startet die Anwendung.*

---

### Option B: Direkt im Portainer Web-Editor (Web Editor)
Falls Ihr Portainer keinen direkten Zugriff auf GitHub hat, können Sie auch den Inhalt der `docker-compose.yml` in den Editor kopieren:

1. **Name:** `telefonverzeichnis`
2. **Build method:** **Web editor**
3. Füge den folgenden Code ein:

```yaml
version: '3.8'

services:
  telefonverzeichnis:
    build:
      context: https://github.com/IHR_BENUTZERNAME/telefonverzeichnis.git#main
      dockerfile: Dockerfile
    image: telefonverzeichnis:latest
    container_name: telefonverzeichnis
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - telefonverzeichnis_data:/app/data
    environment:
      - NODE_ENV=production
      - PORT=3000

volumes:
  telefonverzeichnis_data:
    driver: local
```
4. Klicken Sie auf **Deploy the stack**.

---

##  Schritt 3: Nutzung durch die Mitarbeiter

Sobald Portainer den Stack gestartet hat (Status: **Healthy / Running**):

1. Alle Mitarbeiter öffnen in ihrem Browser einfach die Adresse:
   `http://<SERVER-IP-ODER-HOSTNAME>:3000`
   *(z. B. `http://192.168.1.50:3000`)*

2. Sie sehen in der schwarzen Statusleiste oben:
   `🟢 Zentrale Server-Datenbank aktiv (Multi-User Synchro)`

3. Wenn Mitarbeiter A einen neuen Kontakt anlegt, sieht Mitarbeiter B diesen **automatisch innerhalb weniger Sekunden** auf seinem Bildschirm!

---

## 💾 Datensicherung & Backup

Die Kontaktdaten werden dauerhaft im Docker-Volume `telefonverzeichnis_data` in der Datei `/app/data/contacts.json` gespeichert.

* **Backup erstellen:** Über die App können Sie jederzeit oben auf **JSON Import/Export** klicken und den gesamten Stand als `.json` Datei auf Ihrem Rechner sichern.
* **HTML Offline-Sicherung:** Über den Button **Standalone .html** können Sie eine interaktive Offline-Datei für Laptops oder Mobilgeräte herunterladen.
