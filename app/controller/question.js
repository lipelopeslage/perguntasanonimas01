module.exports = function(app, questionModel, answerModel){
	// biblioteca para parsear requisições POST
	var bodyParser = require('body-parser');

	// função auxiliar para criação de caminhos
	var buildURL = function(req, path){
		return '//'+req.headers.host+path;
	}

	// função auxiliar que retorna o endereço IP da requisição
	var getIpAddr = function(req){
		var ipAddr = req.headers["x-forwarded-for"], list = (ipAddr) ? ipAddr.split(",") : [];
		return (ipAddr) ? list[list.length-1] : req.connection.remoteAddress;
	}

	// função auxiliar que mascara uma string contendo um IP
	var maskIp = function(str){
		var ipAddr = str.split('.');
		ipAddr[1] = 'xxx';
		ipAddr[2] = 'xxx';
		return ipAddr.join('.');
	}

	/* função auxiliar contendo as particularidades de 
		exclusão de documentos nas duas coleções (models)
	*/
	var remove = function(model, id, res){
		var answer;

		if(model.name == 'question'){
			// remove a questão
			model.remove({_id: id}, function(data){
				// retorno do ajax
				res.end(JSON.stringify(data));		
			});
		}else{
			// pega a resposta que será excluída
			answer = answerModel.get({_id:id}, function(data){
				// pega o id da questão atrelado à resposta
				var questionID = data[0].question;
				// remove a resposta
				model.remove({_id: id}, function(data){
					// decrementa o número de respostas da questão
					questionModel.update({_id: questionID}, {$inc:{totalAnswers:-1}}, function(){
						// retorno do ajax
						res.end(JSON.stringify(data));
					});
				});
			});
		}
	}

	// DEFININDO ROTAS

	// redireciona para /get se vazio
	app.get('/', function(req, res){
		res.writeHead(302, {'Location':'/get'});
		res.end();
	});

	// /get lista questões no arquivo 'view/question.ejs'
	app.get('/get', function(req, res){
		questionModel.get(function(data){
			// o objeto no segundo argumento será lido na view
			res.render('question', {data : data, request: req, list: true});
			res.end();
		})
	});

	// /get/:id lista uma questão específica e suas respectivas respostas
	app.get('/get/:id', function(req, res){
		var questionID = req.params.id;
		// busca a questão pelo ID dela na URL
		questionModel.get({_id: questionID}, function(data){
			// maskeando o IP
			data[0].ip = maskIp(data[0].ip);
			// pega as respostas daquela questão
			answerModel.get({question: questionID}, function(ansData){
				res.render('question', {
					data : data[0], 
					answers: JSON.parse(JSON.stringify(ansData)), /* array de respostas */
					request: req, 
					list: false
				});
				res.end();
			});			
		});
	});

	/* /insert mostra formulário de inserção de questões no arquivo 'view/question.js'*/
	app.get('/insert', function(req, res){
		res.render('insert', {request: req, backURL:buildURL(req, '/'), buttonLabel: 'Inserir'});
		res.end();
	});


	// POST

	// inserir questão
	app.post('/insert', bodyParser.urlencoded({ extended: false }), function(req, res){
		// adiciona 2 campos no POST, ip e date
		req.body.date = Date.now();
		req.body.ip = getIpAddr(req);
		// inserindo o conteúdo do POST (req.body) no model
		questionModel.insert(req.body, function(data){
			data = JSON.parse(JSON.stringify(data));
			res.writeHead(302, {'Location':'/get'});
			res.end();
		})
	});

	app.post('/answer', bodyParser.urlencoded({ extended: false }), function(req, res){
		// adiciona 2 campos no POST, ip e date
		req.body.date = Date.now();
		req.body.ip = getIpAddr(req);
		// inserindo o conteúdo do POST (req.body) na coleção de respotas
		answerModel.insert(req.body, function(data){
			// incrementa o número de respostas de uma pergunta
			questionModel.update({_id: req.body.question}, {$inc:{totalAnswers:1}}, function(){
				// atualiza a tela da questão
				res.writeHead(302, {'Location':'/get/'+data.question});
				res.end();	
			});
		});
	});

	app.post('/remove', bodyParser.urlencoded({extended: false}), function(req, res){
		var type = req.body.type, id = req.body.id;
		if(type == 'answer')
			remove(answerModel, id, res);
		else
			remove(questionModel, id, res);
		
	});
}