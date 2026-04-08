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
    const body = JSON.parse(event.body || "{}");
    const apiKey = process.env.JSONBIN_API_KEY;
    const binId = process.env.JSONBIN_BIN_ID;

    const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": apiKey,
      },
      body: JSON.stringify({
        notes: body.notes || {},
        marketingNotes: body.marketingNotes || "",
        weekNotes: body.weekNotes || "",
        dashNotes: body.dashNotes || {},
        date: body.date || new Date().toISOString().split("T")[0],
        savedAt: new Date().toISOString(),
      }),
    });

    const data = await res.json();
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, data }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
