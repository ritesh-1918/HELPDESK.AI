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
  
  // Base fields that are absolutely required and standard
  const basePayload = {
    user_id: "00000000-0000-0000-0000-000000000000",
    subject: "Test Column Diagnostics",
    description: "Testing column presence in database schema",
    category: "Software",
    subcategory: "General",
    priority: "Low",
    assigned_team: "IT Support",
    status: "pending",
    auto_resolve: false,
    is_duplicate: false,
    confidence: 0.9,
    company: "Test Company",
    company_id: "11111111-1111-1111-1111-111111111111",
    is_potential_duplicate: false,
    parent_ticket_id: null,
    metadata: {}
  };

  console.log("1. Testing minimal standard payload...");
  let res = await postRequest(url, basePayload);
  console.log("Status:", res.status);
  console.log("Data:", res.data);

  if (res.status === 200) {
    console.log("SUCCESS! Standard columns are fine.");
  } else {
    console.log("Failed even on minimal payload. Let's see why.");
  }
}

main();
