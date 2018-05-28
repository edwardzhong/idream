

//简单事件绑定
function bindEvents(){
    $('[data-tag=private]').on('click',function(e){
        var txt=$(this).html();
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

	$('#comment').on('click','.close',function(e){
		e.stopPropagation();
		$(this).parent().hide();
		$('#overlay').hide();
	});

	//评论提交事件
	$('#replyComment').on('click',function(e){
		e.stopPropagation();
		//todo:评论表单
	});

	$('.comment-list,.view-article').on('click','[data-tag]',function(e){
		e.stopPropagation();
		var name=$(this).data('tag'),
			opts={};

		switch(name){
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
				generate('http://service.weibo.com/share/share.php?url=(sUrl)&title=(sTitle)&pic=(sPic)', getShareOpts.call(this))
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
