import { useState, useCallback, useEffect } from "react";

const LS_SHEET = "encore_sheet_url";
const LS_SLACK = "encore_slack_webhook";
const LS_WEEK  = "encore_week_notes";
const LS_DASH  = "encore_dashboard_notes";

const TEAM_MEMBERS = [
  { name: "Alyssa",   role: "Thoughtfulness Coordinator",          slackId: "U09FM3V6ZL3" },
  { name: "Amy",      role: "Accounting & Box Office",             slackId: "U07ESPANECB" },
  { name: "Brittney", role: "Events Coordinator",                  slackId: "U035KT6D12Q" },
  { name: "Erin",     role: "Set Designer",                        slackId: "U02QYJ7R8KV" },
  { name: "Ilia",     role: "Stage Manager",                       slackId: null },
  { name: "Joyce",    role: "Marketing & Personal VA",             slackId: "U09EL02EG64" },
  { name: "Kelby",    role: "Aspire Program Director",             slackId: null },
  { name: "Kristen",  role: "Production Manager",                  slackId: "U07ECCVUMT9" },
  { name: "Nicole",   role: "Tech Director",                       slackId: "U0A68LY89AQ" },
  { name: "Randy",    role: "Director of Education",               slackId: "U08H29010UD" },
  { name: "Rebekah",  role: "Volunteer & Scholarship Coordinator", slackId: "U07FBJLFTU7" },
  { name: "Shannon",  role: "Company Manager",                     slackId: "U08ASFC8LF6" },
];

const DASHBOARD_CATEGORIES = [
  {
    id: "projects",
    label: "Projects",
    icon: "/Projects.png",
    color: "#27616e",
    lightColor: "#1A3D45",
    borderColor: "#5d9aa9",
    items: ["Junior Camps", "Sensory Friendly", "Fall Programming"],
  },
  {
    id: "finance",
    label: "Finance",
    icon: "/Cash.png",
    color: "#348193",
    lightColor: "#1E5060",
    borderColor: "#5d9aa9",
    items: ["Budgets", "Contracts"],
  },
  {
    id: "showprep",
    label: "Show Prep",
    icon: "/Show_prep.png",
    color: "#5d9aa9",
    lightColor: "#3A6A78",
    borderColor: "#85b3be",
    items: ["Team Support", "Opening Night", "Closing Night", "Sensory Friendly"],
  },
  {
    id: "executive",
    label: "Executive",
    icon: "/Executive.png",
    color: "#85b3be",
    lightColor: "#4A7A88",
    borderColor: "#aecdd4",
    items: ["Team Meetings & Communication", "Board Meetings", "Board Communication", "City Relationships", "Fundraising", "Grants", "Systems & Processes", "Growing the Team"],
  },
  {
    id: "aspire",
    label: "Aspire",
    icon: "/Aspire_icon_4x.png",
    color: "#aecdd4",
    lightColor: "#6A9AA8",
    borderColor: "#ffffff",
    items: ["Team", "Families", "Show Planning", "Promotion", "Expansion", "Improvements"],
  },
];

const UPCOMING_EVENTS = `- Bright Lights of Broadway (Aspire Performing Co.) — April 16-18, 2026 at the Electric Theater
- Matilda (Aspire Camp): Auditions Wed April 22 6-8pm, Dance Auditions Thu April 23 4pm, Rehearsals April 23-28 6-8pm, Performance Wed April 29 7pm at Electric Theater. Ages 7-11, $175 camp fee.
- Come From Away (Page to Stage field trip): Workshop Wed April 22 4-6pm at Electric Theater, Performance Sat April 25 2pm matinee at Pioneer Theatre Company SLC + group dinner. Only 17 seats, $115.
- Lion King Summer Camp: Auditions May 14 at Electric Theater, Ages 7-18.`;

const AVATAR_COLORS = [
  "#348193","#7FB5D5","#9B8EC4","#D47F9E","#5BBF9F",
  "#D4A84B","#C47055","#6AAEE8","#8EC4A8","#C49898","#8BBFB0","#B8A86A",
];

const avatarColor = (name) =>
  AVATAR_COLORS[(name.charCodeAt(0) + name.charCodeAt(name.length - 1)) % AVATAR_COLORS.length];

const todayStr = () =>
  new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });
const isoDate = () => new Date().toISOString().split("T")[0];

