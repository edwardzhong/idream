const { request, initUser, initList } = require('../common/util');
const log = require('../common/logger');
const config = require('../config/app');
var globleConfig = {
    host: config.url,
    pageSize: config.pageSize
};

/**
 * home (my)
 */
exports.index = async function(ctx, next) {
    return resIndex(ctx, next);
};

/**
 * my picture
 */
exports.mypicture = async function(ctx, next) {
    return resIndex(ctx, next, 'picture');
};

async function resIndex(ctx, next, name) {
    if (!ctx.session || !ctx.session.user) {
        return ctx.redirect('/login');
    }
    let token = ctx.session.user.token,
        userForm = { r: '/user/get-user-info', token: token },
        listForm = { r: '/user/get-user-home', page_size: config.pageSize, token: token },
        user = {},
        list = [];
    if (name) { listForm.has_img = 2; }
    try {
        let ret = await Promise.all([request(userForm), request(listForm)]), //并行请求
            userRet = JSON.parse(ret[0]),
            listRet = JSON.parse(ret[1]);

        if (userRet.code != 200) { log.warn(userRet); }
        if (listRet.code != 200) { log.warn(listRet); }
        Object.assign(user, userRet.data);
        Object.assign(list, listRet.data.feed);
        user = initUser(user);
        list = initList(list);
        let data = {
            isSelf: true,
            isLogin: true,
            isNew: userRet.data.unread_count ? true : false,
            user: user,
            list: list,
            count: listRet.data.feed.length,
            total: listRet.data.count
        };
        Object.assign(data, globleConfig);
        ctx.body = await ctx.render(name ? name : 'index', data);
    } catch (err) {
        log.error(err.message.substr(0, 500));
        ctx.status = 500;
        ctx.statusText = 'Internal Server Error';
        ctx.res.end(err.message);
    }
}

/**
 * user
 */
exports.user = async function(ctx, next) {
    return resUser(ctx, next);
};

/**
 * user picture
 */
exports.picture = async function(ctx, next) {
    return resUser(ctx, next, 'picture');
};

async function resUser(ctx, next, name) {
    let id = ctx.params.id;
    if (!id) return;
    let userForm = { r: '/user/get-user-info', uid: id, token: '' },
        listForm = { r: '/user/get-user-home', uid: id, page_size: config.pageSize, token: '' },
        user = {},
        list = [],
        isLogin = false;

    if (name) { listForm.has_img = 2; }
    if (ctx.session && ctx.session.user) {
        if (ctx.session.user.uid == id) { //与当前登录用户id相同
            return ctx.redirect(name ? '/picture' : '/');
        }
        isLogin = true;
        userForm.token = ctx.session.user.token;
        listForm.token = ctx.session.user.token;
    }
    try {
        let ret = await Promise.all([request(userForm), request(listForm)]), //并行请求
            userRet = JSON.parse(ret[0]),
            listRet = JSON.parse(ret[1]);

        if (userRet.code != 200) { log.warn(userRet); }
        if (listRet.code != 200) { log.warn(listRet); }
        Object.assign(user, userRet.data);
        Object.assign(list, listRet.data.feed);
        user = initUser(user);
        list = initList(list);
        let data = {
            isOther: true,
            isNew: false,
            isLogin: isLogin,
            user: user,
            list: list,
            count: listRet.data.feed.length,
            total: listRet.data.count
        };
        Object.assign(data, globleConfig);
        ctx.body = await ctx.render(name ? name : 'user', data);
    } catch (err) {
        log.error(userForm);
        log.error(listForm);
        log.error(err.message.substr(0, 500));
        ctx.status = 500;
        ctx.statusText = 'Internal Server Error';
        ctx.res.end(err.message);
    }
}

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
            let data = {
                isSelf: true,
                isLogin: true,
                isNew: user.unread_count ? true : false,
                user: user,
                article: ret.data.info,
                tags: ret.data.tags
            };
            Object.assign(data, globleConfig);
            ctx.body = await ctx.render('edit', data);
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
        if (ctx.session.user && ctx.session.user.uid == user.uid) { //当前用户的文章
            Object.assign(data, { isSelf: true, isNew: user.unread_count ? true : false });
        } else {
            Object.assign(data, { isOther: true, isNew: false });
        }
        Object.assign(data, { user: user, article: ret.data.info, comments: ret.data.review }, globleConfig);
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
 * tag list
 */
exports.tag = async function(ctx, next) {
    let uid = ctx.params.uid,
        tag = ctx.params.tag,
        token = '',
        data={
            isLogin : false,
            isNew : false    
        };

    if (!uid || !tag) return;
    if (ctx.session && ctx.session.user) {
        data.isLogin = true;
        token = ctx.session.user.token;
        if (ctx.session.user.uid == uid) {
            data.isSelf = true;
        } else {
            data.isOther = true;
        }
    } else {
        data.isOther = true;
    }
    let userForm = { r: '/user/get-user-info', uid: uid, token: token },
        listForm = { r: '/user/get-tag-feed-list', uid: uid, tag_name: tag, page_size: config.pageSize, token: token },
        user = {},
        list = [];
    try {
        let ret = await Promise.all([request(userForm), request(listForm)]), //并行请求
            userRet = JSON.parse(ret[0]),
            listRet = JSON.parse(ret[1]);

        if (userRet.code != 200) { log.warn(userRet); }
        if (listRet.code != 200) { log.warn(listRet); }
        Object.assign(user, userRet.data);
        Object.assign(list, listRet.data.feed||[]);
        user = initUser(user);
        list = initList(list);
        if (data.isLogin && data.isSelf && user.unread_count) { data.isNew = true; }
        Object.assign(data, {
            tagName:tag,
            user: user,
            list: list,
            count: listRet.data.feed.length,
            total: listRet.data.count
        }, globleConfig);

        ctx.body = await ctx.render('tag', data);
    } catch (err) {
        log.error(userForm);
        log.error(listForm);
        log.error(err.message.substr(0, 500));
        ctx.status = 500;
        ctx.statusText = 'Internal Server Error';
        ctx.res.end(err.message);
    }
};
