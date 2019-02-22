const { request, initUser } = require('../common/util');
const log = require('../common/logger');
const config = require('../config/app');
const globleConfig = {
    host: config.url,
    pageSize: config.pageSize
};


/**
 * profile
 */
exports.profile = async function (ctx, next) {
    await resProfile(ctx, next);
};

/**
 * setup
 */
exports.setup = async function (ctx, next) {
    await resProfile(ctx, next, 'setup');
}

async function resProfile(ctx, next, name) {
    if (!ctx.session || !ctx.session.user) {
        return ctx.redirect('/login');
    }
    let selfForm = { r: '/user/get-user-info', token: ctx.session.user.token },
        self = {},
        user = {};
    try {
        let ret = await request(selfForm),
            selfRet = JSON.parse(ret);
        if (selfRet.code != 200) { log.warn(selfRet); }
        Object.assign(self, selfRet.data);
        Object.assign(user, selfRet.data);

        self = initUser(self);

        let data = {
            isLogin: true,
            isSelf: true,
            isNew: self.unread_count ? true : false,
            self: self,
            user: self,
            ruser: user,
            count: 0,
            total: 0
        };
        Object.assign(data, globleConfig);
        ctx.body = await ctx.render(name ? name : 'profile', data);
    } catch (err) {
        let e = err;
        Object.assign(e, {
            message: err.message.substr(0, 500),
            selfForm: selfForm
        });
        ctx.throw(e);
    }

}

/**
 * private
 */
exports.private = async function (ctx, next) {
    await resForbit(ctx, next);
}

/**
 * forbit
 */
exports.black = async function (ctx, next) {
    await resForbit(ctx, next, true);
};

async function resForbit(ctx, next, isBlack) {
    if (!ctx.session || !ctx.session.user) {
        return ctx.redirect('/login');
    }
    let selfForm = { r: '/user/get-user-info', token: ctx.session.user.token },
        self = {};
    try {
        let ret = await request(selfForm),
            selfRet = JSON.parse(ret);
        if (selfRet.code != 200) { log.warn(selfRet); }
        Object.assign(self, selfRet.data);

        self = initUser(self);

        let data = {
            isLogin: true,
            isBlack: !!isBlack,
            isNew: self.unread_count ? true : false,
            self: self,
            user: self,
            count: 0,
            total: 0
        };
        Object.assign(data, globleConfig);
        ctx.body = await ctx.render('forbit', data);
    } catch (err) {
        let e = err;
        Object.assign(e, {
            message: err.message.substr(0, 500),
            selfForm: selfForm,
        });
        ctx.throw(e);
    }
};


