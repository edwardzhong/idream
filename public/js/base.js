var changeEvent = 'oninput' in window ? 'input' : 'onpropertychange' in window ? 'propertychange' : 'keyup',
    env = getEnv();

// 判断环境
function getEnv() {
    var ua = navigator.userAgent.toLowerCase();
    if (/micromessenger(\/[\d\.]+)*/.test(ua)) {
        return "weixin";
    } else if (/qq\/(\/[\d\.]+)*/.test(ua) || /qzone\//.test(ua)) {
        return "qq";
    } else if(ua.indexOf("firefox") > -1){
        return "ff";
    } else if(ua.indexOf("safari") > -1){
        return "safari"
    } else {
        return 'h5';
    }
}

/**
 * 弹窗
 * 简单用法   showDialog(‘确定吗?’,fn)
 * 自定义文字 showDialog({
 *           txt:'确定吗?',
 *           confirm:'确定',
 *           cancel:'放弃'
 *          },confirmFn,cancelFn)
 *         
 * @param  {String/Object} opt 
 * @param  {Function} confirm 确认回调
 * @param  {Function} cancel  取消回调
 */
function showDialog(opt, confirm, cancel) {
    var isStr = typeof opt == 'string',
        txt = isStr ? opt : opt.txt,
        ytxt = isStr ? '确定' : opt.confirm,
        ctxt = isStr ? '取消' : opt.cancel||'',
        tpl = '<div class="dialog">'
        // +'<div class="close">×</div>'
        + '<div class="dialog-text">' + '<p>{txt}</p>' + '</div>' + '<div class="dialog-footer">' 
        + '<a href="javascript:;" class="confirm">{confirm}</a>' 
        + (ctxt?'<a href="javascript:;" class="cancel">{cancel}</a>':''); 
        + '</div>' 
        + '</div>',
        html = $(tpl.replace('{txt}', txt).replace('{confirm}', ytxt).replace('{cancel}', ctxt));

    $('#overlay').show();
    $(document.body).append(html);
    html.find('.confirm').on('click', function(e) {
        e.stopPropagation();
        confirm && confirm();
        $('#overlay').hide();
        html.remove();
        $('.dialog').remove();
    });
    html.find('.cancel').on('click', function(e) {
        e.stopPropagation();
        cancel && cancel();
        $('#overlay').hide();
        html.remove();
    });
}


$('.edit-div').each(function(i,item){
    if(env=='weixin'||env=='safari'){
        $(item).css('-webkit-user-select', 'auto');
    }
    var txt=$(item).attr('placeholder');
    if(txt){
        $(item).wrap('<div class="edit-wrap"></div>');
        $(item).parent().append('<span>'+txt+'</span>');
        $(item).on(changeEvent,setPlaceholder);
        setPlaceholder.call(item);
    }
});

$('#setUp').mouseenter(function(event) {
    $('#setMenu').show();
}).mouseleave(function(event) {
    $('#setMenu').hide();
});
    

function setPlaceholder(){
    if($(this).html()){
        $(this).siblings('span').hide();
    } else {
        $(this).siblings('span').show();
    }    
}

//需要关闭的层
function hideDialogs() {
    $('.down-tip').hide();
    $('#search').find('.tip').hide();
}

$(document.body).on('click', function() {
    hideDialogs();
});

$('#scrollPos').on('click', function(e) {
    e.stopPropagation();
    $('.middle').scrollTop(0);
}).on('dblclick', function(e) {
    e.stopPropagation();
    var t=$('.middle')[0].scrollHeight;
    $('.middle').scrollTop(t);
});

//退出账户
$('#logOut').on('click', function(e) {
    e.stopPropagation();
    showDialog('退出账户?', function() {
        sendFn({r:'/login/signout'},function(ret){
            location.href='/login';
        },{url:'/logout'});
    });
});

//设置图片位置
function setImgPosition(imgWrap, img, load) {
    var w = 0,
        h = 0,
        l = 0,
        t = 0,
        wrapWidth = imgWrap.width(),
        wrapHeight = imgWrap.height();

    function set(){
        w = img.width;
        h = img.height;

        if (w / h > wrapWidth / wrapHeight) { //宽度大于高度
            img.style.height = '100%';
            l = (wrapHeight / h * w - wrapWidth) / 2;
            imgWrap.scrollLeft(l);
        } else {
            img.style.width = '100%';
            t = (wrapWidth / w * h - wrapHeight) / 2;
            imgWrap.scrollTop(t);
        }
    }

    if(load){
        try{
            set();
        }catch(e){}        
    } else {
        img.onload = function() {
            set();
            pic = null;
        };
    }
}

