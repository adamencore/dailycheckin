import { useState, useCallback, useEffect } from "react";

const LS_SHEET = "encore_sheet_url";
const LS_SLACK = "encore_slack_webhook";

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
  { id: "projects",  label: "Projects",  icon: "/Projects.png",       color: "#27616e", lightColor: "#1A3D45", borderColor: "#5d9aa9", items: ["Junior Camps", "Sensory Friendly", "Fall Programming"] },
  { id: "finance",   label: "Finance",   icon: "/Cash.png",           color: "#348193", lightColor: "#1E5060", borderColor: "#5d9aa9", items: ["Budgets", "Contracts"] },
  { id: "showprep",  label: "Show Prep", icon: "/Show prep.png",      color: "#5d9aa9", lightColor: "#3A6A78", borderColor: "#85b3be", items: ["Team Support", "Opening Night", "Closing Night", "Sensory Friendly"] },
  { id: "executive", label: "Executive", icon: "/Executive.png",      color: "#85b3be", lightColor: "#4A7A88", borderColor: "#aecdd4", items: ["Team Meetings & Communication", "Board Meetings", "Board Communication", "City Relationships", "Fundraising", "Grants", "Systems & Processes", "Growing the Team"] },
  { id: "aspire",    label: "Aspire",    icon: "/Aspire icon@4x.png", color: "#aecdd4", lightColor: "#6A9AA8", borderColor: "#ffffff", items: ["Team", "Families", "Show Planning", "Promotion", "Expansion", "Improvements"] },
];

const UPCOMING_EVENTS = `- Bright Lights of Broadway (Aspire Performing Co.) — April 16-18, 2026 at the Electric Theater
- Matilda (Aspire Camp): Auditions Wed April 22 6-8pm, Dance Auditions Thu April 23 4pm, Rehearsals April 23-28 6-8pm, Performance Wed April 29 7pm at Electric Theater. Ages 7-11, $175 camp fee.
- Come From Away (Page to Stage field trip): Workshop Wed April 22 4-6pm at Electric Theater, Performance Sat April 25 2pm matinee at Pioneer Theatre Company SLC + group dinner. Only 17 seats, $115.
- Lion King Summer Camp: Auditions May 14 at Electric Theater, Ages 7-18.`;

const AVATAR_COLORS = ["#348193","#7FB5D5","#9B8EC4","#D47F9E","#5BBF9F","#D4A84B","#C47055","#6AAEE8","#8EC4A8","#C49898","#8BBFB0","#B8A86A"];
const avatarColor = (name) => AVATAR_COLORS[(name.charCodeAt(0) + name.charCodeAt(name.length - 1)) % AVATAR_COLORS.length];
const todayStr = () => new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });
const isoDate = () => new Date().toISOString().split("T")[0];

const STEPS = { SETUP:"setup", CHECKIN:"checkin", MARKETING:"marketing", WEEK:"week", DASHBOARD:"dashboard", PROCESSING:"processing", REVIEW:"review", SYNCING:"syncing", DONE:"done", TASKS:"tasks" };

