"use strict";

var SPEED = 500;
var automatic_state = false;
var G, counter, current, current_i,	__this, timer, ht = 1;
var queue = [];
var arrow_elem;
init();

function init(){
	// make the global object that will contain the page
	G = mk_function(null, "__global", {});
	$(".inner-context").html('');
	arrow_elem = $("#arrow");
	G.parent = null;
	queue = [];

	counter = 0;
	current  = G;
	current_i = 0;
	__this = null;
}

function __html (o, n, str) {
	if(str === undefined) str = '';
	$("."+o).html(
		$("."+o).html() + "<div class='" + n + " pos' >" + str + "</div>"
	);
}

function animate_me() {
	if(queue.length == 0) {
		console.log("---------------------COMPLETED-----------------------");
		return;
	}
	var obj = queue.shift();
	obj.str = obj.str === undefined ? "undefined" : obj.str.toString();
	
	if(obj.place) arrow_elem.css({'top':parseInt(obj.place) + 15});

	if(obj.type == 1){
		$('.'+obj.o).remove();
	} else if(obj.type == 0) {
		__html(obj.o, obj.n,obj.str);
	} else if(obj.type == 2){
		$("."+obj.o).html($("."+obj.o).html() + obj.str); 
	} else if(obj.type == 3){
		$("."+obj.o).html(obj.str);
	}
	if(obj.type === 2 || obj.type === 3)
		if($('.' + obj.o).get(0)) $('.' + obj.o).get(0).scrollIntoView();;

	$("#container").scrollLeft(1000);
	if(obj.skip){
		animate_me();
	} else {
		if(automatic_state) 
			timer = setTimeout(animate_me, SPEED);
	}
}

function go_ahead(){
	$(".tool-box").animate({width:'0px'},100,function(){
		arrow_elem.css({'top':'70'});
		$("#arrow").show();
		$(this).hide();

		// heeeeeeeeeeere													 -> <- or -> () <-
		$(".inner-context").animate({width:'55%',marginRight:'10px'},100,exceuteFunction());
		$("#next-button").fadeIn();
		$("#auto-button").fadeIn();
		$("#stop-button").fadeIn();
		$("#exec-button").fadeTo(100,0,function(){$(this).hide();});

	})
}

function automatic(){
	if($("#auto-button").text() == "Automatic Execution") {
		$("#auto-button").text("Manual Execution");
		$("#automatic-speed").fadeIn();
		$("#next-button").prop("disabled",true).addClass("disabled-button");
		// make automatic
		automatic_state = true;
		animate_me();

	} else {
		$("#automatic-speed").fadeOut();
		$("#auto-button").text("Automatic Execution");
		$("#next-button").prop("disabled",false).removeClass("disabled-button");
		// make stop
		automatic_state = false;
		clearTimeout(timer);
	}
}

function go_back(){
	clearTimeout(timer);
	arrow_elem.hide();
	arrow_elem.css({'top':'70'});
	$(".inner-context").animate({width:'0%',marginRight:'5px'},100,function(){
	$(".tool-box").show().animate({width:'20%'},100)});
	$("#next-button").fadeOut();
	$("#auto-button").fadeOut();
	$("#stop-button").fadeOut();
	$("#exec-button").show().fadeTo('slow',1);
	$("#automatic-speed").hide();
	$("#next-button").prop("disabled",false).removeClass("disabled-button");
	$("#auto-button").text("Automatic Execution");
	$(".inner-context").html('');
	// reset
	automatic_state = false;
	init();
}

function exceuteFunction(){
	init();
	add_block($('.dropDiv'), G, G);
	_execute();
}

function _execute(){
	ht = 1;
	clearTimeout(timer);
	G.execute('a0');
	console.log("EXECUTION COMPLETED");
	var count = 0;
	for(var i = 0; i < queue.length; i++){
		if(!queue[i].skip) count++;
	}
	console.log("count = " + count);
	// animate_me();
}

function _fun_(f){
	var obj = {
		type: "fun_name",
		function_name: f,
		arguments: []
	};
	if(arguments[1] instanceof Array){
		obj.arguments = arguments[1];
	} else {
		for(var i = 1; i < arguments.length; i++){
			obj.arguments[i-1] = arguments[i];
		}
	}
	
	return obj;
}

function _var_(f){
	return { type: "var_name", name: f };
}

function _str_(v){
	return { type: "__string",name: v, execute:function(){ return this.name; }};
}

function _arr_(v, i){
	return { type: "arr_name",name: v, index: i, 
	execute:function(){
		return var_up(this.name).value[isObj(this.index) ? var_up(this.index.name).value : this.index]; 
	}};
}

function plusplus(i, place){
	return assign( _var_(i), "=", binary(_var_(i), "+", 1), place);
}
function minusminus(i, place){
	return assign( _var_(i), "=", binary(_var_(i), "-", 1), place);
}
function var_eq_var (a, b) {
	return assign(_var_(a), '=', _var_(b));
}
function var_bin_var (d) {
	d = d.split(' ');
	var c = d[2];
	if (!isNaN(c)) 
		return binary(_var_(d[0]), d[1], parseInt(c));	
	return binary(_var_(d[0]), d[1], _var_(c));
}
function display_variables(goku) {
    if (!goku) return;
    if(goku.variables) {
    	console.log(goku);
        for (var v in goku.variables) add_text(' . . . .  [' + v + "] : " + goku.variables[v].value);
    }
    display_variables(goku.parent);
}