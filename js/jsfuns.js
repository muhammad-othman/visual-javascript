"use strict";

var 
TAB_SIZE 				= 		8,
SPACE 					=		"&nbsp;",
switch_to_new_obj		=		true
;
function ____(l,splitter){
	if(!l) return "";
	l *= TAB_SIZE;
	splitter = splitter || SPACE;
	return (new Array(l)).join(splitter);
}

function get_level(obj){
	var lvl = 0;
	while(obj.parent) {if(obj.type != "__if_block"){lvl++;} obj = obj.parent; }
	return lvl-1;
}

function get_parent_with_variables(obj){
	while(!obj.variables) {
		obj = obj.parent;
	}
	return obj;
}

function get_json(){
	var json = JSON.stringify(G,function(k, v){
		if(k == "parent")return v?v.name:"null";
		if(v === undefined)return "undefined";return v;
	});
	prompt("", json);
}

function var_up(_name, _current){
	if(_name == undefined) return;
	_current = __this || _current;
	_current = _current || current;
	// if passed global and didn't find it, return undefined
	if( !_current ) return undefined;

	// check if this object can have variables
	if( _current.variables ){
		for(var tmp in _current.variables){
			if( tmp == _name ) {
				return _current.variables[tmp];
			}	
		}
	}

	if(_current.name === "__global") return undefined;
	return var_up(_name, _current.parent);
}

function log_deactive(a){console.log(a);}


function change_context(i){
	$(".inner-context[value='"+i+"']").trigger("click");
}

function json(obj){
	return JSON.stringify(obj,function(k, v){if(k == "parent")return v?v.name:"null";if(v === undefined)return "undefined";return v;})
}
function add_text(t) {
    $(".inner-context").html($(".inner-context").html() + "<br/>" + t);
    console.log(t);
}


/** =================================================================================================
 * =================================================================================================
 * =================================================================================================
 **/



function raw(from){
	if(isNaN(from)) return _var(from);
	return from;
}
function distribute (from ,par, fun) {
	if(from.nodeType === 3) {
		return raw(from);
	}

	if(from.children('div').length === 0 ){
		return raw(from.html());
	}
	if(from.find('.block').length === 0){
		return raw(from.html());
	}

	from.children('div').each(function(){
		var cur = $(this);

		if(cur.hasClass('block')){
			distribute(cur,par, fun);

		} else if(cur.hasClass('function')){
			get_function_html(cur, par, fun);

		} else if(cur.hasClass('if')){
			get_if_html(cur, par, fun);

		}  else if(cur.hasClass('while-do')){
			get_while_html(cur, par, fun);

		} else if(cur.hasClass('if-else')){

		} else if(cur.hasClass('variable')){
			get_variable_html(cur, par, fun);

		} else if(cur.hasClass('for')){
			get_for_html(cur, par, fun);

		} else if(cur.hasClass('increment')){
			get_unary_html(cur, par, fun);

		} else if(cur.hasClass('statement')){
			get_binary_html(cur, par, fun);
		}

	});
}

function get_function_html(from, par, fun){
   var firstTr = from.find('tr').eq(0);
   var name = firstTr.find("span.text input[type='text']").val();
   var args = firstTr.find("span.text div.block.accept-parameter").text();
   
   var myFun = mk_function(par, name, args.split(','));

   var code = from.find(".transparent-cell").eq(0).find('div.block').eq(0);
   // code = code.add(code.nextAll('div.block'));

   distribute(code, myFun, myFun);
}

function get_while_html(from, par, fun){
	var firstTr = from.find('tr').eq(0);
	var cond = firstTr.find("span.text div.block.accept-statement");
	var code = firstTr.nextAll('tr').eq(0).find(".transparent-cell");

	var myWhile = mk_while(distribute(cond, par, fun));

	distribute(code, myWhile, fun);
	par.add(myWhile);
}

function get_if_html(from, par, fun){
   var firstTr = from.find('tr').eq(0);
   var cond = firstTr.find("span.text div.block.accept-statement");
   var code = firstTr.nextAll('tr').eq(0).find(".transparent-cell").eq(0);
   
   var myIf = mk_if( distribute(cond, par, fun) );

   distribute(code, myIf, fun);
   par.add(myIf);
}

function get_if_else_html(from, par, fun){
	var cond = from.find('tr').eq(0).find("span.text div.block.accept-parameter").text();   
	var code_yes = from.find('tr').eq(1).find("div.block");
	var code_no = from.find('tr').eq(3).find("div.block");

	var myIf = mk_if( distribute(cond, par, fun) );
	distribute(code_yes, myIf.yes, fun);

	distribute(code_yes, myIf.no, fun);
	par.add(myIf);
}

function get_for_html(from, par, fun){
	var tr = from.find('tr').eq(0);
	var a = from.find('tr').eq(0).find("span.text").eq(1);
	var b = a.nextAll("span.text").eq(0);
	var c = a.nextAll("span.text").eq(1);

	var myFor = mk_for(
						distribute(a, par, fun),
						distribute(b, par, fun),
						distribute(c, par, fun)		);

	var body = from.find('td.transparent-cell').eq(0);
	distribute(body, myFor, fun);
	par.add(myFor);
}

function get_variable_html(from, par, fun){
   var name = from.find('tr').eq(0).find("span.text input[type='text']").val();
   fun.var(name);
}

function get_binary_html(from, par, fun){
	var firstTd = from.find('td').eq(0);
	var left = firstTd.find('div.block').eq(0);
	var op = firstTd.nextAll('td').eq(0).find('span').html();
	var right = firstTd.nextAll('td').eq(1).find('div.block').eq(0);

	if(op === "="){
		par.add( assign( distribute(left, par, fun), '=', distribute(right, par, fun) ) );
	} else {
		par.add( binary( distribute(left, par, fun), op.replace('&nbsp;','').trim(), distribute(right, par, fun) ) );
	}

   
}

function get_unary_html(from, par, fun){
	par.add( plusplus( from.find('div.block').html() ));
}