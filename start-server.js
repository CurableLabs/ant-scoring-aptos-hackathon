<<<<<<< HEAD
=======
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< HEAD
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
>>>>>>> 1e100ed19df524466c899a2ff40b2626490bf548
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 7000;
<<<<<<< HEAD
const DEFAULT_FILE = './americas-next-top-curable-blockchain.html';
=======

server.listen(PORT, '127.0.0.1', () => {
    console.log('🎯 Tri-Lane Demo Server STARTED!');
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log('📁 Directory:', process.cwd());
    console.log('✅ Server is ready for testing!');
});

server.on('error', (err) => {
    console.error('❌ Server error:', err);
});

<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream

=======
const http = require('http');
const fs = require('fs');
const path = require('path');
>>>>>>> 1e100ed19df524466c899a2ff40b2626490bf548

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
<<<<<<< HEAD
    console.log(`📁 Directory: ${process.cwd()}`);
    console.log(`✅ Server is ready for testing!`);
});
=======
    console.log('📁 Directory:', process.cwd());
    console.log('✅ Server is ready for testing!');
});

server.on('error', (err) => {
    console.error('❌ Server error:', err);
});

>>>>>>> 261fc5d2fa7adefdf36e416d55fd7bef34e62b5a
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
>>>>>>> 1e100ed19df524466c899a2ff40b2626490bf548