// Carry-forward window: how far back unfinished tasks remain on the open list before being archived from the in-app view.
const OPEN_TASK_WINDOW_DAYS = 30;
const newTaskId = (date, idx) => `${date}-${idx}-${Math.random().toString(36).slice(2,7)}`;

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
  const [weekNotes, setWeekNotes]       = useState("");
  const [dashNotes, setDashNotes]       = useState({});
  const [expandedCats, setExpandedCats] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [actionItems, setActionItems]   = useState([]);
  const [summary, setSummary]           = useState("");
  const [themed, setThemed]             = useState({}); // { team, marketing, week, dashboard }
  const [openTasks, setOpenTasks]       = useState([]); // cross-day list of generated tasks (each with subtasks)
  const [expandedActions, setExpandedActions] = useState({}); // taskId -> bool
  const [taskFilter, setTaskFilter]     = useState("open"); // open | done | all
  const [syncError, setSyncError]       = useState("");
  const [slackSent, setSlackSent]       = useState(false);
  const [slackSending, setSlackSending] = useState(false);
  const [slackError, setSlackError]     = useState("");

  const member = TEAM_MEMBERS[currentIdx];

  useEffect(() => { localStorage.setItem(LS_SHEET, sheetUrl); }, [sheetUrl]);
  useEffect(() => { localStorage.setItem(LS_SLACK, slackWebhook); }, [slackWebhook]);

  // Load saved notes + tasks from server on startup
  useEffect(() => {
    fetch("/.netlify/functions/load-notes")
      .then(r => r.json())
      .then(({ ok, data }) => {
        if (ok && data) {
          if (data.notes) setNotes(data.notes);
          if (data.marketingNotes) setMarketingNotes(data.marketingNotes);
          if (data.weekNotes) setWeekNotes(data.weekNotes);
          if (data.dashNotes) setDashNotes(data.dashNotes);
          if (Array.isArray(data.openTasks)) setOpenTasks(data.openTasks);
          if (data.lastSummary) setSummary(data.lastSummary);
          if (data.lastThemed) setThemed(data.lastThemed);
        }
      })
      .catch(() => {});
  }, []);

  async function saveNotes(n, mn, wn, dn, extra = {}) {
    try {
      await fetch("/.netlify/functions/save-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: n,
          marketingNotes: mn,
          weekNotes: wn,
          dashNotes: dn,
          date: new Date().toISOString().split("T")[0],
          ...extra,
        }),
      });
    } catch(e) {}
  }

  async function persistTasks(nextOpenTasks, nextSummary, nextThemed) {
    setOpenTasks(nextOpenTasks);
    if (nextSummary !== undefined) setSummary(nextSummary);
    if (nextThemed !== undefined) setThemed(nextThemed);
    try {
      await fetch("/.netlify/functions/save-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openTasks: nextOpenTasks,
          ...(nextSummary !== undefined ? { lastSummary: nextSummary } : {}),
          ...(nextThemed  !== undefined ? { lastThemed:  nextThemed  } : {}),
        }),
      });
    } catch(e) {}
  }

  // Toggle a top-level action item or one of its subtasks done.
  function toggleTaskDone(taskId) {
    const next = openTasks.map(t => {
      if (t.id !== taskId) return t;
      const done = !t.done;
      return { ...t, done, completedAt: done ? new Date().toISOString() : null };
    });
    persistTasks(next);
  }
  function toggleSubtaskDone(taskId, subId) {
    const next = openTasks.map(t => {
      if (t.id !== taskId) return t;
      const subs = (t.subtasks || []).map(s => {
        if (s.id !== subId) return s;
        const done = !s.done;
        return { ...s, done, completedAt: done ? new Date().toISOString() : null };
      });
      // Auto-mark parent done when all subtasks done; un-mark when any go undone.
      const allDone = subs.length > 0 && subs.every(s => s.done);
      return { ...t, subtasks: subs, done: allDone, completedAt: allDone ? new Date().toISOString() : null };
    });
    persistTasks(next);
  }
  function toggleExpandedAction(id) { setExpandedActions(prev => ({ ...prev, [id]: !prev[id] })); }

  function handleSetup() {
    if (!sheetUrl.includes("docs.google.com/spreadsheets")) { setSheetError("Please paste a valid Google Sheets URL."); return; }
    setSheetError("");
    setStep(STEPS.CHECKIN);
  }

  function saveAndAdvance() {
    if (currentIdx < TEAM_MEMBERS.length - 1) { setCurrentIdx(i => i + 1); }
    else { setStep(STEPS.MARKETING); }
    saveNotes(notes, marketingNotes, weekNotes, dashNotes);
  }

  function getDashNote(catId, item) { return dashNotes[catId + "::" + item] || ""; }
  function setDashNote(catId, item, value) { setDashNotes(prev => ({ ...prev, [catId + "::" + item]: value })); }
  function toggleCat(catId) { setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] })); }
  function toggleItem(key) { setExpandedItems(prev => ({ ...prev, [key]: !prev[key] })); }
  function dashNotesCount() { return Object.values(dashNotes).filter(v => v && v.trim()).length; }

  const extractActionItems = useCallback(async () => {
    const teamNotes = TEAM_MEMBERS.filter(m => notes[m.name] && notes[m.name].trim()).map(m => m.name + " (" + m.role + "): " + notes[m.name]).join("\n");
    const dashSummary = DASHBOARD_CATEGORIES.flatMap(cat => cat.items.filter(item => getDashNote(cat.id, item).trim()).map(item => cat.label + " - " + item + ": " + getDashNote(cat.id, item))).join("\n");
    const allNotes = [teamNotes, marketingNotes && marketingNotes.trim() ? "MARKETING: " + marketingNotes : "", weekNotes && weekNotes.trim() ? "WEEK AHEAD: " + weekNotes : "", dashSummary ? "DASHBOARD:\n" + dashSummary : ""].filter(Boolean).join("\n\n");
    if (!allNotes) { setActionItems([]); setSummary(""); setThemed({}); setStep(STEPS.REVIEW); return; }

    const prompt = "You are the executive assistant to the Executive Director of Encore Theatre in St. George, Utah.\n\nRead these daily check-in notes and produce three things:\n\n1. A 3-5 sentence executive summary capturing the most important things from today's check-in.\n2. A themed breakdown — one short paragraph (2-4 sentences) for each area that has notes: team, marketing, week, dashboard.\n3. Clear action items, each broken into 2-4 small concrete subtasks. Subtasks should be the actual steps a person would take (\"Draft email to Randy\", \"Send for review\", \"Follow up Friday\"), not vague restatements of the parent task.\n\nUPCOMING EVENTS:\n" + UPCOMING_EVENTS + "\n\nCHECK-IN NOTES:\n" + allNotes + "\n\nReturn ONLY a single JSON object with no markdown, exactly this shape:\n{\n  \"summary\": \"3-5 sentence executive summary\",\n  \"themed\": {\n    \"team\": \"paragraph or empty string\",\n    \"marketing\": \"paragraph or empty string\",\n    \"week\": \"paragraph or empty string\",\n    \"dashboard\": \"paragraph or empty string\"\n  },\n  \"actionItems\": [\n    {\n      \"person\": \"Name or dash\",\n      \"role\": \"Role or empty\",\n      \"task\": \"Full detailed action item with context\",\n      \"priority\": \"high|medium|low\",\n      \"category\": \"team|marketing|week|projects|finance|showprep|executive|aspire\",\n      \"subtasks\": [\"first concrete step\", \"second concrete step\", \"third concrete step\"]\n    }\n  ]\n}\n\nRules:\n- Only extract real action items. Skip filler.\n- Each action item MUST have 2-4 subtasks. Each subtask is a single concrete next step.\n- high = urgent/this week, medium = important soon, low = when possible\n- For team items set person to the team member name; for others use a dash";

    try {
      const res = await fetch("/.netlify/functions/claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4000, messages: [{ role: "user", content: prompt }] }) });
      const data = await res.json();
      const raw = data.content && data.content.find(b => b.type === "text") ? data.content.find(b => b.type === "text").text : "{}";
      let parsed;
      try { parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()); }
      catch(_) { parsed = {}; }

      const items = Array.isArray(parsed.actionItems) ? parsed.actionItems : (Array.isArray(parsed) ? parsed : []);
      const sm = typeof parsed.summary === "string" ? parsed.summary : "";
      const th = parsed.themed && typeof parsed.themed === "object" ? parsed.themed : {};
      const today = isoDate();

      // Hydrate each item with stable IDs and a date so we can persist + track completion.
      const hydrated = items.map((a, i) => {
        const id = newTaskId(today, i);
        const subs = (Array.isArray(a.subtasks) ? a.subtasks : []).slice(0, 4).map((s, j) => ({
          id: id + "-s" + j,
          title: typeof s === "string" ? s : (s && s.title) || "",
          done: false,
          completedAt: null,
        })).filter(s => s.title);
        return {
          id,
          date: today,
          person: a.person || "-",
          role: a.role || "",
          task: a.task || "",
          priority: a.priority || "medium",
          category: a.category || "executive",
          subtasks: subs,
          done: false,
          completedAt: null,
        };
      });

      setActionItems(hydrated);
      setSummary(sm);
      setThemed(th);

      // Merge into openTasks (cross-day list). Drop tasks older than the window
      // unless they're still incomplete — those carry forward.
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - OPEN_TASK_WINDOW_DAYS);
      const cutoffIso = cutoff.toISOString().split("T")[0];
      const kept = openTasks.filter(t => !t.done || (t.date && t.date >= cutoffIso));
      const merged = [...kept, ...hydrated];
      persistTasks(merged, sm, th);
    } catch(e) {
      setActionItems([]);
    }
    setStep(STEPS.REVIEW);
  }, [notes, marketingNotes, weekNotes, dashNotes, openTasks]);

  async function syncToSheets() {
    setStep(STEPS.SYNCING);
    setSyncError("");
    const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) { setSyncError("Couldn't parse spreadsheet ID."); setStep(STEPS.REVIEW); return; }
    const rows = TEAM_MEMBERS.map(m => [isoDate(), "Team", m.name, m.role, notes[m.name] || "", actionItems.filter(a => a.person === m.name).map(a => "[" + (a.priority||"").toUpperCase() + "] " + a.task).join(" | ")]);
    if (marketingNotes) rows.push([isoDate(), "Marketing", "-", "-", marketingNotes, actionItems.filter(a => a.category === "marketing").map(a => a.task).join(" | ")]);
    if (weekNotes) rows.push([isoDate(), "Week Ahead", "-", "-", weekNotes, actionItems.filter(a => a.category === "week").map(a => a.task).join(" | ")]);

    // Build a Tasks-tab payload: one row per subtask (or per parent if it has none),
    // so Adam can track granular progress in Sheets the same way as in-app.
    const taskRows = [];
    actionItems.forEach(a => {
      if (a.subtasks && a.subtasks.length) {
        a.subtasks.forEach(s => {
          taskRows.push([
            isoDate(), a.category || "", (a.priority || "").toUpperCase(),
            a.person || "-", a.role || "", a.task || "", s.title || "",
            s.done ? "DONE" : "OPEN", a.id,
          ]);
        });
      } else {
        taskRows.push([
          isoDate(), a.category || "", (a.priority || "").toUpperCase(),
          a.person || "-", a.role || "", a.task || "", "",
          a.done ? "DONE" : "OPEN", a.id,
        ]);
      }
    });

    const summaryRow = summary
      ? [[isoDate(), "Summary", "-", "-", summary, ""]]
      : [];

    try {
      const prompt =
        "Append to Google Sheets ID \"" + match[1] + "\".\n\n" +
        "1) Sheet1 — add header if missing: Date|Category|Person|Role|Notes|Action Items. Then append these rows to Sheet1!A:F: " +
        JSON.stringify([...summaryRow, ...rows]) + "\n\n" +
        "2) Tasks tab (create it if it doesn't exist) — add header if missing: Date|Category|Priority|Person|Role|Parent Action|Subtask|Status|TaskID. Then append these rows to Tasks!A:I: " +
        JSON.stringify(taskRows);
      await fetch("/.netlify/functions/claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, messages: [{ role: "user", content: prompt }], mcp_servers: [{ type: "url", url: "https://gcal.mcp.claude.com/mcp", name: "google" }] }) });
      setStep(STEPS.DONE);
    } catch (e) { setSyncError("Sync failed: " + e.message); setStep(STEPS.REVIEW); }
  }

  async function sendToSlack() {
    if (!slackWebhook) { setSlackError("Please add your Slack webhook URL in setup."); return; }
    setSlackSending(true); setSlackError("");
    const slackIdMap = {}; TEAM_MEMBERS.forEach(m => { if (m.slackId) slackIdMap[m.name] = m.slackId; });
    const mentionOrName = (name) => slackIdMap[name] ? "<@" + slackIdMap[name] + ">" : name;
    const pEmoji = { high: "🔴", medium: "🟡", low: "🟢" };
    const catLabels = [{ key: "team", label: "👥 Team" }, { key: "marketing", label: "📣 Marketing" }, { key: "week", label: "📅 Week Ahead" }, { key: "projects", label: "Projects" }, { key: "finance", label: "Finance" }, { key: "showprep", label: "🎭 Show Prep" }, { key: "executive", label: "Executive" }, { key: "aspire", label: "⭐ Aspire" }];

    const subtaskCount = actionItems.reduce((n, a) => n + ((a.subtasks && a.subtasks.length) || 0), 0);
    let blocks = [
      { type: "header", text: { type: "plain_text", text: "Encore Daily Check-In — " + todayStr() } },
      { type: "section", text: { type: "mrkdwn", text: TEAM_MEMBERS.length + " team members reviewed · *" + actionItems.length + " action items* · *" + subtaskCount + " subtasks*" } },
    ];

    if (summary && summary.trim()) {
      blocks.push({ type: "divider" });
      blocks.push({ type: "section", text: { type: "mrkdwn", text: "*🧭 Today's Summary*\n" + summary } });
    }

    const themedLabels = [
      ["team", "👥 Team"],
      ["marketing", "📣 Marketing"],
      ["week", "📅 Week Ahead"],
      ["dashboard", "🗂️ Dashboard"],
    ];
    const themedHasContent = themedLabels.some(([k]) => themed[k] && themed[k].trim());
    if (themedHasContent) {
      blocks.push({ type: "divider" });
      blocks.push({ type: "section", text: { type: "mrkdwn", text: "*🧩 By Area*" } });
      themedLabels.forEach(([k, label]) => {
        if (themed[k] && themed[k].trim()) {
          blocks.push({ type: "section", text: { type: "mrkdwn", text: "*" + label + "*\n" + themed[k] } });
        }
      });
    }

    blocks.push({ type: "divider" });
    blocks.push({ type: "section", text: { type: "mrkdwn", text: "*📝 Today's Notes*" } });

    const teamWithNotes = TEAM_MEMBERS.filter(m => notes[m.name] && notes[m.name].trim());
    if (teamWithNotes.length) {
      blocks.push({ type: "section", text: { type: "mrkdwn", text: "*👥 Team*" } });
      teamWithNotes.forEach(m => blocks.push({ type: "section", text: { type: "mrkdwn", text: "*" + mentionOrName(m.name) + "* · _" + m.role + "_\n" + notes[m.name] } }));
    }
    if (marketingNotes && marketingNotes.trim()) blocks.push({ type: "section", text: { type: "mrkdwn", text: "*📣 Marketing*\n" + marketingNotes } });
    if (weekNotes && weekNotes.trim()) blocks.push({ type: "section", text: { type: "mrkdwn", text: "*📅 Week Ahead*\n" + weekNotes } });
    DASHBOARD_CATEGORIES.forEach(cat => {
      const filled = cat.items.filter(item => getDashNote(cat.id, item).trim());
      if (!filled.length) return;
      blocks.push({ type: "section", text: { type: "mrkdwn", text: "*" + cat.label + "*\n" + filled.map(item => "• *" + item + ":* " + getDashNote(cat.id, item)).join("\n") } });
    });
    blocks.push({ type: "divider" });
    blocks.push({ type: "section", text: { type: "mrkdwn", text: "*✅ Action Items (" + actionItems.length + ")*" } });
    if (actionItems.length === 0) { blocks.push({ type: "section", text: { type: "mrkdwn", text: "_No action items today._" } }); }
    else {
      catLabels.forEach(({ key, label }) => {
        const items = actionItems.filter(a => a.category === key);
        if (!items.length) return;
        blocks.push({ type: "section", text: { type: "mrkdwn", text: "*" + label + "*" } });
        ["high","medium","low"].forEach(p => {
          const pi = items.filter(a => a.priority === p);
          if (!pi.length) return;
          blocks.push({ type: "section", text: { type: "mrkdwn", text: pEmoji[p] + " *" + p.charAt(0).toUpperCase() + p.slice(1) + " Priority*" } });
          pi.forEach(item => {
            const hp = item.person && item.person !== "-" && item.person !== "—";
            const subs = (item.subtasks || []).map(s => "    ◦ " + (s.done ? "~" + s.title + "~" : s.title)).join("\n");
            const body = "• " + item.task
              + (hp ? "\n_" + mentionOrName(item.person) + " · " + item.role + "_" : "")
              + (subs ? "\n" + subs : "");
            blocks.push({ type: "section", text: { type: "mrkdwn", text: body } });
          });
        });
        blocks.push({ type: "divider" });
      });
    }

    try {
      const res = await fetch("/.netlify/functions/slack", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ webhookUrl: slackWebhook, payload: { blocks } }) });
      const data = await res.json();
      if (data.ok) { setSlackSent(true); } else { setSlackError("Slack rejected the message."); }
    } catch (e) { setSlackError("Couldn't send to Slack."); }
    setSlackSending(false);
  }

  const ps = (p) => ({ high: { bg: "#2A1515", border: "#8A3030", dot: "#E05050" }, medium: { bg: "#1E1E10", border: "#6A6020", dot: "#C4A830" }, low: { bg: "#101A10", border: "#2A5A2A", dot: "#50A050" } }[p] || { bg: "#1A1A1A", border: "#333", dot: "#666" });
  const catLabels = { team: "Team", marketing: "Marketing", week: "Week Ahead", projects: "Projects", finance: "Finance", showprep: "Show Prep", executive: "Executive", aspire: "Aspire" };

  const P = { padding: "13px 20px", borderRadius: 10, fontSize: 14, fontWeight: "bold", cursor: "pointer", background: "linear-gradient(135deg,#348193,#4A9DAD)", border: "none", color: "#0C0C10" };
  const G = { padding: "13px 20px", borderRadius: 10, fontSize: 14, fontWeight: "bold", cursor: "pointer", background: "transparent", border: "1px solid #2A2A38", color: "#888" };
  const S = { padding: "13px 20px", borderRadius: 10, fontSize: 14, fontWeight: "bold", cursor: "pointer", background: "#1A1F2E", border: "1px solid #3A4A6A", color: "#8AAEE8" };
  const TA = { width: "100%", minHeight: 140, background: "#111118", border: "1px solid #2A2A38", borderRadius: 10, padding: "14px 16px", color: "#EDE8E0", fontSize: 14, lineHeight: 1.75, fontFamily: "Palatino,Georgia,serif", resize: "vertical", outline: "none", boxSizing: "border-box" };
  const IN = { width: "100%", padding: "11px 14px", background: "#0C0C10", border: "1px solid #2A2A38", borderRadius: 8, color: "#EDE8E0", fontSize: 13, fontFamily: "monospace", outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ minHeight: "100vh", background: "#0C0C10", color: "#EDE8E0", fontFamily: "'Palatino Linotype','Book Antiqua',Palatino,Georgia,serif", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 28px", borderBottom: "1px solid #1E1E28", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(180deg,#111118 0%,#0C0C10 100%)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <EncoreLogo />
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#348193", textTransform: "uppercase" }}>Daily Check-In</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#666" }}>{todayStr()}</div>
          {step === STEPS.CHECKIN && <div style={{ fontSize: 10, color: "#348193", marginTop: 4, letterSpacing: 2, textTransform: "uppercase" }}>{currentIdx + 1}/{TEAM_MEMBERS.length} team</div>}
          {step === STEPS.REVIEW && <div style={{ fontSize: 10, color: "#348193", marginTop: 4, letterSpacing: 2, textTransform: "uppercase" }}>{actionItems.length} action items</div>}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "28px", maxWidth: 680, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>

        {step === STEPS.SETUP && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div><div style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>Connect your tools</div><div style={{ fontSize: 14, color: "#888", lineHeight: 1.7 }}>Your notes save to Google Sheets and post a summary to Slack after each check-in.</div></div>
            <div style={{ background: "#111118", border: "1px solid #2A2A38", borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontSize: 11, color: "#348193", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Google Sheets</div>
              <input value={sheetUrl} onChange={e => { setSheetUrl(e.target.value); setSheetError(""); }} placeholder="https://docs.google.com/spreadsheets/d/..." style={{ ...IN, border: "1px solid " + (sheetError ? "#8A3030" : "#2A2A38") }} />
              {sheetError && <div style={{ fontSize: 12, color: "#E05050", marginTop: 6 }}>{sheetError}</div>}
            </div>
            <div style={{ background: "#111118", border: "1px solid #2A2A38", borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontSize: 11, color: "#348193", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Slack <span style={{ color: "#444", fontWeight: "normal", letterSpacing: 0 }}>— optional</span></div>
              <input value={slackWebhook} onChange={e => setSlackWebhook(e.target.value)} placeholder="https://hooks.slack.com/services/..." style={IN} />
            </div>
            <div style={{ background: "#111118", border: "1px solid #2A2A38", borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><div style={{ fontSize: 14, fontWeight: "bold", marginBottom: 2 }}>Encore Dashboard</div><div style={{ fontSize: 12, color: "#666" }}>Projects · Finance · Show Prep · Executive · Aspire</div></div>
              <button onClick={() => setStep(STEPS.DASHBOARD)} style={{ ...G, padding: "8px 16px", fontSize: 13 }}>Open →</button>
            </div>
            {(() => {
              const openCount = openTasks.filter(t => !t.done).length;
              const subOpen = openTasks.reduce((n, t) => n + (t.subtasks || []).filter(s => !s.done).length, 0);
              return (
                <div style={{ background: "#111118", border: "1px solid #2A2A38", borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: "bold", marginBottom: 2 }}>Open Tasks {openCount > 0 && <span style={{ background: "#348193", color: "#0C0C10", fontSize: 11, padding: "1px 7px", borderRadius: 10, marginLeft: 6, fontFamily: "sans-serif" }}>{openCount}</span>}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>{openCount === 0 ? "No open items — you're all caught up." : openCount + " action item" + (openCount === 1 ? "" : "s") + " · " + subOpen + " subtask" + (subOpen === 1 ? "" : "s") + " open"}</div>
                  </div>
                  <button onClick={() => setStep(STEPS.TASKS)} style={{ ...G, padding: "8px 16px", fontSize: 13 }}>Open →</button>
                </div>
              );
            })()}
            <button onClick={handleSetup} style={{ ...P, padding: "14px 24px", fontSize: 15 }}>Begin Today's Check-In →</button>
            <div style={{ textAlign: "center" }}><button onClick={() => setStep(STEPS.CHECKIN)} style={{ background: "none", border: "none", color: "#555", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>Skip — check in without saving</button></div>
          </div>
        )}

        {step === STEPS.CHECKIN && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><div style={{ fontSize: 11, color: "#666", letterSpacing: 2, textTransform: "uppercase" }}>Team Check-In</div><div style={{ fontSize: 11, color: "#348193" }}>{currentIdx + 1} of {TEAM_MEMBERS.length}</div></div>
              <div style={{ height: 3, background: "#1E1E28", borderRadius: 2 }}><div style={{ height: "100%", borderRadius: 2, width: ((currentIdx / TEAM_MEMBERS.length) * 100) + "%", background: "linear-gradient(90deg,#348193,#5BB0BF)", transition: "width 0.3s ease" }} /></div>
            </div>
            <div style={{ background: "#111118", border: "1px solid #2A2A38", borderRadius: 14, padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: avatarColor(member.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: "bold", color: "#0C0C10" }}>{member.name[0]}</div>
                <div><div style={{ fontSize: 22, fontWeight: "bold" }}>{member.name}</div><div style={{ fontSize: 13, color: "#348193" }}>{member.role}</div>{member.slackId && <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>● on Slack</div>}</div>
              </div>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>Check-in notes</div>
              <textarea autoFocus value={notes[member.name] || ""} onChange={e => setNotes(prev => ({ ...prev, [member.name]: e.target.value }))} placeholder={"What's on your mind for " + member.name + "? Updates, follow-ups, concerns, wins…"} style={TA} />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {currentIdx > 0 && <button onClick={() => setCurrentIdx(i => i - 1)} style={G}>← Back</button>}
              <button onClick={saveAndAdvance} style={{ flex: 1, ...P, fontSize: 15 }}>{currentIdx < TEAM_MEMBERS.length - 1 ? "Next: " + TEAM_MEMBERS[currentIdx + 1].name + " →" : "Continue to Marketing →"}</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {TEAM_MEMBERS.map((m, i) => (
                <button key={m.name} onClick={() => setCurrentIdx(i)} title={m.name} style={{ width: 32, height: 32, borderRadius: "50%", background: i === currentIdx ? avatarColor(m.name) : (notes[m.name] && notes[m.name].trim()) ? "#1A2A1A" : "#111118", border: "1.5px solid " + (i === currentIdx ? avatarColor(m.name) : (notes[m.name] && notes[m.name].trim()) ? "#3A6A3A" : "#2A2A38"), color: i === currentIdx ? "#0C0C10" : (notes[m.name] && notes[m.name].trim()) ? "#5ABF5A" : "#555", fontSize: 11, fontWeight: "bold", cursor: "pointer" }}>{m.name[0]}</button>
              ))}
            </div>
          </div>
        )}

        {step === STEPS.MARKETING && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div><div style={{ fontSize: 11, color: "#348193", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>📣 Marketing Check-In</div><div style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>What needs promoting today?</div><div style={{ fontSize: 14, color: "#888", lineHeight: 1.7 }}>Think Instagram, Facebook, email, and ticketing for all upcoming shows, events, and auditions.</div></div>
            <div style={{ background: "#111118", border: "1px solid #2A2A38", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Upcoming to consider</div>
              {["🎭 Bright Lights of Broadway — April 16-18","📚 Matilda Auditions — April 22 & 23","✈️ Come From Away Page to Stage — April 22 & 25 (17 seats left!)","🦁 Lion King Auditions — May 14"].map((e,i) => <div key={i} style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>{e}</div>)}
            </div>
            <textarea value={marketingNotes} onChange={e => setMarketingNotes(e.target.value)} placeholder="Any performances, events, or auditions that need promoting? What platforms, what messaging, what's the priority today?" style={TA} />
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep(STEPS.CHECKIN)} style={G}>← Back</button>
              <button onClick={() => { saveNotes(notes, marketingNotes, weekNotes, dashNotes); setStep(STEPS.WEEK); }} style={{ flex: 1, ...P, fontSize: 15 }}>Continue to Week Ahead →</button>
            </div>
          </div>
        )}

        {step === STEPS.WEEK && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div><div style={{ fontSize: 11, color: "#348193", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>📅 Week Ahead</div><div style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>What's on your mind this week?</div><div style={{ fontSize: 14, color: "#888", lineHeight: 1.7 }}>Scheduled and unscheduled — things to prepare for, decisions to make, people to think about.</div></div>
            <textarea value={weekNotes} onChange={e => setWeekNotes(e.target.value)} placeholder="What's coming up this week? What do you want to prepare for, follow up on, or keep top of mind?" style={{ ...TA, minHeight: 180 }} />
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep(STEPS.MARKETING)} style={G}>← Back</button>
              <button onClick={() => { saveNotes(notes, marketingNotes, weekNotes, dashNotes); setStep(STEPS.DASHBOARD); }} style={{ flex: 1, ...P, fontSize: 15 }}>Continue to Dashboard →</button>
            </div>
          </div>
        )}

        {step === STEPS.DASHBOARD && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div><div style={{ fontSize: 11, color: "#348193", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>🗂️ Encore Dashboard</div><div style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>What's on your mind today?</div><div style={{ fontSize: 14, color: "#888", lineHeight: 1.7 }}>Tap any category to expand it. Add notes to the areas that need attention — leave the rest blank.</div></div>
            {DASHBOARD_CATEGORIES.map(cat => {
              const isExpanded = expandedCats[cat.id];
              const filledCount = cat.items.filter(item => getDashNote(cat.id, item).trim()).length;
              return (
                <div key={cat.id} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid " + cat.borderColor + "40" }}>
                  <button onClick={() => toggleCat(cat.id)} style={{ width: "100%", padding: "16px 20px", background: "linear-gradient(135deg," + cat.color + "88," + cat.lightColor + "CC)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img src={cat.icon} alt={cat.label} style={{ width: 28, height: 28, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.9 }} />
                      <span style={{ fontSize: 16, fontWeight: "bold", color: "#F0EDE8", fontFamily: "Palatino,Georgia,serif" }}>{cat.label}</span>
                      {filledCount > 0 && <span style={{ background: cat.borderColor, color: "#0C0C10", fontSize: 11, fontWeight: "bold", padding: "2px 8px", borderRadius: 20, fontFamily: "sans-serif" }}>{filledCount} note{filledCount > 1 ? "s" : ""}</span>}
                    </div>
                    <span style={{ color: "#EDE8E0", fontSize: 18, opacity: 0.7 }}>{isExpanded ? "▲" : "▼"}</span>
                  </button>
                  {isExpanded && (
                    <div style={{ background: "#0E0E16", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                      {cat.items.map(item => {
                        const key = cat.id + "::" + item;
                        const isOpen = expandedItems[key];
                        const note = getDashNote(cat.id, item);
                        const hasNote = note.trim().length > 0;
                        return (
                          <div key={item} style={{ borderRadius: 8, overflow: "hidden", border: "1px solid " + (hasNote ? cat.borderColor + "60" : "#2A2A38") }}>
                            <button onClick={() => toggleItem(key)} style={{ width: "100%", padding: "11px 16px", background: hasNote ? cat.color + "22" : "#111118", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: hasNote ? cat.borderColor : "#333", flexShrink: 0 }} />
                                <span style={{ fontSize: 14, color: hasNote ? "#EDE8E0" : "#888", fontFamily: "Palatino,Georgia,serif" }}>{item}</span>
                              </div>
                              <span style={{ color: "#555", fontSize: 14 }}>{isOpen ? "▲" : "+"}</span>
                            </button>
                            {isOpen && (
                              <div style={{ padding: "0 16px 12px", background: hasNote ? cat.color + "11" : "#0C0C10" }}>
                                <textarea autoFocus value={note} onChange={e => setDashNote(cat.id, item, e.target.value)} onBlur={() => saveNotes(notes, marketingNotes, weekNotes, {...dashNotes, [cat.id + "::" + item]: note})} placeholder={"What's on your mind about " + item + "?"} style={{ width: "100%", minHeight: 90, background: "transparent", border: "none", borderTop: "1px solid " + cat.borderColor + "30", padding: "12px 0 0", color: "#EDE8E0", fontSize: 14, lineHeight: 1.7, fontFamily: "Palatino,Georgia,serif", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
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
              <button onClick={() => setStep(STEPS.WEEK)} style={G}>← Back</button>
              <button onClick={() => { saveNotes(notes, marketingNotes, weekNotes, dashNotes); setStep(STEPS.PROCESSING); extractActionItems(); }} style={{ flex: 1, ...P, fontSize: 15 }}>Finish & Extract Action Items →</button>
            </div>
            <div style={{ textAlign: "center" }}><button onClick={() => { saveNotes(notes, marketingNotes, weekNotes, dashNotes); setStep(STEPS.SETUP); }} style={{ background: "none", border: "none", color: "#555", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>Save notes & return to home</button></div>
          </div>
        )}

        {step === STEPS.PROCESSING && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 20, textAlign: "center" }}>
            <div style={{ fontSize: 48 }}>✦</div>
            <div style={{ fontSize: 20, fontWeight: "bold" }}>Reading your notes…</div>
            <div style={{ fontSize: 14, color: "#888", maxWidth: 380, lineHeight: 1.7 }}>Claude is reviewing everything and extracting detailed action items by priority.</div>
            <div style={{ display: "flex", gap: 6 }}>{[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#348193", animation: "pulse 1.2s ease-in-out " + (i * 0.2) + "s infinite" }} />)}</div>
            <style>{"@keyframes pulse{0%,100%{opacity:0.2}50%{opacity:1}}"}</style>
          </div>
        )}

        {step === STEPS.REVIEW && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div><div style={{ fontSize: 22, fontWeight: "bold", marginBottom: 6 }}>Today's Check-In</div><div style={{ fontSize: 13, color: "#666" }}>{actionItems.length} action items · {actionItems.reduce((n,a)=>n+((a.subtasks&&a.subtasks.length)||0),0)} subtasks</div></div>

            {summary && summary.trim() && (
              <div style={{ background: "linear-gradient(135deg,#27616e22,#34819322)", border: "1px solid #348193", borderRadius: 12, padding: "18px 22px" }}>
                <div style={{ fontSize: 11, color: "#348193", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>🧭 Today's Summary</div>
                <div style={{ fontSize: 15, color: "#EDE8E0", lineHeight: 1.75 }}>{summary}</div>
              </div>
            )}

            {(["team","marketing","week","dashboard"].some(k => themed[k] && themed[k].trim())) && (
              <div style={{ background: "#111118", border: "1px solid #2A2A38", borderRadius: 12, padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ fontSize: 11, color: "#348193", letterSpacing: 3, textTransform: "uppercase" }}>🧩 By Area</div>
                {[["team","👥 Team"],["marketing","📣 Marketing"],["week","📅 Week Ahead"],["dashboard","🗂️ Dashboard"]].map(([k, label]) => (
                  themed[k] && themed[k].trim() ? (
                    <div key={k}>
                      <div style={{ fontSize: 12, color: "#85b3be", marginBottom: 4, fontWeight: "bold" }}>{label}</div>
                      <div style={{ fontSize: 14, color: "#C0B8B0", lineHeight: 1.7 }}>{themed[k]}</div>
                    </div>
                  ) : null
                ))}
              </div>
            )}

            <div style={{ fontSize: 17, fontWeight: "bold", marginTop: 4 }}>✅ Action Items</div>

            {actionItems.length === 0 ? (
              <div style={{ background: "#111118", border: "1px solid #2A2A38", borderRadius: 12, padding: "24px", textAlign: "center", color: "#666" }}>No action items found today.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {Object.entries(catLabels).map(([cat, label]) => {
                  const items = actionItems.filter(a => a.category === cat);
                  if (!items.length) return null;
                  return (
                    <div key={cat}>
                      <div style={{ fontSize: 11, color: "#348193", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
                      {["high","medium","low"].map(priority => {
                        const pi = items.filter(a => a.priority === priority);
                        if (!pi.length) return null;
                        const p = ps(priority);
                        return (
                          <div key={priority} style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 10, color: p.dot, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: p.dot }} />{priority} priority</div>
                            {pi.map((item) => {
                              const hp = item.person && item.person !== "-" && item.person !== "—";
                              const live = openTasks.find(t => t.id === item.id) || item;
                              const isOpen = !!expandedActions[item.id];
                              const subs = live.subtasks || [];
                              const doneCount = subs.filter(s => s.done).length;
                              return (
                                <div key={item.id} style={{ background: p.bg, border: "1px solid " + p.border, borderRadius: 10, marginBottom: 8 }}>
                                  <div style={{ padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                                    <button onClick={() => toggleTaskDone(item.id)} title={live.done ? "Mark not done" : "Mark done"} style={{ width: 22, height: 22, borderRadius: 6, border: "1.5px solid " + (live.done ? p.dot : "#444"), background: live.done ? p.dot : "transparent", cursor: "pointer", flexShrink: 0, marginTop: 2, color: "#0C0C10", fontSize: 14, fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>{live.done ? "✓" : ""}</button>
                                    {hp && <div style={{ width: 30, height: 30, borderRadius: "50%", background: avatarColor(item.person), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold", color: "#0C0C10", flexShrink: 0 }}>{item.person[0]}</div>}
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: 14, color: live.done ? "#777" : "#EDE8E0", lineHeight: 1.6, textDecoration: live.done ? "line-through" : "none" }}>{item.task}</div>
                                      {hp && <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{item.person} · {item.role}</div>}
                                      {subs.length > 0 && (
                                        <button onClick={() => toggleExpandedAction(item.id)} style={{ background: "none", border: "none", color: "#85b3be", fontSize: 12, padding: 0, marginTop: 8, cursor: "pointer", fontFamily: "inherit" }}>
                                          {isOpen ? "▾" : "▸"} {doneCount}/{subs.length} subtasks
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  {isOpen && subs.length > 0 && (
                                    <div style={{ borderTop: "1px solid " + p.border, padding: "10px 16px 14px 50px", display: "flex", flexDirection: "column", gap: 8 }}>
                                      {subs.map(s => (
                                        <div key={s.id} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                          <button onClick={() => toggleSubtaskDone(item.id, s.id)} style={{ width: 18, height: 18, borderRadius: 5, border: "1.5px solid " + (s.done ? p.dot : "#444"), background: s.done ? p.dot : "transparent", cursor: "pointer", flexShrink: 0, marginTop: 2, color: "#0C0C10", fontSize: 11, fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>{s.done ? "✓" : ""}</button>
                                          <div style={{ fontSize: 13, color: s.done ? "#666" : "#C0B8B0", lineHeight: 1.6, textDecoration: s.done ? "line-through" : "none" }}>{s.title}</div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
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
              {sheetUrl && <button onClick={syncToSheets} style={{ flex: 1, minWidth: 180, ...P }}>Save to Google Sheets →</button>}
              {slackWebhook && <button onClick={sendToSlack} disabled={slackSent || slackSending} style={{ flex: 1, minWidth: 180, ...(slackSent ? { ...S, background: "#101A10", border: "1px solid #2A5A2A", color: "#50A050" } : S) }}>{slackSent ? "✓ Sent to Slack" : slackSending ? "Sending…" : "Post to Slack →"}</button>}
              <button onClick={() => setStep(STEPS.DONE)} style={G}>{sheetUrl || slackWebhook ? "Skip" : "Finish"}</button>
            </div>
          </div>
        )}

        {step === STEPS.SYNCING && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 20, textAlign: "center" }}>
            <div style={{ fontSize: 48 }}>📊</div>
            <div style={{ fontSize: 20, fontWeight: "bold" }}>Saving to Google Sheets…</div>
            <div style={{ fontSize: 14, color: "#888" }}>Writing today's notes and action items to your spreadsheet.</div>
          </div>
        )}

        {step === STEPS.DONE && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 20, textAlign: "center" }}>
            <div style={{ fontSize: 56 }}>✦</div>
            <div style={{ fontSize: 24, fontWeight: "bold" }}>Check-in complete</div>
            <div style={{ fontSize: 14, color: "#888", maxWidth: 380, lineHeight: 1.8 }}>{actionItems.length} action items extracted.{sheetUrl ? " Saved to Google Sheets." : ""}{slackSent ? " Summary posted to Slack." : ""}</div>
            {slackWebhook && !slackSent && <button onClick={sendToSlack} disabled={slackSending} style={S}>{slackSending ? "Sending…" : "Post Summary to Slack →"}</button>}
            {slackSent && <div style={{ fontSize: 13, color: "#50A050" }}>✓ Summary posted to Slack</div>}
            {actionItems.length > 0 && (
              <div style={{ background: "#111118", border: "1px solid #2A2A38", borderRadius: 12, padding: "16px 20px", width: "100%", textAlign: "left" }}>
                <div style={{ fontSize: 11, color: "#348193", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Summary</div>
                {["high","medium","low"].map(p => { const count = actionItems.filter(a => a.priority === p).length; if (!count) return null; const style = ps(p); return (<div key={p} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: style.dot }} /><span style={{ fontSize: 14, color: "#C0B8B0", textTransform: "capitalize" }}>{p} priority</span></div><span style={{ fontSize: 14, color: style.dot, fontWeight: "bold" }}>{count}</span></div>); })}
              </div>
            )}
            <button onClick={() => { setStep(STEPS.SETUP); setCurrentIdx(0); setNotes({}); setMarketingNotes(""); setWeekNotes(""); setDashNotes({}); setActionItems([]); setSyncError(""); setSlackSent(false); setSlackError(""); }} style={{ ...P, padding: "13px 28px", fontSize: 15 }}>Start a New Check-In</button>
          </div>
        )}

        {step === STEPS.TASKS && (() => {
          const filtered = openTasks.filter(t => taskFilter === "all" ? true : taskFilter === "done" ? t.done : !t.done);
          // Group by date (most recent first), then category.
          const dates = [...new Set(filtered.map(t => t.date))].sort().reverse();
          const today = isoDate();
          const totalOpen = openTasks.filter(t => !t.done).length;
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <div style={{ fontSize: 11, color: "#348193", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>📋 Open Tasks</div>
                <div style={{ fontSize: 22, fontWeight: "bold", marginBottom: 6 }}>Your running list</div>
                <div style={{ fontSize: 13, color: "#888", lineHeight: 1.7 }}>{totalOpen === 0 ? "Nothing open right now." : totalOpen + " action items still need attention. Anything not finished today carries to tomorrow."}</div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                {[["open","Open"],["done","Done"],["all","All"]].map(([k, label]) => (
                  <button key={k} onClick={() => setTaskFilter(k)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: "bold", cursor: "pointer", background: taskFilter === k ? "#348193" : "transparent", border: "1px solid " + (taskFilter === k ? "#348193" : "#2A2A38"), color: taskFilter === k ? "#0C0C10" : "#888" }}>{label}</button>
                ))}
              </div>

              {dates.length === 0 ? (
                <div style={{ background: "#111118", border: "1px solid #2A2A38", borderRadius: 12, padding: "32px", textAlign: "center", color: "#666" }}>
                  {taskFilter === "done" ? "Nothing finished yet." : taskFilter === "open" ? "All caught up. ✦" : "No tasks yet — finish a check-in to generate some."}
                </div>
              ) : dates.map(date => {
                const items = filtered.filter(t => t.date === date);
                const dateLabel = date === today ? "Today" : new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" });
                return (
                  <div key={date} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ fontSize: 11, color: "#666", letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>{dateLabel} · {items.length} item{items.length === 1 ? "" : "s"}</div>
                    {items.map(item => {
                      const hp = item.person && item.person !== "-" && item.person !== "—";
                      const isOpen = !!expandedActions[item.id];
                      const subs = item.subtasks || [];
                      const doneCount = subs.filter(s => s.done).length;
                      const p = ps(item.priority);
                      return (
                        <div key={item.id} style={{ background: item.done ? "#0E0E16" : p.bg, border: "1px solid " + (item.done ? "#2A2A38" : p.border), borderRadius: 10, opacity: item.done ? 0.7 : 1 }}>
                          <div style={{ padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <button onClick={() => toggleTaskDone(item.id)} style={{ width: 22, height: 22, borderRadius: 6, border: "1.5px solid " + (item.done ? p.dot : "#444"), background: item.done ? p.dot : "transparent", cursor: "pointer", flexShrink: 0, marginTop: 2, color: "#0C0C10", fontSize: 14, fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>{item.done ? "✓" : ""}</button>
                            {hp && <div style={{ width: 30, height: 30, borderRadius: "50%", background: avatarColor(item.person), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold", color: "#0C0C10", flexShrink: 0 }}>{item.person[0]}</div>}
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                                <span style={{ fontSize: 10, color: p.dot, letterSpacing: 2, textTransform: "uppercase" }}>{item.priority}</span>
                                <span style={{ fontSize: 10, color: "#555" }}>·</span>
                                <span style={{ fontSize: 10, color: "#85b3be", letterSpacing: 1, textTransform: "uppercase" }}>{catLabels[item.category] || item.category}</span>
                              </div>
                              <div style={{ fontSize: 14, color: item.done ? "#777" : "#EDE8E0", lineHeight: 1.6, textDecoration: item.done ? "line-through" : "none" }}>{item.task}</div>
                              {hp && <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{item.person} · {item.role}</div>}
                              {subs.length > 0 && (
                                <button onClick={() => toggleExpandedAction(item.id)} style={{ background: "none", border: "none", color: "#85b3be", fontSize: 12, padding: 0, marginTop: 8, cursor: "pointer", fontFamily: "inherit" }}>
                                  {isOpen ? "▾" : "▸"} {doneCount}/{subs.length} subtasks
                                </button>
                              )}
                            </div>
                          </div>
                          {isOpen && subs.length > 0 && (
                            <div style={{ borderTop: "1px solid " + (item.done ? "#2A2A38" : p.border), padding: "10px 16px 14px 50px", display: "flex", flexDirection: "column", gap: 8 }}>
                              {subs.map(s => (
                                <div key={s.id} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                  <button onClick={() => toggleSubtaskDone(item.id, s.id)} style={{ width: 18, height: 18, borderRadius: 5, border: "1.5px solid " + (s.done ? p.dot : "#444"), background: s.done ? p.dot : "transparent", cursor: "pointer", flexShrink: 0, marginTop: 2, color: "#0C0C10", fontSize: 11, fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>{s.done ? "✓" : ""}</button>
                                  <div style={{ fontSize: 13, color: s.done ? "#666" : "#C0B8B0", lineHeight: 1.6, textDecoration: s.done ? "line-through" : "none" }}>{s.title}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button onClick={() => setStep(STEPS.SETUP)} style={G}>← Back to Home</button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
