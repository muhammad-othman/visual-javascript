"use strict";

var loop_counter 	= 0;

function execute(expr, H){
	if(expr === undefined)
		return undefined;
	if(!isObj(expr)) return expr;
	if(expr.place) _arrow(expr.place);
	if(expr.type === "__return") return expr;

	switch(expr.type){
		case "__var"				: 	return execute( expr.value, H );
		case "var_name"				: 	return execute( var_up(expr.name, H) );
		case "__string"				: 	return expr.name;
		case "fun_name"				: 	var f = expr.function_name;
										if( !isObj(f) ) f = fun_up(f);
										return f.call(expr.arguments, H).execute(H);
		case "arr_name"				:   if(expr.index === undefined) return var_up(expr.name).value;
										return var_up(expr.name).value[ isObj(expr.index) ? var_up(expr.index.name).value : expr.index];
	}
	return val( expr.execute(H) );
}

function val(obj){
	return isObj(obj) ? (obj.type === "__return" ? obj : val(obj.value)) : obj;
}
function name(obj){
	return isObj(obj) ? obj.name : obj;
}

function can_be_child(obj){
	return isObj(obj) && obj.type !== "function" && obj.type !== "__var";
}

function set_parent(obj, par){
	if(can_be_child(obj)) obj.parent = par;
}

function isObj(obj){
	return typeof obj === "object" && !(obj instanceof Array);
}

function binary(_left, _op, _right, place) {

	if(_op === "+=" || _op === "-=" || _op === "*=" || _op === "/="){
		return assign(_left, '=', binary(_left, _op[0], _right, place), place);
	}

	var obj = {
		type   		: "__binary",
		left   		: _left,
		op     		: _op, 
		right  		: _right,
		place		: place,

		execute 	: function(H){
						var bin = 'a' + (ht++);
						_add(H, bin + ' pos-border', '' ,true , this.place);

						var x = 'a' + (ht++);
						_add(bin, x, '', true );
						var l =  execute( this.left, x );
						_text(x ,l, !isObj(this.left) || this.left.type === "var_name", this.place);

						var m = 'a' + (ht++);
						_add(bin, m ,this.op, true, this.place);

						var y = 'a' + (ht++);
						_add(bin, y, '', true, this.place );
						var r =  execute( this.right, y);
						_text(y ,r, false, this.place );
						
						var ans;
						switch(this.op){
							case "+"	:	ans = l +  r; break;
							case "-"	:	ans = l -  r; break;
							case "*"	:	ans = l *  r; break;
							case "%"	:	ans = l /  r; break;
							case "/"	:	ans = l /  r; break;
							case "//"	:	ans = Math.floor(l / r); break;
							case "^"	:	ans = l ^  r; break;
							case "&&"	:	ans = l && r; break;
							case "||"	:	ans = l || r; break;

							case ">"	: 	ans = l >  r; break;
							case "<"	: 	ans = l <  r; break;
							case ">="	: 	ans = l >= r; break;
							case "<="	: 	ans = l <= r; break;
							case "=="	: 	ans = l == r; break;
							case "!="	: 	ans = l != r; break;
						}


						_text_new(bin, ans);
						_remove(bin, true);
						if(this.place) _arrow(this.place);
						return ans;
		}
	};

	set_parent(obj.left, obj);
	set_parent(obj.right, obj);
	return obj;
}

function assign(_left, _op, _right, place) {
	var obj = {
		type   		: "__assign",
		left   		: _left,
		op     		: _op, 
		right  		: _right,
		place		: place,

		execute 	: function(H){
						if(this.place) _arrow(this.place);

						var tl = this.left;
						if(tl.type === "arr_name"){
							var i = tl.index;
							tl = var_up(tl.name);
							if(i === undefined){
								tl.value = execute(this.right, H);
								update_var_html();
								return tl.value;
							} else {
								if(isObj(i)) i = val( execute(i, H) );
								tl.value[i] = execute(this.right, H);
								update_var_html();
								return tl.value[i];
							}
						}

						var bin = 'a' + (ht++);
						_add(H, bin + ' pos-border', '' ,true , this.place);

						var r = tl.type === "var_name" ? var_up(tl.name) : tl;
						r.value = execute(this.right, H);


						_text_new(bin, r.name + ' = ' + r.value, false);
						_remove(bin, true);
						update_var_html();

						if(this.place) _arrow(this.place);
						return r.value;
		}
	};

	set_parent(obj.left, obj);
	set_parent(obj.right, obj);
	return obj;
}

