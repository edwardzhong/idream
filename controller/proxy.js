const { request, htmlEncode } = require('../common/util');
const log = require('../common/logger');

module.exports = async function (ctx, next) {
	let form = ctx.request.body;
	if (ctx.session && ctx.session.user) {
		form.token = ctx.session.user.token;
	}
	try {
		let ret = await request(form);
		ctx.body = await JSON.parse(ret);
	} catch (err) {
		err.form = form;
		err.message = err.message.substr(0, 500);
		log.error(err);
		ctx.body = await { code: 500, msg: htmlEncode(err.message.substr(0, 200)) };
	}
};
