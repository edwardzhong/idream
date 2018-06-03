
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
                    if (ret.data && ret.data.data && ret.data.data.length) {
                        PageTotal = Number(ret.data.count);
                        if(pageNo * PageSize + ret.data.data.length >= PageTotal){
                            isOver=true;
                        } else {
                            isOver=false;
                        }
                        pageNo++;
                        var feeds = ret.data.data, lis = [], li = '';
                        feeds.forEach(function(item, i) {
                            if(item.review_content){
                                item.review_content = item.review_content.replace(/(^|\>|\s+)\#([^\<\>\s\n]+)/g,function(a,b,c){
                                    return b+'<a href="/topic/'+c+'" class="topic">#'+c.replace(/^\s+|\s+$/,'')+'</a>';
                                });
                            }
                            li = tpl.replace(/\(from_avatar\)/, item.from_avatar||'/img/avatar.jpg')
                                .replace(/\(feed_uid\)/g, item.feed_uid)
                                .replace(/\(feed_id\)/g, item.feed_id)
                                .replace(/\(add_time\)/g, item.add_time)
                                .replace(/\(from_uname\)/g, item.from_uname)
                                .replace(/\(title\)/g, item.title)
                                .replace(/\(is_open\)/, item.is_open);

                            if(item.is_open == 0){
                                li =li.replace(/\(new\)/,'new');
                            } else {
                                li =li.replace(/\(new\)/,'');
                            }
                            li =li.replace(/\(type\)/,item.type==1?'评论文章':item.type==2?'点赞文章':item.type==3?'回复评论':'');
                            if(item.review_content){
                                li =li.replace(/\(content\)/,'<a href="/article/'+item.feed_id+'"><p>'+item.review_content+'</p></a>');
                            } else {
                                li =li.replace(/\(content\)/,'');
                            }
                            lis.push(li);
                        });
                        list.append(lis.join(''));
                    }
                } else {
                    showDialog({txt:ret.msg,confirm:'确认'});  
                }
            });
        }
    });
}

scrollPage({r:'/user/get-user-msg'});

