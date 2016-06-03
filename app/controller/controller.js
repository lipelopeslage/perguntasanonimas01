module.exports = function(app, models){
	// inicia o controller 'question' com os models necesários
	require('./question')(app, models.question, models.answer);	
}