function update_var_html(){
	var tmp = __this;
	while(true){
		if(tmp.variables){
			_text_new(tmp.html+"_var", getvars_util(tmp), true);
		}
		if(tmp.name == "__global") return;
		tmp = tmp.parent;
	}
}
function _add_cond(__p, bef){
	this.cond.push(__p);
	set_parent(__p, this);
	if(bef && this.cond.length != 0) this.cond[this.cond.length-1].next=bef;
}
function mk_for(_init, _cond, _inc){
	var obj = {
		type			: "__for",
		name 			: "__for" + loop_counter++,
		init 			: _init,
		cond 			: [],
		inc 			: _inc,
		statements		: [],
		
		add_init: 		function(__p){
							this.init = __p;
							set_parent(__p, this);
		},
		add_cond: 		_add_cond,
		add_inc: 		function(__p){
							this.inc = __p;
							set_parent(__p, this);
		},
		add: 			function(__p, place){
							if(__p && place) __p.place = place;
							this.statements.push(__p);
							set_parent(__p, this);
		},
		execute: 		function(H){
							var k;
							execute(this.init);	
							while( exec_cond(this.cond, H) ){
								exec_arr(this.statements, H);
								execute(this.inc, H);
							}
		}
	};
	if(_cond) obj.add_cond(_cond);

	set_parent(obj.init, obj);
	set_parent(obj.cond, obj);
	set_parent(obj.inc, obj);

	return obj;
}

function mk_while(_cond){
	var obj = {
		type			: "__while",
		name 			: "__while" + loop_counter++,
		cond 			: [],
		statements		: [],

		add: 		function(__p, place){
						if(__p && place) __p.place = place;
						this.statements.push(__p);
						set_parent(__p, this);
		},
		add_cond: 	_add_cond,
		execute: 	function(H){
						var k, i;
						while( exec_cond(this.cond, H) ){
							exec_arr(this.statements, H);
						}
		}
	};
	if(_cond) obj.add_cond(_cond);
	set_parent(obj.cond, obj);
	return obj;
}

function mk_if(_cond){
	var obj = {
		type			: "__if",
		name 			: "__if" + loop_counter++,
		cond 			: [],
		if_yes 			: mk_if_block(),
		if_no			: mk_if_block(),

		add_yes 		: function(__p, place){
							if(__p && place) __p.place = place;
							this.if_yes.push(__p);
							set_parent(__p, this);
		},
		add_no			: function(__p, place){
							if(__p && place) __p.place = place;
							this.if_no.push(__p);
							set_parent(__p, this);
		},
		add_cond 		: 	_add_cond,
		execute 		: 	function(H){
							return exec_cond(this.cond, H) ? this.if_yes.execute(H) : this.if_no.execute(H);
		}
	};
	if(_cond) obj.add_cond(_cond);

	set_parent(obj.cond, obj);
	return obj;
}

function mk_if_block(){
	var obj = {
		statements 		: [],

		add 	 		: function(__p, place){
							if(__p && place) __p.place = place;
							this.statements.push(__p);
							set_parent(__p, this);
		},
		execute 		: 	function(H){
							return exec_arr(this.statements, H);
		}
	};

	return obj;
}

function exec_arr(arr, H){
	var k;
	for(var i = 0; i < arr.length; i++){
		k = execute(arr[i], H);
		if(isObj(k)) return k;
	}
}

function exec_cond(arr, H){
	var k;
	for(var i = 0; i < arr.length; i++){
		k = execute(arr[i], H);
		if(i==arr.length-1) return k;
		if(k && arr[i].next == 'or') return true;
		if(!k && arr[i].next == 'and') return false;
	}
	return k;
}

function mk_return(_expr, place){
	var obj = {
		type		: "__return",
		expr		: _expr,
		place 		: place,
		execute 	: function(){
						if(this.place) _arrow(this.place);
						return { value: execute(this.expr), type:"__return"};
		}
	};

	set_parent(obj.expr, obj);
	return obj;
}

