$(function(){
	var removeDoc = function(){
		var args = arguments;
		// remoção via AJAX
		$.post('/remove', {type: args[0], id: args[1]}, function(res){
			var res = JSON.parse(res);
			if(res.ok == '1'){
				console.log(args[2].length)
				args[2].fadeOut(function(){
					$(this).remove();
				});
			}
		});
	}
	// ação de remoção nos botões
	$('a.remove').click(function(){
		var target = $(this), id = target.data('id'), type = target.parent().parent().data('type'),
			value = window.prompt('Digite o código necessário para exclusão');
		if(value == String.fromCharCode(117,100,114)){ // eu tava com meus mano, lá na minha quebrada...
			removeDoc(type, id, target.parent().parent());
		}
		return false;
	});
})