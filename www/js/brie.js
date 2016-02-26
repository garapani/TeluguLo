(function(){


	var Brie = window.Brie = {


		/**
		 * The main trie structure, containing all the words from the dictionary
		 */
		mainTrie: null,


		/**
		 * Method: init
		 * Constructor
		 */
		init: function (dictionary) {
      Brie.mainTrie = new Brie.Node();
			for (var i = 0, len = dictionary.length; i < len; i++) {
				Brie.insertWord(Brie.mainTrie, dictionary[i]);
			}
		},


		/**
		 * The Trie node structure
		 */
		Node: function () {
			this.word = null;
      this.ranking = 0;
			this.children = {};
		},


		/**
		 * Method: range
		 * A simple range function
		 *
		 * Parameters:
		 * start - {Number} the beginning of the range OR the range limit if the 'end' parameter is not give
		 * end   - {Number} (optional), the end of the range
		 *
		 * Returns:
		 * {Array} an array with the generated range
		 *
		 * Example:
		 * range(3)   returns [0, 1, 2]
		 * range(1,4) returns [1, 2, 3]
		 */
		range: function (start, end) {
			var arrRange = [];

			if (typeof end === 'undefined') {
				end   = start;
				start = 0;
			}

			for (var i = start; i < end; i++) {
				arrRange.push(i);
			}

			return arrRange;
		},


		/**
		 * Method: insertWord
		 * Inserts a word in the Trie node
		 *
		 * Parameters:
		 * node - {Object} the Trie node
		 * word - {String} the word that needs to be inserted
		 */
		insertWord: function (node, word) {
      var found = false;
			for (var i = 0, len = word.length; i < len; i++) {
				var letter = word[i];

				if (!node.children[letter]) {
					node.children[letter] = new Brie.Node();
				}
        else {
          found = true;
        }

				node = node.children[letter];
			}
      if(found) {
        node.ranking = node.ranking + 1;
      }
			node.word = word;
		},


		/**
		 * Method: searchWord
		 * Searches for a word inside the Trie structure and returns the entries matching the word, based on a maximum levenshtein distance cost
		 *
		 * Parameters:
		 * word - {String} the word we're searching for
		 * cost - {Number} the Levenshtein distance between the searched word and similar ones http://en.wikipedia.org/wiki/Levenshtein_distance
		 *
		 * Returns:
		 * {Array} an array with the matching words
		 */
		searchWord: function (word, cost) {
			var currentRow = Brie.range(word.length + 1),
				results    = [];

			for (var letter in Brie.mainTrie.children) {
				Brie.searchWordRecursive(Brie.mainTrie.children[letter], letter, word, currentRow, results, cost);
			}
			return results;
		},


		/**
		 * Method: searchWordRecursive
		 * recursive helper search function
		 */
		searchWordRecursive: function (node, letter, word, previousRow, results, maxCost) {

			var columns    = word.length + 1,
				currentRow = [previousRow[0] + 1],
				xrange     = Brie.range(1, columns);

			for (var i = 0, len = xrange.length; i < len; i++) {
				var column = xrange[i];

				var insertCost  = currentRow[column - 1] + 1,
					deleteCost  = previousRow[column] + 1;
					replaceCost = (word[column - 1] !== letter) ? previousRow[column - 1] + 1 : previousRow[column - 1];

				currentRow.push(Math.min(insertCost, deleteCost, replaceCost));
			}

			if (currentRow[currentRow.length - 1] <= maxCost && node.word) {
				results.push({'word':node.word, 'ranking':node.ranking});
			}

			if (Math.min.apply(Math, currentRow) <= maxCost) {
				for (var letter in node.children) {
					Brie.searchWordRecursive(node.children[letter], letter, word, currentRow, results, maxCost);
				}
			}
		},

	}

})();
