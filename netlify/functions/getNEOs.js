const fetch = require("node-fetch");

exports.handler = async function () {
  const today = new Date().toISOString().split("T")[0];
  const apiKey = "DEMO_KEY"; // أو مفتاحك الفعلي من https://api.nasa.gov

  try {
    const res = await fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${apiKey}`);
    const data = await res.json();
    
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "NASA API Failed", details: err.message })
    };
  }
};
