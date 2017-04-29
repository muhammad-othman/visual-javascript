$(document).ready(function(){
		 	
    minimizeText();
    // make the drawing area sortable     
    $(".dropDiv").sortable({
        
        forcePlaceholderSize: true,
        placeholder: 'place-holder',
        tolerance: 'pointer',
        grid: [20, 5],
        cursorAt: {left: 0, top: 0},
        over: function () {removeIntent = false;} ,
        out: function () {removeIntent = true;} ,
        beforeStop: function (event, ui) {
            if(removeIntent == true){
                ui.item.remove();
            }
        } ,
        start: function(event, ui){ui.item.addClass('drop-shadow')},
        stop: function(event, ui){ui.item.removeClass('drop-shadow')}
    });

    // make the value blocks move separately so we can connect them to the sortable lists
    // that accept values only
    $(".template.value").draggable({
        helper: "clone",
        cursorAt: {left: 0, top: 0},
        grid: [20, 5],
        revert: "invalid",
        connectToSortable: ".accept-value",
        start: function(event, ui){$(ui.helper[0]).addClass('drop-shadow')},
        stop: function(event, ui){
                    $(ui.helper[0]).removeClass("template");
                    $(ui.helper[0]).css("height", "auto").css("width", "auto");
                    $(ui.helper[0]).removeClass('drop-shadow');
                    $(ui.helper[0]).click(function( event ) {
                        event.stopPropagation();
                    });
                    minimizeText();
        }
    });

    // make the parameter blocks move separately so we can connect them to the sortable lists
    // that accept parameters only
    $(".template.parameter").draggable({
        helper: "clone",
        cursorAt: {left: 0, top: 0},
        grid: [20, 5],
        revert: "invalid",
        connectToSortable: ".accept-parameter",
        start: function(event, ui){$(ui.helper[0]).addClass('drop-shadow')},
        stop: function(event, ui){
                    $(ui.helper[0]).removeClass("template");
                    $(ui.helper[0]).css("height", "auto").css("width", "auto");
                    $(ui.helper[0]).removeClass('drop-shadow');
                    $(ui.helper[0]).click(function( event ) {
                        event.stopPropagation();
                    });
                    minimizeText();
        }
    });

    // handle all the rest of the blocks, but not the parameter nor the value
    $(".template:not(.value):not(.parameter)").draggable({
        helper: "clone",
        cursorAt: {left: 0, top: 0},
        grid: [20, 5],
        revert: "invalid",
        connectToSortable: ".dropDiv",
        start: function(event, ui){$(ui.helper[0]).addClass('drop-shadow')},
        stop: function(event, ui){
                $(ui.helper[0]).removeClass("template");
                $(ui.helper[0]).css("height", "auto").css("width", "auto");
                $(ui.helper[0]).removeClass('drop-shadow');
                $(ui.helper[0]).click(function( event ) {
                    event.stopPropagation();
                });
                minimizeText();

                $(".sortable:not(.template .sortable)").sortable({
            
                    connectWith: ".dropDiv, .sortable:not(.template .sortable)",
                    forcePlaceholderSize: true,
                    placeholder: 'place-holder',
                    tolerance: 'pointer',
                    grid: [20, 5],
                    cursorAt: {left: 0, top: 0},
                    over: function () {removeIntent = false;} ,
                    out: function () {removeIntent = true;} ,
                    beforeStop: function (event, ui) {
                        if(removeIntent == true){
                            ui.item.remove();
                        }
                    } ,
                    start: function(event, ui){
                        
                        //ui.item.css("float","inherit");
                        if (event.ctrlKey || event.altKey) {
                            if(ui.item.hasClass("variable") || ui.item.hasClass("parameter")){
                                var $clone = ui.item.clone().insertBefore(ui.item);
                                $clone.css({position:"static"});
                            }  
                            else if(ui.item.hasClass("function")) 
                            {

                                var $clone = ui.item.clone().insertBefore(ui.item);
                                $clone.css({position:"static"});

                                // this part needs refining
                                    var func = 
                                "<table class='round-right'>"+
                                "<tr>"+

                                "<td class='color-green round-left'><div class='block vertical-align-container' >"+
                                "<span class='text vertical-align' >"+
                                ui.item.children()[0].children[0].children[0].children[1].children[0].children[0].children[0].value+
                                "</span></div></td>"+

                                "<td class='color-green'>"+
                                "<div class='vertical-align-container'><span>&nbsp;</span>"+
                                "<span class='text vertical-align'>"+
                                "<div class='block sortable function-call many accept-statement accept-variable accept-value accept-function' style='height: auto'></div>"+
                                "</span>"+
                                "</div></td>"+
                                "</tr>"+
                                "</table>"
                                
                                $(ui.item).html(func).removeClass("function").addClass("function-call");
                                /*
                                var function_name = ui.item.find('input').first().value
                                var temp = $("div.function-call-template");
                                temp.find("span").first().text(function_name);
                                $(ui.item).html(temp.html()).removeClass("function").addClass("function-call");
                                */
                                SortableEvent();
                            }
                        }
                        ui.item.addClass('drop-shadow');
                    },
                    stop: function(event, ui){
                        minimizeText();
                        ui.item.removeClass('drop-shadow');
                        $(this).children().css("display", "table");
                        $('dropDiv').children().css("display", "table");
                        $(".function .accept-parameter").children().css("display", "inline-block");
                        $(".function-call .sortable").children().css("display", "inline-block");
                    },
                    change: function(){
                        // make the parameter block block "vertically listed for easy manipulation"
                        if(($(this).hasClass("accept-parameter") || $(this).hasClass("function-call")) && !(event.ctrlKey || event.altKey)){
                            $(this).children().css("display", "block");
                        }
                    },
                    receive: function(event, ui){
                        if($(this).hasClass("one")){
                            // check for the number of elements
                            if($(this).children().length == 1){
                                if(
                                    (ui.item.hasClass("statement") && $(this).hasClass("accept-statement"))
                                    ||
                                    (ui.item.hasClass("value") && $(this).hasClass("accept-value"))
                                    ||
                                    (ui.item.hasClass("parameter") && $(this).hasClass("accept-parameter"))
                                    ||
                                    (ui.item.hasClass("variable") && $(this).hasClass("accept-variable"))
                                    ||
                                    (ui.item.hasClass("function-call") && $(this).hasClass("accept-function"))
                                    ){
                                }
                                    
                                else{
                                    if(ui.item.hasClass("template")){
                                        $(ui.item).remove();
                                    }
                                    else{
                                        $(ui.sender).sortable("cancel");
                                    }
                                }                                                
                            }
                            else{
                                if(ui.item.hasClass("template")){
                                    $(ui.item).remove();
                                }
                                else{
                                    $(ui.sender).sortable("cancel");
                                }
                            }
                        }
                        else if($(this).hasClass("many")){
                            console.log('many');
                            // nothing handled here. was for testing puurposes
                            if(
                                (ui.item.hasClass("statement") && $(this).hasClass("accept-statement"))
                                ||
                                (ui.item.hasClass("value") && $(this).hasClass("accept-value"))
                                ||
                                (ui.item.hasClass("parameter") && $(this).hasClass("accept-parameter"))
                                ||
                                (ui.item.hasClass("variable") && $(this).hasClass("accept-variable"))
                                ||
                                (ui.item.hasClass("function-call") && $(this).hasClass("accept-function"))
                                ){
                            }   
                            else{
                                if(ui.item.hasClass("template")){
                                    console.log('delete');
                                    //$(ui.item).remove();
                                    $(this).sortable("cancel");
                                    $(ui.item).remove();
                                }
                                else{
                                    $(this).sortable("cancel");
                                }
                            } 
                        }// if else end
                    }// function end
                });// this end
        }
    });


    // tool box coloring
    $('#condition').css('background-color', 'indianred');
    $('.scroller').children().css('display', 'none');
    $('.scroller').children('.condition').css('display', 'table');

    $('.choice').on('click', function(){
        $('.choice').css('background-color', 'transparent');
        $('.scroller').children().css('display', 'none');
        switch(this.id){
            case 'statement':
            $(this).css('background-color', 'goldenrod');
            $('.scroller').children('.statement').css('display', 'table');
            break;
            case 'function':
            $(this).css('background-color', 'rgb(92, 182, 18)');
            $('.scroller').children('.function, .return').css('display', 'table');
            break;
            case 'condition':
            $(this).css('background-color', 'indianred');
            $('.scroller').children('.condition').css('display', 'table');
            break;
            case 'variable':
            $(this).css('background-color', 'dodgerblue');
            $('.scroller').children('.variable, .value, .parameter').css('display', 'table');
            break;
        }
    })

    $("#trash").droppable(
        {
            over: function() { $("#trash").animate({ height: '+=20px', width: '+=20px'})} ,
            out: function() { $("#trash").animate({ height: '-=20px', width: '-=20px'});} ,
            drop: function(event, ui) {
                ui.draggable.remove();
                $("#trash").animate({ height: '-=20px', width: '-=20px' });
        }
    });

    function SortableEvent(){

        $(".sortable:not(.template .sortable)").sortable({
            
            connectWith: ".dropDiv, .sortable:not(.template .sortable)",
            forcePlaceholderSize: true,
            placeholder: 'place-holder',
            tolerance: 'pointer',
            grid: [20, 5],
            cursorAt: {left: 0, top: 0},
            over: function () {removeIntent = false;} ,
            out: function () {removeIntent = true;} ,
            beforeStop: function (event, ui) {
                if(removeIntent == true){
                    ui.item.remove();
                }
            } ,
            start: function(event, ui){
                
                //ui.item.css("float","inherit");
                if (event.ctrlKey || event.altKey) {
                    if(ui.item.hasClass("variable") || ui.item.hasClass("parameter")){
                        var $clone = ui.item.clone().insertBefore(ui.item);
                        $clone.css({position:"static"});
                    }  
                    else if(ui.item.hasClass("function")) 
                    {

                        var $clone = ui.item.clone().insertBefore(ui.item);
                        $clone.css({position:"static"});

                        // this part needs refining
                            var func = 
                        "<table class='round-right'>"+
                        "<tr>"+

                        "<td class='color-green round-left'><div class='block vertical-align-container' >"+
                        "<span class='text vertical-align' >"+
                        ui.item.children()[0].children[0].children[0].children[1].children[0].children[0].children[0].value+
                        "</span></div></td>"+

                        "<td class='color-green'>"+
                        "<div class='vertical-align-container'><span>&nbsp;</span>"+
                        "<span class='text vertical-align'>"+
                        "<div class='block sortable function-call many accept-statement accept-variable accept-value accept-function' style='height: auto'></div>"+
                        "</span>"+
                        "</div></td>"+
                        "</tr>"+
                        "</table>"
                        
                        $(ui.item).html(func).removeClass("function").addClass("function-call");
                        /*
                        var function_name = ui.item.find('input').first().value
                        var temp = $("div.function-call-template");
                        temp.find("span").first().text(function_name);
                        $(ui.item).html(temp.html()).removeClass("function").addClass("function-call");
                        */
                        SortableEvent();
                    }
                }
                ui.item.addClass('drop-shadow');
            },
            stop: function(event, ui){
                minimizeText();
                ui.item.removeClass('drop-shadow');
                $(this).children().css("display", "table");
                $('dropDiv').children().css("display", "table");
                $(".function .accept-parameter").children().css("display", "inline-block");
                $(".function-call .sortable").children().css("display", "inline-block");
            },
            change: function(){
                // make the parameter block block "vertically listed for easy manipulation"
                if(!$(this).hasClass('dropDiv') && ($(this).hasClass("accept-parameter") || $(this).hasClass("function-call")) && !(event.ctrlKey || event.altKey)){
                    $(this).children().css("display", "block");
                }
            },
            receive: function(event, ui){
                if($(this).hasClass("one")){
                    // check for the number of elements
                    if($(this).children().length == 1){
                        if(
                            (ui.item.hasClass("statement") && $(this).hasClass("accept-statement"))
                            ||
                            (ui.item.hasClass("value") && $(this).hasClass("accept-value"))
                            ||
                            (ui.item.hasClass("parameter") && $(this).hasClass("accept-parameter"))
                            ||
                            (ui.item.hasClass("variable") && $(this).hasClass("accept-variable"))
                            ||
                            (ui.item.hasClass("function-call") && $(this).hasClass("accept-function"))
                            ){
                        }
                            
                        else{
                            if(ui.item.hasClass("template")){
                                $(ui.item).remove();
                            }
                            else{
                                $(ui.sender).sortable("cancel");
                            }
                        }                                                
                    }
                    else{
                        if(ui.item.hasClass("template")){
                            $(ui.item).remove();
                        }
                        else{
                            $(ui.sender).sortable("cancel");
                        }
                    }
                }
                else if($(this).hasClass("many")){
                    console.log('many');
                    // nothing handled here. was for testing puurposes
                    if(
                        (ui.item.hasClass("statement") && $(this).hasClass("accept-statement"))
                        ||
                        (ui.item.hasClass("value") && $(this).hasClass("accept-value"))
                        ||
                        (ui.item.hasClass("parameter") && $(this).hasClass("accept-parameter"))
                        ||
                        (ui.item.hasClass("variable") && $(this).hasClass("accept-variable"))
                        ||
                        (ui.item.hasClass("function-call") && $(this).hasClass("accept-function"))
                        ){
                    }   
                    else{
                        if(ui.item.hasClass("template")){
                            console.log('delete');
                            //$(ui.item).remove();
                            $(this).sortable("cancel");
                            $(ui.item).remove();
                        }
                        else{
                            $(this).sortable("cancel");
                        }
                    } 
                }// if else end
            }// function end
        });// this end
    }// end of SortableEvent Function

    function minimizeText(){
        var inputs_array = $('.editable').get();
        var length = inputs_array.length;
        for(var i = 0; i < length; i++){
            autosizeInput(inputs_array[i]);
        }
    }

    $(".logical-not").remove();
    look_for_cookies();
});


function look_for_cookies(){
    var name = getCookie('user-name');
    if(name){
        $("#menu-div ul").append('<li style="float:right;margin-right:35px;margin-top:14px;">\
                                    Welcome back, ' + name + '</li>')
    }
}
function getCookie (name) 
{
    var cookies = document.cookie.split(";");
    for(var i = 0; i < cookies.length; i++)
    {
        if(cookies[i].split("=")[0] == name) 
        {
            return decodeURIComponent(cookies[i].split("=")[1]);
        }
    }       
    return undefined;
}
function getAllCookies () {
    var cookies = document.cookie.split(";");
    var parsed = [];
    for(var i = 0; i < cookies.length; i++)
    {
        parsed[ cookies[i].split("=")[0].trim() ] = decodeURIComponent( cookies[i].split("=")[1] );
    }
    return parsed;
}