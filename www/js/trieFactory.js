angular.module('teluguLoApp.services', ['teluguLoApp.DS'])
.factory('trieFactory',function(trieTree,$cordovaFile) {
  var service = {};
  //var trie = new Trie();
  service.addWord = function(wordToAdd) {
    var item = {word:wordToAdd,ranking:0};
    var temp = trieTree.add(item);
    temp.ranking = temp.ranking + 1;
  };

  service.findWord = function(searchWord) {
    console.log("searching for " + searchWord.trim());
    var nodes = trieTree.findWords(searchWord.trim());
    return nodes;
  };

  var serialize = function(jsonString) {
    $cordovaFile.checkFile(cordova.file.dataDirectory, "wordsDB.txt")
    .then(function (success) {
    },
    function (error) {
      $cordovaFile.createFile(cordova.file.dataDirectory, "wordsDB.txt",false)
      .then(function (success) {
        $cordovaFile.writeFile(cordova.file.dataDirectory, "wordsDB.txt", jsonString, true)
        .then(function (success) {
          $cordovaFile.readAsText(cordova.file.dataDirectory, "wordsDB.txt")
          .then(function (success) {
            var words = JSON.parse(success);
            for (var word in words) {
              var tempNode = trieTree.add(words[word]);
              tempNode.ranking = words[word].ranking;
            }
          }, function (error) {
            console.log(error);
          });
        }, function (error) {
          console.log(error);
        });
      }, function (error) {
        console.log(error);
      });
    });
  };

  var divider = '#';
  var deserialize = function() {
    $cordovaFile.checkFile(cordova.file.dataDirectory, "wordsDB.txt")
    .then(function (success) {
      console.log(success);
      $cordovaFile.readAsText(cordova.file.dataDirectory, "wordsDB.txt")
      .then(function (success) {
        var words = JSON.parse(success);
        for (var word in words) {
          var tempNode = trieTree.add(words[word]);
          tempNode.ranking = words[word].ranking;
        }
      }, function (error) {
        console.log(error);
      });
    }, function (error) {
      console.log(error);
    });
  };

  service.initialization = function() {
    var data = [
      {word:"venkaT",ranking:1},
      {word:"vamSee",ranking:1},
      {word:"venki",ranking:1},
    ];
     serialize(JSON.stringify(data));
     deserialize();
  };
  return service;
});