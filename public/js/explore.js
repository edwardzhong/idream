
//简单事件绑定
function bindEvents() {
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

    //瀑布流分页加载
    var isOver = false, //是否加载到最后一页了
        isLoading = false, //是否正在加载
        i = 0; //此变量为样例模拟接口数据加载完用
    $('.middle').on('scroll', function(e) {
        var list = $('.article-list'),
            posTop = list.outerHeight(),
            mt = $(this).offset().top,
            mh = $(window).height(),
            st = $(this).scrollTop();

        if (isOver || isLoading) return;
        if ( mh + st > posTop - 100 ) {
            console.log(mh,st,posTop);
            isLoading = true; //加载数据前标志位设为正在加载
            // todo: 从后台获取数据例子
            // $.ajax({
            //      url:'...',
            //      type:'GET',
            //      dataType:'json',
            //      data:{pageNum:1,pageSize:10},
            //      success:function(data){
            //         isLoading=false;
            //         if(data.isSucc){
            //              // 数据渲染到模版
            //              // var tpl=...
            //              list.append(tpl);
            //         }  
            //      }
            // });
            // 下面为前端样例,实际需要发起ajax请求获取数据后渲染模版
            var li = '<li> <a href="other.html" class="avatar-wrap"> <div class="avatar"> <img src="./img/avatar.jpg" alt=""> </div> </a> <div class="dream-wrap"> <div class="title"> <a href="other_article.html"><time class="fr">18:00 昨天</time></a> <a href="other_article.html"><h3>梦境题目title2</h3></a> <a href="other.html"><span>作者名字</span></a> </div> <div class="img-list"> <div class="img"><img src="./img/avatar.jpg" alt=""></div> <div class="img"><img src="./img/avatar.jpg" alt=""></div> <div class="img"><img src="./img/avatar.jpg" alt=""></div> </div> <p>如果无法简洁的表达你的想法,那只说明你还不够了解它.阿尔伯特.爱因斯坦如果无法简洁的表达你的想法,那只说明你还不够了解它.阿尔伯特.爱因斯坦如果无法简洁的表达你的想法,那只说明你还不够了解它.阿尔伯特.爱因斯坦</p> <div class="actions"> <i data-tag="up" class="icon-heart" title="比心"></i> <span>36</span> <i data-tag="comment" class="icon-comment" title="评论"></i> <span>46</span> <i data-tag="share" class="icon-forward" title="传达"></i> <div class="down-tip" data-menu="share"> <div class="menu"> <a data-tag="collect" href="javascript:;">收藏</a> <a data-tag="copy" href="javascript:;" data-clipboard-text="http://jeffzhong.space/">复制链接</a> <a class="share-icon" href="javascript:;" data-url="index.html"> <i data-tag="facebook" class="icon-facebook-squared"></i> <i data-tag="weibo" class="icon-sina-weibo"></i> <i data-tag="douban">豆</i> <i data-tag="qq" class="icon-qq"></i> <i data-tag="wechat" class="icon-wechat"></i> <i data-tag="whatsapp" class="icon-whatsapp"></i> </a> </div> </div> </div> </div> </li>';
            setTimeout(function() {
                var tpl = new Array(11).join(li);
                list.append(tpl);
                if (i > 4) isOver = true; //模拟接口数据已经加载完
                isLoading = false; //加载完数据后,重设标志位
                i++; //模拟接口数据已经加载完
            }, 600);
        }
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
                //todo:私密
                if (txt == '设为私密') {
                    $(this).html('设为公开');
                } else {
                    $(this).html('设为私密');
                }
                $(this).parentsUntil('.actions').siblings('.private').toggle();
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

setCopyUrl();
bindEvents();
