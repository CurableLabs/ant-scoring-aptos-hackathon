const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 7000;
const DEFAULT_FILE = './americas-next-top-curable-blockchain.html';

const server = http.createServer((req, res) => {
    let filePath = req.url === '/' ? DEFAULT_FILE : ('.' + req.url);
    filePath = path.join(__dirname, filePath);

    console.log('Request received for:', req.url, '-> serving:', filePath);

    fs.readFile(filePath, 'utf8', (err, content) => {
        if (err) {
            console.error('Error serving file:', filePath, err.message);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found: ' + filePath);
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
            res.end(content);
            console.log('Served:', filePath);
        }
    });
});

server.listen(PORT, () => {
    console.log(`🎯 Tri-Lane Demo Server STARTED!`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`📁 Directory: ${process.cwd()}`);
    console.log(`✅ Server is ready for testing!`);
});