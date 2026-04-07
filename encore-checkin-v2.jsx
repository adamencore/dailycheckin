import { useState, useCallback } from "react";

// ── DATA ──────────────────────────────────────────────────────────────────────
const TEAM_MEMBERS = [
  { name: "Alisa",    role: "Thoughtfulness Coordinator" },
  { name: "Amy",      role: "Accounting & Box Office" },
  { name: "Brittany", role: "Events Coordinator" },
  { name: "Erin",     role: "Set Designer" },
  { name: "Ilia",     role: "Stage Manager" },
  { name: "Joyce",    role: "Marketing & Personal VA" },
  { name: "Kelby",    role: "Aspire Program Director" },
  { name: "Kristen",  role: "Production Manager" },
  { name: "Nicole",   role: "Tech Director" },
  { name: "Randy",    role: "Director of Education" },
  { name: "Rebekah",  role: "Volunteer & Scholarship Coordinator" },
  { name: "Shannon",  role: "Company Manager" },
];

const AVATAR_COLORS = [
  "#C9956A","#7FB5D5","#9B8EC4","#D47F9E","#5BBF9F",
  "#D4A84B","#C47055","#6AAEE8","#8EC4A8","#C49898","#8BBFB0","#B8A86A",
];

const avatarColor = (name) =>
  AVATAR_COLORS[(name.charCodeAt(0) + name.charCodeAt(name.length - 1)) % AVATAR_COLORS.length];

const today = () => {
  const d = new Date();
  return d.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });
};
const isoDate = () => new Date().toISOString().split("T")[0];

