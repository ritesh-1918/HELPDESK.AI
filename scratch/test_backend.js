const https = require('https');

const fetchUrl = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'NodeJS' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    }).on('error', reject);
  });
};

async function main() {
  const url = "https://huggingface.co/api/spaces/ritesh19180/ai-helpdesk-api";
  console.log("Querying Hugging Face Space API...");
  
  try {
    const res = await fetchUrl(url);
    console.log("Space API status:", res.status);
    if (res.status === 200 && res.data) {
      console.log("Space Runtime/Status:", res.data.runtime?.stage);
      console.log("Last Commit SHA:", res.data.sha);
      console.log("Last Modified:", res.data.lastModified);
    } else {
      console.log("Response data:", res.data);
    }
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

main();
