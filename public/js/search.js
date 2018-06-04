    var FeedID = 0,
        firstLoad = true,
        isLoading = false,
        pageID = 'dream',
        pageInfo = {
            dream: { page: 0, total: 0, firstLoad: true, isOver: false },
            user: { page: 0, total: 0, firstLoad: true, isOver: false },
            picture: { page: 0, total: 0, firstLoad: true, isOver: false },
            my: { page: 0, total: 0, firstLoad: true, isOver: false }
        },
        options = { page_size: PageSize, keyword: Keyword },
        Actions = {
            dream: function() {
                $.extend(options, { r: '/feed/explore' });
                afterLoad('dream');
            },
            user: function() {
                $.extend(options, { r: '/feed/users-search', uname: Keyword });
                afterLoad('user');
            },
            picture: function() {
                $.extend(options, { r: '/feed/explore', has_img: 2 });
                afterLoad('picture');
            },
            my: function() {
                $.extend(options, { r: '/user/get-user-home' });
                afterLoad('my');            }
        };

    function selectHash(hash) {
        if (location.hash.substr(1) != hash) {
            location.hash = hash;
            return;
        }
        var args = hash.split('/');
        var actionName = args[0];
        if (!actionName || !(actionName in Actions)) {
            selectHash('dream');
        } else {
            activePage(actionName);
            pageID = actionName;
            Actions[actionName].apply(this, args);
            firstLoad = false;
        }
    }

    function afterLoad(name){
        if (pageInfo[name].firstLoad) {
            options.page = 1;
            renderList(scrollPage);
        } else {
            scrollPage();
        }
        pageInfo[name].firstLoad = false;

    }

    function activePage(name) {
        $('.middle').off();
        var page = $('.search-pages').find('[data-tag=' + name + ']');
        page.show().siblings().hide();
        $('.middle').scrollTop(0);
        $('#serachNav').find('[data-tag=' + name + ']').addClass('active').siblings('.active').removeClass('active');
    }


    $(window).on('hashchange', function(e) {
        selectHash(location.hash.replace('#', ''));
    });

    selectHash(location.hash.substr(1));

    function scrollPage() {
        $('.middle').on('scroll', function(e) {
            var list = $('#' + pageID + 'List'),
                posTop = list.outerHeight(),
                mt = $(this).offset().top,
                mh = $(window).height(),
                st = $(this).scrollTop();
            if (isLoading || pageInfo[pageID].isOver) return;
            if (mh + st > posTop - 100) {
                isLoading = true;
                options.page = pageInfo[pageID].page + 1;
                renderList();
            }
        });
    }

    function renderList(callback) {
        if (!Keyword) return;
        var list = $('#' + pageID + 'List'),
            noList = list.prev('.no-list'),
            tpl = $(pageID == 'user' ? '#userTemp' : '#liTemp').html();
        console.log(options);
        noList.hide();
        sendFn(options, function(ret) {
            console.log(ret);
            isLoading = false;
            if (ret.code == 200) {
                var data = ret.data;
                if (data && 'feed' in data) { data.data = data.feed; }
                if (data && data.data && data.data.length) {
                    noList.hide();
                    pageInfo[pageID].total = Number(data.count);
                    if (pageInfo[pageID].page * PageSize + data.data.length >= pageInfo[pageID].total) {
                        pageInfo[pageID].isOver = true;
                    } else {
                        pageInfo[pageID].isOver = false;
                    }
                    pageInfo[pageID].page++;
                    var feeds = data.data,
                        lis = [],
                        li = '';
                    feeds = initList(feeds);
                    feeds.forEach(function(item, i) {
                        if (item.content) {
                            item.content = replaceTopic(item.content);
                        }

                        li = tpl.replace(/\(avatar\)/, item.avatar)
                            .replace(/\(uid\)/g, item.uid)
                            .replace(/\(publish_time\)/, item.publish_time)
                            .replace(/\(feed_id\)/g, item.feed_id)
                            .replace(/\(uname\)/g, item.uname)
                            .replace(/\(title\)/g, item.title)
                            .replace(/\(content\)/, item.content)
                            .replace(/\(digg_count\)/, item.digg_count || '')
                            .replace(/\(comment_count\)/, item.comment_count || '')
                            .replace(/\(show_type\)/, item.show_type || '')
                            .replace(/\(intro\)/, item.intro || '&nbsp;');
                        if (item.imgInfo && item.imgInfo.length) {
                            var imgs = [];
                            item.imgInfo.forEach(function(img) {
                                imgs.push('<div class="img"><img src="' + img + '" alt="avatar"></div>');
                            });
                            li = li.replace(/\(imgs\)/, imgs.join(''));
                        } else {
                            li = li.replace(/\(imgs\)/, '');
                        }
                        if (item.has_digg == 1) {
                            li = li.replace(/\(has_digg\)/, 'active');
                        } else {
                            li = li.replace(/\(has_digg\)/, '');
                        }
                        if (item.is_me == 1) {
                            li = li.replace(/\(mstyle\)/, 'inline');
                        } else {
                            li = li.replace(/\(mstyle\)/, 'none');
                        }
                        if (item.show_type && item.show_type == 2) {
                            li = li.replace(/\(pstyle\)/, 'inline').replace(/\(ptxt\)/, '公开');
                        } else {
                            li = li.replace(/\(pstyle\)/, 'none').replace(/\(ptxt\)/, '私密');
                        }
                        lis.push(li);
                    });
                    list.append(lis.join(''));
                    setCopyUrl();
                    $('.article-list li').off();
                    setContent();
                } else {
                    noList.html('暂时未搜索到结果').show();
                }
            } else {
                noList.html(ret.msg).show();
            }
            if (callback) {
                setTimeout(callback, 300);
            }
        });
    }


    //简单事件绑定
    function bindEvents() {
        $('#search').find('input').on(changeEvent, function(e) {
            var search = $('#search'),
                val = $(this).val(),
                tip = search.find('.tip');
            tip.find('p').html(val);
            if (!val) {
                tip.hide();
            } else {
                tip.show();
            }
        });

        $(document).on('keydown', function(e) {
            var txt = $.trim($('#search').find('input').val());
            if (e.keyCode == 13 && txt) {
                $('#search').find('.tip').hide();
                location.href = '/search?kw=' + txt + location.hash;
            }
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
            var commentText = $('#commentText');
            if (!$.trim(commentText.html())) {
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
                r: '/feed/review',
                feed_id: FeedID,
                content: commentText.html()
            }, function(ret) {
                $('#loading').hide();
                if (ret.code == 200) {
                    // location.reload();
                    console.log(ret);
                } else {
                    showDialog({ txt: ret.msg, confirm: '确认' });
                }
            });
        });


        $('.article-list').on('click', '[data-tag]', function(e) {
            e.stopPropagation();
            var that = $(this);
            name = that.data('tag'),
                fid = that.data('id'),
                opts = {};

            switch (name) {
                case 'up': //点赞
                    sendFn({
                        r: '/feed/digg',
                        feed_id: fid
                    }, function(ret) {
                        $('#loading').hide();
                        if (ret.code == 200) {
                            that.toggleClass('active');
                            console.log(ret);
                        } else {
                            showDialog({ txt: ret.msg, confirm: '确认' });
                        }
                    });
                    break;
                case 'more': //更多图标
                    hideDialogs();
                    var menu = $(this).siblings('[data-menu=more]');
                    showDownMenu(menu, $(this));
                    break;
                case 'share': //分享图标
                    hideDialogs();
                    var menu = $(this).siblings('[data-menu=share]');
                    showDownMenu(menu, $(this));
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
                            } else {
                                showDialog({ txt: ret.msg, confirm: '确认' });
                            }
                        });
                    });
                    break;
                case 'private': //私密
                    hideDialogs();
                    var that = $(this),
                        pri = that.parentsUntil('.actions').siblings('.private'),
                        showType = Number(that.data('type'));
                    //todo:私密
                    sendFn({
                        r: '/feed/set-feed-secret',
                        feed_id: fid,
                        show_type: 3 - showType
                    }, function(ret) {
                        if (ret.code == 200) {
                            pri.toggle();
                            that.data('type', 3 - showType);
                            that.html(['设为公开', '设为私密'][showType - 1]);
                        } else {
                            showDialog({ txt: ret.msg, confirm: '确认' });
                        }
                    });
                    break;
                case 'collect': //收藏
                    // todo: 收藏
                    hideDialogs();
                    showDialog({ txt: '已收藏', confirm: '确认' });
                    break;
                case 'copy': //复制
                    break;
                case 'comment': //评论
                    var wrap = $(this).parents('.dream-wrap'),
                        userNames = wrap.find('.title span'),
                        l = wrap.offset().left,
                        w = wrap.width();
                    showComment(userNames, l, w);
                    FeedID = fid;
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
        $('#search').find('input').focus().val(Keyword);
    }, 300);

    // scrollPage();
    setCopyUrl();
    bindEvents();
