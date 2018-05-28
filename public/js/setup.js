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
        $('.pages>div').hide();
        $('.pages .'+name).show();
        $('.nav [data-tag='+name+']').addClass('active').siblings('.active').removeClass('active');
    }

    $(window).on('hashchange', function(e) {
        selectHash(location.hash.replace('#', ''));
    });

    selectHash(location.hash.substr(1));

    $('.black-list').on('mouseenter','[data-tag=black]',function(e){
        $(this).find('.delete-black').addClass('show');
    }).on('mouseleave','[data-tag=black]',function(e){
        $(this).find('.delete-black').removeClass('show');
    }).on('click','[data-tag]',function(){
        var type=$(this).data('tag');
        if(type=='confirm'){
            $(this).parents('li').remove();
        } else if(type=='cancel'){
            $(this).parent().removeClass('show');
        }
    });

    $('#passSave').on('click',function(e){
        var opass=$('#oldPass'),
            npass=$('#newPass'),
            cpass=$('#comPass');


        cpass.removeClass('warn');
        if(!$.trim(opass.val())){
            showDialog({txt:'原密码不能未空',confirm:'确认'},function(){
                opass.focus();
            });
            return;
        }
        if(!$.trim(npass.val())){
            showDialog({txt:'新密码不能为空',confirm:'确认'},function(){
                npass.focus();
            });
            return;
        }

        if(npass.val()!=cpass.val()){
            cpass.addClass('warn');
            showDialog({txt:'重设密码不一致',confirm:'确认'},function(){
                cpass.focus();
            });
            return;
        }
        // todo:保存密码
    });

    $('#mailSave').on('click',function(e){
        var code=$('#code'),
            nmail=$('#newMail'),
            cmail=$('#comMail');


        code.removeClass('warn');
        nmail.removeClass('warn');
        cmail.removeClass('warn');
        if(!$.trim(code.val())){
            showDialog({txt:'验证码不能未空',confirm:'确认'},function(){
                code.focus();
            });
            return;
        }
        if(!$.trim(nmail.val())){
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
        code.addClass('warn');
        showDialog({txt:'验证码错误',confirm:'确认'},function(){
            code.focus();
        });
        return;
        // todo:保存邮箱
    });
