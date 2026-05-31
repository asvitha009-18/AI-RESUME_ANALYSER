import { useMemo, useRef, useState } from 'react';

type AnalysisResponse = {
  match_score: number;
  ats_score: number;
  missing_keywords: string[];
  suggestions: string[];
  top_resume_highlights: string[];
};

const DEFAULT_JOB_DESCRIPTION = `We are seeking a detail-oriented software engineer with experience in React, TypeScript, REST APIs, cloud deployment, and ATS-friendly resume writing. Strong communication, debugging, and teamwork skills are required.`;

const sectionVariants = ['Resume preview', 'AI analysis results', 'Stats', 'Testimonials'];

function App() {
  const [jobDescription, setJobDescription] = useState(DEFAULT_JOB_DESCRIPTION);
  const [selectedFileName, setSelectedFileName] = useState('No file uploaded yet');
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement | null>(null);

  const heroText = useMemo(() => {
    return `Drag your resume here or click to upload a PDF / DOCX. Get an instant ATS score and improvement plan.`;
  }, []);

  const updateAnalysis = async (file: File) => {
    setError('');
    setLoading(true);
    setAnalysis(null);

    const formData = new FormData();
    formData.append('resume_file', file);
    formData.append('job_description', jobDescription);

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Upload failed');
      }

      const payload = await response.json();
      setAnalysis(payload);
      setSelectedFileName(file.name);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) updateAnalysis(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) updateAnalysis(file);
  };

  const handleBrowse = () => {
    fileInput.current?.click();
  };

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="logo">AI Resume Analyzer</div>
        <nav className="nav-links">
          {sectionVariants.map((label) => (
            <a key={label} href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}>{label}</a>
          ))}
        </nav>
        <a className="button button-primary" href="#analysis">Start analysis</a>
      </header>

      <main>
        <section className="hero" id="hero">
          <div>
            <p className="eyebrow">Resume Intelligence for your next interview</p>
            <h1>AI-powered resume scoring, missing skills insights, and ATS optimization suggestions.</h1>
            <p className="lead">
              Upload a resume, paste a job description, and get a polished improvement plan your hiring team will notice.
            </p>
            <div className="hero-actions">
              <button className="button button-primary" onClick={handleBrowse}>Upload resume</button>
              <button className="button button-secondary" onClick={() => setJobDescription(DEFAULT_JOB_DESCRIPTION)}>Use sample job description</button>
            </div>
          </div>
          <div className="hero-card" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={handleBrowse}>
            <div className="hero-card-line" />
            <div>
              <p className="hero-card-title">Resume upload</p>
              <p>{heroText}</p>
              <strong>{selectedFileName}</strong>
            </div>
            <div className="hero-card-glow" />
          </div>
        </section>

        <section className="split-grid" id="analysis">
          <article className="panel panel-left">
            <h2>Resume preview</h2>
            <div className="frame">
              <p>Upload your PDF/DOCX and we analyze the content, structure, and ATS readability.</p>
              <p><strong>Job description</strong></p>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                aria-label="Job description"
              />
            </div>
          </article>

          <article className="panel panel-right">
            <h2>AI analysis results</h2>
            <div className="result-card">
              {loading && <p>Analyzing your resume…</p>}
              {error && <p className="error">{error}</p>}
              {!loading && !analysis && <p>Upload a resume to see your match score, missing keywords and rewrite suggestions.</p>}
              {analysis && (
                <>
                  <div className="score-block">
                    <div>
                      <span>Match score</span>
                      <strong>{analysis.match_score}%</strong>
                    </div>
                    <div>
                      <span>ATS score</span>
                      <strong>{analysis.ats_score}%</strong>
                    </div>
                  </div>

                  <div className="progress">
                    <div className="progress-bar" style={{ width: `${analysis.ats_score}%` }} />
                  </div>

                  <div className="result-section">
                    <h3>Missing keywords</h3>
                    <ul>
                      {analysis.missing_keywords.map((keyword) => <li key={keyword}>{keyword}</li>)}
                    </ul>
                  </div>

                  <div className="result-section">
                    <h3>Improvement suggestions</h3>
                    <ol>
                      {analysis.suggestions.map((item) => <li key={item}>{item}</li>)}
                    </ol>
                  </div>
                </>
              )}
            </div>
          </article>
        </section>

        <section className="stats" id="stats">
          <div className="stat-card">
            <strong>92%</strong>
            <p>of users improved resume readability after one pass.</p>
          </div>
          <div className="stat-card">
            <strong>85%</strong>
            <p>reported better alignment with job requirements.</p>
          </div>
          <div className="stat-card">
            <strong>7x</strong>
            <p>faster resume reviews using AI-driven keyword matching.</p>
          </div>
        </section>

        <section className="testimonials" id="testimonials">
          <h2>Trusted by job seekers and career coaches</h2>
          <div className="testimonial-grid">
            <blockquote>
              “The analysis highlighted experience I had overlooked and helped me rewrite my resume for interviews.”
              <footer>— Mia, Product Designer</footer>
            </blockquote>
            <blockquote>
              “A simple upload and the AI suggested exact keywords from the job posting. My ATS score improved significantly.”
              <footer>— Noah, Software Engineer</footer>
            </blockquote>
            <blockquote>
              “Great landing page, powerful backend. The results felt practical and data-driven.”
              <footer>— Kara, Career Coach</footer>
            </blockquote>
          </div>
        </section>
      </main>

      <input
        type="file"
        accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="visually-hidden"
        ref={fileInput}
        onChange={handleFileSelect}
      />
    </div>
  );
}

export default App;
