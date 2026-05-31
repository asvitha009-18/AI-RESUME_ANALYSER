import re
from typing import List

KEYWORD_PATTERN = re.compile(r"[A-Za-z0-9+#]+(?:-[A-Za-z0-9+#]+)*")


def extract_text_from_pdf(file_bytes: bytes) -> str:
    from PyPDF2 import PdfReader
    from io import BytesIO

    text_parts: List[str] = []
    reader = PdfReader(BytesIO(file_bytes))
    for page in reader.pages:
        page_text = page.extract_text() or ''
        text_parts.append(page_text)
    return '\n'.join(text_parts)


def extract_text_from_docx(file_bytes: bytes) -> str:
    from docx import Document
    from io import BytesIO

    document = Document(BytesIO(file_bytes))
    return '\n'.join(paragraph.text for paragraph in document.paragraphs)


def extract_text(file_name: str, file_bytes: bytes) -> str:
    lowered = file_name.lower()
    if lowered.endswith('.pdf'):
        return extract_text_from_pdf(file_bytes)
    if lowered.endswith('.docx'):
        return extract_text_from_docx(file_bytes)
    raise ValueError('Unsupported file type. Please upload PDF or DOCX.')


def extract_keywords(text: str) -> List[str]:
    matches = KEYWORD_PATTERN.findall(text)
    filtered = [match.lower() for match in matches if len(match) > 1]
    return sorted(set(filtered))


def compare_resume_to_job(resume_text: str, job_description: str) -> dict:
    resume_text_lower = resume_text.lower()
    job_keywords = extract_keywords(job_description)
    resume_keywords = extract_keywords(resume_text)

    detected = [kw for kw in job_keywords if kw in resume_text_lower]
    missing = [kw for kw in job_keywords if kw not in resume_text_lower]

    score = 0
    if job_keywords:
        score = int(len(detected) / len(job_keywords) * 100)

    ats_score = max(20, min(100, int(score * 0.95 + 5)))

    suggestions = []
    if missing:
        suggestions.append(
            'Add or rephrase the missing keywords from the job description into your resume.'
        )
    if 'team' not in resume_text_lower and 'teamwork' in job_description.lower():
        suggestions.append('Highlight collaborative and team contributions in your experience section.')
    if 'react' not in resume_text_lower and 'react' in job_description.lower():
        suggestions.append('Include relevant React or frontend framework experience where appropriate.')
    if 'typescript' not in resume_text_lower and 'typescript' in job_description.lower():
        suggestions.append('Mention TypeScript experience and strong typed code projects.')

    if not suggestions:
        suggestions.append('Your resume already includes most keywords. Focus on concrete outcomes and metrics.')

    return {
        'match_score': score,
        'ats_score': ats_score,
        'missing_keywords': missing[:8],
        'suggestions': suggestions,
        'top_resume_highlights': resume_keywords[:8],
    }
