"use strict";
/*

	many factors with precedence
	function as an index
	- waiting
	execute merge
	copy function name to another variable
	assign null
					allow objects		OOP
	switch
	break
	continue
*/
var SPEED = 500;
var G, counter, current, current_i,	__this, timer, ht = 1;
var queue = [];

init();

function init(){
	// make the global object that will contain the page
	G = mk_function(null, "__global", {});
	// G.html = 'a0';
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
	if(queue.length == 0) return;
	var obj = queue.shift();
	obj.str = obj.str === undefined ? "undefined" : obj.str.toString();

	if(obj.type == 1){
		$('.'+obj.o).remove();
	} else if(obj.type == 0) {
		__html(obj.o, obj.n,obj.str);
	} else if(obj.type == 2){
		$("."+obj.o).html($("."+obj.o).html() + obj.str); 
	} else if(obj.type == 3){
		$("."+obj.o).html(obj.str);
	}
	if(obj.type != 1)	$('.' + obj.o).get(0).scrollIntoView();;

	$("#container").scrollLeft(1000);
	if(obj.skip){
		animate_me();
	} else {
		timer = setTimeout(animate_me, SPEED);
	}
}

function go_ahead(){
	init();
	distribute($('.dropDiv'), G, G);
	console.log(G);
}

function _execute(){
	ht = 1;
	clearTimeout(timer);
	$(".inner-context").html('');
	G.execute('a0');
	console.log("EXECUTION COMPLETED");
	var count = 0;
	for(var i = 0; i < queue.length; i++){
		if(!queue[i].skip) count++;
	}
	alert(count);
	animate_me();
}

