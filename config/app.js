/**
 * app config
 */
module.exports = {
    env: 'dev',
    port: 8282,
    url:'http://118.31.61.9:8282',
    proxy: {
        filter: '/api',
        host: '118.31.61.9',
        path: '/index.php',
        port: 8181
    },
    pageSize:10
};

