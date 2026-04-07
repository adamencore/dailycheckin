import { useState, useCallback } from "react";

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
  "#348193","#7FB5D5","#9B8EC4","#D47F9E","#5BBF9F",
  "#D4A84B","#C47055","#6AAEE8","#8EC4A8","#C49898","#8BBFB0","#B8A86A",
];

const avatarColor = (name) =>
  AVATAR_COLORS[(name.charCodeAt(0) + name.charCodeAt(name.length - 1)) % AVATAR_COLORS.length];

const todayStr = () =>
  new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });
const isoDate = () => new Date().toISOString().split("T")[0];

const STEPS = { SETUP:"setup", CHECKIN:"checkin", PROCESSING:"processing", REVIEW:"review", SYNCING:"syncing", DONE:"done" };

const EncoreLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 913.73 186.58" style={{ height: 28, width: "auto" }}>
    <g fill="#f2f2f2">
      <path d="M908.69,159.89c0,13.31-6.67,19.97-19.97,19.97-14.13,0-21.2-6.67-21.2-19.97s7.07-19.97,21.2-19.97c13.31,0,19.97,6.67,19.97,19.97ZM881.22,125.36c-3.26-21.63-5.96-38.67-8.12-51.12-2.18-12.46-3.93-22.15-5.29-29.07-1.35-6.92-2.31-12.1-2.86-15.56-.55-3.46-.8-7.02-.8-10.65,0-12.63,8.27-18.95,24.79-18.95s24.79,6.32,24.79,18.95c0,3.63-.28,7.19-.8,10.65-.55,3.46-1.55,8.65-3.06,15.56-1.48,6.92-3.58,16.62-6.29,29.07-2.71,12.46-6.09,29.5-10.15,51.12h-12.2Z"/>
      <path d="M54.51,132.65c7.27,21.55,36.09,47.24,79.42,8.57,2.61-2.33,6.49.78,4.94,3.63-8.3,15.84-27.24,39.45-65.94,39.45S0,154.45,0,117.59,32.45,50.62,72.68,50.87h.78c32.45-.25,59.95,19.72,69.04,46.99,1.05,3.38-.78,7.02-4.16,8.04,0,0-83.83,26.74-83.83,26.74ZM90.85,109.54c2.08-.78,3.38-3.11,2.86-5.19-4.41-20.75-14.54-43.33-29.6-40.75-.25,0-.78.25-1.03.25-18.42,4.66-16.87,40.75-12.2,58.14,0,0,39.97-12.46,39.97-12.46Z"/>
      <path d="M313.41,183c-19.2,6.74-64.88,9.1-64.88-41.28v-44.63c0-8.04-3.38-23.11-19.97-24.66-13.23-1.03-25.19,12.71-25.19,24.41v61.25c0,1.55-.78,16.36,15.31,17.92,1.3.25,2.86,1.55,2.86,3.38s-1.3,3.38-3.11,3.38h-79.94c-1.83,0-3.38-1.55-3.38-3.38s1.3-3.11,3.11-3.38c9.1-1.03,15.06-7.52,15.31-17.39v-74.76s.25-13.76-14.28-13.23c-2.33,0-4.16-1.55-4.16-3.88,0-1.8,1.3-3.38,3.11-3.63l65.16-10.12v16.36s11.93-16.62,40.75-16.36c26.74.53,54.26,17.14,54.26,44.63l-.25,53.73c0,28.29,15.31,31.68,15.31,31.68v-.03Z"/>
      <path d="M449.77,137.08c-8.3,15.84-32.68,47.22-71.35,47.22s-72.93-29.85-72.93-66.71,32.45-66.96,72.68-66.71h.78c18.17-.25,35.04,6.24,47.77,16.34,19.2,15.84,9.35,31.15-9.87,34.78h-.78c-9.07,1.3-17.92-4.16-21.03-12.71-5.46-15.31-14.01-27.52-25.44-25.69-.25,0-.78,0-1.03.25-22.05,6.74-15.31,52.68-8.57,68.79,10.12,24.41,45.91,36.86,84.83.8,2.61-2.33,6.49.78,4.94,3.63Z"/>
      <path d="M588.93,117.84c0,37.89-32.96,68.52-72.93,68.52s-72.93-30.62-72.93-68.52,32.45-68.52,72.68-68.52h.78c39.97,0,72.4,30.62,72.4,68.52h0ZM539.09,117.84c0-16.87-3.11-56.06-22.58-56.06h-1.03c-19.47,0-22.58,39.2-22.58,56.06s3.11,56.06,22.58,56.06h1.03c19.47,0,22.58-39.2,22.58-56.06Z"/>
      <path d="M697.35,98.89c-.78.25-1.8.25-2.86.25-10.38,0-18.7-8.3-18.7-18.7,0-4.66,1.55-8.82,4.41-12.2-12.2-.53-30.37,18.17-30.37,34.01v55.81c0,1.55-.78,16.36,15.31,18.17,1.83,0,2.86,1.55,2.86,3.11v.25c0,1.83-1.3,3.11-3.11,3.11h-79.94c-1.83,0-3.38-1.3-3.38-3.38,0-1.55,1.3-3.11,3.11-3.11,15.56-1.8,15.31-16.34,15.31-17.39v-75.01s.25-13.23-14.28-13.23c-2.08,0-3.88-1.3-4.16-3.38-.25-2.08,1.3-3.88,3.11-4.16l65.13-10.12v16.62s14.54-19.72,40.75-16.34c29.32,3.63,28.54,44.13,6.74,45.69l.08.03Z"/>
      <path d="M766.14,132.65c7.27,21.55,36.09,47.24,79.42,8.57,2.61-2.33,6.49.78,4.94,3.63-8.3,15.84-27.24,39.45-65.94,39.45s-72.93-29.85-72.93-66.71,32.45-66.96,72.68-66.71h.78c32.45-.25,59.95,19.72,69.04,46.99,1.03,3.38-.78,7.02-4.16,8.04l-83.83,26.74h0ZM802.48,109.54c2.08-.78,3.38-3.11,2.86-5.19-4.41-20.75-14.54-43.33-29.6-40.75-.25,0-.78.25-1.03.25-18.42,4.66-16.87,40.75-12.2,58.14l39.97-12.46h0Z"/>
    </g>
  </svg>
);

