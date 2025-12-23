# Lavagne Interattive - ITS Maker Academy

Piattaforma web per corsi interattivi con bacheche collaborative.

## 🚀 Avvio Rapido

### Prerequisiti
- Node.js 18+ installato

### Installazione e Avvio
```bash
cd lavagne-interattive
npm install
npm run dev
```

L'applicazione sarà disponibile su: http://localhost:5173

## 🔐 Accesso

### Login Formatore
- Username: qualsiasi
- Password: qualsiasi

*Nota: Al momento usa autenticazione mock. Dopo l'integrazione Supabase sarà necessario un account reale.*

## ✨ Funzionalità Implementate

### Dashboard Formatore
- ✅ Lista bacheche con card interattive
- ✅ Creazione nuove bacheche
- ✅ Eliminazione bacheche (con conferma)
- ✅ Visualizzazione numero partecipanti attivi
- ✅ Data/ora ultima modifica
- ✅ QR Code per condivisione
- ✅ Copia link condivisione

### Canvas/Bacheca
- ✅ Canvas 4000x4000px
- ✅ Zoom (0.25x - 2x) con controlli
- ✅ Pan con mouse drag
- ✅ Griglia visiva
- ✅ Responsive (desktop + tablet)

### Toolbar Formatore (sinistra, collassabile)
- ✅ **Aggiungi elementi**
  - Post-it
  - Sondaggio
  - Esercizio
  - Link/Risorsa
- ✅ **Partecipanti**: lista nickname attivi
- ✅ **Permessi Corsisti**: toggle per post-it e disegno
- ✅ **Condividi**: QR code + link copia
- ✅ **Blocca Bacheca**: disabilita interazioni corsisti
- ✅ **Reset Bacheca**: elimina solo elementi corsisti

### Elementi Canvas

#### 1. Post-it
- ✅ Dimensione fissa 200x200px
- ✅ 5 colori (giallo, rosa, verde, blu, arancio)
- ✅ Trascinabili (formatore può spostare tutti, corsisti solo i propri)
- ✅ Testo max 280 caratteri
- ✅ Badge autore + timestamp
- ✅ Modifica/elimina (solo dal creatore)

#### 2. Sondaggio
- ✅ Scelta singola / multipla
- ✅ Max 8 opzioni
- ✅ Barre percentuali + numero voti
- ✅ Nomi votanti NON visibili
- ✅ Sempre aperto (no chiusura manuale)
- ✅ Aggiornamento real-time

#### 3. Esercizio a Risposta Aperta
- ✅ Domanda max 500 caratteri
- ✅ Risposte corsisti visibili in lista
- ✅ Badge autore + timestamp
- ✅ Max 1 risposta per corsista
- ✅ Risposte non modificabili dopo invio

#### 4. Link/Risorse
- ✅ Apertura in nuova tab
- ✅ Anteprima iframe (quando possibile)
- ✅ Titolo personalizzabile
- ✅ URL validation

### Interazioni Corsisti
- ✅ Accesso via QR/link
- ✅ Inserimento nickname (duplicati ammessi)
- ✅ Visualizzazione bacheca completa
- ✅ Creazione post-it (se abilitato)
- ✅ Risposta a sondaggi
- ✅ Risposta a esercizi
- ✅ Modifica/elimina solo propri elementi

### Sistema Permessi
- ✅ Formatore: accesso completo
- ✅ Corsisti: permessi configurabili
- ✅ Blocco bacheca: solo visualizzazione
- ✅ Permessi post-it: toggle on/off
- ✅ Permessi disegno: toggle on/off

## 📋 Stato Implementazione MVP

### ✅ Completato
- [x] Autenticazione formatore (mock)
- [x] Dashboard con CRUD bacheche
- [x] Canvas con zoom/pan
- [x] Post-it trascinabili
- [x] Sondaggi con voti
- [x] Esercizi con risposte
- [x] Link con preview
- [x] Toolbar completa
- [x] Lista partecipanti
- [x] QR code condivisione
- [x] Sistema permessi
- [x] Blocco bacheca
- [x] Reset bacheca
- [x] UI completamente in italiano

### ⏳ Non Incluso in MVP
- [ ] Disegno a mano libera (da implementare)
- [ ] Upload file (richiede Supabase Storage)
- [ ] Integrazione Supabase
- [ ] Polling real-time
- [ ] Persistenza database
- [ ] Export CSV
- [ ] Cronologia modifiche
- [ ] Template bacheche
- [ ] Chat integrata

## 🔧 Prossimi Step per Produzione

### 1. Setup Supabase
```sql
-- Tabelle da creare in Supabase:

CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  config JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE board_elements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  position JSONB DEFAULT '{}'::jsonb,
  author TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE board_participants (
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  joined_at TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (board_id, nickname, joined_at)
);
```

### 2. Configurazione
Creare file `.env`:
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Integrazione Supabase
- Installare `@supabase/supabase-js`
- Sostituire mock state con chiamate Supabase
- Implementare polling (4s corsisti, 2s formatore)
- Aggiungere error handling e retry

## 🎨 Stack Tecnologico

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Canvas**: React Zoom Pan Pinch (Fabric.js rimosso per semplicità)
- **Drag & Drop**: React Draggable
- **Icons**: Lucide React
- **QR Code**: qrcode.react
- **Backend**: Supabase (da integrare)

## 📱 Compatibilità

- ✅ Desktop: Chrome, Firefox, Safari
- ✅ Tablet: iPad, Android (landscape)
- ⚠️ Mobile: limitato (non prioritario in MVP)

## 🎯 User Flow

### Formatore
1. Login → Dashboard
2. Crea nuova bacheca
3. Aggiunge elementi (post-it, sondaggi, ecc.)
4. Condivide QR/link con corsisti
5. Monitora interazioni
6. Gestisce permessi
7. Blocca/Reset quando necessario

### Corsisti
1. Scansiona QR / clicca link
2. Inserisce nickname
3. Visualizza bacheca
4. Interagisce con elementi (se permessi attivi)
5. Vede aggiornamenti in tempo reale (quando integrato Supabase)

## 🐛 Note di Sviluppo

- Attualmente usa React state locale
- Nessuna persistenza (ricarica = reset)
- Autenticazione mock
- Nessun polling real-time ancora

## 📄 Licenza

Progetto privato - ITS Maker Academy
