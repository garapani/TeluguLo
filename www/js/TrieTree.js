angular.module('teluguLoApp.DS', [])
.factory('trieTree',function() {
	var services = {};
	var Node = function Node(value, parent) {
		if (value === undefined) value = '';
		this.name = value;
		this.children = [];
		this.parent = parent;
	};

	var root = new Node();
	services.add = function(value)
	{
		var parent = root;
		var _loop = function (i, len) {
			if (!parent.children) parent.children = [];
			var node = null;
			var k = 0;
			if(parent.children.length > 0) {
				for(k = 0; k< parent.children.length; k++) {
					if(parent.children[k].name[i] === value.word[i]) {
						node = parent.children[k];
						break;
					}
				}
			}

			if (!node) {
				node = new Node(value.word.slice(0, i + 1), parent.name);
				parent.children.push(node);
			}
			parent = node;
		};

		for (var i = 0, len = value.word.length; i < len; i++) {
			_loop(i, len);
		}

		return parent;
	};

	services.find = function(value) {
		var parent = root;
		var _loop2 = function (i, len) {
			var node = null;
			var k = 0;
			for(; k< parent.children.length; k++) {
				if(parent.children[k].name[i] === value[i]) {
					parent = parent.children[k];
					break;
				}
			}
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
		var parent = root;
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