//设置复制
function setCopyUrl(){
    var btns = $('[data-tag=copy]');
        btns.each(function(i,item){
        var clipboard = new ClipboardJS(item);
        clipboard.on('success', function(e) {
            $(item).parent().parent().hide();
            showDialog({txt:'链接已经复制到剪贴板',confirm:'确认'});
        });

        clipboard.on('error', function(e) {
            console.log(e);
        });
    });
}

function showDownMenu(menu,icon){
    var l = icon.position().left;
    menu.removeClass('down').css('top','26px');
    if($(window).height()-icon.offset().top<menu.height()){
        menu.css('top','-'+(menu.height()+10)+'px').addClass('down');
    }
    menu.css('left', l - 30).show();
}

function showComment(names,l,w) {
    var com = $('#comment');
    com.find('p').empty();
    $('#overlay').show();
    if (names.length) {
        com.find('p').html('回复 | ' + names.first().html());
    }
    com.css({left:l, width:w});
    $('#commentText').empty().focus();
    com.show();
    setTimeout(function() {
       $('#commentText').empty().focus(); 
    }, 300);
}

//二维码浮层
function showWX(opt) {
    var popup = $('.wxshare-popup');

    generateCode(opt.sUrl);
    $(document.body).css('overflow', 'hidden');
    $('#overlay').show();
    popup.show();
    popup.find('.close').on('click', hideWX);

    function hideWX(e) {
        e.stopPropagation();
        $('#overlay').hide();
        $(document.body).css('overflow', '');
        popup.hide();
    }
}

function generateCode(url) {
    $('#qrcode').empty();
    var qrcode = new QRCode('qrcode', {
        text: url,
        width: 200,
        height: 200,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
    });
}

//分享浮层
function showShareOverlay() {
    var overlay = $('<div class="share-overlay"><i class="share-arrow"></i><p class="share-tip">分享给好友&nbsp;</p></div>');
    $(document.body).css('overflow', 'hidden').append(overlay);

    overlay.on('click', function(e) {
        e.stopPropagation();
        $(document.body).css('overflow', '');
        overlay.remove();
    });
}

//获取分享信息
function getShareOpts() {
    var self = $(this),
        url = self.parent().attr('data-url') || '',
        article = self.parents('.view-article,.dream-wrap'),
        src = article.find('img').length ? article.find('img')[0].src : '';
    return {
        url: location.protocol + '//' + location.host,
        sUrl: location.protocol + '//' + location.host + url,
        sPic: src,
        sTitle: article.find('h3').html(),
        sDesc: article.find('p').html().substr(0, 150)
    };
}

//产生分享链接
function generate(url, opts) {
    var url = url.replace(/\(sUrl\)/g, encodeURI(opts.sUrl))
        .replace(/\(sTitle\)/g, opts.sTitle)
        .replace(/\(sDesc\)/g, opts.sDesc)
        .replace(/\(sPic\)/g, encodeURIComponent(opts.sPic))
        .replace(/\(url\)/g, encodeURIComponent(opts.url));

    window.open(url);
}

function showShare() {
    if (env == 'weixin' || env == 'qq') {
        showShareOverlay();
        return true;
    }
    return false;
}

//上传图片配置
function uploadImage() {
    var pic = null;
    $('#editImgs').on('click', 'img', function(e) {
        pic = this;
        $('#replaceUpload').trigger('click');
    });

    $('#uploadFile').on('change', 'input', uploadFile);

    $('#replaceUpload').on('change', function(e) {
        uploadFile(e, pic);
    });
}

function replaceInput() {
    $('#uploadFile').find('input').remove();
    $('#uploadFile').append('<input type="file" name="file">');
}

//上传图片
function uploadFile(e, pic) {
    var file = e.target.files[0],
        fSize = file.size,
        fType = file.type,
        fr;

    if (['image/jpg', 'image/jpeg', 'image/png'].indexOf(fType) < 0) {
        showDialog({txt:'只能上传jpg和png格式的图片',confirm:'确认'});
        return;
    }
    if (fSize > 2 * 1024 * 1024) { //不能大于2M
        showDialog({txt:'您上传的图片太大了，不能超过2M哦！',confirm:'确认'});
        return;
    }
    if (window.FileReader) {
        fr = new FileReader();
        //加载完成后显示图片
        fr.onloadend = function(e) {
            var wrap, img;
            if (pic) {
                img = pic;
                img.src = e.target.result;
                wrap = $(pic).parent();
                reqUploadImg(e.target.result,function(src){
                    img.src=src; 
                    setImgPosition(wrap, img);
                });
            } else {
                var img = new Image(),
                    imgHtml = '<div class="img-wrap"><i class="icon-minus-circled" title="删除"></i><div class="img"></div></div>';

                img.src = e.target.result;
                wrap = $(imgHtml);
                wrap.find('.img').append(img);
                $('#editImgs').append(wrap);
                reqUploadImg(e.target.result,function(src){
                    img.src=src;
                    setImgPosition(wrap.find('.img'), img);
                });
                replaceInput();
            }
        };
        fr.readAsDataURL(file);
    } else {
        showDialog({txt:'浏览器不支持上传',confirm:'确认'});
    }
}

