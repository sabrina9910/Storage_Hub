📦 StorageHub

StorageHub è una piattaforma web-based per la gestione avanzata, intelligente e reattiva dell'inventario. Progettato con un'architettura a servizi e un'interfaccia basata sul Glassmorphism, il sistema permette di monitorare le giacenze in tempo reale, gestire le anagrafiche dei fornitori e tracciare le movimentazioni di magazzino in modo immutabile. Il gestionale è potenziato dall'integrazione con Google Gemini AI, che offre supporto contestuale all'amministratore.
👥 Il Team di Sviluppo

Il progetto è stato ingegnerizzato seguendo i principi di suddivisione dei carichi di lavoro (Agile), con moduli specifici assegnati ai membri del team:

----

   
🚀 Guida all'Installazione (Setup Locale)

Segui questi passaggi per configurare l'ambiente di sviluppo sul tuo terminale.
1. Prerequisiti

Assicurati di avere installati: Python 3.10+, Node.js 18+ e Git.
Bash

git clone https://github.com/tuo-username/Storage_Hub.git
cd Storage_Hub

2. Avvio del Backend (Django)
Bash

cd backend
python3 -m venv venv
source venv/bin/activate       # Su Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate       # Generazione tabelle DB
python manage.py createsuperuser # Creazione account Admin
python manage.py runserver     # Il server parte su http://127.0.0.1:8000

3. Avvio del Frontend (React)

Apri una nuova finestra del terminale e posizionati nella root del progetto:
Bash

cd frontend
npm install
npm run dev                    # L'app parte su http://localhost:5173

🔐 Variabili d'Ambiente (.env)

Il sistema richiede un file .env all'interno della cartella backend/. Crealo e inserisci i seguenti parametri:
Variabile	Descrizione	Come ottenerla
SECRET_KEY	Chiave crittografica univoca di Django.	Tramite generatore online o script Python.
DEBUG	Disabilita la cache e mostra errori di sviluppo.	Impostare su True in locale.
GEMINI_API_KEY	Chiave di accesso al motore AI generativo.	Generabile gratuitamente su Google AI Studio.
💻 Flusso Operativo Principale

    Accesso: Login tramite JWT. Il sistema instrada l'utente in base al ruolo (Admin o Magazziniere).

    Setup Anagrafiche (Admin): Creazione di Categorie e Fornitori. Inserimento dei Prodotti specificando Codice SKU, Prezzo e Soglia di Allarme per il riordino.

    Operatività (Magazziniere): Utilizzo della vista semplificata per consultare le locazioni della merce e registrare movimenti di Carico (IN) e Scarico (OUT).

🗄️ Architettura del Database (Diagramma ER)

Il database relazionale è strutturato per garantire l'integrità dei dati storici delle movimentazioni.
Snippet di codice

erDiagram
    USERS ||--o{ MOVEMENTS : "registra"
    PRODUCTS ||--o{ MOVEMENTS : "subisce"
    CATEGORIES ||--|{ PRODUCTS : "classifica"
    SUPPLIERS }|--|{ PRODUCTS : "fornisce"

    USERS {
        int id PK
        string username
        string role "Admin | Magazziniere"
    }
    PRODUCTS {
        int id PK
        string sku
        float prezzo
        int soglia_minima
        int category_id FK
    }
    MOVEMENTS {
        int id PK
        string tipo "IN | OUT"
        int quantita
        datetime data_operazione
        int product_id FK
        int user_id FK
    }

🔌 Documentazione API (Endpoints)

L'architettura RESTful è protetta da JWT. Inserire il token nell'header: Authorization: Bearer <token>.

<details>
<summary><strong>🔐 POST /api/token/ (Login)</strong></summary>

    Descrizione: Autenticazione utente.

    Body:
    JSON

    {
      "username": "admin",
      "password": "password123"
    }

    Risposta (200 OK):
    JSON

    {
      "access": "eyJ0eXAiOi...",
      "refresh": "eyJ0eXAiOi..."
    }

</details>

<details>
<summary><strong>📦 GET /api/prodotti/ (Lista Prodotti)</strong></summary>

    Descrizione: Recupera l'intero catalogo o filtra per parametri.

    Query Params: ?category=Salumi

    Risposta (200 OK):
    JSON

    [
      {
        "sku": "SLM-PRM-024",
        "nome": "Prosciutto di Parma DOP",
        "giacenza": 50,
        "prezzo_unitario": "145.50"
      }
    ]

</details>

<details>
<summary><strong>🔄 POST /api/movimenti/ (Nuovo Movimento)</strong></summary>

    Descrizione: Registra un carico o scarico merce.

    Body:
    JSON

    {
      "prodotto_id": 1,
      "tipo_movimento": "IN",
      "quantita": 15
    }

    Risposta (201 Created): Ritorna l'oggetto movimento creato e aggiorna in background la giacenza.

</details>
☁️ Architettura Cloud (AWS Layer 3 - Prospettiva di Deployment)

Il progetto è predisposto per un ambiente di produzione scalabile su infrastruttura AWS:

    Storage & CDN: Frontend buildato caricato su Amazon S3 ed esposto tramite CloudFront per latenza minima.

    Compute: Backend Django containerizzato via Docker e orchestrato su Amazon ECS con Application Load Balancer.

    Database: Istanza Amazon RDS (PostgreSQL) per gestire le transazioni concorrenziali con backup automatizzati.
