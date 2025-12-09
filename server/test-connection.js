const http = require('http');
const data = JSON.stringify({});
const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/ai/test-connection',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};
const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Body:', body);
        try { console.log('Parsed JSON:', JSON.parse(body)); } catch (e) { console.error('JSON parse error', e); }
    });
});
req.on('error', (e) => { console.error('Request error:', e); });
req.write(data);
req.end();