//上传到公共api
function reqUploadImg(img,cb){
    sendFn({r:'/login/upload-img',img:img},function(ret){
        if(ret.code==200&&ret.data&&ret.data.url){
            cb(ret.data.url);
        }
    }); 
}

function sendFn(data,succFn,opt){
	var options={
    	url:'/api',
    	type:'POST',
    	dataType:'json',
    	success:function(ret){
            $('#loading').hide();
    		showDialog({txt:ret.msg,confirm:'确认'});
    		console.log(ret);
    	},
    	error:function(err){
            $('#loading').hide();
    		showDialog({txt:'服务器错误,请稍后再试',confirm:'确认'});
			console.log(err);
    	}
    };
    if(opt){
    	$.extend(options,opt);
    }
	$.extend(options,{data:data,success:succFn});    
    $.ajax(options);
}

var Host=$('#host').val()||'',
    isLoading = false, //是否正在加载
    pageNo = 2;
function scrollPage(opt){
    $('.middle').on('scroll', function(e) {
        var options={page:pageNo},
            list = $('.article-list'),
            tpl=$('#liTemp').html(),
            posTop = list.outerHeight(),
            mt = $(this).offset().top,
            mh = $(window).height(),
            st = $(this).scrollTop();
        $.extend(options,opt);
        if (isLoading) return;
        if ( mh + st > posTop - 100 ) {
            isLoading = true;
            sendFn(options,function(ret){
                isLoading=false;
                if(ret.code == 200){
                    console.log(ret);
                    if(ret.data&&ret.data.feed&&ret.data.feed.length){
                        pageNo++;
                        var feeds=ret.data.feed,
                            lis=[],li='';
                        feeds=initList(feeds);
                        feeds.forEach(function(item,i){
                            li=tpl.replace(/\(avatar\)/,item.avatar)
                                .replace(/\(publish_time\)/,item.publish_time)
                                .replace(/\(feed_id\)/g,item.feed_id)
                                .replace(/\(uname\)/g,item.uname)
                                .replace(/\(title\)/g,item.title)
                                .replace(/\(content\)/,item.content)
                                .replace(/\(digg_count\)/,item.digg_count)
                                .replace(/\(comment_count\)/,item.comment_count)
                                .replace(/\(host\)/g,item.host);
                            if(item.imgInfo&&item.imgInfo.length){
                                var imgs=[];
                                item.imgInfo.forEach(function(img){
                                    imgs.push('<div class="img"><img src="'+img+'" alt="avatar"></div>');    
                                });
                                li=li.replace(/\(imgs\)/,imgs.join(''));
                            } else {
                                li=li.replace(/\(imgs\)/,'');
                            }
                            lis.push(li);
                        });
                        list.append(lis.join(''));
                    }
                } else {
                    // showDialog({txt:ret.msg,confirm:'确认'});  
                }
            });
        }
    });
}

function initList(list){
    return list.map(function(i){
        i.avatar=i.avatar||'/img/avatar.jpg';
        i.digg_count=i.digg_count==0?'':i.digg_count;
        i.comment_count=i.comment_count==0?'':i.comment_count;
        i.host=Host;
        return i;
    });
}

function setHeader() {
    var inner = $('.header .inner'),
        w = ($(window).width() - inner.width()) / 2;
    inner.css('marginLeft', w > 0 ? w : 0);
}

function setSearch(){
    var search=$('#search'),
        title=$('#scrollPos');
    if(search.length){
        search.width(title.width()/2-45);
    }
}

function setSearchNav(){
    var nav=$('#serachNav'),
        middle=$('.middle'),
        l=middle.offset().left,
        w=middle.width();
    if(nav.length){
        nav.css({
            left:l,
            width:w
        });
    }
}
function setTagWidth(){
    var act=$('#actions');
    if(act.length){
        act.find('.tags').width(act.width()-90);
    }
}

$(window).on('resize', function() {
    $('#blackMenu').hide();
    setHeader();
    setSearch();
    setSearchNav();
    setTagWidth();
});

setHeader();
setSearch();
setSearchNav();
setTagWidth();

