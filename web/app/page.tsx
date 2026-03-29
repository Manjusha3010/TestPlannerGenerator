"use client";

import { useCallback, useEffect, useState } from "react";

type WorkItem = Record<string, unknown>;

function errDetail(data: unknown): string {
  const d = (data as { detail?: unknown })?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d))
    return d
      .map((x) =>
        typeof x === "object" && x && "msg" in x ? String((x as { msg: string }).msg) : String(x)
      )
      .join("; ");
  return "Request failed";
}

function apiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base =
    typeof window !== "undefined" ? window.location.origin : "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

async function api<T>(path: string, body: unknown): Promise<T> {
  const url = apiUrl(path);
  let r: Response;
  try {
    r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e);
    throw new Error(
      `Cannot reach the app (${path}). ${raw}. Local: run "npm run dev" in the web folder and open http://localhost:3000 (not the old port 5174). Deployed: confirm Vercel Root Directory is "web" and the deployment succeeded.`
    );
  }
  const json = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new Error(errDetail(json) || r.statusText);
  }
  return json as T;
}

function useTheme() {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("blast-theme") === "dark";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    try {
      localStorage.setItem("blast-theme", dark ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }, [dark]);
  return { dark, setDark };
}

function simpleMdHtml(md: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let t = esc(md);
  t = t.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  t = t.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  t = t.replace(/^# (.*)$/gm, "<h1>$1</h1>");
  t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/\n\n/g, "</p><p>");
  return `<p>${t}</p>`;
}