const STEPS = { SETUP:"setup", CHECKIN:"checkin", MARKETING:"marketing", WEEK:"week", DASHBOARD:"dashboard", PROCESSING:"processing", REVIEW:"review", SYNCING:"syncing", DONE:"done" };

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
  const [step, setStep]                 = useState(STEPS.SETUP);
  const [sheetUrl, setSheetUrl]         = useState(() => localStorage.getItem(LS_SHEET) || "");
  const [slackWebhook, setSlackWebhook] = useState(() => localStorage.getItem(LS_SLACK) || "");
  const [sheetError, setSheetError]     = useState("");
  const [currentIdx, setCurrentIdx]     = useState(0);
  const [notes, setNotes]               = useState({});
  const [marketingNotes, setMarketingNotes] = useState("");
  const [weekNotes, setWeekNotes]       = useState(() => localStorage.getItem(LS_WEEK) || "");
  const [dashNotes, setDashNotes]       = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_DASH) || "{}"); } catch { return {}; }
  });
  const [expandedCats, setExpandedCats] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [actionItems, setActionItems]   = useState([]);
  const [syncError, setSyncError]       = useState("");
  const [slackSent, setSlackSent]       = useState(false);
  const [slackSending, setSlackSending] = useState(false);
  const [slackError, setSlackError]     = useState("");

  const member = TEAM_MEMBERS[currentIdx];

  useEffect(() => { localStorage.setItem(LS_SHEET, sheetUrl); }, [sheetUrl]);
  useEffect(() => { localStorage.setItem(LS_SLACK, slackWebhook); }, [slackWebhook]);
  useEffect(() => { localStorage.setItem(LS_WEEK, weekNotes); }, [weekNotes]);
  useEffect(() => { localStorage.setItem(LS_DASH, JSON.stringify(dashNotes)); }, [dashNotes]);

  // Disable loading — show app immediately
  useEffect(() => { setLoading(false); }, []);

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
      setStep(STEPS.MARKETING);
    }
  }

  function goBack() {
    if (currentIdx > 0) setCurrentIdx(i => i - 1);
  }

  function setDashNote(catId, item, value) {
    const key = `${catId}::${item}`;
    setDashNotes(prev => ({ ...prev, [key]: value }));
  }

  function getDashNote(catId, item) {
    return dashNotes[`${catId}::${item}`] || "";
  }

  function toggleCat(catId) {
    setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));
  }

  function toggleItem(key) {
    setExpandedItems(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function dashNotesCount() {
    return Object.values(dashNotes).filter(v => v && v.trim()).length;
  }

  async function saveNotes() {
    setSaveStatus("saving");
    try {
      await fetch("/.netlify/functions/save-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes, marketingNotes, weekNotes, dashNotes,
          date: new Date().toISOString().split("T")[0],
        }),
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch(e) { setSaveStatus("error"); }
  }

  const extractActionItems = useCallback(async () => {
    const teamNotes = TEAM_MEMBERS
      .filter(m => notes[m.name] && notes[m.name].trim())
      .map(m => `${m.name} (${m.role}): ${notes[m.name]}`)
      .join("\n");

    const dashSummary = DASHBOARD_CATEGORIES.flatMap(cat =>
      cat.items
        .filter(item => getDashNote(cat.id, item).trim())
        .map(item => `${cat.label} - ${item}: ${getDashNote(cat.id, item)}`)
    ).join("\n");

    const allNotes = [
      teamNotes,
      marketingNotes && marketingNotes.trim() ? `MARKETING: ${marketingNotes}` : "",
      weekNotes && weekNotes.trim() ? `WEEK AHEAD: ${weekNotes}` : "",
      dashSummary ? `ORGANIZATIONAL DASHBOARD:\n${dashSummary}` : "",
    ].filter(Boolean).join("\n\n");

    if (!allNotes) { setActionItems([]); setStep(STEPS.REVIEW); return; }

    const prompt = `You are the executive assistant to the Executive Director of Encore Theatre, a performing arts organization in St. George, Utah.

Read the following daily check-in notes and extract clear, detailed, well-written action items. Write each as a complete professional sentence with enough context that anyone reading it understands what needs to happen and why.

UPCOMING EVENTS:
${UPCOMING_EVENTS}

CHECK-IN NOTES:
${allNotes}

Return ONLY a JSON array with no markdown:
[{"person":"Name or dash","role":"Role or empty","task":"Full detailed action item with context","priority":"high|medium|low","category":"team|marketing|week|projects|finance|showprep|executive|aspire"}]

Rules:
- Write complete, well-worded tasks with context from the notes
- Only extract real action items, skip purely informational notes
- high = urgent/this week, medium = important soon, low = when possible
- Match category to the section the note came from
- For team items set person to the team member name; for others use a dash`;

    try {
      const res = await fetch("/.netlify/functions/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const raw = data.content && data.content.find(b => b.type === "text") ? data.content.find(b => b.type === "text").text : "[]";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setActionItems(Array.isArray(parsed) ? parsed : []);
    } catch(e) { setActionItems([]); }
    setStep(STEPS.REVIEW);
  }, [notes, marketingNotes, weekNotes, dashNotes]);

  async function syncToSheets() {
    setStep(STEPS.SYNCING);
    setSyncError("");
    const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) { setSyncError("Couldn't parse spreadsheet ID."); setStep(STEPS.REVIEW); return; }
    const spreadsheetId = match[1];
    const rows = TEAM_MEMBERS.map(m => {
      const items = actionItems.filter(a => a.person === m.name).map(a => `[${(a.priority||"").toUpperCase()}] ${a.task}`).join(" | ");
      return [isoDate(), "Team", m.name, m.role, notes[m.name] || "", items];
    });
    if (marketingNotes) rows.push([isoDate(), "Marketing", "-", "-", marketingNotes, actionItems.filter(a => a.category === "marketing").map(a => a.task).join(" | ")]);
    if (weekNotes) rows.push([isoDate(), "Week Ahead", "-", "-", weekNotes, actionItems.filter(a => a.category === "week").map(a => a.task).join(" | ")]);
    DASHBOARD_CATEGORIES.forEach(cat => {
      cat.items.forEach(item => {
        const note = getDashNote(cat.id, item);
        if (note.trim()) rows.push([isoDate(), cat.label, item, "-", note, actionItems.filter(a => a.category === cat.id && a.task.includes(item)).map(a => a.task).join(" | ")]);
      });
    });

    const prompt = `Append data to Google Sheets ID "${spreadsheetId}". Check for header row in Sheet1; if missing add: Date | Category | Person | Role | Notes | Action Items. Append: ${JSON.stringify(rows)} to range "Sheet1!A:F".`;
    try {
      await fetch("/.netlify/functions/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }], mcp_servers: [{ type: "url", url: "https://gcal.mcp.claude.com/mcp", name: "google" }] }),
      });
      setStep(STEPS.DONE);
    } catch (e) { setSyncError("Sync failed: " + e.message); setStep(STEPS.REVIEW); }
  }

  async function sendToSlack() {
    if (!slackWebhook) { setSlackError("Please add your Slack webhook URL in setup."); return; }
    setSlackSending(true);
    setSlackError("");

    const slackIdMap = {};
    TEAM_MEMBERS.forEach(m => { if (m.slackId) slackIdMap[m.name] = m.slackId; });
    const mentionOrName = (name) => slackIdMap[name] ? `<@${slackIdMap[name]}>` : name;
    const priorityEmoji = { high: "🔴", medium: "🟡", low: "🟢" };

    const categoryGroups = [
      { key: "team", label: "👥 Team" },
      { key: "marketing", label: "📣 Marketing" },
      { key: "week", label: "📅 Week Ahead" },
      { key: "projects", label: "🗂️ Projects" },
      { key: "finance", label: "💰 Finance" },
      { key: "showprep", label: "🎭 Show Prep" },
      { key: "executive", label: "🏛️ Executive" },
      { key: "aspire", label: "⭐ Aspire" },
    ];

    let blocks = [
      { type: "header", text: { type: "plain_text", text: `Encore Daily Check-In — ${todayStr()}` } },
      { type: "section", text: { type: "mrkdwn", text: `${TEAM_MEMBERS.length} team members reviewed · *${actionItems.length} action items* extracted` } },
      { type: "divider" },
    ];

    // ── SECTION 1: RAW NOTES ──
    blocks.push({ type: "section", text: { type: "mrkdwn", text: "*📝 Today's Notes*" } });

    // Team notes
    const teamWithNotes = TEAM_MEMBERS.filter(m => notes[m.name] && notes[m.name].trim());
    if (teamWithNotes.length) {
      blocks.push({ type: "section", text: { type: "mrkdwn", text: "*👥 Team*" } });
      teamWithNotes.forEach(m => {
        const mention = slackIdMap[m.name] ? `<@${slackIdMap[m.name]}>` : m.name;
        blocks.push({ type: "section", text: { type: "mrkdwn", text: `*${mention}* · _${m.role}_\n${notes[m.name]}` } });
      });
    }

    // Marketing notes
    if (marketingNotes && marketingNotes.trim()) {
      blocks.push({ type: "section", text: { type: "mrkdwn", text: `*📣 Marketing*\n${marketingNotes}` } });
    }

    // Week ahead notes
    if (weekNotes && weekNotes.trim()) {
      blocks.push({ type: "section", text: { type: "mrkdwn", text: `*📅 Week Ahead*\n${weekNotes}` } });
    }

    // Dashboard notes
    DASHBOARD_CATEGORIES.forEach(cat => {
      const filledItems = cat.items.filter(item => getDashNote(cat.id, item).trim());
      if (!filledItems.length) return;
      let dashText = `*${cat.label}*\n`;
      filledItems.forEach(item => {
        dashText += `• *${item}:* ${getDashNote(cat.id, item)}\n`;
      });
      blocks.push({ type: "section", text: { type: "mrkdwn", text: dashText.trim() } });
    });

    blocks.push({ type: "divider" });

    // ── SECTION 2: ACTION ITEMS ──
    blocks.push({ type: "section", text: { type: "mrkdwn", text: `*✅ Action Items (${actionItems.length})*` } });

    if (actionItems.length === 0) {
      blocks.push({ type: "section", text: { type: "mrkdwn", text: "_No action items today._" } });
    } else {
      categoryGroups.forEach(({ key, label }) => {
        const catItems = actionItems.filter(a => a.category === key);
        if (!catItems.length) return;
        blocks.push({ type: "section", text: { type: "mrkdwn", text: `*${label}*` } });
        ["high","medium","low"].forEach(p => {
          const items = catItems.filter(a => a.priority === p);
          if (!items.length) return;
          blocks.push({ type: "section", text: { type: "mrkdwn", text: `${priorityEmoji[p]} *${p.charAt(0).toUpperCase() + p.slice(1)} Priority*` } });
          items.forEach(item => {
            const hasPerson = item.person && item.person !== "-" && item.person !== "—";
            const mention = hasPerson ? `\n_${mentionOrName(item.person)} · ${item.role}_` : "";
            blocks.push({ type: "section", text: { type: "mrkdwn", text: `• ${item.task}${mention}` } });
          });
        });
        blocks.push({ type: "divider" });
      });
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
    } catch (e) { setSlackError("Couldn't send to Slack."); }
    setSlackSending(false);
  }

  const priorityStyle = (p) => ({
    high:   { bg: "#2A1515", border: "#8A3030", dot: "#E05050" },
    medium: { bg: "#1E1E10", border: "#6A6020", dot: "#C4A830" },
    low:    { bg: "#101A10", border: "#2A5A2A", dot: "#50A050" },
  }[p] || { bg: "#1A1A1A", border: "#333", dot: "#666" });

  const ALL_CATEGORY_LABELS = {
    team: "Team", marketing: "Marketing", week: "Week Ahead",
    projects: "Projects", finance: "Finance", showprep: "Show Prep",
    executive: "Executive", aspire: "Aspire",
  };

  const inputStyle = { width: "100%", padding: "11px 14px", background: "#0C0C10", border: "1px solid #2A2A38", borderRadius: 8, color: "#EDE8E0", fontSize: 13, fontFamily: "monospace", outline: "none", boxSizing: "border-box" };
  const textareaStyle = { width: "100%", minHeight: 140, background: "#111118", border: "1px solid #2A2A38", borderRadius: 10, padding: "14px 16px", color: "#EDE8E0", fontSize: 14, lineHeight: 1.75, fontFamily: "Palatino,Georgia,serif", resize: "vertical", outline: "none", boxSizing: "border-box" };
  const primaryBtn = { padding: "13px 20px", borderRadius: 10, fontSize: 14, fontWeight: "bold", cursor: "pointer", background: "linear-gradient(135deg,#348193,#4A9DAD)", border: "none", color: "#0C0C10" };
  const ghostBtn   = { padding: "13px 20px", borderRadius: 10, fontSize: 14, fontWeight: "bold", cursor: "pointer", background: "transparent", border: "1px solid #2A2A38", color: "#888" };
  const slackBtn   = { padding: "13px 20px", borderRadius: 10, fontSize: 14, fontWeight: "bold", cursor: "pointer", background: "#1A1F2E", border: "1px solid #3A4A6A", color: "#8AAEE8" };

  return (
    <div style={{ minHeight: "100vh", background: "#0C0C10", color: "#EDE8E0", fontFamily: "'Palatino Linotype','Book Antiqua',Palatino,Georgia,serif", display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <div style={{ padding: "16px 28px", borderBottom: "1px solid #1E1E28", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(180deg,#111118 0%,#0C0C10 100%)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <EncoreLogo />
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#348193", textTransform: "uppercase" }}>Daily Check-In</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#666" }}>{todayStr()}</div>
          {step === STEPS.CHECKIN && <div style={{ fontSize: 10, color: "#348193", marginTop: 4, letterSpacing: 2, textTransform: "uppercase" }}>{currentIdx + 1}/{TEAM_MEMBERS.length} team</div>}
          {step === STEPS.MARKETING && <div style={{ fontSize: 10, color: "#348193", marginTop: 4, letterSpacing: 2, textTransform: "uppercase" }}>📣 Marketing</div>}
          {step === STEPS.WEEK && <div style={{ fontSize: 10, color: "#348193", marginTop: 4, letterSpacing: 2, textTransform: "uppercase" }}>📅 Week Ahead</div>}
          {step === STEPS.DASHBOARD && <div style={{ fontSize: 10, color: "#348193", marginTop: 4, letterSpacing: 2, textTransform: "uppercase" }}>🗂️ Dashboard · {dashNotesCount()} notes</div>}
          {step === STEPS.REVIEW && <div style={{ fontSize: 10, color: "#348193", marginTop: 4, letterSpacing: 2, textTransform: "uppercase" }}>{actionItems.length} action items</div>}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "28px", maxWidth: 680, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>

        {/* ══ LOADING ══ */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 16, textAlign: "center" }}>
            <div style={{ fontSize: 48 }}>✦</div>
            <div style={{ fontSize: 16, color: "#888" }}>Loading your notes…</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#348193", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
            </div>
            <style>{`@keyframes pulse{0%,100%{opacity:0.2}50%{opacity:1}}`}</style>
          </div>
        )}

        {/* ══ SETUP ══ */}
        {!loading && step === STEPS.SETUP && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>Connect your tools</div>
              <div style={{ fontSize: 14, color: "#888", lineHeight: 1.7 }}>Your notes save to Google Sheets and post a summary to Slack after each check-in.</div>
            </div>
            <div style={{ background: "#111118", border: "1px solid #2A2A38", borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontSize: 11, color: "#348193", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Google Sheets</div>
              <input value={sheetUrl} onChange={e => { setSheetUrl(e.target.value); setSheetError(""); }} placeholder="https://docs.google.com/spreadsheets/d/..." style={{ ...inputStyle, border: `1px solid ${sheetError ? "#8A3030" : "#2A2A38"}` }} />
              {sheetError && <div style={{ fontSize: 12, color: "#E05050", marginTop: 6 }}>{sheetError}</div>}
            </div>
            <div style={{ background: "#111118", border: "1px solid #2A2A38", borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontSize: 11, color: "#348193", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Slack <span style={{ color: "#444", fontWeight: "normal", letterSpacing: 0 }}>— optional</span></div>
              <input value={slackWebhook} onChange={e => setSlackWebhook(e.target.value)} placeholder="https://hooks.slack.com/services/..." style={inputStyle} />
            </div>

            {/* Quick access to dashboard */}
            <div style={{ background: "#111118", border: "1px solid #2A2A38", borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: "bold", marginBottom: 2 }}>Encore Dashboard</div>
                <div style={{ fontSize: 12, color: "#666" }}>Projects · Finance · Show Prep · Executive · Aspire</div>
              </div>
              <button onClick={() => setStep(STEPS.DASHBOARD)} style={{ ...ghostBtn, padding: "8px 16px", fontSize: 13 }}>Open →</button>
            </div>

            {/* Saved notes notice */}
            {savedDate && (
              <div style={{ background: "#0D1A1A", border: "1px solid #1E3A3A", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, color: "#5d9aa9" }}>
                  ✦ Notes loaded from {savedDate === new Date().toISOString().split("T")[0] ? "today" : savedDate}
                </div>
                <button onClick={saveNotes} style={{ background: "none", border: "1px solid #2A2A38", borderRadius: 6, color: "#666", fontSize: 12, cursor: "pointer", padding: "4px 10px" }}>
                  {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "✓ Saved" : "Save now"}
                </button>
              </div>
            )}

            <button onClick={handleSetup} style={{ ...primaryBtn, padding: "14px 24px", fontSize: 15 }}>Begin Today's Check-In →</button>
            <div style={{ textAlign: "center" }}>
              <button onClick={() => setStep(STEPS.CHECKIN)} style={{ background: "none", border: "none", color: "#555", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>Skip — check in without saving</button>
            </div>
          </div>
        )}

        {/* ══ TEAM CHECK-IN ══ */}
        {!loading && step === STEPS.CHECKIN && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontSize: 11, color: "#666", letterSpacing: 2, textTransform: "uppercase" }}>Team Check-In</div>
                <div style={{ fontSize: 11, color: "#348193" }}>{currentIdx + 1} of {TEAM_MEMBERS.length}</div>
              </div>
              <div style={{ height: 3, background: "#1E1E28", borderRadius: 2 }}>
                <div style={{ height: "100%", borderRadius: 2, width: `${(currentIdx / TEAM_MEMBERS.length) * 100}%`, background: "linear-gradient(90deg,#348193,#5BB0BF)", transition: "width 0.3s ease" }} />
              </div>
            </div>
            <div style={{ background: "#111118", border: "1px solid #2A2A38", borderRadius: 14, padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: avatarColor(member.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: "bold", color: "#0C0C10" }}>{member.name[0]}</div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: "bold" }}>{member.name}</div>
                  <div style={{ fontSize: 13, color: "#348193" }}>{member.role}</div>
                  {member.slackId && <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>● on Slack</div>}
                </div>
              </div>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>Check-in notes</div>
              <textarea autoFocus value={notes[member.name] || ""} onChange={e => setNotes(prev => ({ ...prev, [member.name]: e.target.value }))}
                placeholder={`What's on your mind for ${member.name}? Updates, follow-ups, concerns, wins…`}
                style={textareaStyle} />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {currentIdx > 0 && <button onClick={goBack} style={ghostBtn}>← Back</button>}
              <button onClick={saveAndAdvance} style={{ flex: 1, ...primaryBtn, fontSize: 15 }}>
                {currentIdx < TEAM_MEMBERS.length - 1 ? `Next: ${TEAM_MEMBERS[currentIdx + 1].name} →` : "Continue to Marketing →"}
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {TEAM_MEMBERS.map((m, i) => (
                <button key={m.name} onClick={() => setCurrentIdx(i)} title={m.name} style={{ width: 32, height: 32, borderRadius: "50%", background: i === currentIdx ? avatarColor(m.name) : notes[m.name] && notes[m.name].trim() ? "#1A2A1A" : "#111118", border: `1.5px solid ${i === currentIdx ? avatarColor(m.name) : notes[m.name] && notes[m.name].trim() ? "#3A6A3A" : "#2A2A38"}`, color: i === currentIdx ? "#0C0C10" : notes[m.name] && notes[m.name].trim() ? "#5ABF5A" : "#555", fontSize: 11, fontWeight: "bold", cursor: "pointer" }}>
                  {m.name[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══ MARKETING ══ */}
        {!loading && step === STEPS.MARKETING && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: "#348193", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>📣 Marketing Check-In</div>
              <div style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>What needs promoting today?</div>
              <div style={{ fontSize: 14, color: "#888", lineHeight: 1.7 }}>Think Instagram, Facebook, email, and ticketing for all upcoming shows, events, and auditions.</div>
            </div>
            <div style={{ background: "#111118", border: "1px solid #2A2A38", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Upcoming to consider</div>
              {["🎭 Bright Lights of Broadway — April 16-18","📚 Matilda Auditions — April 22 & 23","✈️ Come From Away Page to Stage — April 22 & 25 (17 seats left!)","🦁 Lion King Auditions — May 14"].map((e,i) => (
                <div key={i} style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>{e}</div>
              ))}
            </div>
            <textarea value={marketingNotes} onChange={e => setMarketingNotes(e.target.value)}
              placeholder="Any performances, events, or auditions that need promoting? What platforms, what messaging, what's the priority today?"
              style={textareaStyle} />
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep(STEPS.CHECKIN)} style={ghostBtn}>← Back</button>
              <button onClick={() => setStep(STEPS.WEEK)} style={{ flex: 1, ...primaryBtn, fontSize: 15 }}>Continue to Week Ahead →</button>
            </div>
          </div>
        )}

        {/* ══ WEEK AHEAD ══ */}
        {!loading && step === STEPS.WEEK && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: "#348193", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>📅 Week Ahead</div>
              <div style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>What's on your mind this week?</div>
              <div style={{ fontSize: 14, color: "#888", lineHeight: 1.7 }}>Scheduled and unscheduled — things to prepare for, decisions to make, people to think about.</div>
            </div>
            <textarea value={weekNotes} onChange={e => setWeekNotes(e.target.value)}
              placeholder="What's coming up this week? What do you want to prepare for, follow up on, or keep top of mind?"
              style={{ ...textareaStyle, minHeight: 180 }} />
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep(STEPS.MARKETING)} style={ghostBtn}>← Back</button>
              <button onClick={() => setStep(STEPS.DASHBOARD)} style={{ flex: 1, ...primaryBtn, fontSize: 15 }}>Continue to Dashboard →</button>
            </div>
          </div>
        )}

        {/* ══ DASHBOARD ══ */}
        {!loading && step === STEPS.DASHBOARD && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: "#348193", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>🗂️ Encore Dashboard</div>
              <div style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>What's on your mind today?</div>
              <div style={{ fontSize: 14, color: "#888", lineHeight: 1.7 }}>Tap any category to expand it. Add notes to the areas that need attention — leave the rest blank.</div>
            </div>

            {DASHBOARD_CATEGORIES.map(cat => {
              const isExpanded = expandedCats[cat.id];
              const filledCount = cat.items.filter(item => getDashNote(cat.id, item).trim()).length;
              return (
                <div key={cat.id} style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${cat.borderColor}40` }}>
                  {/* Category Header */}
                  <button onClick={() => toggleCat(cat.id)} style={{
                    width: "100%", padding: "16px 20px",
                    background: `linear-gradient(135deg, ${cat.color}88, ${cat.lightColor}CC)`,
                    border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    textAlign: "left",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img src={cat.icon} alt={cat.label} style={{ width: 28, height: 28, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.9 }} />
                      <span style={{ fontSize: 16, fontWeight: "bold", color: "#F0EDE8", fontFamily: "Palatino,Georgia,serif" }}>{cat.label}</span>
                      {filledCount > 0 && (
                        <span style={{ background: cat.borderColor, color: "#0C0C10", fontSize: 11, fontWeight: "bold", padding: "2px 8px", borderRadius: 20, fontFamily: "sans-serif" }}>
                          {filledCount} note{filledCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <span style={{ color: "#EDE8E0", fontSize: 18, opacity: 0.7 }}>{isExpanded ? "▲" : "▼"}</span>
                  </button>

                  {/* Category Items */}
                  {isExpanded && (
                    <div style={{ background: "#0E0E16", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                      {cat.items.map(item => {
                        const key = `${cat.id}::${item}`;
                        const isOpen = expandedItems[key];
                        const note = getDashNote(cat.id, item);
                        const hasNote = note.trim().length > 0;
                        return (
                          <div key={item} style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${hasNote ? cat.borderColor + "60" : "#2A2A38"}` }}>
                            <button onClick={() => toggleItem(key)} style={{
                              width: "100%", padding: "11px 16px",
                              background: hasNote ? `${cat.color}22` : "#111118",
                              border: "none", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              textAlign: "left",
                            }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: hasNote ? cat.borderColor : "#333", flexShrink: 0 }} />
                                <span style={{ fontSize: 14, color: hasNote ? "#EDE8E0" : "#888", fontFamily: "Palatino,Georgia,serif" }}>{item}</span>
                              </div>
                              <span style={{ color: "#555", fontSize: 14 }}>{isOpen ? "▲" : "+"}</span>
                            </button>
                            {isOpen && (
                              <div style={{ padding: "0 16px 12px", background: hasNote ? `${cat.color}11` : "#0C0C10" }}>
                                <textarea
                                  autoFocus
                                  value={note}
                                  onChange={e => setDashNote(cat.id, item, e.target.value)}
                                  placeholder={`What's on your mind about ${item}?`}
                                  style={{ width: "100%", minHeight: 90, background: "transparent", border: "none", borderTop: `1px solid ${cat.borderColor}30`, padding: "12px 0 0", color: "#EDE8E0", fontSize: 14, lineHeight: 1.7, fontFamily: "Palatino,Georgia,serif", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              {step === STEPS.DASHBOARD && (
                <button onClick={() => setStep(STEPS.WEEK)} style={ghostBtn}>← Back</button>
              )}
              <button onClick={() => { saveNotes(); setStep(STEPS.PROCESSING); extractActionItems(); }} style={{ flex: 1, ...primaryBtn, fontSize: 15 }}>
                Finish & Extract Action Items →
              </button>
            </div>

            {/* Also let them access dashboard standalone without extracting */}
            <div style={{ textAlign: "center" }}>
              <button onClick={() => setStep(STEPS.SETUP)} style={{ background: "none", border: "none", color: "#555", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
                Save notes & return to home
              </button>
            </div>
          </div>
        )}

        {/* ══ PROCESSING ══ */}
        {!loading && step === STEPS.PROCESSING && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 20, textAlign: "center" }}>
            <div style={{ fontSize: 48 }}>✦</div>
            <div style={{ fontSize: 20, fontWeight: "bold" }}>Reading your notes…</div>
            <div style={{ fontSize: 14, color: "#888", maxWidth: 380, lineHeight: 1.7 }}>Claude is reviewing everything and extracting detailed action items by priority.</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#348193", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
            </div>
            <style>{`@keyframes pulse{0%,100%{opacity:0.2}50%{opacity:1}}`}</style>
          </div>
        )}

        {/* ══ REVIEW ══ */}
        {!loading && step === STEPS.REVIEW && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: "bold", marginBottom: 6 }}>Today's Action Items</div>
              <div style={{ fontSize: 13, color: "#666" }}>{actionItems.length} items extracted from your check-in notes</div>
            </div>
            {actionItems.length === 0 ? (
              <div style={{ background: "#111118", border: "1px solid #2A2A38", borderRadius: 12, padding: "24px", textAlign: "center", color: "#666" }}>No action items found today.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {Object.entries(ALL_CATEGORY_LABELS).map(([cat, label]) => {
                  const catItems = actionItems.filter(a => a.category === cat);
                  if (!catItems.length) return null;
                  return (
                    <div key={cat}>
                      <div style={{ fontSize: 11, color: "#348193", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
                      {["high","medium","low"].map(priority => {
                        const items = catItems.filter(a => a.priority === priority);
                        if (!items.length) return null;
                        const ps = priorityStyle(priority);
                        return (
                          <div key={priority} style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 10, color: ps.dot, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 6, height: 6, borderRadius: "50%", background: ps.dot }} />{priority} priority
                            </div>
                            {items.map((item, i) => {
                              const hasPerson = item.person && item.person !== "-" && item.person !== "—";
                              return (
                                <div key={i} style={{ background: ps.bg, border: `1px solid ${ps.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 8, display: "flex", gap: 14, alignItems: "flex-start" }}>
                                  {hasPerson && (
                                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: avatarColor(item.person), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold", color: "#0C0C10", flexShrink: 0 }}>
                                      {item.person[0]}
                                    </div>
                                  )}
                                  <div>
                                    <div style={{ fontSize: 14, color: "#EDE8E0", lineHeight: 1.6 }}>{item.task}</div>
                                    {hasPerson && <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{item.person} · {item.role}</div>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
            {syncError && <div style={{ background: "#1A1010", border: "1px solid #6A2020", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#E05050" }}>{syncError}</div>}
            {slackError && <div style={{ background: "#1A1010", border: "1px solid #6A2020", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#E05050" }}>{slackError}</div>}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {sheetUrl && <button onClick={syncToSheets} style={{ flex: 1, minWidth: 180, ...primaryBtn }}>Save to Google Sheets →</button>}
              {slackWebhook && (
                <button onClick={sendToSlack} disabled={slackSent || slackSending}
                  style={{ flex: 1, minWidth: 180, ...(slackSent ? { ...slackBtn, background: "#101A10", border: "1px solid #2A5A2A", color: "#50A050" } : slackBtn) }}>
                  {slackSent ? "✓ Sent to Slack" : slackSending ? "Sending…" : "Post to Slack →"}
                </button>
              )}
              <button onClick={() => setStep(STEPS.DONE)} style={ghostBtn}>{sheetUrl || slackWebhook ? "Skip" : "Finish"}</button>
            </div>
          </div>
        )}

        {/* ══ SYNCING ══ */}
        {!loading && step === STEPS.SYNCING && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 20, textAlign: "center" }}>
            <div style={{ fontSize: 48 }}>📊</div>
            <div style={{ fontSize: 20, fontWeight: "bold" }}>Saving to Google Sheets…</div>
            <div style={{ fontSize: 14, color: "#888" }}>Writing today's notes and action items to your spreadsheet.</div>
          </div>
        )}

        {/* ══ DONE ══ */}
        {!loading && step === STEPS.DONE && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 20, textAlign: "center" }}>
            <div style={{ fontSize: 56 }}>✦</div>
            <div style={{ fontSize: 24, fontWeight: "bold" }}>Check-in complete</div>
            <div style={{ fontSize: 14, color: "#888", maxWidth: 380, lineHeight: 1.8 }}>
              {actionItems.length} action items extracted.{sheetUrl ? " Saved to Google Sheets." : ""}{slackSent ? " Summary posted to Slack." : ""}
            </div>
            {slackWebhook && !slackSent && (
              <button onClick={sendToSlack} disabled={slackSending} style={slackBtn}>
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
            <button onClick={() => { 
              setStep(STEPS.SETUP); setCurrentIdx(0); setNotes({}); setMarketingNotes(""); 
              setWeekNotes(""); setDashNotes({}); setActionItems([]); 
              setSyncError(""); setSlackSent(false); setSlackError("");
              setSavedDate(""); setSaveStatus("");
              localStorage.removeItem(LS_WEEK);
              localStorage.removeItem(LS_DASH);
            }}
              style={{ ...primaryBtn, padding: "13px 28px", fontSize: 15 }}>
              Start a New Check-In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
