angular.module('teluguLoApp.DS', [])
.factory('trieTree',function() {
	var services = {};
	var createNode = function(value, parentNode) {
		var node = {
			name : value,
			children : [],
			parent : parentNode,
		};
		return node;
	}
	var root= createNode(0, null);
	services.add = function(value)
	{
		var parent = root;
		for (var i = 0, len = value.word.length; i < len; i++) {
			if (!parent.children) parent.children = [];
			var node = null;
			console.log(parent.children);
			if(parent.children.length > 0) {
				node = parent.children.find(function (child) {
					console.log(child);
					return child.name[i] === value.word[i];
				});
			}
			if (!node) {
				node = createNode(value.word.slice(0, i + 1), parent.name);
				parent.children.push(node);
			}
			parent = node;
		}
		return parent;
	};

	services.find = function(value) {
		var parent = root;
		var _loop2 = function (i, len) {
			console.log(parent.children);
			parent = parent.children.find(function (child) {
				console.log(child);
				return child.name[i] === value[i];
			});

			if (!parent) return {
				v: null
			};
		};

		for (var i = 0, len = value.length; i < len; i++) {
			var _ret2 = _loop2(i, len);

			if (typeof _ret2 === 'object') return _ret2.v;
		}

		return parent;
	};

	services.findWords = function(value)
	{
		var parent = arguments.length <= 1 || arguments[1] === undefined || typeof arguments[1] == 'undefined'? this.root : arguments[1];
		var top = this.find(value, parent);
		if (!top) return [];

		var words = [];

		top.children.forEach(function getWords(node) {
			if(typeof node.ranking != 'undefined') words.push(node);
			node.children.forEach(getWords);
		});
		return words;
	};	
	return services;
});