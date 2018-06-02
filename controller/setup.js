const { request,initUser } = require('../common/util');
const log = require('../common/logger');
const config = require('../config/app');
var globleConfig = {
    host: config.url,
    pageSize: config.pageSize
};


/**
 * profile
 */
exports.profile = async function(ctx, next) {
    return resProfile(ctx,next);
};

/**
 * setup
 */
exports.setup=async function(ctx,next){
    return resProfile(ctx,next,'setup');
}

async function resProfile(ctx,next,name){
    if (!ctx.session || !ctx.session.user) {
        return ctx.redirect('/login');
    }
    let selfForm = { r: '/user/get-user-info', token: ctx.session.user.token },
        self = {},
        user ={};
    try {
        let ret=await request(selfForm),
            selfRet=JSON.parse(ret);
        if(selfRet.code!=200){log.warn(selfRet);}
        Object.assign(self,selfRet.data);
        Object.assign(user,selfRet.data);

        self = initUser(self);

        let data = {
            isLogin: true,
            isSelf:true,
            isNew: self.unread_count ? true : false,
            self: self,
            user: self,
            ruser: user,
            count: 0,
            total: 0
        };
        Object.assign(data, globleConfig);
        ctx.body = await ctx.render(name?name:'profile', data);
    } catch (err) {
        log.error(selfForm);
        log.error(err.message.substr(0, 500));
        ctx.status = 500;
        ctx.statusText = 'Internal Server Error';
        ctx.res.end(err.message);
    }

}