function _fun_(f){
	var obj = {
		type: "fun_name",
		function_name: f,
		arguments: []
	};
	for(var i = 1; i < arguments.length; i++){
		obj.arguments[i-1] = arguments[i];
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

function demo(){
	init();
	// function factorial(n)
	var myFun = mk_function(G, "factorial", ['n']);
	// if(n < 2)
	var myIf = mk_if();
	myIf.add_cond( binary( _var_("n"), "<" , 2))
	
	// return 1;
	myIf.add_yes( mk_return(1) );
	// return n * myFun(n-1);
	myIf.add_no( mk_return(binary(_var_("n"), "*", _fun_(myFun,binary(_var_("n"),"-",1)))));

	myFun.add( myIf );
	// G.var("a", _fun_(myFun, 5));
	G.var("a", binary(_fun_(myFun, 5),"+",_fun_(myFun, 10)));
	// G.add( assign(_var_("a") , "=", binary(_var_("a"),"-",6)));
	// G.add( assign(_var_("a") , "=", binary(_var_("a"),"-",_fun_(myFun, 11))));
}
function demo2(){
	init();
	// function factorial(n)
	var myFun = mk_function(G, "factorial", ['n']);

	// var r = 1;
	myFun.var("r", 1);
	// while( n > 1 )
	var myWhile = mk_while(  var_bin_var('n > 1') );
	
	// r = r * n
	// n = n - 1
	myWhile.add( assign( _var_("r"), "=", var_bin_var('r * n') ) );
	myWhile.add( assign( _var_("n"), "=", var_bin_var('n - 1')) );
	
	myFun.add( myWhile );
	// return r;
	myFun.return(_var_("r"));

	// var a = myFun(5) + myFun(6);
	G.var("a" , binary(_fun_(myFun, 5), "+" , _fun_(myFun, 6)));
}
function demo3(){
	init();
	// function factorial(n)
	var myFun = mk_function(G, "factorial", ['n']);

	// var r = 1;
	myFun.var("r", 1);

	// for( var i = 1; i <= n, i=i+1)
	var myFor = mk_for();
	myFun.var("i", 1);
	myFor.add_cond( var_bin_var('i <= n') );
	myFor.add_inc( plusplus('i') );
	
	// r = r * i;
	myFor.add( assign( _var_("r"), "=", var_bin_var('r * i') ) );
	
	myFun.add( myFor );
	// return r;
	myFun.return(_var_("r"));

	// var a = myFun(5) + myFun(6);
	G.var("a", binary(_fun_(myFun, 5), "+" , _fun_(myFun, 6)));
}
function demo4(){
	init();
	// function factorial(n, str)
	var myFun = mk_function(G, "factorial", ['n', 'str']);
	
	// var r = "";
	myFun.var("r", _str_(""));

	// while( n > 0 )
	var myWhile = mk_while( var_bin_var('n > 0') );
	// r = r + str;
	myWhile.add( assign(_var_("r"), "=", var_bin_var('r + str') ) );
	// n = n - 1
	myWhile.add( assign(_var_("n"), "=", var_bin_var('n - 1') ) );

	myFun.add( myWhile );
	// return r;
	myFun.return(_var_("r"));

	// var a = myFun(5, "hi ");
	G.var("a", _fun_(myFun, 5, _str_("javascript ")));
}
function demo5(){
	init();
	// function factorial(n)
	var myFun = mk_function(G, "myArray", ['n']);

	// var arrr = [];
	myFun.add_arr("arr", []);

	// for( var i = 1; i <= n, i=i+1)
	var myFor = mk_for();
	myFun.var("i", 0);
	myFor.add_cond( var_bin_var('i < n') );
	myFor.add_inc( plusplus('i'));
	
	myFor.add( assign( _arr_("arr", _var_("i")), "=", binary(var_bin_var('i - 10'), "+" , _str_(" ")) ));
	
	myFun.add( myFor );


	var myFor = mk_for();
	myFun.var("r", _str_(""));
	myFun.var("i", 0);
	myFor.add_cond( var_bin_var('i < n') );
	myFor.add_inc( plusplus('i'));
	
	myFor.add( assign( _var_("r"), "=", binary(_var_("r") , "+", _arr_("arr", _var_("i")))) );
	
	myFun.add( myFor );
	// return r;
	myFun.return(_var_("r"));

	// var a = myFun(5) + myFun(6);
	G.var("a", _fun_(myFun, 15));
	// G.var("a", binary(_fun_(myFun, 2), "+" , _fun_(myFun, 2)));
}
function demo6(){
	init();

	var merge = mk_function(G, "Merge", ['A', 'ls', 'le', 'rs', 're']);
	merge.add_arr("tmp", []);
	merge.var("i");

	// for(i = ls; i <= le; i++)
	var merge_for = mk_for(		var_eq_var('i','ls') ,
								var_bin_var('i <= le'),
								plusplus('i') 	);
	// tmp[i-ls] = arr[i];
	merge_for.add(  assign( 	_arr_('tmp', var_bin_var('i - ls') ), '=', 
								_arr_('A', _var_('i'))) 	);
	merge.add(merge_for);

	// int ts = 0, te = le-ls;
	merge.var('ts', 0);
	merge.var('te');
	merge.add(assign(_var_('te'), '=',var_bin_var('le - ls')));

	// while(ts <= te && rs <= re)
	var merge_wh = mk_while('ts <= te');
	merge_wh.add_cond( var_bin_var('rs <= re'), 'and' );
	merge.add(merge_wh);


	// if ( tmp[ts] <= arr[rs] )
	var merge_if = mk_if( binary(_arr_('tmp', _var_('ts')), "<=", _arr_('A', _var_('rs'))) );
	merge_wh.add(merge_if);

	// arr[ls++] = tmp[ts++]
	merge_if.add_yes( assign( _arr_('A', _var_('ls')), '=', _arr_('tmp', _var_('ts')) ) );
	merge_if.add_yes( plusplus('ls') );
	merge_if.add_yes( plusplus('ts') );

	// arr[ls++] = arr[rs++];
	merge_if.add_no( assign( _arr_('A', _var_('ls')), '=', _arr_('A', _var_('rs')) ) );
	merge_if.add_no( plusplus('ls') );
	merge_if.add_no( plusplus('rs') );

	// while(ts <= te) arr[ls++] = tmp[ts++];
	merge_wh = mk_while( var_bin_var('ts <= te') );
	merge.add(merge_wh);
	merge_wh.add( assign( _arr_('A', _var_('ls')), '=', _arr_('tmp', _var_('ts')) )  );
	merge_wh.add( plusplus('ls') );
	merge_wh.add( plusplus('ts') );

	// while(rs <= re) arr[ls++] = arr[rs++];
	merge_wh = mk_while( var_bin_var('rs <= re') );
	merge.add(merge_wh);
	merge_wh.add( assign( _arr_('A', _var_('ls')), '=', _arr_('arr', _var_('rs')) )  );
	merge_wh.add( plusplus('ls') );
	merge_wh.add( plusplus('rs') );

	G.add(merge);

	var MergeSort = mk_function(G, "MergeSort", ['A', 'start', 'end']);
	MergeSort.var("mid", 0);

	var f = mk_if( binary(_var_('start'), '<', _var_('end')) );
	f.add_yes( assign(_var_('mid'), '=', binary( var_bin_var('start + end') , '//', 2) ) );
	f.add_yes(_fun_(MergeSort, _arr_('A'), _var_('start'), _var_('mid')));
	f.add_yes(_fun_(MergeSort, _arr_('A'), binary(_var_('mid'), "+", 1), _var_('end')));

	f.add_yes(_fun_(merge, _arr_('A'), _var_('start'),_var_('mid'), binary(_var_('mid'), "+", 1), _var_('end')));
	MergeSort.add(f);

	G.var('myArr', [2, 4, 3, 5, 1]);
	G.add(MergeSort);
	G.add(_fun_(MergeSort, _arr_('myArr'), 0, 4));
}
function demo7(){
	init();

	var partition = mk_function(G, "partition", ['A', 'start', 'end']);
	partition.var('i');
	partition.var('j');
	partition.add(var_eq_var('i', 'start'));

	var fr = mk_for( 	var_eq_var('j', 'start'),
						var_bin_var('j < end'),
						plusplus('j') 	);

	var f = mk_if( binary(_arr_('A', _var_('j')), '<=', _arr_('A', _var_('end'))) );
	partition.var('tmp');
	f.add_yes( assign(_var_('tmp'), '=', _arr_('A', _var_('i'))) );
	f.add_yes( assign(_arr_('A', _var_('i')), '=', _arr_('A', _var_('j'))) );
	f.add_yes( assign(_arr_('A', _var_('j')), '=', _var_('tmp')) );
	f.add_yes( plusplus('i') );
	fr.add(f);
	
	partition.add(fr);

	partition.add( assign(_var_('tmp'), '=', _arr_('A', _var_('end'))) );
	partition.add( assign(_arr_('A', _var_('end')), '=', _arr_('A', _var_('i'))) );
	partition.add( assign(_arr_('A', _var_('i')), '=', _var_('tmp')) );
	partition.return(_var_('i'));

	G.add(partition);

	var QuickSort = mk_function(G, 'QuickSort', ['A', 'start', 'end']);

	f = mk_if( binary(_var_('start'), '<', _var_('end')) );
	QuickSort.var('p');
	f.add_yes( assign(_var_('p'), '=', _fun_(partition, _arr_('A'), _var_('start'), _var_('end'))) );
	f.add_yes( _fun_(QuickSort, _arr_('A'), _var_('start'), var_bin_var('p - 1') )  );
	f.add_yes( _fun_(QuickSort, _arr_('A'), var_bin_var('p + 1') , _var_('end')  ) );

	QuickSort.add(f);
	G.add(QuickSort);

	G.var('myArr', [2, 4, 3, 5, 1]);
	G.add(_fun_(QuickSort, _arr_('myArr'), 0, 4));
}

function plusplus(i){
	return assign( _var_(i), "=", binary(_var_(i), "+", 1));
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