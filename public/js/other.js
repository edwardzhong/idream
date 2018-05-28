var FeedID=0,
    match=location.pathname.match(/\/(\d+)/),
    UID=(match&&match[1])||0;



//简单事件绑定
function bindEvents() {
    $('[data-tag=private]').on('click',function(e){
        var txt=$(this).html();
        // sendFn({
        //     r:'/userset/set-black',
        //     feed_id:fid
        // },function(ret){
        //     $('#loading').hide();
        //     if(ret.code == 200){
        //         $(this).toggleClass('active');
        //         console.log(ret);
        //     } else {
        //         showDialog({txt:ret.msg,confirm:'确认'});  
        //     }
        // });

        if(txt=='加入黑名单'){
            //todo：加入黑名单
            showDialog({txt:'已添加黑名单',confirm:'确认'});
            $(this).html('解除黑名单');
        } else {
            //todo：解除黑名单
            showDialog({txt:'已解除黑名单',confirm:'确认'});
            $(this).html('加入黑名单');
        }
    });

    $('#black i').on('click',function(e){
        e.stopPropagation();
        var l=$(this).offset().left,
            t=$(this).offset().top;
        $('#blackMenu').css({
            top:t+25,
            left:l-30
        }).toggle();        
    });
    $('.article-list li').on('click', 'p', function() {
        $(this).addClass('show');
    });

    $('.article-list li').on('dblclick', 'p', function() {
        $(this).removeClass('show');
    });

    $('#comment').on('click', '.close', function(e) {
        e.stopPropagation();
        $(this).parent().hide();
        $('#overlay').hide();
    });

    //评论提交事件
    $('#replyComment').on('click', function(e) {
        e.stopPropagation();
        // todo: 评论提交
        var commentText=$('#commentText');
        if(!$.trim(commentText.html())){
            commentText.addClass('flash');
            setTimeout(function() {
                commentText.removeClass('flash');
            }, 900);
            return;
        }
        $('#loading').show();
        $('#overlay').hide();
        $('#comment').hide();
        sendFn({
            r:'/feed/review',
            feed_id:FeedID,
            content:commentText.html()
        },function(ret){
            $('#loading').hide();
            if(ret.code == 200){
                location.reload();
                console.log(ret);
            } else {
                showDialog({txt:ret.msg,confirm:'确认'});  
            }
        });
    });

    $('.article-list').on('click', '[data-tag]', function(e) {
        e.stopPropagation();
        var that=$(this);
            name = that.data('tag'),
            fid =that.data('id'),
            opts = {};

        switch (name) {
            case 'up':
                sendFn({
                    r:'/feed/digg',
                    feed_id:fid
                },function(ret){
                    $('#loading').hide();
                    if(ret.code == 200){
                        that.toggleClass('active');
                        console.log(ret);
                    } else {
                        showDialog({txt:ret.msg,confirm:'确认'});  
                    }
                });
                break;
            case 'more': //更多图标
                hideDialogs();
                var menu=$(this).siblings('[data-menu=more]');
                showDownMenu(menu,$(this));
                break;
            case 'share': //分享图标
                hideDialogs();
                var menu=$(this).siblings('[data-menu=share]');
                showDownMenu(menu,$(this));
                break;
            case 'collect': //收藏
                hideDialogs();
                showDialog({txt:'已收藏',confirm:'确认'});
                // todo: 收藏
                break;
            case 'copy': //复制
                break;
            case 'comment': //评论
                var wrap=$(this).parents('.dream-wrap'),
                    userNames = wrap.find('.title span'),
                    l=wrap.offset().left,
                    w=wrap.width();
                FeedID=fid;
                showComment(userNames,l,w);
                break;
                /**
                 * sns分享
                 */
            case 'facebook':
                if (showShare()) break;
                generate('https://www.facebook.com/sharer/sharer.php?u=(sUrl)', getShareOpts.call(this))
                break;
            case 'weibo': //微博
                if (showShare()) break;
                generate('http://service.weibo.com/share/share.php?url=(sUrl)&title=(sTitle)&pic=(sPic)', getShareOpts.call(this))
                break;
            case 'douban': //豆瓣
                if (showShare()) break;
                generate('https://www.douban.com/share/service?image=(sPic)&href=(sUrl)&name=(sTitle)&text=(sDesc)', getShareOpts.call(this))
                break;
            case 'qq': //qq
                if (showShare()) break;
                generate('http://connect.qq.com/widget/shareqq/index.html?url=(sUrl)&title=(sTitle)&source=(sDesc)', getShareOpts.call(this))
                break;
            case 'wechat': //微信
                if (showShare()) break;
                showWX(getShareOpts.call(this));
                break;
            case 'whatsapp':
                if (showShare()) break;
                generate('whatsapp://send?text=(sDesc)' + encodeURIComponent('\n\n') + '(sUrl)&via=lopscoop', getShareOpts.call(this))
                break;
            default:
                break;
        }
    });
}
setCopyUrl();
bindEvents();
scrollPage({r:'/user/get-user-home',uid:UID});

