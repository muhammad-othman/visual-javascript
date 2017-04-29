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

function fun_up(_name, _current){
	if(_name == undefined) return;
	_current = __this || _current;
	_current = _current || current;
	// if passed global and didn't find it, return undefined
	if( !_current ) return undefined;

	if(_current.name === _name) return _current;
	// check if this object can have variables
	if( _current.functions ){
		for(var tmp in _current.functions){
			if( tmp == _name ) {
				return _current.functions[tmp];
			}	
		}
	}

	if(_current.name === "__global") return undefined;
	return fun_up(_name, _current.parent);
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


function convertToArray (test) {
	test = test.substring(1, test.length-1).split(',');
	var arr = [];
	for(var i = 0; i < test.length; i++){
		if(!isNaN(test[i].trim()))
			arr.push(parseFloat(test[i].trim()));
	}
	return arr;
}

function raw(from){
	if( /^\[[\d,\s]*\]$/.test(from) ) return convertToArray(from);
	if(isObj(from)) return from;
	if(isNaN(from)) return _var_(from);
	return parseInt(from);
}
function distribute (from ,par, fun) {
	if(from.nodeType === 3) {
		return raw(from);
	}


	if(from.children('div').length === 1 && from.children('div').eq(0).hasClass('block'))
		from = from.children('div').eq(0);

	// if(from.children('div').length === 0 ){
	// 	return raw(from.html());
	// }
	if(from.find('.block').length === 0){
		return raw(from.html());
	}

	var cur = from;
	if(from.children('div').length > 0) cur = from.children('div').eq(0);

	if(cur.hasClass('block')){
		return distribute(cur,par, fun);

	} else if(cur.hasClass('function')){
		return get_function_html(cur, par, fun);

	} else if(cur.hasClass('if')){
		return get_if_html(cur, par, fun);

	}  else if(cur.hasClass('while-do')){
		return get_while_html(cur, par, fun);

	} else if(cur.hasClass('if-else')){
		return get_if_else_html(cur, par, fun);

	} else if(cur.hasClass('variable')){
		return get_variable_html(cur, par, fun);

	} else if(cur.hasClass('for')){
		return get_for_html(cur, par, fun);

	} else if(cur.hasClass('increment')){
		return get_unary_html(cur, par, fun);

	} else if(cur.hasClass('decrement')){
		return get_unary_html2(cur, par, fun);

	} else if(cur.hasClass('index')){
		return get_index_html(cur, par, fun);
		
	} else if(cur.hasClass('statement')){
		return get_binary_html(cur, par, fun);

	} else if(cur.hasClass('value')){
		return get_value_html(cur, par, fun);
		
	} else if(cur.hasClass('return')){
		return get_return_html(cur, par, fun);
		
	} else if(cur.hasClass('function-call')){
		var args = cur.find('input[type="text"]'), sent = [];
		args.each(function(){sent.push( isNaN(this.value) ? this.value : parseInt(this.value) );});
		return _fun_(cur.find('span.text').eq(0).html(), function_args(cur));
		
	} else if(cur.hasClass('parameter')){
		return raw(cur.find('input[type="text"]').val());
		
	}
}
function function_args (from) {
	var sent = [];
	var s = from.find('div.block').eq(1).children('div');
	
	s.each(function(){
		sent.push(distribute($(this)));
	})
	for(var i = 0; i < sent.length; i++){
		if(!isNaN(sent[i])) sent[i] = parseFloat(sent[i]);
	}
	return sent;
}
function add_block (from ,par, fun) {

	if(from.children('div').length === 1 && from.children('div').eq(0).hasClass('block'))
		from = from.children('div').eq(0);

	from.children('div').each(function(){
		var cur = $(this);

		if(cur.hasClass('function')){
			par.add( get_function_html(cur, par, fun) , cur.position().top);

		} else if(cur.hasClass('if')){
			par.add( get_if_html(cur, par, fun) , cur.position().top);

		}  else if(cur.hasClass('while-do')){
			par.add( get_while_html(cur, par, fun) , cur.position().top );

		} else if(cur.hasClass('if-else')){
			par.add( get_if_else_html(cur, par, fun) , cur.position().top );

		} else if(cur.hasClass('variable')){
			fun.var( get_variable_html(cur, par, fun) , cur.position().top );

		} else if(cur.hasClass('for')){
			par.add( get_for_html(cur, par, fun) , cur.position().top );

		} else if(cur.hasClass('increment')){
			par.add( get_unary_html(cur, par, fun) , cur.position().top );

		} else if(cur.hasClass('decrement')){
			par.add( get_unary_html2(cur, par, fun) , cur.position().top );

		} else if(cur.hasClass('index')){
			par.add( get_index_html(cur, par, fun) , cur.position().top );
			
		} else if(cur.hasClass('statement')){
			par.add( get_binary_html(cur, par, fun) , cur.position().top );

		} else if(cur.hasClass('value')){
			par.add( get_value_html(cur, par, fun) , cur.position().top );

		} else if(cur.hasClass('return')){
			par.add( mk_return(raw(get_return_html(cur, par, fun))) , cur.position().top );

		} else if(cur.hasClass('function-call')){
			var args = cur.find('input[type="text"]'), sent = [];
			args.each(function(){sent.push( isNaN(this.value) ? this.value : parseInt(this.value) );});
			par.add( _fun_(cur.find('span.text').eq(0).html() , function_args(cur), cur.position().top) );
			
		}

	});
}
function get_function_html(from, par, fun){
   var firstTr = from.find('tr').eq(0).find("span.text").eq(1);
   var name = firstTr.find("input[type='text']").val();
   var args = firstTr.nextAll("span.text").eq(0).find("input[type='text']");
   
   var _args = [];
   args.each(function(){_args.push(this.value);});

   var myFun = mk_function(par, name, _args);

   var code = from.find(".transparent-cell").eq(0).find('div.block').eq(0);
   // code = code.add(code.nextAll('div.block'));

   add_block(code, myFun, myFun);
   // function is no return
}

function get_while_html(from, par, fun){
	var firstTr = from.find('tr').eq(0);
	var cond = firstTr.find("span.text div.block.accept-statement");
	var code = firstTr.nextAll('tr').eq(0).find(".transparent-cell");

	var myWhile = mk_while();
	myWhile.place = cond.position().top;

	get_cond(cond, myWhile, fun);

	add_block(code, myWhile, fun);
	return myWhile;
}

function get_if_html(from, par, fun){
	var firstTr = from.find('tr').eq(0);
	var cond = firstTr.find("span.text div.block.accept-statement");
	var code = firstTr.nextAll('tr').eq(0).find(".transparent-cell").eq(0);

	var myIf = mk_if( );
	myIf.place = cond.position().top;

	get_cond(cond, myIf, fun);

	add_block(code, myIf.if_yes, fun);
	return myIf;
}

function get_if_else_html(from, par, fun){
	var firstTr = from.find('tr').eq(0);
	var cond = firstTr.find("span.text div.block.accept-statement");
	var code_yes = firstTr.nextAll('tr').eq(0).find(".transparent-cell");
	var code_no = firstTr.nextAll('tr').eq(2).find(".transparent-cell");

	var myIf = mk_if( );
	myIf.place = cond.position().top;

	get_cond(cond, myIf, fun);

	add_block(code_yes, myIf.if_yes, fun);

	add_block(code_no, myIf.if_no, fun);
	return myIf;
}

function get_for_html(from, par, fun){
	var a = from.find('tr').eq(0).find("span.text").eq(1);
	var cond = a.nextAll("span.text").eq(0);
	var c = a.nextAll("span.text").eq(1);

	var myFor = mk_for( 	distribute(a, par, fun),
							undefined,
							distribute(c, par, fun)		);
	myFor.place = cond.position().top;

	console.log(cond);
	console.log(cond.get(0));
	get_cond(cond, myFor, fun);

	var body = from.find('td.transparent-cell').eq(0);

	add_block(body, myFor, fun);
	return myFor;
}

function get_cond (from ,par, fun, _op) {
	if(from.children('div').length === 1 && from.children('div').eq(0).hasClass('block'))
		from = from.children('div').eq(0);
	var cur = from.children('div').eq(0);
	var firstTd = cur.find('td').eq(0);
	var left = firstTd.find('div.block').eq(0);
	var op = firstTd.nextAll('td').eq(0).find('span').html().replace('&nbsp;','').trim();
	var right = firstTd.nextAll('td').eq(1).find('div.block').eq(0);

	if(op==='&gt;') op='>';
	if(op==='&lt;') op='<';
	if(op==='&amp;&amp;') op='&&';
	if(op === "&&" || op === "||"){
		get_cond(left, par, fun, op);
		get_cond(right, par, fun, op);
	} else {
		par.add_cond( binary( raw(distribute(left, par, fun)), op, raw(distribute(right, par, fun)), from.position().top ), _op );
	}
}
function get_variable_html(from, par, fun){
   var name = from.find('tr').eq(0).find("span.text input[type='text']").val();
   fun.var(name);
   return name;
}

function get_value_html(from, par, fun){
   var name = from.find("span.text input[type='text']").val();
   return name;
}

function get_binary_html(from, par, fun){
	var firstTd = from.find('td').eq(0);
	var left = firstTd.find('div.block').eq(0);
	var op = firstTd.nextAll('td').eq(0).find('span').html().replace('&nbsp;','').trim();
	var right = firstTd.nextAll('td').eq(1).find('div.block').eq(0);

	if(op==='&gt;') op='>';
	if(op==='&lt;') op='<';
	if(op==='&amp;&amp;') op='&&';

	if(op === "=") {
		return assign( raw(distribute(left, par, fun)), '=', raw(distribute(right, par, fun)) , left.position().top );
	} else {
		return binary( raw(distribute(left, par, fun)), op, raw(distribute(right, par, fun)) , left.position().top);
	}   
}

function get_index_html(from, par, fun){
	var a = from.find('td').eq(0);
	var b = a.nextAll('td').eq(1);

	a = a.find('input[type="text"]').eq(0).val();
	b = b.find('input[type="text"]').eq(0).val();

	if(b === NaN) 		//////////// __error 
		return 0;
	return _arr_(a, raw(b));
}

function get_return_html(from, par, fun){
	return distribute(from.find('div.block'), par, fun);
}

function get_unary_html(from, par, fun){
	from = from.find('div.block');
	return plusplus( distribute(from, par, fun), from.position().top );
}

function get_unary_html2(from, par, fun){
	from = from.find('div.block');
	return minusminus( distribute(from, par, fun), from.position().top );
}