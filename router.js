const { proxy } = require('./config/app');
const proxyFn = require('./controller/proxy');
const indexCtr = require('./controller/index');
const setupCtr = require('./controller/setup');
const signCtr = require('./controller/sign');
const pages = ['about', 'login', 'register', 'forget', 'tool'];

module.exports = function (router) {
    router.post(proxy.filter, proxyFn)
        .get('/', indexCtr.index)
        .get('/index', indexCtr.index)
        .get('/user/:id', indexCtr.user)
        .get('/article/:id', indexCtr.article)
        .get('/edit/:id', indexCtr.edit)
        .get('/picture/:id', indexCtr.picture)
        .get('/picture', indexCtr.mypicture)
        .get('/tag/:uid/:tag', indexCtr.tag)
        .get('/explore', indexCtr.explore)
        .get('/topic/:kw', indexCtr.topic)
        .get('/search', indexCtr.search)
        .get('/notice', indexCtr.notice)
        .get('/profile', setupCtr.profile)
        .get('/setup', setupCtr.setup)
        .get('/private', setupCtr.private)
        .get('/black', setupCtr.black)
        .post('/login', signCtr.login)
        .post('/register', signCtr.register)
        .post('/logout', signCtr.logout);

    pages.forEach(page => {
        router.get('/' + page, async (ctx, next) => {
            ctx.body = await ctx.render(page);
        });
    });
};
