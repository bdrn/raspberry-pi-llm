## Study Buddy – Raspberry Pi LLM Quiz Device

A small full‑stack project that turns PDFs into quizzes using an LLM backend, and keeps them in sync with a Raspberry Pi "Study Buddy" device.

The web dashboard lets you upload lecture notes, auto‑generate quizzes, and (soon) pair a physical device via QR code so it can periodically sync the latest quizzes.

---

### High‑level architecture

- **Backend (Flask)**
  - Exposes a small JSON API under `/api/*`.
  - Accepts PDF uploads, extracts text, calls OpenAI to generate a quiz JSON, and stores it in SQLite.
  - Provides a `/api/sync` endpoint that the Raspberry Pi can call to pull all quizzes.
- **Frontend (React + Vite)**
  - Single‑page app with two main routes: dashboard (`/`) and pairing flow (`/pair`).
  - Uses an Axios instance with `baseURL: "/api"`, with Vite dev proxying those requests to the Flask backend.
  - `Home` page shows upload UI and a list of quizzes "available on device".
- **Raspberry Pi device (external)**
  - Not part of this repo, but expected to periodically call the backend’s `/api/sync` endpoint.
  - Future pairing flow will use a `QRCodeGen` component on the `/pair` page to let the Pi link itself to this backend.

---

### Repository layout

- **Root**
  - `.gitignore` – ignores environment files, Python artifacts, Node artifacts, and SQLite DB files.
  - `README.md` – this file.
