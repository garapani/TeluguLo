angular.module('teluguLoApp.services', ['teluguLoApp.DS'])
    .factory('trieFactory', function(trieTree, $cordovaFile) {
        var service = {};
        //var trie = new Trie();
        service.addWord = function(wordToAdd) {
            if (wordToAdd != "") {
                var item = { word: wordToAdd, ranking: 1 };
                var temp = trieTree.add(item);
            }
            //console.log(temp);
        };

        service.findWord = function(searchWord, maxWords) {
            console.log("searching for " + searchWord.trim());
            var nodes = trieTree.findWords(searchWord.trim());
            if(typeof nodes != 'undefined' && nodes.length > maxWords) {
                return nodes.slice(0,maxWords);
            }
            // console.log(nodes);
            return nodes;
        };

        var serialize = function(jsonString) {
            $cordovaFile.checkFile(cordova.file.dataDirectory, "wordsDB.txt")
                .then(function(success) {
                    $cordovaFile.writeFile(cordova.file.dataDirectory, "wordsDB.txt", jsonString, true)
                        .then(function(success) {
                            $cordovaFile.readAsText(cordova.file.dataDirectory, "wordsDB.txt")
                                .then(function(success) {
                                    var words = JSON.parse(success);
                                    for (var word in words) {
                                        var tempNode = trieTree.add(words[word]);
                                        tempNode.ranking = words[word].ranking;
                                    }
                                }, function(error) {
                                    console.log(error);
                                });
                        }, function(error) {
                            console.log(error);
                        });
                },
                function(error) {
                    $cordovaFile.createFile(cordova.file.dataDirectory, "wordsDB.txt", false)
                        .then(function(success) {
                            $cordovaFile.writeFile(cordova.file.dataDirectory, "wordsDB.txt", jsonString, true)
                                .then(function(success) {
                                    $cordovaFile.readAsText(cordova.file.dataDirectory, "wordsDB.txt")
                                        .then(function(success) {
                                            var words = JSON.parse(success);
                                            for (var word in words) {
                                                var tempNode = trieTree.add(words[word]);
                                                tempNode.ranking = words[word].ranking;
                                            }
                                        }, function(error) {
                                            console.log(error);
                                        });
                                }, function(error) {
                                    console.log(error);
                                });
                        }, function(error) {
                            console.log(error);
                        });
                });
        };

        var divider = '#';
        var deserialize = function() {
            $cordovaFile.checkFile(cordova.file.dataDirectory, "wordsDB.txt")
                .then(function(success) {
                    console.log(success);
                    $cordovaFile.readAsText(cordova.file.dataDirectory, "wordsDB.txt")
                        .then(function(success) {
                            var words = JSON.parse(success.trim());
                            for (var word in words) {
                                if (words[word] != "") {
                                    var tempNode = trieTree.add(words[word]);
                                    tempNode.ranking = words[word].ranking;
                                }
                            }
                        }, function(error) {
                            console.log(error);
                        });
                }, function(error) {
                    console.log(error);
                    $cordovaFile.createFile(cordova.file.dataDirectory, "wordsDB.txt", false)
                        .then(function(success1) {
                            console.log(success1);
                        }, function(error1) {
                            console.log(error1);
                        });
                });
        };

        function copyFileIfNotPresent(successCallBack, failureCallBack) {
            $cordovaFile.checkFile(cordova.file.dataDirectory, "wordsDB.txt")
                .then(function (success) {
                    successCallBack();
                }, function (failure) {
                    $cordovaFile.checkFile(cordova.file.applicationDirectory, "www/wordsDB.txt")
                        .then(function (success) {
                            $cordovaFile.copyFile(cordova.file.applicationDirectory, "www/wordsDB.txt", cordova.file.dataDirectory, "wordsDB.txt")
                                .then(function (success) {
                                    successCallBack();
                                }, function (error) {
                                    failureCallBack();
                                });
                        }, function (failure) {
                            failureCallBack();
                        });
                });
        }
        
        service.initialization = function() {
            copyFileIfNotPresent(function(){
                deserialize();
            }, function(){
                console.log('words DB not found');
            });
        };

        service.SaveChanges = function() {
            var words = trieTree.getAllWords();
            if (typeof words != 'undefined' && words.length > 0) {
                serialize(JSON.stringify(words));
            }
        };
        return service;
    });
