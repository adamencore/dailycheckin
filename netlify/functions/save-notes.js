const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "ok" };
  }

  try {
    const { notes, marketingNotes, weekNotes, dashNotes, date } = JSON.parse(event.body);
    const store = getStore("checkin-notes");

    await store.setJSON("latest", {
      notes: notes || {},
      marketingNotes: marketingNotes || "",
      weekNotes: weekNotes || "",
      dashNotes: dashNotes || {},
      date: date || new Date().toISOString().split("T")[0],
      savedAt: new Date().toISOString(),
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
