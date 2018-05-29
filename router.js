const { proxy } = require('./config/app');
const proxyFn = require('./controller/proxy');
const indexCtr = require('./controller/index');
const signCtr = require('./controller/sign');
const pages=['about','login','register','forget','tool'];

module.exports = function(router) {
    router.post(proxy.filter, proxyFn)
        .get('/', indexCtr.index)
        .get('/index', indexCtr.index)
        .get('/user/:id', indexCtr.user)
        .get('/article/:id', indexCtr.article)
        .get('/edit/:id', indexCtr.edit)
        .get('/tag/:id', indexCtr.tag)
        .post('/login', signCtr.login)
        .post('/register', signCtr.register)
        .post('/logout', signCtr.logout);

    pages.forEach(page=>{
        router.get('/'+page, async(ctx, next) => {
            ctx.body = await ctx.render(page);
        });
    });
};
