from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from analysis import extract_text, compare_resume_to_job

app = FastAPI(
    title='AI Resume Analyzer API',
    description='Upload a resume and compare it against a job description for ATS and match suggestions.',
    version='0.1.0'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:4173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)


class AnalysisResult(BaseModel):
    match_score: int
    ats_score: int
    missing_keywords: list[str]
    suggestions: list[str]
    top_resume_highlights: list[str]


@app.post('/analyze', response_model=AnalysisResult)
async def analyze_resume(
    resume_file: UploadFile = File(...),
    job_description: str = Form(...)
):
    try:
        contents = await resume_file.read()
        text = extract_text(resume_file.filename, contents)
        if not text.strip():
            raise HTTPException(status_code=422, detail='Could not extract text from the uploaded file.')

        report = compare_resume_to_job(text, job_description)
        return report
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail='Resume analysis failed. Please try again.')
