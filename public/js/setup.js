    var firstLoad=true,
        Actions={
            about:function(){},
            notice:function(){},
            private:function(){},
            account:function(){},
            black:function(){}
        };
        
    function selectHash(hash){
        if (location.hash.substr(1) != hash) {
            location.hash = hash;
            return;
        }
        var args=hash.split('/');
        var actionName=args[0];
        if (!actionName || !(actionName in Actions)) {
            selectHash('notice');
        } else {
            activePage(actionName);
            Actions[actionName].apply(this,args);
            firstLoad=false;
        }
    }

    function activePage(name){
        var page = $('.pages .'+name);
        page.show().siblings().hide();
        $('.nav [data-tag='+name+']').addClass('active').siblings('.active').removeClass('active');
    }

    $(window).on('hashchange', function(e) {
        selectHash(location.hash.replace('#', ''));
    });

    selectHash(location.hash.substr(1));

    /************************************/
    //关于
    $('#title').on(changeEvent, function(e) {
        setTextWarn.call(this,this.value,7);
    });
    $('#content').on(changeEvent, function(e) {
        setTextWarn.call(this,this.innerHTML,150);
    });
    $('#btnAbout').on('click',function(e){
        e.stopPropagation();
        var title=$('#title'),
            content=$('#content');

        if(!$.trim(title.val())){
            title.addClass('warn');
            showDialog({txt:'关于不能为空',confirm:'确认'},function(){
                title.focus();
            });
            return;
        }
        title.removeClass('warn');
        if(!$.trim(content.html())){
            content.addClass('warn');
            showDialog({txt:'内容不能为空',confirm:'确认'},function(){
                content.focus();
            });
            return;
        }
        content.removeClass('warn');
        $('#loading').show();
        sendFn({
            r:'/userset/add-opinion',
            title:title.val(),
            content:content.html()
        },function(ret){
            $('#loading').hide();
            if(ret.code == 200){
                title.val('');
                content.empty();
                content.next('span').show();
                showDialog({txt:'提交成功',confirm:'确认'});    
            } else {
                showDialog({txt:ret.msg,confirm:'确认'});
            }
        });
    });

    //通知
    $('[name=notice]').on('click',function(e){
        var comm=1, ding=1;
        $('[name=notice]').each(function(i,item){
            if(item.id=='comment') comm=item.checked?1:2;
            if(item.id=='ding') ding=item.checked?1:2;
            console.log(i);
        });
        
        sendFn({
            r:'/userset/set-user-notice',
            is_review:comm,
            is_digg:ding
        },function(ret){
            if(ret.code != 200){
                showDialog({txt:ret.msg,confirm:'确认'});  
            }
        });
    });

    //隐私
    $('[name=private]').on('click',function(e){
        var isShow =$('[name=private]:checked').data('show');
        sendFn({
            r:'/userset/set-secret',
            is_show:isShow
        },function(ret){
            if(ret.code != 200){
                showDialog({txt:ret.msg,confirm:'确认'});  
            }
        });
    });

    //更改登录密码
    $('#btnPass').on('click',function(e){
        e.stopPropagation();
        var opass=$('#oldPass'),
            npass=$('#newPass'),
            cpass=$('#comPass');
        
        if(!$.trim(opass.val())){
            opass.addClass('warn');
            showDialog({txt:'原密码不能为空',confirm:'确认'},function(){
                opass.focus();
            });
            return;
        }
        opass.removeClass('warn');

        if(!$.trim(npass.val())){
            npass.addClass('warn');
            showDialog({txt:'新密码不能为空',confirm:'确认'},function(){
                npass.focus();
            });
            return;
        }
        npass.removeClass('warn');

        if(npass.val()!=cpass.val()){
            cpass.addClass('warn');
            showDialog({txt:'重设密码不一致',confirm:'确认'},function(){
                cpass.focus();
            });
            return;
        }
        cpass.removeClass('warn');
        $('#loading').show();
        sendFn({
            r:'/userset/change-pwd',
            oldpassword:opass.val(),
            password:npass.val(),
            repassword:cpass.val()
        },function(ret){
            $('#loading').hide();
            if(ret.code == 200){
                opass.val('');
                npass.val('');
                cpass.val('');
                showDialog({txt:'密码修改成功',confirm:'确认'});    
            } else {
                showDialog({txt:ret.msg,confirm:'确认'});
            }
        });
    });

    $('#btnEmail').on('click',function(e){
        e.stopPropagation();
        var mail=$('#email');

        if(!$.trim(mail.val())){
            mail.addClass('warn');
            showDialog({txt:'邮箱不能为空',confirm:'确认'},function(){
                mail.focus();
            });
            return;
        }

        if(!/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(mail.val())){
            mail.addClass('warn');
            showDialog({txt:'邮箱格式不正确',confirm:'确认'},function(){
                mail.focus();
            });
            return;
        }
        mail.removeClass('warn');
        $('#loading').show();
        sendFn({
            r:'/userset/send-email-code',
            email:mail.val()
        },function(ret){
            $('#loading').hide();
            if(ret.code == 200){
                showDialog({txt:'验证码已发送，请登录邮箱查看',confirm:'确认'});
            } else {
                showDialog({txt:ret.msg,confirm:'确认'});
            }
        });

    });

    //更改登录邮箱
    $('#btnSave').on('click',function(e){
        e.stopPropagation();
        var code=$('#code'),
            nmail=$('#newMail'),
            cmail=$('#comMail');


        code.removeClass('warn');
        nmail.removeClass('warn');
        cmail.removeClass('warn');
        if(!$.trim(code.val())){
            code.addClass('warn');
            showDialog({txt:'验证码不能未空',confirm:'确认'},function(){
                code.focus();
            });
            return;
        }
        if(!$.trim(nmail.val())){
            nmail.addClass('warn');
            showDialog({txt:'新邮箱不能为空',confirm:'确认'},function(){
                nmail.focus();
            });
            return;
        }

        if(!/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(nmail.val())){
            nmail.addClass('warn');
            showDialog({txt:'邮箱格式不正确',confirm:'确认'},function(){
                nmail.focus();
            });
            return;
        }

        if(nmail.val()!=cmail.val()){
            cmail.addClass('warn');
            showDialog({txt:'确认邮箱与新邮箱不一致',confirm:'确认'},function(){
                cmail.focus();
            });
            return;
        }
        $('#loading').show();
        sendFn({
            r:'/userset/change-email',
            code:code.val(),
            newMail:nmail.val(),
            reMail:cmail.val()
        },function(ret){
            $('#loading').hide();
            if(ret.code == 200){
                code.val('');
                nmail.val('');
                cmail.val('');
                showDialog({txt:'更改登录邮箱成功',confirm:'确认'});    
            } else {
                showDialog({txt:ret.msg,confirm:'确认'});
            }
        });
    });

    // 黑名单
    $('.black-list').on('click','[data-tag=black]',function(e){
        var li=$(this).parents('li'),
            id=$(this).data('id');
        showDialog('取消黑名单?',function(){
            sendFn({
                r:'/userset/del-black',
                black_uid:id
            },function(ret){
                if(ret.code == 200){
                    li.remove();
                } else {
                    showDialog({txt:ret.msg,confirm:'确认'});    
                }
            });
        });
    });

