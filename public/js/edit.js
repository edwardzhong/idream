    // var storage = new Storage('edit'+FeedID);

    // function restoreData() {
    //     var obj = storage.get();
    //     if (obj && obj.feedID && obj.feedID == FeedID) {
    //         $('#title').val(obj.title);
    //         $('#content').html(obj.content);
    //         $('#editImgs').html(obj.imgs);
    //         $('#addTag').val(obj.tags);
    //         $('.edit-wrap').find('span').hide();
    //     }
    // }

    // function autoSave() {
    //     function save() {
    //         var title = $.trim($('#title').val()),
    //             content = $.trim($('#content').html()),
    //             imgs = $('#editImgs').html(),
    //             tags = $.trim($('#addTag').val());
    //         if (title && content) {
    //             storage.save({
    //                 feedID: FeedID,
    //                 title: title,
    //                 content: content,
    //                 imgs: imgs,
    //                 tags: tags
    //             });
    //         }
    //         setTimeout(save, 50000);
    //     }
    //     setTimeout(save, 50000);
    // }

    // restoreData();
    // autoSave();

    $('.img-list img').each(function(i, item) {
        var wrap = $(item).parent();
        setImgPosition(wrap, item, true);
    });

    //简单事件绑定
    function bindEvents() {
        $('#addTag').on('click', function(e) {
            $('#tag').toggle();
        });

        $('#editImgs').on('click', 'i', function(e) {
            var that = $(this);
            showDialog('确定删除?', function() {
                that.parent().remove();
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
            if (num > 10) {
                $(this).addClass('warn')
            } else {
                $(this).removeClass('warn');
            }
        });

        //文章提交事件
        $('#submit').on('click', function() {
            // todo: 文章表单提交
            var title = $('#title'),
                content = $('#content'),
                imgs = [],
                tags = $.trim($('#tag').val());

            if (!$.trim(title.val())) {
                title.addClass('warn');
                showDialog({ txt: '标题不能为空', confirm: '确认' }, function() {
                    title.focus();
                });
                return;
            }
            title.removeClass('warn');

            if (!$.trim(content.html())) {
                content.addClass('warn');
                showDialog({ txt: '内容不能为空', confirm: '确认' }, function() {
                    content.focus();
                });
                return;
            }
            content.removeClass('warn');
            $('#editImgs').find('img').each(function(i, item) {
                imgs.push(item.src);
            });
            $('#loading').show();
            sendFn({
                r: '/user/publish',
                feed_id: FeedID,
                title: title.val(),
                content: content.html(),
                img_url: imgs.join(','),
                tags: tags
            }, function(ret) {
                $('#loading').hide();
                // storage.clear();
                if (ret.code == 200) {
                    location.href = '/article/' + FeedID;
                } else {
                    showDialog({ txt: ret.msg, confirm: '确认' });
                }
            });
        });

    }

    uploadImage();
    bindEvents();
