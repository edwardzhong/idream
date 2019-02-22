var FeedID=0,
    match=location.pathname.match(/\/tag\/\d+\/([^\/]+)/),
    TagName=(match&&match[1])||'';

//简单事件绑定
function bindEvents() {
    $('[data-tag=black]').on('click',function(e){
        var that=$(this),
            txt=that.html();

        if(txt=='加入黑名单'){
            //todo：加入黑名单
            showDialog({txt:'已添加黑名单',confirm:'确认'});
            sendFn({
                r:'/userset/set-black',
                black_uid:UID
            },function(ret){
                $('#loading').hide();
                if(ret.code == 200){
                    that.html('解除黑名单');
                    console.log(ret);
                } else {
                    showDialog({txt:ret.msg,confirm:'确认'});  
                }
            });
        } else {
            //todo：解除黑名单
            showDialog({txt:'已解除黑名单',confirm:'确认'});
            sendFn({
                r:'/userset/del-black',
                black_uid:UID
            },function(ret){
                $('#loading').hide();
                if(ret.code == 200){
                    that.html('加入黑名单');
                    console.log(ret);
                } else {
                    showDialog({txt:ret.msg,confirm:'确认'});  
                }
            });
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
    $('.article-list li').on('click', '.text', function() {
        $(this).addClass('show');
    });

    $('.article-list li').on('dblclick', '.text', function() {
        $(this).removeClass('show');
    });

    $('#comment').on('click', '.close', function(e) {
        e.stopPropagation();
        $(this).parent().hide();
        $('#overlay').hide();
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
            case 'delete': //删除事件
                var that = $(this);
                showDialog('确定删除?', function() {
                    // todo: 删除
                    sendFn({
                        r: '/user/del',
                        feed_id: fid
                    }, function(ret) {
                        if (ret.code == 200) {
                            if (that.parents('ul').length) {
                                that.parentsUntil('ul').remove();
                            }
                            if(!$('.article-list').children('li').length){
                                location.href='/';
                            }
                        } else {
                            showDialog({ txt: ret.msg, confirm: '确认' });
                        }
                    });
                });
                break;
            case 'private': //私密
                hideDialogs();
                var that=$(this),
                    pri=that.parentsUntil('.actions').siblings('.private'),
                    showType=Number(that.data('type'));
                //todo:私密
                sendFn({
                    r:'/feed/set-feed-secret',
                    feed_id:fid,
                    show_type:3-showType
                },function(ret){
                    if(ret.code == 200){
                        pri.toggle();
                        that.data('type',3-showType);
                        that.html(['设为公开','设为私密'][showType-1]);
                    } else {
                        showDialog({txt:ret.msg,confirm:'确认'});  
                    }
                });
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
scrollPage({ r:'/user/get-tag-feed-list',uid:UID,tag_name: TagName});

