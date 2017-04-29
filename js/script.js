function scroll_menu()
{
    if (this.scrollY>150)
    $('#menu-div').css('backgroundColor','rgb(18, 54, 90)');
    else{$('#menu-div').css('backgroundColor','rgba(119, 129, 132, 0.1)');} 
}

function home_menu()
{
    this.location='index.html';
}

function examples_menu()
{
    this.location='vis.html';
}


function visualize_menu()
{
    this.location='visualize.html';
}
function set_cookie()
{
    var name = $('#name_bx').val();
    var mail = $('#mail_bx').val();
    var mobile = $('#mobile_bx').val();        

    var dt= new Date();
    dt.setMonth(dt.getMonth() + 6);
        
    setCookie('user-name', name, dt);
    setCookie('user-mail', mail, dt);
    setCookie('user-mobile', mobile, dt);
}