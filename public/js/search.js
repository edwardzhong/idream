    var firstLoad=true,
        Actions={
            dream:function(){},
            user:function(){},
            picture:function(){},
            my:function(){}
        };
        
    function selectHash(hash){
        if (location.hash.substr(1) != hash) {
            location.hash = hash;
            return;
        }
        var args=hash.split('/');
        var actionName=args[0];
        if (!actionName || !(actionName in Actions)) {
            selectHash('dream');
        } else {
            activePage(actionName);
            Actions[actionName].apply(this,args);
            firstLoad=false;
        }
    }

    function activePage(name){
        $('.search-pages>div').hide();
        $('.search-pages').find('[data-tag='+name+']').show();
        $('#serachNav').find('[data-tag='+name+']').addClass('active').siblings('.active').removeClass('active');
    }

    $(window).on('hashchange', function(e) {
        selectHash(location.hash.replace('#', ''));
    });

    selectHash(location.hash.substr(1));

//简单事件绑定
function bindEvents() {
    $('#search').find('input').on(changeEvent,function(e){
        var search=$('#search'),
            val=$(this).val(),
            tip=search.find('.tip');
        tip.find('p').html(val);
        if(!val){
            tip.hide();
        } else {
            tip.show();
        }
    });

    $(document).on('keydown',function(e){
        var txt=$.trim($('#search').find('input').val());
        if(e.keyCode==13&&txt){
            //todo:向后台查询结果
            $('#search').find('.tip').hide();
        }
    });

    $('#serachNav').on('click','a',function(){
        var pages=$('.search-pages'),
            i=$(this).index();

        $('.middle').scrollTop(0);
        $(this).addClass('active').siblings('.active').removeClass('active');
        pages.children('div').eq(i).addClass('active').siblings('.active').removeClass('active');
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
    });

    $('.article-list').on('click', '[data-tag]', function(e) {
        e.stopPropagation();
        var name = $(this).data('tag'),
            opts = {};

        switch (name) {
            case 'up':
                $(this).toggleClass('active');
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
                    if (that.parents('ul').length) {
                        that.parentsUntil('ul').remove();
                    } else {
                        location.href = 'index.html';
                    }
                });
                break;
            case 'private': //私密
                hideDialogs();
                var txt = $(this).html();
                if (txt == '设为私密') {
                    $(this).html('设为公开');
                } else {
                    $(this).html('设为私密');
                }
                $(this).parentsUntil('.actions').siblings('.private').toggle();
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
                    // userName = wrap.find('.title span').first().html(),
                    userNames = wrap.find('.title span'),
                    l=wrap.offset().left,
                    w=wrap.width();
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

setTimeout(function() {
    $('#search').find('input').focus();
}, 300);

setCopyUrl();
bindEvents();

