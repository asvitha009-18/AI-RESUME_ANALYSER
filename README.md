# AI Resume Analyzer

A landing page and backend service for an AI-powered resume analyzer. Users can upload a PDF or DOCX resume, compare it to a job description, and receive:

- Match score
- ATS score visualization
- Missing keywords
- Resume improvement suggestions

## Structure

- `frontend/` — React + TypeScript landing page built with Vite
- `backend/` — FastAPI service that handles file upload and analysis

## Local setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown in the terminal (default: `http://localhost:4173`).

### Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`.

## Notes

- The frontend sends resume uploads to `http://localhost:8000/analyze`.
- Supported resume formats: PDF and DOCX.
- The backend uses simple keyword extraction and scoring logic for prototyping.

## Deployment

- Deploy the frontend to Vercel by connecting the `frontend` folder.
- Deploy the backend to Render or Railway using `backend/main.py`.