function mk_function(_parent,_name, _args) {
	var obj = {
		type			: "function",
		name 			: _name,
		parent 			: _parent,
		variables		: {},
		functions		: {},
		arguments 		: [],
		statements 		: [],
		html			: undefined,

		add: 			function(__p, place){
							if(__p && place) __p.place = place;
							this.statements.push(__p);
							set_parent(__p, this);
		},
		var: 			function(__p, _value, _type, _place){
							if( this.variables[__p] !== undefined ) return this.variables[__p];
							var v = mk_var(__p, this, _type);
							if(_value !== undefined)
								this.add( assign( _var_(__p), "=", _value , _place) );
							return v;
		},
		add_arr: 		function(__p, _value, _type){
							var v = mk_var(__p, this, _type);
							this.add( assign( _arr_(__p), "=", _value ) );
							return v;
		},
		add_function: 	function(__p){
							this.functions[__p.name] = __p;
							set_parent(__p, this);
		},
		add_arg: 		function(__p){
							this.arguments.push(__p);				
		},
		return: 		function(__p){
							this.add( mk_return( __p ) );
		},
		execute: 		function(H){
							var __tmp = __this,k, z=this.statements;
							__this = this;
							this.html = 'a' + (ht++);
							_add(H, this.html + ' function-exec', format(this.name) + getvars(this));


							var k;
							for(var i = 0; i < z.length; i++){
								if(z[i]===undefined) continue;
								k = undefined;
								if(z[i].place) _arrow(z[i].place);
								if(z[i].type == "__return") {
									k = execute(z[i].expr, this.html);
									i=z.length;
								} else if (z[i].type !== "function" && z[i].type !== "__var"){
									k = execute(z[i], this.html);
									if(isObj(k) && k.type == "__return") {
										k = execute(k.expr, this.html);
										i=z.length;
									}
								}
							}
							update_var_html();
							if(this.name != "__global") _remove(this.html);

							__this = __tmp;
							return k;
		},
		call: 			function(_args, H){
							var new_obj = copy_object(this);
							new_obj.parent = __this;
							for(var i = 0; i < _args.length; i++){
								if(isObj(_args[i])){
									new_obj.variables[new_obj.arguments[i]] = 
									{ value:execute(_args[i], H), name:new_obj.arguments[i], parent:new_obj,type:"__var"};
								} else if(typeof _args[i] === "string"){
									new_obj.variables[new_obj.arguments[i]] = var_up(_args[i]);
								} else {
									new_obj.variables[new_obj.arguments[i]].value = _args[i];
								}
							}
							return new_obj;
		}
	};

	for(var i = 0; i < _args.length; i++){
		if(_args[i] !== '') {
			obj.arguments.push(_args[i]);
			obj.variables[_args[i]] = mk_var(_args[i], obj);
		}
	}

	// Hoist the function

	// check if this is not the global object
	if( _parent ){
		var tmp = _parent;
		// go up till you find an object that can have variables (function or global)
		while( !tmp.functions ) tmp = tmp.parent;
		// add the variable to the variables array
		tmp.functions[_name] = obj;
	}
	return obj;
}

function mk_var(_name, _par, _type) {
	var obj = {
		type	: _type || "__var",
		name 	: _name,
		value	: undefined
	};

	// Hoist the variable
	var _par = _par || G;
	// go up till you find an object that can have variables (function or global)
	while( !_par.variables ) _par = _par.parent;
	// add the variable to the variables array
	_par.variables[_name] = obj;
	obj.parent = _par;

	return obj;
}

function copy_object(obj){
	var new_obj = {variables:{}, functions:{}, arguments:[], statements:[], parent:obj.parent,type:"function",name:obj.name};
	for(var v in obj.variables){
		new_obj.variables[v] = copy_object_util(obj.variables[v], new_obj);
		new_obj.variables[v].parent = new_obj;
	}
	
	for(var v in obj.functions){
		new_obj.functions[v] = copy_object(obj.functions[v]);
		new_obj.functions[v].parent = new_obj;
	}
	
	for(var i = 0; i < obj.arguments.length; i++){
		new_obj.arguments[i] = copy_object_util(obj.arguments[i], this);
	}

	if (obj.execute) new_obj.execute = obj.execute;
	if(obj.call) new_obj.call = obj.call;
	if(obj.add) new_obj.add = obj.add;

	for(var i = 0; i < obj.statements.length; i++){
		new_obj.statements[i] = copy_object_util(obj.statements[i], new_obj);
	}
	return new_obj;
}

function copy_object_util(obj, par){
	if(!isObj(obj)) return obj;
	if(obj instanceof Array){
		var new_arr = [];
		for(var i = 0; i < obj.length; i++){
			new_arr[i] = copy_object_util(obj[i], par);
		}
		return new_arr;
	} else {
		var new_obj = {parent: par};

		if(obj.type === "fun_name"){
			new_obj.type = obj.type;
			new_obj.function_name = obj.function_name;
			new_obj.arguments = [];
			for(var i = 0; i < obj.arguments.length; i++){
				new_obj.arguments[i] = copy_object_util(obj.arguments[i], new_obj);
			}
		} else {
			for(var x in obj){
				if(obj[x] && obj[x].type === "__var"){
					new_obj[x] = var_up(obj[x].name, new_obj);
				} else if(x != "parent"){
					new_obj[x] = copy_object_util(obj[x], new_obj);
				}
			}
		}

		return new_obj;
	}
}
function getvars (it) {
	return '<span class="variables ' + it.html + '_var">' + getvars_util(it) + "</span>";
}
function getvars_util (it) {
	var st = "";
	for(var v in it.variables){
		if(it.variables[v].value instanceof Array)
			st += v + " = [" + it.variables[v].value +"]<br/>";	
		else 
			st += v + " = " + it.variables[v].value +"<br/>";
	}
	return st;
}
function format (name) {
	if(name === "__global") return '';
	return '<span class="fun_name">'+name+'</span><br/>';
}
function _text (o,str,skip, place) {
	queue.push({type:2, o:o,str:str, skip:skip, place:place});
}
function _text_new (o,str, skip) {
	queue.push({type:3, o:o,str:str, skip:skip});
}
function _add (o,n,str, skip, place) {
	queue.push({type:0, o:o,n:n,str:str, skip:skip, place:place});
}
function _remove (o, skip) {
	queue.push({type:1, o:o, skip:skip});
}
function _arrow (place) {
	queue.push({type:4,place:place, skip:true});
}