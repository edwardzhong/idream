var img;
$('#intro').trumbowyg({
    svgPath: false,
    resetCss: true,
    removeformatPasted: true,
    hideButtonTexts: true,
    autogrow: true,
    autogrowOnEnter: true
});

setTimeout(function() {
    $('.edit-user .trumbowyg-editor').focus();
    setTimeout(function() {
        $('#btn').focus();
    }, 50);
}, 300);
// 截取图像
function cutPicture() {
    var cropData = $(img).cropper('getData'),
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        cSrc='';

    canvas.width = cropData.width;
    canvas.height = cropData.height;
    ctx.drawImage(img, cropData.x, cropData.y, cropData.width, cropData.height, 0, 0, canvas.width, canvas.height);
    cSrc=canvas.toDataURL('image/jpeg');
    $('#avatar').find('img').attr('src', cSrc);
    reqUploadImg(cSrc, function(src) {
        $('#avatar').find('img').attr('src', src);
    });
}

// 重置状态
function destroyImg() {
    $(img).cropper('destroy');
    $('#popImg').hide().find('img').remove();
    $('#overlay').hide();
    $(document).off('keydown');
    $('#popImg').off('dblclick');
    $('#replaceUpload').remove();
    $(document.body).append('<input type="file" name="file" id="replaceUpload" class="replace-upload">');
}

$('#popImg').on('click', '.close', destroyImg);

$(document.body).on('change', '#replaceUpload', function(e) {
    var file = e.target.files[0],
        fSize = file.size,
        fType = file.type,
        fr,
        pop = $('#popImg');

    if (['image/jpg', 'image/jpeg', 'image/png'].indexOf(fType) < 0) {
        showDialog({txt:'只能上传jpg和png格式的图片',confirm:'确认'});
        return;
    }
    if (fSize > 4 * 1024 * 1024) {
        showDialog({txt:'您上传的图片太大了，不能超过4M哦！',confirm:'确认'});
        return;
    }
    if (window.FileReader) {
        fr = new FileReader();
        fr.onloadend = function(e) {
            img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                pop.prepend(img).show();
                $(img).cropper({
                    aspectRatio: 1 / 1,
                    viewMode: 1
                });
                $('#overlay').show();
                $(document).on('keydown', function(e) {
                    if (e.keyCode == 13) {
                        cutPicture();
                        destroyImg();
                    }
                });
                $('#popImg').on('dblclick', function() {
                    cutPicture();
                    destroyImg();
                });
            };
        };
        fr.readAsDataURL(file);
    } else {
        showDialog({txt:'浏览器不支持上传',confirm:'确认'});
    }
});

$('#avatar').on('click', function(e) {
    $('#replaceUpload').trigger('click');
});

//年龄
$('#year').on(changeEvent, function(e) {
    var val = this.value;
    val = val.replace(/\D+/, '');
    $(this).val(val);
});

$('#name').on(changeEvent, function(e) {
    setTextWarn.call(this,this.value,7);
});
$('#job,#loc').on(changeEvent, function(e) {
    setTextWarn.call(this,this.value,7);
});
$('.edit-user .trumbowyg-editor').on(changeEvent, function(e) {
    var txt =$('.edit-user .trumbowyg-editor').html();
    setTextWarn.call($('.edit-user .trumbowyg-editor')[0],txt,150);
});

$('#btn').on('click', function(e) {
    e.stopPropagation();
    showDialog({txt:'确定保存吗？',confirm:'确认'},function(){
        var avatar=$('#avatar').find('img').attr('src'),
            name=$('#name').val(),
            intro=$('#intro').trumbowyg('html'),
            sex=$('[name=gender]:checked').data('id')||0,
            age=$('#age').val(),
            job=$('#job').val(),
            loc=$('#loc').val();
        $('#loading').show();
        sendFn({
            r:'/user/edit-user',
            avatar:avatar,
            uname:name,
            intro:intro,
            sex:sex,
            location:loc,
            job:job,
            age:age
        },function(ret){
            $('#loading').hide();
            if(ret.code == 200){
                location.href='/';
                // console.log(ret);
            } else {
                showDialog({txt:ret.msg,confirm:'确认'});  
            }
        });
        
    });
});

