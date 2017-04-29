$(document).ready(function() {

    $(".dropDiv").sortable({

        forcePlaceholderSize: true,
        placeholder: 'place-holder',
        tolerance: 'pointer',
        grid: [20, 5],
        cursorAt: {
            left: 0,
            top: 0
        },
        start: function(event, ui) {
            ui.item.addClass('drop-shadow')
        },
        stop: function(event, ui) {
            ui.item.removeClass('drop-shadow')
        }
    });

    $(".template.value").draggable({
        helper: "clone",
        cursorAt: {
            left: 0,
            top: 0
        },
        grid: [20, 5],
        revert: "invalid",
        connectToSortable: ".accept-value",
        start: function(event, ui) {
            $(ui.helper[0]).addClass('drop-shadow')
        },
        stop: function(event, ui) {
            $(ui.helper[0]).removeClass("template");
            $(ui.helper[0]).css("height", "auto").css("width", "auto");
            $(ui.helper[0]).removeClass('drop-shadow');
            $(ui.helper[0]).click(function(event) {
                event.stopPropagation();
            });
        }
    });
    $(".template.parameter").draggable({
        helper: "clone",
        cursorAt: {
            left: 0,
            top: 0
        },
        grid: [20, 5],
        revert: "invalid",
        connectToSortable: ".accept-parameter",
        start: function(event, ui) {
            $(ui.helper[0]).addClass('drop-shadow')
        },
        stop: function(event, ui) {
            $(ui.helper[0]).removeClass("template");
            $(ui.helper[0]).css("height", "auto").css("width", "auto");
            $(ui.helper[0]).removeClass('drop-shadow');
            $(ui.helper[0]).click(function(event) {
                event.stopPropagation();
            });
        }
    });

    $(".template:not(.value):not(.parameter)").draggable({
        helper: "clone",
        cursorAt: {
            left: 0,
            top: 0
        },
        grid: [20, 5],
        revert: "invalid",
        connectToSortable: ".dropDiv",
        start: function(event, ui) {
            $(ui.helper[0]).addClass('drop-shadow')
        },
        stop: function(event, ui) {
            $(ui.helper[0]).removeClass("template");
            $(ui.helper[0]).css("height", "auto").css("width", "auto");
            $(ui.helper[0]).removeClass('drop-shadow');
            $(ui.helper[0]).click(function(event) {
                event.stopPropagation();
            });

            $(".sortable:not(.template .sortable)").sortable({

                connectWith: ".dropDiv, .sortable:not(.template .sortable)",
                forcePlaceholderSize: true,
                placeholder: 'place-holder',
                tolerance: 'pointer',
                grid: [20, 5],
                cursorAt: {
                    left: 0,
                    top: 0
                },
                start: function(event, ui) {
                    ui.item.css("float", "inherit");
                    if (event.ctrlKey || event.altKey) {
                        if (ui.item.hasClass("variable") || ui.item.hasClass("parameter")) {
                            var $clone = ui.item.clone().insertBefore(ui.item);
                            $clone.css({
                                position: "static"
                            });
                        } else if (ui.item.hasClass("function")) {
                            var $clone = ui.item.clone().insertBefore(ui.item);
                            $clone.css({
                                position: "static"
                            });


                            var func =
                                "<div class='value table' style='height: auto'><table class='round-right'><tr><td class='color-green'><div class='block vertical-align-container' ><span class='text vertical-align' >" +
                                ui.item.children()[0].children[0].children[0].children[1].children[0].children[0].children[0].value + "</span></div></td><td class='color-green'><div class='vertical-align-container'><span>&nbsp;</span><span class='text vertical-align'><div class='block sortable functionCall one accept-statement accept-variable accept-value' style='height: auto'></div></span></div></td></tr></table></div>"
                            $(ui.item).html(func).removeClass("function");
                        }
                    }
                    ui.item.addClass('drop-shadow')
                },
                stop: function(event, ui) {
                    ui.item.removeClass('drop-shadow')
                },
                receive: function(event, ui) {




                    if ($(this).hasClass("one")) {
                        if (
                            (ui.item.hasClass("parameter") && $(this).hasClass("accept-parameter")) ||
                            ((ui.item.hasClass("variable") || ui.item.hasClass("value") || ui.item.hasClass("statement")) &&
                                $(this).hasClass("functionCall"))


                        ) {
                            $(this).children().css("float", "left");
                        }
                        // check for the number of elements
                        else if ($(this).children().length == 1) {
                            if (
                                (ui.item.hasClass("statement") && $(this).hasClass("accept-statement")) ||
                                (ui.item.hasClass("value") && $(this).hasClass("accept-value")) ||
                                (ui.item.hasClass("variable") && $(this).hasClass("accept-variable")) ||
                                (ui.item.hasClass("function") && $(this).hasClass("accept-function"))
                            ) {} else {
                                if (ui.item.hasClass("template")) {
                                    $(ui.item).remove();
                                } else {
                                    $(ui.sender).sortable("cancel");
                                }
                            }
                        } else {
                            if (ui.item.hasClass("template")) {
                                $(ui.item).remove();
                            } else {
                                $(ui.sender).sortable("cancel");
                            }
                        }
                    } else {

                    }
                }
            });
        }
    });


    $("#trash").droppable({
        over: function() {
            $("#trash").animate({

                height: '+=20px',
                width: '+=20px'
            });
        },
        out: function() {
            $("#trash").animate({

                height: '-=20px',
                width: '-=20px'
            });
        },
        drop: function(event, ui) {
            ui.draggable.remove();
            $("#trash").animate({

                height: '-=20px',
                width: '-=20px'
            });
        }
    });



});