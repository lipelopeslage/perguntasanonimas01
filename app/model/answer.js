module.exports = function(collection){
	return {
		get: function () {
			// trata os argumentos
			var args = [].slice.call(arguments), objs = [], query, callback;
			callback = args.filter(function(arg){
				if(typeof arg == 'object') objs.push(arg);
				return typeof arg == 'function';
			})[0] || null;
			query = objs[0] || {};
			try{
				/*busca na coleção de acordo com a query, e chama o callback passando o resultado*/
				collection.find(query, function(err, res){
					var res = (res.length) ? res : [];
					callback.call(this, res);
				});
			}catch(err){
				throw new Error(err);
			}
		},
		insert: function(){
			var args = [].slice.call(arguments), objs = [], query, insert, callback;
			callback = args.filter(function(arg){
				if(typeof arg == 'object') objs.push(arg);
				return typeof arg == 'function';
			})[0] || function(){};
			query = objs[0] || {};
			/* cria um novo objeto da coleção */
			insert = new collection(query);
			try{
				/*insere na coleção, e chama o callback passando o resultado*/
				insert.save(function(err, res){
					callback.call(this, res);
				});
			}catch(err){
				throw new Error(err);
			}
		},
		remove: function(){
			var args = [].slice.call(arguments), objs = [], query, callback;
			callback = args.filter(function(arg){
				if(typeof arg == 'object') objs.push(arg);
				return typeof arg == 'function';
			})[0] || function(){};
			query = objs[0] || {};
			try{
				/*remove da coleção de acordo com a query, e chama o callback passando o resultado*/
				collection.remove(query, function(err, res){
					callback.call(this, res);
				})
			}
			catch(err){
				throw new Error(err);
			}
		}
	}
}