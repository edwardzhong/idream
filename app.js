const koa = require('koa');
const app = new koa();
const logger = require('koa-logger');
const server = require('koa-static');
const render = require('koa-swig');
const koaBody = require('koa-body');
const session = require('koa-session2');
const co = require('co');
const router = require('koa-router')();
const favicon = require('koa-favicon');
const addRouters = require('./router');
const config = require('./config/app');
const log = require('./common/logger');
const staticCache = require('koa-static-cache')

app.use(staticCache(__dirname + '/public/lib'), {
  maxAge: 365 * 24 * 60 * 60
});

// diplay access records
app.use(logger());

// session
app.use(session({
    key: 'sessionID',
    maxAge: 1000 * 60 * 60
}));

// parse request
app.use(koaBody({
    jsonLimit: 1024 * 1024 * 5,
    formLimit: 1024 * 1024 * 5,
    textLimit: 1024 * 1024 * 5,
    formidable: { uploadDir: __dirname + '/public/upload' }
}));


// set static directiory
app.use(server(__dirname + '/public'));
// favicon
app.use(favicon(__dirname + '/public/favicon.ico'));

// set template engine
app.context.render = co.wrap(render({
    root: __dirname + '/view',
    cache: false,
    autoescape: false,
    ext: 'html',
    writeBody: false
}));

// add route
addRouters(router);
app.use(router.routes())
    .use(router.allowedMethods());

// koa already had middleware to deal with the error, rigister the error event
app.on('error', (err, ctx) => {
    ctx.status = 500;
    ctx.statusText = 'Internal Server Error';
    log.error(err);
    if (config.env === 'dev') { //throw the error to frontEnd when in the develop mode
        ctx.res.end(err.message); //finish the response
    }
});

// deal 404
app.use(async(ctx, next) => {
    ctx.status = 404;
    ctx.body = await ctx.render('404');
});

if (!module.parent) {
    let port = config.port || 3000;
    app.listen(port);
    log.info('=== app start ===');
    console.log('running server at: http://localhost:%d', port);
}
