var http = require('http');

function beforeRender(req, res, done) {
    http.get({
        hostname: 'jsonplaceholder.typicode.com',
        port: 80,
        path: '/posts',
    }, (result) => {
        var str = '';
        result.on('data', (b) => str += b);
        result.on('error', done);
        result.on('end', () => {
            req.data = { posts: JSON.parse(str) };
            done();
        });
    });
}