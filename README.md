# 📦 StorageHub

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python Version](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Node.js Version](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)

**StorageHub** è una piattaforma web-based per la gestione avanzata, intelligente e reattiva dell'inventario. Progettato con un'architettura a servizi e un'interfaccia basata sul *Glassmorphism*, il sistema permette di monitorare le giacenze in tempo reale, gestire le anagrafiche dei fornitori e tracciare le movimentazioni di magazzino in modo immutabile. 

Il gestionale è potenziato dall'integrazione con **Google Gemini AI**, che offre supporto contestuale e predittivo all'amministratore.

---

## 👥 Il Team di Sviluppo

Il progetto è stato ingegnerizzato seguendo i principi di suddivisione dei carichi di lavoro (*Agile*), con moduli e funzionalità specifiche assegnate e sviluppate dai membri del team.

---

## 🚀 Guida all'Installazione (Setup Locale)

Segui questi passaggi per configurare l'ambiente di sviluppo locale sul tuo terminale.

### 1. Prerequisiti
Assicurati di avere installati sulla tua macchina:
- **Python 3.10+**
- **Node.js 18+**
- **Git**

Clona il repository:
```bash
git clone https://github.com/tuo-username/Storage_Hub.git
cd Storage_Hub
```

### 2. Avvio del Backend (Django)
Avvia e configura l'ambiente Python:

```bash
cd backend
python3 -m venv venv

# Attivazione ambiente virtuale (Mac/Linux)
source venv/bin/activate       
# Su Windows usa: venv\Scripts\activate

pip install -r requirements.txt
python manage.py migrate             # Generazione tabelle DB
python manage.py createsuperuser     # Creazione account Admin
python manage.py runserver           # Il server parte su http://127.0.0.1:8000
```

### 3. Avvio del Frontend (React)
Apri una **nuova finestra** del terminale, posizionati nella root del progetto e avvia il server di sviluppo React/Vite:

```bash
cd frontend
npm install
npm run dev                          # L'app parte su http://localhost:5173
```

---

## 🔐 Variabili d'Ambiente (`.env`)

Il sistema richiede un file `.env` all'interno della cartella `backend/`. Crealo e inserisci i seguenti parametri:

| Variabile | Descrizione | Come ottenerla |
| :--- | :--- | :--- |
| `SECRET_KEY` | Chiave crittografica univoca di Django. | Tramite generatore online o script Python. |
| `DEBUG` | Disabilita la cache e mostra errori di sviluppo. | Impostare su `True` in ambiente locale. |
| `GEMINI_API_KEY`| Chiave di accesso al motore AI generativo. | Generabile gratuitamente su [Google AI Studio](https://aistudio.google.com). |

---

## 💻 Flusso Operativo Principale

1. **Accesso:** Login sicuro tramite JWT. Il sistema instrada automaticamente l'utente in base al ruolo assegnato (*Admin* o *Magazziniere*).
2. **Setup Anagrafiche (Admin):** Creazione di Categorie e Fornitori. Inserimento dei Prodotti specificando Codice SKU, Prezzo e Soglia di Allarme per il riordino intelligente.
3. **Operatività (Magazziniere):** Utilizzo della vista semplificata per consultare le locazioni fisiche della merce e registrare dinamicamente movimenti di **Carico (IN)** e **Scarico (OUT)**.

---

## 🔌 Documentazione API (Endpoints Base)

L'architettura RESTful è protetta da standard JWT. Inserire il bearer token nell'header delle richieste protette: `Authorization: Bearer <token>`.

<details>
<summary><strong>🔐 POST <code>/api/token/</code> (Login)</strong></summary>

- **Descrizione:** Autenticazione utente e rilascio tokens.
- **Body:**
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```
- **Risposta (200 OK):**
  ```json
  {
    "access": "eyJ0eXAiOi...",
    "refresh": "eyJ0eXAiOi..."
  }
  ```
</details>

<details>
<summary><strong>📦 GET <code>/api/prodotti/</code> (Lista Prodotti)</strong></summary>

- **Descrizione:** Recupera l'intero catalogo o applica filtri specifici.
- **Query Params:** `?category=Salumi`
- **Risposta (200 OK):**
  ```json
  [
    {
      "sku": "SLM-PRM-024",
      "nome": "Prosciutto di Parma DOP",
      "giacenza": 50,
      "prezzo_unitario": "145.50"
    }
  ]
  ```
</details>

<details>
<summary><strong>🔄 POST <code>/api/movimenti/</code> (Nuovo Movimento)</strong></summary>

- **Descrizione:** Registra un ingresso o un'uscita di merce.
- **Body:**
  ```json
  {
    "prodotto_id": 1,
    "tipo_movimento": "IN",
    "quantita": 15
  }
  ```
- **Risposta (201 Created):** Ritorna l'oggetto movimento confermato e aggiorna in background e istantaneamente la giacenza complessiva.
</details>

---
