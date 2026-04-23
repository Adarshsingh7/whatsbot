import fs from 'fs';
import https from 'https';

const env = fs.readFileSync('.env.local', 'utf8');
const apiKey = env.match(/VITE_GEMINI_API_KEY=(.*)/)[1].trim();

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models?key=${apiKey}`,
  method: 'GET'
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const json = JSON.parse(data);
    const models = json.models.map(m => m.name.replace('models/', ''));
    console.log('Available Models:', models);
  });
});

req.on('error', error => console.error(error));
req.end();
