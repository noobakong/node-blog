// project util.js
$(function () {

    // 登录注册切换
    $('.j_userTab span').on('click', function () {
        var _index = $(this).index();
        $(this).addClass('user_cur').siblings().removeClass('user_cur');
        $('.user_login,.user_register').hide();
        if (_index == 0) {
            $('.user_login').css('display', 'inline-block');
            $('.user_register').hide();
        } else {
            $('.user_login').hide();
            $('.user_register').css('display', 'inline-block');
        }
    });
    // 登录校验
    // var reg = /^[^<>"'$\|?~*&@(){}]*$/;
    var $login = $('#login')
    var $register = $('#register')
    var $userInfo = $('#user_logined')
    // $('.user_login_btn').on('click',function(){
    //     if( $login.find('.user_input').eq(0).find('input').val().trim() == '' ){
    //         $login.find('.user_err span').text('用户名不能为空').show();
    //         return false;
    //     }
    //     if( !reg.test($login.find('.user_input').eq(0).find('input').val().trim()) ){
    //         $login.find('.user_err span').text('用户名不能含有特殊字符').show();
    //         return false;
    //     }
    //     if( $login.find('.user_input').eq(1).find('input').val().trim() == '' ){
    //         $login.find('.user_err span').text('密码不能为空').show();
    //         return false;
    //     }
    //     if( !reg.test($login.find('.user_input').eq(1).find('input').val().trim()) ){
    //         $login.find('.user_err span').text('密码不能含有特殊字符').show();
    //         return false;
    //     }
    //     $login.find('.user_err span').text('').hide();
    // });

    // $('.user_register_btn').on('click',function(){
    //     if( $register.find('.user_input').eq(0).find('input').val().trim() == '' ){
    //         $register.find('.user_err span').text('用户名不能为空').show();
    //         return false;
    //     }
    //     if( !reg.test($register.find('.user_input').eq(0).find('input').val().trim()) ){
    //         $register.find('.user_err span').text('用户名不能含有特殊字符').show();
    //         return false;
    //     }
    //     if( $register.find('.user_input').eq(1).find('input').val().trim() == '' ){
    //         $register.find('.user_err span').text('密码不能为空').show();
    //         return false;
    //     }
    //     if( !reg.test($register.find('.user_input').eq(1).find('input').val().trim()) ){
    //         $register.find('.user_err span').text('密码不能含有特殊字符').show();
    //         return false;
    //     }
    //     if( $register.find('.user_input').eq(1).find('input').val().trim() != 
    //         $register.find('.user_input').eq(2).find('input').val().trim()
    //     ){
    //         $register.find('.user_err span').text('两次输入的密码不一致').show();
    //         return false;
    //     }
    //     $register.find('.user_err span').text('').hide();
    // });

    // 打字效果
    var str = 'ming zhao hu niu bi ';
    var i = 0;
    function typing() {
        var divTyping = $('.banner h2');
        if (i <= str.length) {
            divTyping.text(str.slice(0, i++) + '_');
            setTimeout(function () { typing() }, 200);
        } else {
            divTyping.text(str);
        }
    }
    typing();
    // 注册
    $register.find('.user_register_btn').on('click', function () {
        $.ajax({
            type: 'post',
            url: 'api/user/register',
            data: {
                username: $register.find('[name="username"]').val(),
                password: $register.find('[name="password"]').val(),
                repassword: $register.find('[name="repassword"]').val()
            },
            dataType: 'json',
            success: function (result) {
                $register.find('.user_err').html(result.message)

                if (!result.code) {
                    setTimeout(() => {
                        $('.j_userTab span')[0].click()
                    }, 1000)
                }
            }
        })
    })

    // 登录
    $login.find('.user_login_btn').on('click', function () {
        $.ajax({
            type: 'post',
            url: 'api/user/login',
            data: {
                username: $login.find('[name="username"]').val(),
                password: $login.find('[name="password"]').val(),
            },
            dataType: 'json',
            success: function (result) {
                $login.find('.user_err').html(result.message)
                // 登录成功
                if (!result.code) {
                    window.location.reload()
                }
            }
        })
    })

    // 登出
    $('#logout').on('click', function () {
        $.ajax({
            url: '/api/user/logout',
            success: function(result) {
                if (!result.code) {
                    window.location.reload()
                }
            }
        })
    })
});