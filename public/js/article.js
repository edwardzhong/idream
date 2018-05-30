var ReviewID='';


//简单事件绑定
function bindEvents(){
	$('#comment').on('click','.close',function(e){
		e.stopPropagation();
		$(this).parent().hide();
		$('#overlay').hide();
	});
	$('#addTag').on('click',function(e){
		$('.tags').toggle();
	});

	//评论提交事件
	$('#replyComment').on('click',function(e){
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
            to_review_id:ReviewID,
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

	$('.comment-list,.view-article').on('click','[data-tag]',function(e){
		e.stopPropagation();
        var that=$(this);
            name = that.data('tag'),
            rid =that.data('rid'),
            opts = {};

		switch(name){
			case 'up':
				sendFn({
                    r:'/feed/digg',
                    feed_id:FeedID
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
			case 'delete'://删除事件
				var that=$(this);
				showDialog('确定删除?',function(){
					// todo: 删除
					if(that.parents('ul').length){
						// 删除评论
						sendFn({
							r:'/feed/del-review',
							feed_id:FeedID,
							review_id:rid
						},function(ret){
							if(ret.code == 200){
								that.parentsUntil('ul').remove();
							} else {
								showDialog({txt:ret.msg,confirm:'确认'});  
							}
						});
						
					} else {
						// 删除文章
						sendFn({
							r:'/user/del',
							feed_id:FeedID
						},function(ret){
							if(ret.code == 200){
								location.href='/';
							} else {
								showDialog({txt:ret.msg,confirm:'确认'});  
							}
						});
					}
				});
				break;
			case 'private'://私密
                hideDialogs();
                var that=$(this),
                    pri=that.parentsUntil('.actions').siblings('.private'),
                    showType=Number(that.data('type'));
                //todo:私密
                sendFn({
                    r:'/feed/set-feed-secret',
                    feed_id:FeedID,
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
			case 'collect'://收藏
				// todo: 收藏
				hideDialogs();
				showDialog({txt:'已收藏',confirm:'确认'});
				break;
			case 'copy'://复制
				break;
            case 'comment': //评论
                var wrap=$(this).parents('.dream-wrap,.view-article');
 					userNames = wrap.find('.title span');
 				if($(this).parent().parent()[0].className=='dream-wrap'){
 					wrap=$(this).parentsUntil('.comment-list').find('.dream-wrap').first();
 				}
                var l=wrap.offset().left,
                    w=wrap.width();
                showComment(userNames,l,w);
                ReviewID=rid;
                break;
			/**
			 * sns分享
			 */
			case 'facebook':
				if(showShare()) break;
				generate('https://www.facebook.com/sharer/sharer.php?u=(sUrl)', getShareOpts.call(this))
				break;
			case 'weibo'://微博
				if(showShare()) break;
				generate('http://service.weibo.com/share/share.php?url=(sUrl(&title=(sTitle)&pic=(sPic)', getShareOpts.call(this))
				break;
			case 'douban'://豆瓣
				if(showShare()) break;
				generate('https://www.douban.com/share/service?image=(sPic)&href=(sUrl)&name=(sTitle)&text=(sDesc)', getShareOpts.call(this))
				break;
			case 'qq'://qq
				if(showShare()) break;
				generate('http://connect.qq.com/widget/shareqq/index.html?url=(sUrl)&title=(sTitle)&source=(sDesc)', getShareOpts.call(this))
				break;
			case 'wechat'://微信
				if(showShare()) break;
				showWX(getShareOpts.call(this));
				break;
			case 'whatsapp':
				if(showShare()) break;
				generate('whatsapp://send?text=(sDesc)' + encodeURIComponent('\n\n')+'(sUrl)&via=lopscoop', getShareOpts.call(this))
				break;
			default:break;
		}
	});
}


var viewer = new Viewer($('#viewImgs')[0],{
	minZoomRatio:0.5,
	maxZoomRatio:3
});

setCopyUrl();
bindEvents();
