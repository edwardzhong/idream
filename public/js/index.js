
var FeedID=0,
    storage=new Storage('addArticle');

function restoreData(){
    var obj = storage.get();
    if(obj&&obj.title){
        $('#title').val(obj.title);
        $('#content').html(obj.content);
        $('#editImgs').html(obj.imgs);
        $('#tag').val(obj.tags);
        $('.edit-wrap').find('span').hide();
    }
}

function autoSave(){
    function save(){
        var title=$.trim($('#title').val()),
            content=$.trim($('#content').html()),
            imgs=$('#editImgs').html(),
            tags=$.trim($('#tag').val());
        if(title&&content){
            storage.save({
                title:title,
                content:content,
                imgs:imgs,
                tags:tags
            });
        }
        setTimeout(save, 50000);
    }
    setTimeout(save, 50000);
}

restoreData();
autoSave();


//简单事件绑定
function bindEvents() {
    $('#editImgs').on('click', 'i', function(e) {
        var that = $(this);
        showDialog('确定删除?', function() {
            that.parent().remove();
        });
    });
    $('#addTag').on('click',function(e){
        $('#tag').toggle();
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

    // 标题超过10个中文变红
    $('#title').on(changeEvent, function(e) {
        var val = this.value,
            num = 0;
        for (var i = 0; i < val.length; i++) {
            if (/[\u4e00-\u9fa5]/.test(val.charAt(i))) {
                num++;
            }
        }
        if (num > 15) {
            $(this).addClass('warn')
        } else {
            $(this).removeClass('warn');
        }
    });

    //文章提交事件
    $('#submit').on('click', function() {
        // todo: 文章表单提交
        var title=$('#title'),
            content=$('#content'),
            imgs=[],
            tags=$('#tag').val();

        if(!$.trim(title.val())){
            title.addClass('warn');
            showDialog({txt:'标题不能为空',confirm:'确认'},function(){
                title.focus();
            });
            return;
        }
        title.removeClass('warn');

        if(!$.trim(content.html())){
            content.addClass('warn');
            showDialog({txt:'内容不能为空',confirm:'确认'},function(){
                content.focus();
            });
            return;
        }
        content.removeClass('warn');
        $('#editImgs').find('img').each(function(i,item){
            imgs.push(item.src);
        });
        $('#loading').show();
        sendFn({
            r:'/user/publish',
            title:title.val(),
            content:content.html(),
            img_url:imgs.join(','),
            tags:tags
        },function(ret){
            $('#loading').hide();
            storage.clear();
            if(ret.code == 200){
                location.reload();
            } else {
                showDialog({txt:ret.msg,confirm:'确认'});
            }
        });
    });

    $('.article-list,.view-article').on('click', '[data-tag]', function(e) {
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

uploadImage();
setCopyUrl();
bindEvents();
scrollPage({r:'/user/get-user-home',pagehas_img:HasImg||''});


