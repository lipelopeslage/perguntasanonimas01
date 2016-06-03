// tratamento de rotas
var express = require('express');
var app = express();
// selecionando o banco
var mongodb = require('mongodb');
// API pra banco
var mongoose = require('mongoose');
// URL do banco de dados
var dbUrl = 'mongodb://user:user@ds011913.mlab.com:11913/heroku_qb961mgd';
// conexão do banco
var db = mongoose.connection;
// definindo o model com instância do banco
var models = require('./app/model/model')(mongoose);
var routes;

// iniciar app
var startApp = function(){
  var server;
  // definindo o controller com instância da model
  routes = require('./app/controller/controller')(app, models);

  // definindo a porta do serviço
  app.set('port', process.env.PORT || 3000);
  // definindo diretório das views utilizadas no template
  app.set('views', __dirname + '/app/view');
  // escolhendo engine de templatização
  app.set('view engine', 'ejs');
  // ativando leitura de endereço IP
  app.set('trust proxy', 'loopback');
  // definindo caminho para assets estáticos
  app.use(express.static(__dirname + '/app/public'));
  // iniciando server
  server = app.listen(app.get('port'), function() {
    console.log('Ouvindo servidor em http://localhost:' + server.address().port + '...');
  });  
}

// adicionando os models utilizados no app
// formato: nome, url relativa do arquivo .js, schema
models.addModel('question', './question', mongoose.model('Question', new mongoose.Schema({question:String, ip: String, date: Date, totalAnswers: {type: Number, default: 0}}), 'question'));
models.addModel('answer', './answer', mongoose.model('Answer', new mongoose.Schema({question: Object, answer:String, ip: String, date: Date}), 'answer'));

Date.prototype.formated = function(){
  var day = this.getDate(), month = this.getMonth()+1, year = this.getFullYear(), result;
  return ((day < 10) ? '0'+day : day ) + '/' + ((month < 10) ? '0'+month : month ) + '/' + year;
}
// avisa o console em caso de erro na conexão do banco
db.on('error', console.log.bind(console,'connection error'));
// ao conectar no banco, iniciar app
db.on('open', startApp);
// conectar no banco
mongoose.connect(dbUrl);