export default function EncoreCheckin() {
  const [step, setStep]               = useState(STEPS.SETUP);
  const [sheetUrl, setSheetUrl]       = useState("");
  const [slackWebhook, setSlackWebhook] = useState("");
  const [sheetError, setSheetError]   = useState("");
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [notes, setNotes]             = useState({});
  const [actionItems, setActionItems] = useState([]);
  const [syncError, setSyncError]     = useState("");
  const [slackSent, setSlackSent]     = useState(false);
  const [slackSending, setSlackSending] = useState(false);
  const [slackError, setSlackError]   = useState("");

  const member = TEAM_MEMBERS[currentIdx];

  function handleSetup() {
    if (!sheetUrl.includes("docs.google.com/spreadsheets")) {
      setSheetError("Please paste a valid Google Sheets URL.");
      return;
    }
    setSheetError("");
    setStep(STEPS.CHECKIN);
  }

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

  const extractActionItems = useCallback(async () => {
    const notesSummary = TEAM_MEMBERS
      .filter(m => notes[m.name]?.trim())
      .map(m => `${m.name} (${m.role}): ${notes[m.name]}`)
      .join("\n");

    if (!notesSummary) { setActionItems([]); setStep(STEPS.REVIEW); return; }

    const prompt = `You are an executive assistant. Read these check-in notes from a theatre executive director and extract concrete action items.

NOTES:
${notesSummary}

Return ONLY a JSON array (no markdown, no explanation) like:
[{"person":"Name","role":"Their Role","task":"Specific action to take","priority":"high|medium|low"}]

Rules:
- Only extract real action items (follow-ups, decisions needed, things to schedule, concerns to address)
- If a note has no action items, skip it
- Keep tasks concise and actionable (start with a verb)
- Assign priority: high = urgent/time-sensitive, medium = this week, low = when possible`;

    try {
      const res = await fetch("/.netlify/functions/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "[]";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setActionItems(Array.isArray(parsed) ? parsed : []);
    } catch { setActionItems([]); }
    setStep(STEPS.REVIEW);
  }, [notes]);

  async function syncToSheets() {
    setStep(STEPS.SYNCING);
    setSyncError("");
    const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) { setSyncError("Couldn't parse spreadsheet ID."); setStep(STEPS.REVIEW); return; }
    const spreadsheetId = match[1];
    const rows = TEAM_MEMBERS.map(m => {
      const items = actionItems.filter(a => a.person === m.name).map(a => `[${a.priority?.toUpperCase()}] ${a.task}`).join(" | ");
      return [isoDate(), "Encore Team", m.name, m.role, notes[m.name] || "", items];
    });
    const prompt = `You have access to Google Sheets. Append data to spreadsheet ID "${spreadsheetId}". First check if a header row exists in Sheet1; if not add: Date | Category | Person | Role | Notes | Action Items. Then append these rows: ${JSON.stringify(rows)}. Use sheets.spreadsheets.values.append to range "Sheet1!A:F".`;
    try {
      const res = await fetch("/.netlify/functions/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }], mcp_servers: [{ type: "url", url: "https://gcal.mcp.claude.com/mcp", name: "google" }] }),
      });
      await res.json();
      setStep(STEPS.DONE);
    } catch (e) { setSyncError("Sync failed: " + e.message); setStep(STEPS.REVIEW); }
  }

  async function sendToSlack() {
    if (!slackWebhook) { setSlackError("Please add your Slack webhook URL in setup."); return; }
    setSlackSending(true);
    setSlackError("");

    const dateStr = todayStr();
    const priorityEmoji = { high: "🔴", medium: "🟡", low: "🟢" };
    const priorityLabel = { high: "*High priority*", medium: "*Medium priority*", low: "*Low priority*" };

    let blocks = [
      { type: "header", text: { type: "plain_text", text: `📋 Encore Daily Check-In — ${dateStr}` } },
      { type: "section", text: { type: "mrkdwn", text: `${TEAM_MEMBERS.length} team members reviewed · ${actionItems.length} action items extracted` } },
      { type: "divider" },
    ];

    ["high","medium","low"].forEach(p => {
      const items = actionItems.filter(a => a.priority === p);
      if (!items.length) return;
      blocks.push({ type: "section", text: { type: "mrkdwn", text: `${priorityEmoji[p]} ${priorityLabel[p]}` } });
      items.forEach(item => {
        blocks.push({ type: "section", text: { type: "mrkdwn", text: `• ${item.task}\n_${item.person} · ${item.role}_` } });
      });
    });

    if (actionItems.length === 0) {
      blocks.push({ type: "section", text: { type: "mrkdwn", text: "_No action items today._" } });
    }

    try {
      const res = await fetch("/.netlify/functions/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl: slackWebhook, payload: { blocks } }),
      });
      const data = await res.json();
      if (data.ok) { setSlackSent(true); }
      else { setSlackError("Slack rejected the message. Check your webhook URL."); }
    } catch (e) {
      setSlackError("Couldn't send to Slack. Check your webhook URL.");
    }
    setSlackSending(false);
  }

  const priorityStyle = (p) => ({
    high:   { bg: "#2A1515", border: "#8A3030", dot: "#E05050" },
    medium: { bg: "#1E1E10", border: "#6A6020", dot: "#C4A830" },
    low:    { bg: "#101A10", border: "#2A5A2A", dot: "#50A050" },
  }[p] || { bg: "#1A1A1A", border: "#333", dot: "#666" });

  return (
    <div style={{ minHeight: "100vh", background: "#0C0C10", color: "#EDE8E0", fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif", display: "flex", flexDirection: "column" }}>

      {/* ── HEADER ── */}
      <div style={{ padding: "16px 28px", borderBottom: "1px solid #1E1E28", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(180deg, #111118 0%, #0C0C10 100%)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <EncoreLogo />
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#348193", textTransform: "uppercase" }}>Daily Check-In</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#666" }}>{todayStr()}</div>
          {step !== STEPS.SETUP && (
            <div style={{ fontSize: 10, color: "#348193", marginTop: 4, letterSpacing: 2, textTransform: "uppercase" }}>
              {step === STEPS.CHECKIN ? `${currentIdx + 1}/${TEAM_MEMBERS.length} reviewed` :
               step === STEPS.PROCESSING ? "Extracting actions…" :
               step === STEPS.REVIEW ? `${actionItems.length} action items` :
               step === STEPS.SYNCING ? "Syncing…" : "Complete"}
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "28px", maxWidth: 680, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>

        {/* ══ SETUP ══ */}
        {step === STEPS.SETUP && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>Connect your tools</div>
              <div style={{ fontSize: 14, color: "#888", lineHeight: 1.7 }}>Your notes save to Google Sheets and post a summary to Slack after each check-in.</div>
            </div>

            {/* Google Sheets */}
            <div style={{ background: "#111118", border: "1px solid #2A2A38", borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontSize: 11, color: "#348193", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Google Sheets</div>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>Paste your spreadsheet URL</div>
              <input value={sheetUrl} onChange={e => { setSheetUrl(e.target.value); setSheetError(""); }}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                style={{ width: "100%", padding: "11px 14px", background: "#0C0C10", border: `1px solid ${sheetError ? "#8A3030" : "#2A2A38"}`, borderRadius: 8, color: "#EDE8E0", fontSize: 13, fontFamily: "monospace", outline: "none", boxSizing: "border-box" }} />
              {sheetError && <div style={{ fontSize: 12, color: "#E05050", marginTop: 6 }}>{sheetError}</div>}
            </div>

            {/* Slack */}
            <div style={{ background: "#111118", border: "1px solid #2A2A38", borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontSize: 11, color: "#348193", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Slack <span style={{ color: "#444", fontWeight: "normal", letterSpacing: 0 }}>— optional</span></div>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>Paste your Slack Incoming Webhook URL</div>
              <input value={slackWebhook} onChange={e => setSlackWebhook(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                style={{ width: "100%", padding: "11px 14px", background: "#0C0C10", border: "1px solid #2A2A38", borderRadius: 8, color: "#EDE8E0", fontSize: 13, fontFamily: "monospace", outline: "none", boxSizing: "border-box" }} />
              <div style={{ fontSize: 12, color: "#555", marginTop: 8 }}>
                Get this from api.slack.com/apps → Incoming Webhooks
              </div>
            </div>

            <button onClick={handleSetup} style={{ padding: "14px 24px", background: "linear-gradient(135deg, #348193, #4A9DAD)", border: "none", borderRadius: 10, color: "#0C0C10", fontSize: 15, fontWeight: "bold", cursor: "pointer" }}>
              Begin Today's Check-In →
            </button>
            <div style={{ textAlign: "center" }}>
              <button onClick={() => setStep(STEPS.CHECKIN)} style={{ background: "none", border: "none", color: "#555", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
                Skip — check in without saving
              </button>
            </div>
          </div>
        )}

        {/* ══ CHECK-IN ══ */}
        {step === STEPS.CHECKIN && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontSize: 11, color: "#666", letterSpacing: 2, textTransform: "uppercase" }}>Progress</div>
                <div style={{ fontSize: 11, color: "#348193" }}>{currentIdx + 1} of {TEAM_MEMBERS.length}</div>
              </div>
              <div style={{ height: 3, background: "#1E1E28", borderRadius: 2 }}>
                <div style={{ height: "100%", borderRadius: 2, width: `${(currentIdx / TEAM_MEMBERS.length) * 100}%`, background: "linear-gradient(90deg, #348193, #5BB0BF)", transition: "width 0.3s ease" }} />
              </div>
            </div>

            <div style={{ background: "#111118", border: "1px solid #2A2A38", borderRadius: 14, padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: avatarColor(member.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: "bold", color: "#0C0C10" }}>
                  {member.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: "bold" }}>{member.name}</div>
                  <div style={{ fontSize: 13, color: "#348193" }}>{member.role}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>Check-in notes</div>
              <textarea autoFocus value={notes[member.name] || ""} onChange={e => setNotes(prev => ({ ...prev, [member.name]: e.target.value }))}
                placeholder={`What's on your mind for ${member.name}? Updates, action items, concerns, wins…`}
                style={{ width: "100%", minHeight: 130, background: "#0C0C10", border: "1px solid #2A2A38", borderRadius: 10, padding: "14px 16px", color: "#EDE8E0", fontSize: 14, lineHeight: 1.75, fontFamily: "Palatino, Georgia, serif", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              {currentIdx > 0 && (
                <button onClick={goBack} style={{ padding: "12px 20px", background: "transparent", border: "1px solid #2A2A38", borderRadius: 10, color: "#888", fontSize: 14, cursor: "pointer" }}>← Back</button>
              )}
              <button onClick={saveAndAdvance} style={{ flex: 1, padding: "13px 20px", background: "linear-gradient(135deg, #348193, #4A9DAD)", border: "none", borderRadius: 10, color: "#0C0C10", fontSize: 15, fontWeight: "bold", cursor: "pointer" }}>
                {currentIdx < TEAM_MEMBERS.length - 1 ? `Next: ${TEAM_MEMBERS[currentIdx + 1].name} →` : "Finish & Extract Action Items →"}
              </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {TEAM_MEMBERS.map((m, i) => (
                <button key={m.name} onClick={() => setCurrentIdx(i)} style={{ width: 32, height: 32, borderRadius: "50%", background: i === currentIdx ? avatarColor(m.name) : notes[m.name]?.trim() ? "#1A2A1A" : "#111118", border: `1.5px solid ${i === currentIdx ? avatarColor(m.name) : notes[m.name]?.trim() ? "#3A6A3A" : "#2A2A38"}`, color: i === currentIdx ? "#0C0C10" : notes[m.name]?.trim() ? "#5ABF5A" : "#555", fontSize: 11, fontWeight: "bold", cursor: "pointer" }}>
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
            <div style={{ fontSize: 14, color: "#888", maxWidth: 380, lineHeight: 1.7 }}>Claude is reviewing your notes and extracting action items by priority.</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#348193", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
            </div>
            <style>{`@keyframes pulse { 0%,100%{opacity:0.2} 50%{opacity:1} }`}</style>
          </div>
        )}

        {/* ══ REVIEW ══ */}
        {step === STEPS.REVIEW && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: "bold", marginBottom: 6 }}>Today's Action Items</div>
              <div style={{ fontSize: 13, color: "#666" }}>{actionItems.length} items extracted from your check-in notes</div>
            </div>

            {actionItems.length === 0 ? (
              <div style={{ background: "#111118", border: "1px solid #2A2A38", borderRadius: 12, padding: "24px", textAlign: "center", color: "#666" }}>No action items found today.</div>
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
                        <div key={i} style={{ background: ps.bg, border: `1px solid ${ps.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 8, display: "flex", gap: 14, alignItems: "flex-start" }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: avatarColor(item.person), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold", color: "#0C0C10", flexShrink: 0 }}>
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

            {syncError && <div style={{ background: "#1A1010", border: "1px solid #6A2020", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#E05050" }}>{syncError}</div>}
            {slackError && <div style={{ background: "#1A1010", border: "1px solid #6A2020", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#E05050" }}>{slackError}</div>}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {sheetUrl && (
                <button onClick={syncToSheets} style={{ flex: 1, minWidth: 180, padding: "13px 20px", background: "linear-gradient(135deg, #348193, #4A9DAD)", border: "none", borderRadius: 10, color: "#0C0C10", fontSize: 14, fontWeight: "bold", cursor: "pointer" }}>
                  Save to Google Sheets →
                </button>
              )}
              {slackWebhook && (
                <button onClick={sendToSlack} disabled={slackSent || slackSending} style={{ flex: 1, minWidth: 180, padding: "13px 20px", background: slackSent ? "#101A10" : "#1A1F2E", border: `1px solid ${slackSent ? "#2A5A2A" : "#3A4A6A"}`, borderRadius: 10, color: slackSent ? "#50A050" : "#8AAEE8", fontSize: 14, fontWeight: "bold", cursor: slackSent ? "default" : "pointer" }}>
                  {slackSent ? "✓ Sent to Slack" : slackSending ? "Sending…" : "Post to Slack →"}
                </button>
              )}
              <button onClick={() => setStep(STEPS.DONE)} style={{ padding: "13px 20px", background: "transparent", border: "1px solid #2A2A38", borderRadius: 10, color: "#888", fontSize: 14, cursor: "pointer" }}>
                {sheetUrl || slackWebhook ? "Skip" : "Finish"}
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
              {actionItems.length} action items extracted.{sheetUrl ? " Saved to Google Sheets." : ""}{slackSent ? " Summary posted to Slack." : ""}
            </div>

            {/* Slack button on done screen too if not yet sent */}
            {slackWebhook && !slackSent && (
              <button onClick={sendToSlack} disabled={slackSending} style={{ padding: "13px 28px", background: "#1A1F2E", border: "1px solid #3A4A6A", borderRadius: 10, color: "#8AAEE8", fontSize: 14, fontWeight: "bold", cursor: "pointer" }}>
                {slackSending ? "Sending…" : "Post Summary to Slack →"}
              </button>
            )}
            {slackSent && <div style={{ fontSize: 13, color: "#50A050" }}>✓ Summary posted to Slack</div>}

            {actionItems.length > 0 && (
              <div style={{ background: "#111118", border: "1px solid #2A2A38", borderRadius: 12, padding: "16px 20px", width: "100%", textAlign: "left" }}>
                <div style={{ fontSize: 11, color: "#348193", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Summary</div>
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

            <button onClick={() => { setStep(STEPS.SETUP); setCurrentIdx(0); setNotes({}); setActionItems([]); setSyncError(""); setSlackSent(false); setSlackError(""); }}
              style={{ padding: "13px 28px", background: "linear-gradient(135deg, #348193, #4A9DAD)", border: "none", borderRadius: 10, color: "#0C0C10", fontSize: 15, fontWeight: "bold", cursor: "pointer" }}>
              Start a New Check-In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
