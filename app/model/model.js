module.exports = function(mongoose){
	// objeto que irá armazenar os models adicionados
	var models = {};
	models.addModel = function(){
		var args = [].slice.call(arguments), name, schema, file;
		try{
			name = args[0];
			file = args[1];
			collection = args[2];
			
			models[name] = require(file)(collection);
			models[name].name = name;
		}catch(err){
			throw new Error(err);
		}
	}
	return models;
}