const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    console.log('Request received for:', req.url);
    
    let filePath = req.url === '/' ? './complete-tri-lane-demo.html' : ('.' + req.url);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache'
        });
        res.end(content);
        console.log('✅ Served:', filePath);
    } catch(error) {
        console.log('❌ Error serving:', filePath, error.message);
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('File not found: ' + filePath);
    }
});

const PORT = 7000;

server.listen(PORT, '127.0.0.1', () => {
    console.log('🎯 Tri-Lane Demo Server STARTED!');
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log('📁 Directory:', process.cwd());
    console.log('✅ Server is ready for testing!');
});

server.on('error', (err) => {
    console.error('❌ Server error:', err);
});


