const https = require('https');

const SUPABASE_URL = "https://aejuenhqciagpntcqoir.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlanVlbmhxY2lhZ3BudGNxb2lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjM4NDA3OCwiZXhwIjoyMDg3OTYwMDc4fQ.b3tZ_yad4WPQi4oSqGp1ksr_zw-ldByLqZWvT7HX5aQ";

const getRequest = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'aejuenhqciagpntcqoir.supabase.co',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
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
    req.end();
  });
};

async function run() {
  console.log("Querying single ticket...");
  const res = await getRequest('/rest/v1/tickets?select=*&limit=1');
  console.log("Ticket status:", res.status);
  console.log("Ticket data:", res.data);
}

run();
