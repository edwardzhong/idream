const http = require('http');
const qs = require('querystring');
const config = require('../config/app');
const proxy = config.proxy;
// const log = require('../common/logger');

/**
 * http get
 * @param  {String} url 
 */
function get(url) {
    return new Promise((resolve, reject) => {
        let body = '';
        http.get(url, res => {
            res.on('data', data => {
                body += data;
            });

            res.on('end', () => {
                resolve(body);
            }).on('error', err => {
                reject(err)
            });
        });
    });
}

/**
 * http request
 * @param  {Object} form 
 */
function request(form) {
    let postData = qs.stringify(form),
        options = {
            hostname: proxy.host,
            port: proxy.port,
            path: proxy.path + '?r=' + decodeURIComponent(form.r),
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        },
        body = '';

    return new Promise((resolve, reject) => {
        let req = http.request(options, res => {
            res.setEncoding('utf8');
            res.on('data', chunk => {
                body += chunk;
            });
            res.on('end', () => {
                let firstCode = body.charCodeAt(0);
                if (firstCode != 123) {
                    reject(new Error('server return unexpect data: ' + body));
                }
                resolve(body);
            });
        });

        req.on('error', err => {
            reject(err)
        });

        // post form
        req.write(postData);
        req.end();
    });
}

function initUser(user) {
    let gender = { '0': '不详', '1': '男', '2': '女', '3': '男男', '4': '女女', '5': '异性', '6': '双性', '7': '无性' };
    user.avatar = user.avatar || '/img/avatar.jpg';
    user.uname = user.uname || '未命名';
    user.sex = gender['' + user.sex];
    user.age = user.age;
    user.feed_count = user.feed_count == 0 ? '' : user.feed_count;
    user.feed_image_count = user.feed_image_count == 0 ? '' : user.feed_image_count;
    user.job = user.job == 0 ? '未知' : user.job;
    user.location = user.location || '未知';
    return user;
}

function initList(list, kw) {
    return list.map(i => {
        i.avatar = i.avatar || '/img/avatar.jpg';
        i.digg_count = i.digg_count == 0 ? '' : i.digg_count;
        i.comment_count = i.comment_count == 0 ? '' : i.comment_count;
        i.host = config.url;
        if (i.content) {
            i.content = i.content.replace(/(^|.+?)\#([^\<\>\s\n]+)/g, (a, b, c) => {
                let mstr = c.replace('&nbsp;', '').replace(/^\s+|\s+$/, ''),
                    act = (kw && kw == mstr) ? true : false;
                return b + '<a href="' + (act ? 'javascript:;' : '/topic/' + mstr) + '" class="topic' + (act ? ' active' : '') + '">#' + mstr + '</a>';
            });
        }
        if (i.review_content) {
            i.review_content = i.review_content.replace(/(^|.+?)\#([^\<\>\s\n]+)/g, (a, b, c) => {
                let mstr = c.replace(/^\s+|\s+$/, ''),
                    act = (kw && kw == mstr) ? true : false;
                return b + '<a href="' + (act ? 'javascript:;' : '/topic/' + mstr) + '" class="topic' + (act ? ' active' : '') + '">#' + mstr + '</a>';
            });
        }
        return i;
    });
}

/**
 * html encode
 * html转码
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
function htmlEncode(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/ /g, '&nbsp;')
        .replace(/\'/g, '&#39;')
        .replace(/\"/g, '&quot;');
}

/**
 * html decode
 * html解码
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
function htmlDecode(str) {
    if (!str) return '';
    return str.replace(/&amp;/g, "&")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#39;/g, '\'')
        .replace(/&quot;/g, '\"');
}

module.exports = {
    get,
    request,
    initUser,
    initList,
    htmlEncode,
    htmlDecode
};
