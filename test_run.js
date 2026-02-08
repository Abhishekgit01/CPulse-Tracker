const http = require('http');
const data = JSON.stringify({
  code: '#include <iostream>\nusing namespace std;\nint main(){cout<<42;return 0;}',
  language: 'cpp',
  stdin: ''
});
const req = http.request({
  hostname: 'localhost', port: 5000,
  path: '/api/dsa-practice/run',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
}, res => {
  let b = '';
  res.on('data', c => b += c);
  res.on('end', () => console.log(b));
});
req.write(data);
req.end();
