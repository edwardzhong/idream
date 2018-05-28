/**
 * app config
 */
module.exports = {
    env: 'env',
    port: 3001,
    url:'http://localhost:3001',
    proxy: {
        filter: '/api',
        host: '118.31.61.9',
        path: '/index.php',
        port: 8181
    },
    pagesize:10
};