- **backend/**

  - `app.py`
    - Creates the Flask app, enables CORS.
    - Configures SQLite via SQLAlchemy: `SQLALCHEMY_DATABASE_URI = 'sqlite:///studybuddy.db'`.
    - Initializes the `db` object and creates tables on startup.
    - **Routes**:
      - `GET /` – health check: returns `{ message: "Study Buddy API is running...", status: "online" }`.
      - `POST /api/upload` – accepts a `file` field (PDF) in `multipart/form-data`:
        - Validates that a file is present and ends with `.pdf`.
        - Calls `extract_text_from_pdf(...)` to read text from the PDF.
        - Calls `generate_quiz_from_text(...)` to get a quiz JSON from OpenAI.
        - Derives a `topic` from `quiz_json.meta.topic` (or falls back to the filename).
        - Persists a `Quiz` row with filename, topic and the raw JSON string.
        - Returns `201` with `{ message, filename: quiz.id, topic }`.
      - `GET /api/sync` – endpoint intended for the Raspberry Pi:
        - Fetches all `Quiz` rows ordered by `created_at DESC`.
        - Serializes them via `Quiz.to_dict()` and returns `{ quizzes: [...] }`.
  - `services/`
    - `pdf_parser.py`
      - `extract_text_from_pdf(file_stream)` using `pypdf.PdfReader`.
      - Walks pages, concatenates extracted text, and errors if the PDF has no text.
    - `llm_generator.py`
      - Loads `.env` from the project root (`.env` two levels up from `services/`).
      - Reads `OPENAI_API_KEY` or `OPEN_API_KEY` (either works).
      - Initializes `OpenAI` client.
      - `generate_quiz_from_text(text_context)`:
        - Truncates to ~15000 chars and sends a structured prompt to the `gpt-4o-mini` chat model.
        - Uses `response_format={"type": "json_object"}` to force JSON.
        - Returns the parsed quiz JSON (`meta` object + `questions` array with `mcq` and `flashcard` types).
  - `database/`
    - `models.py`
      - Defines `db = SQLAlchemy()`.
      - `Quiz` model:
        - `id` (PK, integer)
        - `filename` (string)
        - `topic` (string)
        - `created_at` (datetime, default `utcnow`)
        - `quiz_data` (text, raw JSON string)
        - `is_synced` (boolean, default `False`, reserved for Pi sync state)
      - `to_dict()` helper converts `quiz_data` back to a Python dict and serializes other fields.
  - `requirements.txt`
    - Core deps: `flask`, `flask-cors`, `openai`, `pypdf`, `python-dotenv`, `flask-sqlalchemy`.

- **frontend/**
  - `index.html` – Vite entry.
  - `package.json`
    - React 19 + Vite 7.
    - Routing via `react-router-dom`.
    - Axios for HTTP (`/src/api.js`).
    - `react-qr-code` already installed (for the future `QRCodeGen` component).
    - Scripts:
      - `npm run dev` – start Vite dev server.
      - `npm run build` – build for production.
      - `npm run preview` – serve the production build.
      - `npm run lint` – run ESLint.
  - `vite.config.js`
    - Adds `@` alias for `src`.
    - Proxies `/api` → `http://127.0.0.1:5000` in dev, so frontend can call `/api/...` without worrying about ports.
  - `src/api.js`
    - Exports a preconfigured Axios instance:
      - `baseURL: "/api"`.
      - `Content-Type: multipart/form-data` (suited for file uploads).
  - `src/main.jsx`
    - Standard React root entry (mounts `<App />`).
  - `src/App.jsx`
    - Wraps everything in `BrowserRouter`.
    - Renders `Navbar` and a main content container.
    - Routes:
      - `/` → `Home` page.
      - `/pair` → `PairDevice` page (pairing UI and QR code placeholder).
  - `src/pages/Home.jsx`
    - Fetches quizzes on mount via `GET /api/sync` using `api.get("/sync")`.
    - Shows loading, empty, or list states.
    - Renders:
      - A header describing the dashboard and device sync.
      - A `Card` containing the `UploadBox` component.
      - A list of `QuizCard` components for each quiz.
    - When an upload succeeds, it calls `fetchQuizzes()` again to refresh the list.
  - `src/pages/PairDevice.jsx`
    - Page layout and copy for pairing a new device.
    - Uses `Card` UI and currently renders a static "QR code placeholder" box where `QRCodeGen` will eventually live.
  - `src/components/Navbar.jsx`
    - Top navigation bar with logo and two links:
      - "Dashboard" → `/`.
      - "Pair device" → `/pair`.
    - Highlights the active route.
  - `src/components/UploadBox.jsx`
    - Handles file selection and upload flow.
    - Validates that the user selected a PDF (`application/pdf`).
    - Uses `FormData` and `api.post("/upload", formData)`.
    - Exposes an `onUploadSuccess` callback prop.
    - Shows loading state and simple error messages.
  - `src/components/QuizCard.jsx`
    - Visual card for a quiz returned from the backend.
    - Reads `quiz.quiz_data.meta` to show `topic` and `total_questions`.
    - Displays filename and `created_at`, and a "Ready to sync" chip.
  - `src/components/ui/*`
    - `button.jsx`, `card.jsx` – small styled UI primitives used throughout the app.
  - `src/App.css` / `src/index.css`
    - Additional styling. Tailwind is available via the Vite/Tailwind setup, but some custom CSS remains for layout and legacy styles.

---

### Environment variables

Create a `.env` file in the **project root** (same level as `backend/` and `frontend/`). This file is already git‑ignored.

Required keys for the backend:

- **`OPENAI_API_KEY`** (preferred) or **`OPEN_API_KEY`** – your OpenAI API key.

Backend code will load `.env` twice:

- `backend/services/llm_generator.py` uses a path two levels up from `services/` to find the root `.env`.
- `backend/app.py` also calls `load_dotenv()`.

You do **not** need environment variables for the frontend.

---

### How to run everything locally

#### 1. Backend (Flask API)

From the repository root:

```bash
cd backend

# (Optional but recommended) create and activate a virtualenv
python3 -m venv .venv
source .venv/bin/activate  # on macOS/Linux
# .venv\Scripts\activate   # on Windows PowerShell

# Install dependencies
pip install -r requirements.txt

# Run the API
python app.py
```

- The backend will listen on `http://127.0.0.1:5000`.
- Check `GET /` in a browser or with curl to confirm it’s up:

```bash
curl http://127.0.0.1:5000/
```

You should see a small JSON health payload.

#### 2. Frontend (React + Vite)

In a separate terminal, from the repository root:

```bash
cd frontend
npm install
npm run dev
```

- Vite will start on `http://127.0.0.1:5173` by default.
- Thanks to the proxy in `vite.config.js`, any request to `/api/...` from the browser will be forwarded to `http://127.0.0.1:5000`.
- Navigate to `http://127.0.0.1:5173/` to use the dashboard.

#### 3. End‑to‑end flow

1. Start the **backend** (`python app.py`).
2. Start the **frontend** (`npm run dev`).
3. Open the dashboard at `http://127.0.0.1:5173/`.
4. Upload a PDF via the upload box.
   - The frontend calls `POST /api/upload` with the PDF file.
   - The backend extracts text, asks OpenAI for a quiz, stores it, and returns basic info.
5. The frontend refreshes `/api/sync` and displays the new quiz card under "Available on device".
6. A Raspberry Pi device can call `GET /api/sync` directly against the backend to retrieve the same quizzes.

---

### Raspberry Pi integration (current behavior)

Right now, the Raspberry Pi only needs to do:

- **Endpoint**: `GET http://<backend-host>:5000/api/sync`
- **Response shape**:
  - `{ quizzes: [ { id, filename, topic, created_at, quiz_data }, ... ] }`
  - `quiz_data` is a nested JSON object containing `meta` and `questions` as produced by the LLM.

The Pi is responsible for:

- Deciding how often to sync (e.g. every N minutes or on demand).
- Caching the quizzes locally (e.g. on disk or in memory).
- Rendering/reading the questions on the physical device.

There is **no authentication or pairing** yet. Any device that can reach the backend can pull all quizzes.

---

### What’s left to build: `QRCodeGen` pairing component

You mentioned that the remaining task is a **pairing component** called `QRCodeGen` to connect the Raspberry Pi to this backend. Here’s a clear spec for your friend, including suggested file structure and behavior.

#### Target UX

- Visit `/pair` in the web app.
- See a QR code containing all the information the Pi needs to connect to this backend instance.
- On the Raspberry Pi:
  - User opens a camera/QR‑scanner flow.
  - Device decodes the QR payload and saves configuration details (at minimum, the backend base URL; optionally, a per‑device token or ID).
  - From then on, the Pi uses that configuration when calling `/api/sync`.

#### Minimal data to encode in the QR code

At minimum encode a small JSON object, for example:

```json
{
  "type": "studybuddy_pairing",
  "backend_url": "http://192.168.1.50:5000",
  "device_name": "Living Room Buddy"
}
```

Notes:

- `backend_url` should point to the IP/hostname where the Pi can reach the Flask backend on the LAN.
- `device_name` can be optional and editable in the UI.
- `type` is just a namespace so the Pi can verify it scanned the right sort of QR.
- In a more advanced version you can add a `pair_token` or `device_id` generated by the backend.

#### Frontend work: `QRCodeGen` component

- **Location**: `frontend/src/components/QRCodeGen.jsx`.
- **Library**: use the already‑installed `react-qr-code` package.
- **API (suggested)**:
  - Props:
    - `value` (string): the raw string to encode (likely `JSON.stringify({ ... })`).
    - Optional styling props (`size`, etc.) if needed.
- **Responsibilities**:
  - Render a QR code for the provided string.
  - Handle simple loading/empty states if `value` isn’t ready yet.

Example implementation sketch:

```jsx
// frontend/src/components/QRCodeGen.jsx
import QRCode from "react-qr-code";

const QRCodeGen = ({ value, size = 192 }) => {
  if (!value) {
    return (
      <div className="text-xs text-slate-500">Waiting for pairing data…</div>
    );
  }

  return (
    <div className="inline-flex items-center justify-center rounded-xl bg-slate-900 p-4">
      <QRCode
        value={value}
        size={size}
        fgColor="#e5e7eb"
        bgColor="transparent"
      />
    </div>
  );
};

export default QRCodeGen;
```

#### Integrating `QRCodeGen` into `PairDevice` page

In `frontend/src/pages/PairDevice.jsx`:

- Import and use `QRCodeGen` in place of the current "QR code placeholder" box.
- Build the QR payload JSON from React state/props.

Example pattern:

```jsx
// inside PairDevice component
const baseUrl = window.location.origin.replace(":5173", ":5000");
const payload = {
  type: "studybuddy_pairing",
  backend_url: `${baseUrl}/api`,
};

const qrValue = JSON.stringify(payload);

// In JSX
<CardContent>
  <div className="flex items-center justify-center py-4">
    <QRCodeGen value={qrValue} />
  </div>
</CardContent>;
```

This approach:

- Assumes the backend runs on the same host as the frontend (`window.location.origin`) but on port `5000` (adjust logic if you deploy differently).
- Encodes the full API base URL in the QR code.

#### (Optional) Backend work for a more robust pairing flow

If you want real per‑device pairing instead of just configuring a base URL, here’s a suggested roadmap:

- **New `Device` model** (not yet implemented):
  - `id` (PK), `name`, `pair_token` (random secret), `created_at`, `last_seen_at`, etc.
- **New endpoints**:
  - `POST /api/pair/request` – creates a new `Device` row and returns `{ device_id, pair_token }`.
  - The frontend encodes that info in the QR code along with the API base URL.
  - `POST /api/pair/confirm` – Pi calls this after first scan to mark itself as paired.
- **Auth on `/api/sync`**:
  - Require a header like `X-Device-Token: <pair_token>`.
  - Validate it against the `Device` table.

None of this exists in the code yet; it is simply a sketched extension for later.

---

### Quick checklist for your collaborator

- **Understand current stack**
  - [ ] Backend: read `backend/app.py`, `backend/services/*`, `backend/database/models.py`.
  - [ ] Frontend: read `frontend/src/App.jsx`, `frontend/src/pages/*`, `frontend/src/components/*`.
- **Run locally**
  - [ ] Create `.env` with `OPENAI_API_KEY`.
  - [ ] Start backend (`python app.py`).
  - [ ] Start frontend (`npm run dev`).
  - [ ] Upload a PDF and confirm quizzes appear.
- **Implement pairing**
  - [ ] Create `frontend/src/components/QRCodeGen.jsx` using `react-qr-code`.
  - [ ] Wire `QRCodeGen` into `PairDevice.jsx` with a JSON payload (at least `backend_url`).
  - [ ] Implement QR scanning + config persistence on the Raspberry Pi side.
  - [ ] (Optional) Design and implement a more secure pairing flow with per-device tokens.
