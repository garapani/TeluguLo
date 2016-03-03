angular.module('teluguLoApp.services', ['teluguLoApp.DS'])
.factory('trieFactory',function(trieTree) {
  var service = {};
  //var trie = new Trie();
  service.addWord = function(wordToAdd)
  {
    var item = {word:wordToAdd,ranking:0};
    var temp = trieTree.add(item);
    temp.ranking = temp.ranking + 1;
  };

  service.findWord = function(searchWord)
  {
    console.log("searching for " + searchWord.trim());
    var nodes = trieTree.findWords(searchWord.trim());
    return nodes;
  };

  service.initialization = function()
  {
    var data = [
      {word:"venkaT",ranking:0},
      {word:"vamSee",ranking:0},
      {word:"venki",ranking:0},
    ];

    for (var node in data) {
      var tempNode = trieTree.add(data[node]);
      tempNode.ranking = 1;
      console.log(tempNode);
    }
  };
  return service;
});
