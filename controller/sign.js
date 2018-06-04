const { request } = require('../common/util');
const log = require('../common/logger');

/**
 * login
 */
exports.login = async function(ctx, next) {
    let form = ctx.request.body;
    try {
        let ret = await request(form);
        ret = JSON.parse(ret);
        if (ret.code == 200) {
            ctx.session.user = {};
            Object.assign(ctx.session.user, form, ret.data);
        }
        ctx.body = await ret;
    } catch (err) {
        log.error(err);
        ctx.body = await { code: 500, msg: '服务器错误,请稍后再试', err: err };
    }
};

/**
 * register
 */
exports.register = async function(ctx, next) {
    let form = ctx.request.body;
    try {
        let ret = await request(form);
        ret = JSON.parse(ret);
        if (ret.code == 200) { //注册成功后登录
            form.r = '/login/sign';
            let loginRet = await request(form);
            loginRet = JSON.parse(loginRet);
            if (loginRet.code == 200) {
                ctx.session.user = {};
                Object.assign(ctx.session.user, form, ret.data);
            }
            ctx.body = await loginRet;
        } else {
            ctx.body = await ret;
        }
    } catch (err) {
        log.error(err);
        ctx.body = await { code: 500, msg: '服务器错误,请稍后再试', err: err };
    }
};

/**
 * logout
 */
exports.logout = async function(ctx, next) {
    let form = ctx.request.body;
    if(ctx.session && ctx.session.user){
        form.token = ctx.session.user.token;
    }

    try {
        let ret = await request(form);
        ret = JSON.parse(ret);
        if (ret.code != 200) {log.warn(form); }
        ctx.session.user = null;
        ctx.body = await ret;
    } catch (err) {
        log.error(err);
        ctx.body = await { code: 500, msg: '服务器错误,请稍后再试', err: err };
    }
};
