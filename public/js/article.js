

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
			case 'delete'://删除事件
				var that=$(this);
				showDialog('确定删除?',function(){
					// todo: 删除
					if(that.parents('ul').length){
						// 删除评论
						that.parentsUntil('ul').remove();
					} else {
						// 删除文章
						location.href='index.html';
					}
				});
				break;
			case 'private'://私密
				hideDialogs();
				// todo: 公开私密设置
				var txt=$(this).html();
				if(txt=='设为私密'){
					$(this).html('设为公开');
				} else {
					$(this).html('设为私密');
				}
				$(this).parentsUntil('.actions').siblings('.private').toggle();
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
