const http = require('http');
const fs = require('fs');
const path = require('path');

// MIME type mapping for proper content types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
    '.md': 'text/markdown'
};

const server = http.createServer((req, res) => {
    console.log('Request received for:', req.url);

    let filePath = req.url === '/' ? './americas-next-top-curable-blockchain.html' : ('.' + req.url);

    // Remove query string if present
    const urlParts = filePath.split('?');
    filePath = urlParts[0];

    try {
        const extname = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[extname] || 'application/octet-stream';

        // Read as binary for images, text for others
        const isBinary = ['.png', '.jpg', '.jpeg', '.gif', '.ico'].includes(extname);
        const content = fs.readFileSync(filePath, isBinary ? null : 'utf8');

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(content);
        console.log('✅ Served:', filePath);
    } catch(error) {
        console.log('❌ Error serving:', filePath, error.message);
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('File not found: ' + filePath);
    }
});

// Use PORT from environment variable (required for Render) or default to 7000 for local dev
const PORT = process.env.PORT || 7000;
const HOST = process.env.HOST || '0.0.0.0'; // Bind to 0.0.0.0 for cloud deployments

server.listen(PORT, HOST, () => {
    console.log('🎯 Curable Catalysts Demo Server STARTED!');
    console.log(`🌐 Server running on ${HOST}:${PORT}`);
    console.log('📁 Directory:', process.cwd());
    console.log('✅ Server is ready!');
});

server.on('error', (err) => {
    console.error('❌ Server error:', err);
    process.exit(1);
});
