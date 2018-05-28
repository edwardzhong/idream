
$('.img-list img').each(function(i,item){
    var wrap=$(item).parent();
    setImgPosition(wrap,item,true);
});

//简单事件绑定
function bindEvents() {
    $('#addTag').on('click',function(e){
        $('#tag').toggle();
    });

    $('#editImgs').on('click', 'i', function(e) {
        var that = $(this);
        showDialog('确定删除?', function() {
            that.parent().remove();
        });
    });

    //文章提交事件
    $('#submit').on('click', function() {
        // todo: 文章表单提交
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

}

uploadImage();
bindEvents();
