exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "ok" };
  }

  try {
    const apiKey = process.env.JSONBIN_API_KEY;
    const binId = process.env.JSONBIN_BIN_ID;

    const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      headers: { "X-Master-Key": apiKey },
    });

    const data = await res.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, data: data.record || null }),
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, data: null }),
    };
  }
};