// ── STEP ENUM ─────────────────────────────────────────────────────────────────
const STEPS = { SETUP: "setup", CHECKIN: "checkin", PROCESSING: "processing", REVIEW: "review", SYNCING: "syncing", DONE: "done" };

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function EncoreCheckin() {
  const [step, setStep]               = useState(STEPS.SETUP);
  const [sheetUrl, setSheetUrl]       = useState("");
  const [sheetError, setSheetError]   = useState("");
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [notes, setNotes]             = useState({});          // name → string
  const [actionItems, setActionItems] = useState([]);          // [{person, role, task, priority}]
  const [syncStatus, setSyncStatus]   = useState("");
  const [syncError, setSyncError]     = useState("");

  // ── helpers ──
  const member = TEAM_MEMBERS[currentIdx];
  const progress = Math.round((Object.keys(notes).length / TEAM_MEMBERS.length) * 100);

  // ── STEP 1: validate sheet URL ──
  function handleSetup() {
    if (!sheetUrl.includes("docs.google.com/spreadsheets")) {
      setSheetError("Please paste a valid Google Sheets URL.");
      return;
    }
    setSheetError("");
    setStep(STEPS.CHECKIN);
  }

  // ── STEP 2: note input ──
  function saveAndAdvance() {
    if (currentIdx < TEAM_MEMBERS.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      setStep(STEPS.PROCESSING);
      extractActionItems();
    }
  }

  function goBack() {
    if (currentIdx > 0) setCurrentIdx(i => i - 1);
  }

  // ── STEP 3: AI extraction ──
  const extractActionItems = useCallback(async () => {
    const notesSummary = TEAM_MEMBERS
      .filter(m => notes[m.name]?.trim())
      .map(m => `${m.name} (${m.role}): ${notes[m.name]}`)
      .join("\n");

    if (!notesSummary) {
      setActionItems([]);
      setStep(STEPS.REVIEW);
      return;
    }

    const prompt = `You are an executive assistant. Read these check-in notes from a theatre executive director and extract concrete action items.

NOTES:
${notesSummary}

Return ONLY a JSON array (no markdown, no explanation) like:
[
  {"person":"Name","role":"Their Role","task":"Specific action to take","priority":"high|medium|low"}
]

Rules:
- Only extract real action items (follow-ups, decisions needed, things to schedule, concerns to address)
- If a note has no action items, skip it
- Keep tasks concise and actionable (start with a verb)
- Assign priority: high = urgent/time-sensitive, medium = this week, low = when possible`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "[]";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setActionItems(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      setActionItems([]);
    }
    setStep(STEPS.REVIEW);
  }, [notes]);

  // ── STEP 4: sync to Google Sheets ──
  async function syncToSheets() {
    setStep(STEPS.SYNCING);
    setSyncError("");

    // Extract spreadsheet ID from URL
    const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) { setSyncError("Couldn't parse spreadsheet ID from URL."); setStep(STEPS.REVIEW); return; }
    const spreadsheetId = match[1];

    const dateStr = isoDate();

    // Build rows: [Date, Category, Person, Role, Notes, Action Items]
    const rows = TEAM_MEMBERS.map(m => {
      const memberItems = actionItems
        .filter(a => a.person === m.name)
        .map(a => `[${a.priority?.toUpperCase()}] ${a.task}`)
        .join(" | ");
      return [dateStr, "Encore Team", m.name, m.role, notes[m.name] || "", memberItems];
    });

    const prompt = `You have access to Google Sheets. Append data to spreadsheet ID "${spreadsheetId}".

First, check if a header row exists in Sheet1. If not, add this header row:
Date | Category | Person | Role | Notes | Action Items

Then append these rows to Sheet1:
${JSON.stringify(rows)}

Use the sheets.spreadsheets.values.append method to range "Sheet1!A:F".`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
          mcp_servers: [{ type: "url", url: "https://gcal.mcp.claude.com/mcp", name: "google" }],
        }),
      });
      const data = await res.json();
      const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("\n") || "";
      setSyncStatus(text);
      setStep(STEPS.DONE);
    } catch (e) {
      setSyncError("Sync failed: " + e.message);
      setStep(STEPS.REVIEW);
    }
  }

  // ── PRIORITY COLORS ──
  const priorityStyle = (p) => ({
    high:   { bg: "#2A1515", border: "#8A3030", dot: "#E05050" },
    medium: { bg: "#1E1E10", border: "#6A6020", dot: "#C4A830" },
    low:    { bg: "#101A10", border: "#2A5A2A", dot: "#50A050" },
  }[p] || { bg: "#1A1A1A", border: "#333", dot: "#666" });

  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div style={{
      minHeight: "100vh", background: "#0C0C10", color: "#EDE8E0",
      fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif",
      display: "flex", flexDirection: "column",
    }}>

      {/* ── TOP BAR ── */}
      <div style={{
        padding: "18px 28px", borderBottom: "1px solid #1E1E28",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "linear-gradient(180deg, #111118 0%, #0C0C10 100%)",
      }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 5, color: "#A07848", textTransform: "uppercase", marginBottom: 3 }}>Encore Theatre</div>
          <div style={{ fontSize: 20, fontWeight: "bold" }}>Daily Check-In</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#666" }}>{today()}</div>
          {step !== STEPS.SETUP && (
            <div style={{ fontSize: 10, color: "#A07848", marginTop: 4, letterSpacing: 2, textTransform: "uppercase" }}>
              {step === STEPS.CHECKIN ? `${Object.keys(notes).length}/${TEAM_MEMBERS.length} reviewed` :
               step === STEPS.PROCESSING ? "Extracting actions…" :
               step === STEPS.REVIEW ? `${actionItems.length} action items` :
               step === STEPS.SYNCING ? "Syncing…" : "Complete"}
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "28px 28px", maxWidth: 680, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>

        {/* ══ SETUP ══ */}
        {step === STEPS.SETUP && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>Connect your Google Sheet</div>
              <div style={{ fontSize: 14, color: "#888", lineHeight: 1.7 }}>
                After each check-in, your notes and AI-extracted action items will be automatically saved to your spreadsheet.
              </div>
            </div>

            <div style={{
              background: "#111118", border: "1px solid #2A2A38",
              borderRadius: 12, padding: "20px 22px",
            }}>
              <div style={{ fontSize: 11, color: "#666", letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>
                How to set up
              </div>
              {["Go to sheets.google.com and create a new spreadsheet",
                "Name it something like 'Encore Daily Check-Ins'",
                "Copy the full URL from your browser",
                "Paste it below — Claude will handle the rest"].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "flex-start" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: "#1E1E28", border: "1px solid #3A3A48",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, color: "#A07848", flexShrink: 0, marginTop: 1,
                  }}>{i + 1}</div>
                  <div style={{ fontSize: 14, color: "#C0B8B0", lineHeight: 1.6 }}>{s}</div>
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 8, letterSpacing: 1 }}>Google Sheets URL</div>
              <input
                value={sheetUrl}
                onChange={e => { setSheetUrl(e.target.value); setSheetError(""); }}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                style={{
                  width: "100%", padding: "12px 16px", background: "#111118",
                  border: `1px solid ${sheetError ? "#8A3030" : "#2A2A38"}`,
                  borderRadius: 10, color: "#EDE8E0", fontSize: 14,
                  fontFamily: "monospace", outline: "none", boxSizing: "border-box",
                }}
              />
              {sheetError && <div style={{ fontSize: 12, color: "#E05050", marginTop: 6 }}>{sheetError}</div>}
            </div>

            <button onClick={handleSetup} style={{
              padding: "14px 24px", background: "linear-gradient(135deg, #A07848, #C49A60)",
              border: "none", borderRadius: 10, color: "#0C0C10",
              fontSize: 15, fontWeight: "bold", cursor: "pointer",
            }}>
              Begin Today's Check-In →
            </button>

            <div style={{ textAlign: "center" }}>
              <button onClick={() => setStep(STEPS.CHECKIN)} style={{
                background: "none", border: "none", color: "#555", fontSize: 13,
                cursor: "pointer", textDecoration: "underline",
              }}>
                Skip — check in without saving
              </button>
            </div>
          </div>
        )}

        {/* ══ CHECK-IN ══ */}
        {step === STEPS.CHECKIN && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Progress */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontSize: 11, color: "#666", letterSpacing: 2, textTransform: "uppercase" }}>Progress</div>
                <div style={{ fontSize: 11, color: "#A07848" }}>{currentIdx + 1} of {TEAM_MEMBERS.length}</div>
              </div>
              <div style={{ height: 3, background: "#1E1E28", borderRadius: 2 }}>
                <div style={{
                  height: "100%", borderRadius: 2,
                  width: `${((currentIdx) / TEAM_MEMBERS.length) * 100}%`,
                  background: "linear-gradient(90deg, #A07848, #D4AA70)",
                  transition: "width 0.3s ease",
                }} />
              </div>
            </div>

            {/* Member card */}
            <div style={{
              background: "#111118", border: "1px solid #2A2A38",
              borderRadius: 14, padding: "24px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: avatarColor(member.name),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, fontWeight: "bold", color: "#0C0C10",
                }}>
                  {member.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: "bold" }}>{member.name}</div>
                  <div style={{ fontSize: 13, color: "#A07848", letterSpacing: 0.5 }}>{member.role}</div>
                </div>
              </div>

              <div style={{ fontSize: 13, color: "#666", marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>
                Check-in notes
              </div>
              <textarea
                autoFocus
                value={notes[member.name] || ""}
                onChange={e => setNotes(prev => ({ ...prev, [member.name]: e.target.value }))}
                placeholder={`What's on your mind for ${member.name}? Updates, action items, concerns, wins…`}
                style={{
                  width: "100%", minHeight: 130,
                  background: "#0C0C10", border: "1px solid #2A2A38",
                  borderRadius: 10, padding: "14px 16px",
                  color: "#EDE8E0", fontSize: 14, lineHeight: 1.75,
                  fontFamily: "Palatino, Georgia, serif",
                  resize: "vertical", outline: "none", boxSizing: "border-box",
                }}
              />
            </div>

            {/* Nav */}
            <div style={{ display: "flex", gap: 12 }}>
              {currentIdx > 0 && (
                <button onClick={goBack} style={{
                  padding: "12px 20px", background: "transparent",
                  border: "1px solid #2A2A38", borderRadius: 10,
                  color: "#888", fontSize: 14, cursor: "pointer",
                }}>
                  ← Back
                </button>
              )}
              <button onClick={saveAndAdvance} style={{
                flex: 1, padding: "13px 20px",
                background: "linear-gradient(135deg, #A07848, #C49A60)",
                border: "none", borderRadius: 10,
                color: "#0C0C10", fontSize: 15, fontWeight: "bold", cursor: "pointer",
              }}>
                {currentIdx < TEAM_MEMBERS.length - 1 ? `Next: ${TEAM_MEMBERS[currentIdx + 1].name} →` : "Finish & Extract Action Items →"}
              </button>
            </div>

            {/* Minimap */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {TEAM_MEMBERS.map((m, i) => (
                <button key={m.name} onClick={() => setCurrentIdx(i)} style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: i === currentIdx ? avatarColor(m.name) : notes[m.name]?.trim() ? "#1A2A1A" : "#111118",
                  border: `1.5px solid ${i === currentIdx ? avatarColor(m.name) : notes[m.name]?.trim() ? "#3A6A3A" : "#2A2A38"}`,
                  color: i === currentIdx ? "#0C0C10" : notes[m.name]?.trim() ? "#5ABF5A" : "#555",
                  fontSize: 11, fontWeight: "bold", cursor: "pointer",
                  title: m.name,
                }}>
                  {m.name[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══ PROCESSING ══ */}
        {step === STEPS.PROCESSING && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 20, textAlign: "center" }}>
            <div style={{ fontSize: 48 }}>✦</div>
            <div style={{ fontSize: 20, fontWeight: "bold" }}>Reading your notes…</div>
            <div style={{ fontSize: 14, color: "#888", maxWidth: 380, lineHeight: 1.7 }}>
              Claude is reviewing your check-in notes and extracting action items ranked by priority.
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#A07848",
                  animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
            <style>{`@keyframes pulse { 0%,100%{opacity:0.2} 50%{opacity:1} }`}</style>
          </div>
        )}

        {/* ══ REVIEW ══ */}
        {step === STEPS.REVIEW && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: "bold", marginBottom: 6 }}>Today's Action Items</div>
              <div style={{ fontSize: 13, color: "#666" }}>
                {actionItems.length} items extracted from your check-in notes
              </div>
            </div>

            {actionItems.length === 0 ? (
              <div style={{
                background: "#111118", border: "1px solid #2A2A38",
                borderRadius: 12, padding: "24px", textAlign: "center", color: "#666",
              }}>
                No action items were found in today's notes.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["high","medium","low"].map(priority => {
                  const items = actionItems.filter(a => a.priority === priority);
                  if (!items.length) return null;
                  const ps = priorityStyle(priority);
                  return (
                    <div key={priority}>
                      <div style={{ fontSize: 10, color: ps.dot, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: ps.dot }} />
                        {priority} priority
                      </div>
                      {items.map((item, i) => (
                        <div key={i} style={{
                          background: ps.bg, border: `1px solid ${ps.border}`,
                          borderRadius: 10, padding: "14px 16px", marginBottom: 8,
                          display: "flex", gap: 14, alignItems: "flex-start",
                        }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: "50%",
                            background: avatarColor(item.person),
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: "bold", color: "#0C0C10", flexShrink: 0,
                          }}>
                            {item.person?.[0]}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, color: "#EDE8E0", lineHeight: 1.5 }}>{item.task}</div>
                            <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{item.person} · {item.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {syncError && (
              <div style={{ background: "#1A1010", border: "1px solid #6A2020", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#E05050" }}>
                {syncError}
              </div>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              {sheetUrl && (
                <button onClick={syncToSheets} style={{
                  flex: 1, padding: "14px 20px",
                  background: "linear-gradient(135deg, #A07848, #C49A60)",
                  border: "none", borderRadius: 10,
                  color: "#0C0C10", fontSize: 15, fontWeight: "bold", cursor: "pointer",
                }}>
                  Save to Google Sheets →
                </button>
              )}
              <button onClick={() => setStep(STEPS.DONE)} style={{
                padding: "14px 20px", background: "transparent",
                border: "1px solid #2A2A38", borderRadius: 10,
                color: "#888", fontSize: 14, cursor: "pointer",
              }}>
                {sheetUrl ? "Skip saving" : "Finish"}
              </button>
            </div>
          </div>
        )}

        {/* ══ SYNCING ══ */}
        {step === STEPS.SYNCING && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 20, textAlign: "center" }}>
            <div style={{ fontSize: 48 }}>📊</div>
            <div style={{ fontSize: 20, fontWeight: "bold" }}>Saving to Google Sheets…</div>
            <div style={{ fontSize: 14, color: "#888" }}>Writing today's notes and action items to your spreadsheet.</div>
          </div>
        )}

        {/* ══ DONE ══ */}
        {step === STEPS.DONE && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 20, textAlign: "center" }}>
            <div style={{ fontSize: 56 }}>✦</div>
            <div style={{ fontSize: 24, fontWeight: "bold" }}>Check-in complete</div>
            <div style={{ fontSize: 14, color: "#888", maxWidth: 380, lineHeight: 1.8 }}>
              {actionItems.length} action items extracted.
              {sheetUrl ? " Your notes have been saved to Google Sheets." : ""}
            </div>

            {actionItems.length > 0 && (
              <div style={{
                background: "#111118", border: "1px solid #2A2A38",
                borderRadius: 12, padding: "16px 20px", width: "100%", textAlign: "left",
              }}>
                <div style={{ fontSize: 11, color: "#A07848", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Summary</div>
                {["high","medium","low"].map(p => {
                  const count = actionItems.filter(a => a.priority === p).length;
                  if (!count) return null;
                  const ps = priorityStyle(p);
                  return (
                    <div key={p} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: ps.dot }} />
                        <span style={{ fontSize: 14, color: "#C0B8B0", textTransform: "capitalize" }}>{p} priority</span>
                      </div>
                      <span style={{ fontSize: 14, color: ps.dot, fontWeight: "bold" }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <button onClick={() => {
              setStep(STEPS.SETUP); setCurrentIdx(0);
              setNotes({}); setActionItems([]);
              setSyncStatus(""); setSyncError("");
            }} style={{
              padding: "13px 28px",
              background: "linear-gradient(135deg, #A07848, #C49A60)",
              border: "none", borderRadius: 10,
              color: "#0C0C10", fontSize: 15, fontWeight: "bold", cursor: "pointer",
            }}>
              Start a New Check-In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
