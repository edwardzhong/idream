var FeedID=0;


//简单事件绑定
function bindEvents() {
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
            case 'up'://点赞
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
            case 'delete': //删除事件
                var that = $(this);
                showDialog('确定删除?', function() {
                    // todo: 删除
                    sendFn({
                        r:'/user/del',
                        feed_id:fid
                    },function(ret){
                        if(ret.code == 200){
                            if (that.parents('ul').length) {
                                that.parentsUntil('ul').remove();
                            }
                        } else {
                            showDialog({txt:ret.msg,confirm:'确认'});  
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
            case 'collect': //收藏
                // todo: 收藏
                hideDialogs();
                showDialog({txt:'已收藏',confirm:'确认'});
                break;
            case 'copy': //复制
                break;
            case 'comment': //评论
                var wrap=$(this).parents('.dream-wrap'),
                    userNames = wrap.find('.title span'),
                    l=wrap.offset().left,
                    w=wrap.width();
                showComment(userNames,l,w);
                FeedID=fid;
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

var isLoading = false, //是否正在加载
    pageNo = 1,
    isOver = FirstCount >= PageTotal;

function scrollPage(opt) {
    $('.middle').on('scroll', function(e) {
        var options = { page: pageNo+1, page_size: PageSize },
            list = $('.article-list'),
            tpl = $('#liTemp').html(),
            posTop = list.outerHeight(),
            mt = $(this).offset().top,
            mh = $(window).height(),
            st = $(this).scrollTop();
        $.extend(options, opt);
        if (isLoading || isOver) return;
        if (mh + st > posTop - 100) {
            isLoading = true;
            sendFn(options, function(ret) {
                console.log(ret);
                isLoading = false;
                if (ret.code == 200) {
                    if (ret.data && ret.data.feed && ret.data.feed.length) {
                        PageTotal = Number(ret.data.count);
                        if(pageNo * PageSize + ret.data.feed.length >= PageTotal){
                            isOver=true;
                        } else {
                            isOver=false;
                        }
                        pageNo++;
                        var feeds = ret.data.feed, lis = [], li = '';
                        feeds = initList(feeds);
                        feeds.forEach(function(item, i) {
                            item.content = replaceTopic(item.content,Topic);
                            li = tpl.replace(/\(avatar\)/, item.avatar)
                                .replace(/\(uid\)/g, item.uid)
                                .replace(/\(publish_time\)/, item.publish_time)
                                .replace(/\(feed_id\)/g, item.feed_id)
                                .replace(/\(uname\)/g, item.uname)
                                .replace(/\(title\)/g, item.title)
                                .replace(/\(content\)/, item.content)
                                .replace(/\(digg_count\)/, item.digg_count)
                                .replace(/\(comment_count\)/, item.comment_count)
                                .replace(/\(show_type\)/, item.show_type||'');
                            if (item.imgInfo && item.imgInfo.length) {
                                var imgs = [];
                                item.imgInfo.forEach(function(img) {
                                    imgs.push('<div class="img"><img src="' + img + '" alt="avatar"></div>');
                                });
                                li = li.replace(/\(imgs\)/, imgs.join(''));
                            } else {
                                li = li.replace(/\(imgs\)/, '');
                            }
                            if(item.has_digg==1){
                                li =li.replace(/\(has_digg\)/,'active');
                            } else {
                                li =li.replace(/\(has_digg\)/,'');
                            }
                            if(item.is_me == 1){
                                li =li.replace(/\(mstyle\)/,'inline');
                            } else {
                                li =li.replace(/\(mstyle\)/,'none');
                            }
                            if(item.show_type && item.show_type == 2){
                                li =li.replace(/\(pstyle\)/,'inline').replace(/\(ptxt\)/,'公开');
                            } else {
                                li =li.replace(/\(pstyle\)/,'none').replace(/\(ptxt\)/,'私密');
                            }
                            lis.push(li);
                        });
                        list.append(lis.join(''));
                        setCopyUrl();
                        $('.article-list li').off();
                        setContent();
                    }
                } else {
                    showDialog({txt:ret.msg,confirm:'确认'});  
                }
            });
        }
    });
}

setCopyUrl();
bindEvents();
scrollPage({r:'/user/get-topic-list',topic_name:Topic});

