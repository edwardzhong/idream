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
            isNew: user.unread_count ? true : false,
            user: user,
            self: user,
            list: list,
            count: list.length,
            total: Number(listRet.data.count)
        };
        Object.assign(data, globleConfig);
        ctx.body = await ctx.render(name ? name : 'index', data);
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
    let selfForm = { r: '/user/get-user-info' }
    userForm = { r: '/user/get-user-info', uid: id },
        listForm = { r: '/user/get-user-home', uid: id, page_size: config.pageSize },
        self = {},
        user = {},
        list = [],
        total = 0,
        data = { isLogin: false, isNew: false };

    if (name) { listForm.has_img = 2; }
    try {
        if (ctx.session && ctx.session.user) {
            data.isLogin = true;
            selfForm.token = ctx.session.user.token;
            userForm.token = ctx.session.user.token;
            listForm.token = ctx.session.user.token;
            if (ctx.session.user.uid == id) { //与当前登录用户id相同
                return ctx.redirect(name ? '/picture' : '/');
            } else {
                let selfRet = await request(selfForm);
                selfRet = JSON.parse(selfRet);
                if (selfRet.code != 200) { log.warn(selfRet); }
                Object.assign(self, selfRet.data);
                self = initUser(self);
            }
        }
        let ret = await Promise.all([request(userForm), request(listForm)]), //并行请求
            userRet = JSON.parse(ret[0]),
            listRet = JSON.parse(ret[1]);

        if(userRet.data.is_show==2){
            return ctx.redirect('/private');
        }
        if(userRet.data.black_list){
            if(userRet.data.black_list.some(i=>{return self.uid && i.uid == self.uid})){
                return ctx.redirect('/black');
            }
        }
        if (userRet.code != 200) { log.warn(userRet); }
        if (listRet.code != 200) { log.warn(listRet); }
        Object.assign(user, userRet.data);
        if (listRet.data && listRet.data.feed) {
            Object.assign(list, listRet.data.feed);
            total = Number(listRet.data.count || 0);
        }

        user = initUser(user);
        list = initList(list);
        if (!self.uid) { Object.assign(self, user); }
        Object.assign(data, {
            isOther: true,
            isNew: self.unread_count ? true : false,
            self: self,
            user: user,
            list: list,
            count: list.length,
            total: total
        }, globleConfig);
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
 * tag list
 */
exports.tag = async function(ctx, next) {
    let uid = ctx.params.uid,
        tag = ctx.params.tag,
        selfForm = { r: '/user/get-user-info' },
        userForm = { r: '/user/get-user-info', uid: uid },
        listForm = { r: '/user/get-tag-feed-list', uid: uid, tag_name: tag, page_size: config.pageSize },
        user = {},
        self = {},
        list = [];
        total = 0,
        data = { isLogin: false, isNew: false };

    if (!uid || !tag) return;
    try {
        if (ctx.session && ctx.session.user) {
            data.isLogin = true;
            selfForm.token = ctx.session.user.token;
            userForm.token = ctx.session.user.token;
            listForm.token = ctx.session.user.token;
            if (ctx.session.user.uid == uid) { //访问的是当前用户
                data.isSelf = true;
            } else {
                data.isOther = true;
                let selfRet = await request(selfForm);
                selfRet = JSON.parse(selfRet);
                Object.assign(self, selfRet.data);
                self = initUser(self);
            }
        } else {
            data.isOther = true;
        }

        let ret = await Promise.all([request(userForm), request(listForm)]),
            userRet = JSON.parse(ret[0]),
            listRet = JSON.parse(ret[1]);
        if(userRet.data.is_show==2){
            return ctx.redirect('/private');
        }
        if(userRet.data.black_list){
            if(userRet.data.black_list.some(i=>{return self.uid && i.uid == self.uid})){
                return ctx.redirect('/black');
            }
        }
        if (userRet.code != 200) { log.warn(userRet); }
        if (listRet.code != 200) { log.warn(listRet); }
        Object.assign(user, userRet.data);
        if (listRet.data && listRet.data.feed) {
            Object.assign(list, listRet.data.feed);
            total = Number(listRet.data.count || 0);
        }

        user = initUser(user);
        list = initList(list);
        if (!self.uid) { Object.assign(self, user); }
        Object.assign(data, {
            tagName: tag,
            isNew: self.unread_count ? true : false,
            self: self,
            user: user,
            list: list,
            count: list.length,
            total: total
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
                self: user,
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
        selfForm = { r: '/user/get-user-info' },
        form = { r: '/feed/feed-info', feed_id: id },
        self = {},
        user = {},
        data = { isLogin: false };

    if (!id) return;
    if (ctx.session && ctx.session.user) {
        data.isLogin = true;
        selfForm.token = ctx.session.user.token;
        form.token = ctx.session.user.token;
    }
    try {
        let ret = await request(form);
        ret = JSON.parse(ret);
        if (ret.code != 200) { log.warn(ret); }
        Object.assign(user, ret.data.user);
        user = initUser(user);
        if (ctx.session.user && ctx.session.user.uid == user.uid) { //当前用户的文章
            data.isSelf = true;
        } else {
            let selfRet = await request(selfForm);
            selfRet = JSON.parse(selfRet);
            Object.assign(self, selfRet.data);
            self = initUser(self);
            data.isOther = true;
        }
        if(user.is_show==2){
            return ctx.redirect('/private');
        }
        if(user.black_list){
            if(user.black_list.some(i=>{return self.uid && i.uid == self.uid})){
                return ctx.redirect('/black');
            }
        }
        if (!self.uid) { Object.assign(self, user); }
        Object.assign(data, {
            isNew: self.unread_count ? true : false,
            self: self,
            user: user,
            article: ret.data.info,
            comments: ret.data.review
        }, globleConfig);

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
 * explore
 */
exports.explore = async function(ctx, next) {
    let form = { r: '/feed/explore', page_size: config.pageSize },
        selfForm = { r: '/user/get-user-info' },
        self = {},
        list = [],
        total = 0,
        data = { isLogin: false, isExplore: true, isNew: false };
    if (!ctx.session || !ctx.session.user) {
        return ctx.redirect('/login');
    }
    data.isLogin = true;
    form.token = ctx.session.user.token;
    selfForm.token = ctx.session.user.token;
    try {
        let ret = await Promise.all([request(selfForm), request(form)]),
            selfRet = JSON.parse(ret[0]),
            listRet = JSON.parse(ret[1]);

        if (selfRet.code != 200) { log.warn(selfRet); }
        Object.assign(self, selfRet.data);
        if (listRet.code != 200) { log.warn(listRet); }
        if (listRet.data && listRet.data.data) {
            Object.assign(list, listRet.data.data);
            total = Number(listRet.data.count || 0);
        }

        list = initList(list);
        self = initUser(self);
        Object.assign(data, {
            isNew: self.unread_count ? true : false,
            self: self,
            list: list,
            count: list.length,
            total: total
        }, globleConfig);

        ctx.body = await ctx.render('explore', data);
    } catch (err) {
        log.error(selfForm);
        log.error(form);
        log.error(err.message.substr(0, 500));
        ctx.status = 500;
        ctx.statusText = 'Internal Server Error';
        ctx.res.end(err.message);
    }
};

/**
 * notice
 */
exports.notice = async function(ctx, next) {
    if (!ctx.session || !ctx.session.user) {
        return ctx.redirect('/login');
    }
    let selfForm = { r: '/user/get-user-info', token: ctx.session.user.token },
        listForm = { r: '/user/get-user-msg', page_size: config.pageSize, token: ctx.session.user.token },
        self = {},
        total=0,
        list = [];
    try {
        let ret=await Promise.all([request(selfForm),request(listForm)]),
            selfRet=JSON.parse(ret[0]),
            listRet=JSON.parse(ret[1]);
        if(selfRet.code!=200){log.warn(selfRet);}
        if(listRet.code!=200){log.warn(listRet);}
        Object.assign(self,selfRet.data);
        if (listRet.data && listRet.data.data) {
            Object.assign(list, listRet.data.data);
            total = Number(listRet.data.count || 0);
        }
        list = initList(list);
        self = initUser(self);

        let data = {
            isNotice:true,
            isLogin: true,
            // isNew: self.unread_count ? true : false,
            isNew: false,
            self: self,
            list: list,
            count: list.length,
            total: total
        };
        Object.assign(data, globleConfig);
        ctx.body = await ctx.render('notice', data);
    } catch (err) {
        log.error(selfForm);
        log.error(listForm);
        log.error(err.message.substr(0, 500));
        ctx.status = 500;
        ctx.statusText = 'Internal Server Error';
        ctx.res.end(err.message);
    }
};