export default function HomePage() {
  const { dark, setDark } = useTheme();
  const [openStep, setOpenStep] = useState(1);
  const [err, setErr] = useState<string | null>(null);

  const [llmBase, setLlmBase] = useState("https://api.groq.com/openai/v1");
  const [llmKey, setLlmKey] = useState("");
  const [llmModel, setLlmModel] = useState("llama-3.1-8b-instant");
  const [step1Done, setStep1Done] = useState(false);

  const [jiraUrl, setJiraUrl] = useState("");
  const [jiraEmail, setJiraEmail] = useState("");
  const [jiraToken, setJiraToken] = useState("");
  const [step2Done, setStep2Done] = useState(false);

  const [issueKey, setIssueKey] = useState("");
  const [extraContext, setExtraContext] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [workItem, setWorkItem] = useState<WorkItem | null>(null);

  const [markdown, setMarkdown] = useState("");
  const [generating, setGenerating] = useState(false);

  const [cfUrl, setCfUrl] = useState("");
  const [cfEmail, setCfEmail] = useState("");
  const [cfToken, setCfToken] = useState("");
  const [cfSpace, setCfSpace] = useState("");
  const [cfTitle, setCfTitle] = useState("");
  const [publishBusy, setPublishBusy] = useState(false);
  const [publishResult, setPublishResult] = useState<string | null>(null);

  const testLlm = async () => {
    setErr(null);
    try {
      await api("/api/llm/test", {
        provider_base_url: llmBase,
        api_key: llmKey,
        model: llmModel,
      });
      setStep1Done(true);
      setOpenStep(2);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const testJira = async () => {
    setErr(null);
    try {
      await api("/api/jira/test", {
        jira_base_url: jiraUrl,
        jira_email: jiraEmail,
        jira_api_token: jiraToken,
      });
      setStep2Done(true);
      setOpenStep(3);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const fetchPreview = async () => {
    setErr(null);
    try {
      const res = await api<{ work_item: WorkItem; preview_text: string }>("/api/jira/preview", {
        jira_base_url: jiraUrl,
        jira_email: jiraEmail,
        jira_api_token: jiraToken,
        issue_key: issueKey.trim(),
      });
      setWorkItem(res.work_item);
      setPreviewText(res.preview_text);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const generatePlan = useCallback(async () => {
    if (!workItem) {
      setErr("Fetch ticket preview first.");
      return;
    }
    setErr(null);
    setGenerating(true);
    setMarkdown("");
    try {
      const res = await api<{ markdown: string }>("/api/generate", {
        work_item: workItem,
        llm: {
          provider_base_url: llmBase,
          api_key: llmKey,
          model: llmModel,
        },
        additional_context: extraContext || null,
        prepared_by: "QA Architecture Team",
      });
      setMarkdown(res.markdown);
      const key = String(workItem.key ?? issueKey);
      setCfTitle((t) => t || `Test Plan - ${key}`);
      setOpenStep(4);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerating(false);
    }
  }, [workItem, llmBase, llmKey, llmModel, extraContext, issueKey]);

  const publishConfluence = async () => {
    setErr(null);
    setPublishResult(null);
    setPublishBusy(true);
    try {
      const res = await api<{ webui?: string; id?: string }>("/api/confluence/publish", {
        confluence_base_url: cfUrl,
        email: cfEmail,
        api_token: cfToken,
        space_key: cfSpace,
        title: cfTitle,
        body_markdown: markdown,
      });
      setPublishResult(res.webui ? `Published: ${res.webui}` : `Page id: ${res.id}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setPublishBusy(false);
    }
  };

  const downloadMd = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `test-plan-${issueKey || "export"}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const stepNumClass = (n: number) => {
    const done =
      (n === 1 && step1Done) ||
      (n === 2 && step2Done) ||
      (n === 3 && !!workItem) ||
      (n === 4 && !!markdown);
    if (done && openStep !== n) return "done";
    if (openStep === n) return "current";
    return "";
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon" aria-hidden>
            🚀
          </span>
          B.L.A.S.T
        </div>
        <button type="button" className="nav-btn active">
          📊 Dashboard
        </button>
        <button type="button" className="nav-btn" disabled>
          🕐 History
        </button>
        <div className="sidebar-footer">
          <button type="button" className="theme-toggle" onClick={() => setDark(!dark)}>
            {dark ? "☀️ Light mode" : "🌙 Dark mode"}
          </button>
        </div>
      </aside>
      <main className="main">
        <h1 className="page-title">Test Planner Dashboard</h1>
        <p className="page-sub">Guided step-by-step workflow for generating test plans.</p>
        {err && <div className="error">{err}</div>}

        <section className="step">
          <button type="button" className="step-head" onClick={() => setOpenStep(1)}>
            <span className={`step-num ${stepNumClass(1)}`}>1</span>
            LLM Connection
          </button>
          {openStep === 1 && (
            <div className="step-body">
              <div className="field">
                <label>Base URL</label>
                <input
                  value={llmBase}
                  onChange={(e) => setLlmBase(e.target.value)}
                  placeholder="https://api.groq.com/openai/v1 ( /v1 added automatically if missing )"
                />
              </div>
              <div className="field">
                <label>API Key</label>
                <input
                  type="password"
                  value={llmKey}
                  onChange={(e) => setLlmKey(e.target.value)}
                  placeholder="API Key"
                  autoComplete="off"
                />
              </div>
              <div className="field">
                <label>Model</label>
                <input value={llmModel} onChange={(e) => setLlmModel(e.target.value)} placeholder="llama-3.1-8b-instant" />
              </div>
              <div className="row-actions">
                <button type="button" className="btn btn-primary" onClick={testLlm}>
                  Test Connection & Continue →
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="step">
          <button type="button" className="step-head" onClick={() => setOpenStep(2)}>
            <span className={`step-num ${stepNumClass(2)}`}>2</span>
            Jira Connection
          </button>
          {openStep === 2 && (
            <div className="step-body">
              <div className="field">
                <label>Jira URL</label>
                <input
                  value={jiraUrl}
                  onChange={(e) => setJiraUrl(e.target.value)}
                  placeholder="https://your-domain.atlassian.net (site root, not …/jira)"
                />
              </div>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={jiraEmail}
                  onChange={(e) => setJiraEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </div>
              <div className="field">
                <label>API Token</label>
                <input
                  type="password"
                  value={jiraToken}
                  onChange={(e) => setJiraToken(e.target.value)}
                  placeholder="Jira API token"
                  autoComplete="off"
                />
              </div>
              <div className="row-actions">
                <button type="button" className="btn" onClick={() => setOpenStep(1)}>
                  Back
                </button>
                <button type="button" className="btn btn-primary" onClick={testJira} disabled={!step1Done}>
                  Test Connection & Continue →
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="step">
          <button type="button" className="step-head" onClick={() => setOpenStep(3)}>
            <span className={`step-num ${stepNumClass(3)}`}>3</span>
            Ticket Information
          </button>
          {openStep === 3 && (
            <div className="step-body">
              <div className="field">
                <label>Jira Ticket ID (required)</label>
                <input value={issueKey} onChange={(e) => setIssueKey(e.target.value)} placeholder="PROJ-123" />
              </div>
              <div className="field">
                <label>Additional Context (optional)</label>
                <textarea
                  value={extraContext}
                  onChange={(e) => setExtraContext(e.target.value)}
                  placeholder="E.g. Focus specifically on security boundary testing…"
                />
              </div>
              <button type="button" className="btn" onClick={fetchPreview} disabled={!step2Done}>
                🔍 Fetch Preview
              </button>
              {previewText && <div className="preview-box">{previewText}</div>}
              <div className="row-actions">
                <button type="button" className="btn" onClick={() => setOpenStep(2)}>
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-purple"
                  onClick={generatePlan}
                  disabled={!workItem || generating}
                >
                  ⚡ Generate Test Plan
                  {generating && <span className="spinner" aria-label="Loading" />}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="step">
          <button type="button" className="step-head" onClick={() => setOpenStep(4)}>
            <span className={`step-num ${stepNumClass(4)}`}>4</span>
            Generated Result
          </button>
          {openStep === 4 && (
            <div className="step-body">
              {markdown ? (
                <div className="md-preview" dangerouslySetInnerHTML={{ __html: simpleMdHtml(markdown) }} />
              ) : (
                <p className="page-sub">Generate a plan from step 3 to see the preview here.</p>
              )}
              {markdown && (
                <button type="button" className="btn" style={{ marginTop: "0.75rem" }} onClick={downloadMd}>
                  Download Markdown
                </button>
              )}
              <h3 className="page-title" style={{ fontSize: "1.1rem", marginTop: "1.5rem" }}>
                Publish to Confluence
              </h3>
              <div className="field">
                <label>Confluence Base URL</label>
                <input
                  value={cfUrl}
                  onChange={(e) => setCfUrl(e.target.value)}
                  placeholder="https://your-domain.atlassian.net/wiki"
                />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" value={cfEmail} onChange={(e) => setCfEmail(e.target.value)} />
              </div>
              <div className="field">
                <label>API Token</label>
                <input type="password" value={cfToken} onChange={(e) => setCfToken(e.target.value)} />
              </div>
              <div className="field">
                <label>Space key</label>
                <input value={cfSpace} onChange={(e) => setCfSpace(e.target.value)} placeholder="TEAM" />
              </div>
              <div className="field">
                <label>Page title</label>
                <input value={cfTitle} onChange={(e) => setCfTitle(e.target.value)} />
              </div>
              <div className="row-actions">
                <button type="button" className="btn" onClick={() => setOpenStep(3)}>
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={publishConfluence}
                  disabled={!markdown || publishBusy}
                >
                  Publish
                </button>
              </div>
              {publishResult && <p className="page-sub">{publishResult}</p>}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
