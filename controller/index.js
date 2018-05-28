const { request, initUser, initList } = require('../common/util');
const log = require('../common/logger');
const config = require('../config/app');

/**
 * home 
 */
exports.index = async function(ctx, next) {
    if (!ctx.session || !ctx.session.user) {
        return ctx.redirect('/login');
    }
    let token = ctx.session.user.token,
        userForm = { r: '/user/get-user-info', token: token },
        listForm = { r: '/user/get-user-home', token: token },
        user = {},
        list = [];
    try {
        let userRet = await request(userForm);
        let listRet = await request(listForm);
        userRet = JSON.parse(userRet);
        listRet = JSON.parse(listRet);

        if (userRet.code != 200) {log.warn(userRet); }
        if (listRet.code != 200) {log.warn(listRet); }
        Object.assign(user, userRet.data);
        Object.assign(list, listRet.data.feed);
        user = initUser(user);
        list = initList(list);
        ctx.body = await ctx.render('index', { isSelf: true, isLogin: true, isNew: userRet.data.unread_count ? true : false, host: config.url, user: user, list: list });
    } catch (err) {
        log.error(err.message.substr(0, 500));
        ctx.status = 500;
        ctx.statusText = 'Internal Server Error';
        ctx.res.end(err.message);
    }
};

/**
 * user
 */
exports.user = async function(ctx, next) {
    let id = ctx.params.id;
    if (!id) return;
    let userForm = { r: '/user/get-user-info', uid: id, token: '' },
        listForm = { r: '/user/get-user-home', uid: id, token: '' },
        user = {},
        list = [],
        isLogin = false;

    if (ctx.session && ctx.session.user) {
        if (ctx.session.user.uid == id) { //与当前登录用户id相同
            return ctx.redirect('/');
        }
        isLogin = true;
        userForm.token = ctx.session.user.token;
        listForm.token = ctx.session.user.token;
    }
    try {
        let userRet = await request(userForm);
        let listRet = await request(listForm);
        userRet = JSON.parse(userRet);
        listRet = JSON.parse(listRet);

        if (userRet.code != 200) { log.warn(userRet); }
        if (listRet.code != 200) { log.warn(listRet); }
        Object.assign(user, userRet.data);
        Object.assign(list, listRet.data.feed);
        user = initUser(user);
        list = initList(list);
        ctx.body = await ctx.render('user', { isOther: true, isNew: false, isLogin: isLogin, host: config.url, user: user, list: list });
    } catch (err) {
        log.error(userForm);
        log.error(listForm);
        log.error(err.message.substr(0, 500));
        ctx.status = 500;
        ctx.statusText = 'Internal Server Error';
        ctx.res.end(err.message);
    }
};

/**
 * edit article
 */
exports.edit = async function(ctx, next) {
    var id = ctx.params.id;
    if (!id) return;
    if (!ctx.session || !ctx.session.user) {
        return ctx.redirect('/login');
    }
    let token = ctx.session.user.token,
        form = { r: '/feed/feed-info', feed_id: id, token: token },
        ret = {},
        user = {};
    try {
        ret = await request(form);
        ret = JSON.parse(ret);
        if (ret.code != 200) { log.warn(ret); }
        Object.assign(user, ret.data.user);
        user = initUser(user);
        if (user.uid != ctx.session.user.uid) { //文章不属于该用户
            return ctx.redirect('/article/' + id);
        } else {
            ctx.body = await ctx.render('edit', { isSelf: true, isLogin: true, isNew: user.unread_count ? true : false, host: config.url, user: user, article: ret.data.info });
        }

    } catch (err) {
        log.error(form);
        log.error(err.message.substr(0, 500));
        ctx.status = 500;
        ctx.statusText = 'Internal Server Error';
        ctx.res.end(err.message);
    }
};

/**
 * view article
 */
exports.article = async function(ctx, next) {
    let id = ctx.params.id,
        token = '',
        data = { isLogin: false };
        
    if (!id) return;
    if (ctx.session && ctx.session.user) {
        data.isLogin = true;
        token = ctx.session.user.token;
    }
    let form = { r: '/feed/feed-info', feed_id: id, token: token },
        ret = {},
        user = {};
    try {
        ret = await request(form);
        ret = JSON.parse(ret);
        if (ret.code != 200) { log.warn(ret); }
        Object.assign(user, ret.data.user);
        user = initUser(user);
        if (ctx.session.user && ctx.session.user.uid == user.uid) {//当前用户的文章
            Object.assign(data, { isSelf: true, isNew: user.unread_count ? true : false });
        } else {
            Object.assign(data, { isOther: true, isNew: false });
        }
        Object.assign(data, { host: config.url, user: user, article: ret.data.info, comments: ret.data.review });
        ctx.body = await ctx.render('article', data);
    } catch (err) {
        log.error(form);
        log.error(err.message.substr(0, 500));
        ctx.status = 500;
        ctx.statusText = 'Internal Server Error';
        ctx.res.end(err.message);
    }
};

/**
 * get article list by tag
 */
exports.tag = async function(ctx, next) {
    var tag = ctx.params.id;
    if (!tag) return;

};
