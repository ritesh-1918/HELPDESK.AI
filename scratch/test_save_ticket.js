const https = require('https');

const postRequest = (url, payload) => {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const postData = JSON.stringify(payload);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

async function main() {
  const url = "https://ritesh19180-ai-helpdesk-api.hf.space/tickets/save";
  
  // Using valid user_id and company_id from database
  const testPayload = {
    user_id: "843dfe99-70dd-4283-8eaf-c1bc70047b59",
    subject: "Test Support Ticket from Script v2",
    description: "Testing saving with valid database credentials and checking remote FastAPI server.",
    category: "Software",
    subcategory: "General",
    priority: "Low",
    assigned_team: "Software Team",
    status: "pending",
    auto_resolve: false,
    is_duplicate: false,
    confidence: 0.95,
    company: "RITESH PVT LTD",
    company_id: "76d16bf6-2ee9-44ad-b64e-ad5ecf0a079b",
    is_potential_duplicate: false,
    parent_ticket_id: null,
    sla_breach_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    routing_confidence: 0.95,
    metadata: {}
  };

  console.log("Sending ticket save request to remote API...");
  try {
    const res = await postRequest(url, testPayload);
    console.log("Response status:", res.status);
    console.log("Response data:", res.data);
  } catch (err) {
    console.error("Request failed:", err);
  }
}

main();
