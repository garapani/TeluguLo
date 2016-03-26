angular.module('teluguLoApp.favServices', [])
    .factory('favFactory', function($cordovaFile) {
        var service = {};
        var favWords = [];

        service.getFavoriteStrings = function() {
            return favWords;
        };

        var serialize = function(jsonString) {
            $cordovaFile.checkFile(cordova.file.dataDirectory, "favs.txt")
                .then(function(success) {
                    $cordovaFile.writeFile(cordova.file.dataDirectory, "favs.txt", jsonString, true)
                        .then(function(success) {
                            // console.log("write success");
                        }, function(error) {
                            console.log(error);
                        });
                },
                function(error) {
                    $cordovaFile.createFile(cordova.file.dataDirectory, "favs.txt", false)
                        .then(function(success) {
                            $cordovaFile.writeFile(cordova.file.dataDirectory, "favs.txt", jsonString, true)
                                .then(function(success) {
                                    // console.log("write success");
                                }, function(error) {
                                    console.log(error);
                                });
                        }, function(error) {
                            console.log(error);
                        });
                });
        };

        var deserialize = function() {
            $cordovaFile.checkFile(cordova.file.dataDirectory, "favs.txt")
                .then(function(success) {
                    // console.log(success);
                    $cordovaFile.readAsText(cordova.file.dataDirectory, "favs.txt")
                        .then(function(success) {
                            var words = JSON.parse(success);
                            favWords = [];
                            for (var word in words) {
                                favWords.push(words[word]);
                            }
                        }, function(error) {
                            console.log(error);
                        });
                }, function(error) {
                    console.log(error);
                });
        };

        service.initialization = function() {
            deserialize();
        };

        service.addFav = function(englishWord) {
            var item = { english: englishWord };
            if (favWords.length === 0) {
                favWords.push(item);
                serialize(JSON.stringify(favWords));
            }
            else {
                var foundWords = favWords.find(function(child) {
                    return child.english === item.english;
                });
                // console.log(foundWords);
                if (typeof foundWords == 'undefined' || foundWords.length <= 0) {
                    favWords.push(item);
                    serialize(JSON.stringify(favWords));
                }
            }
        };

        service.removeFav = function(englishWord) {
            for (var i = favWords.length - 1; i >= 0; i--) {
                if (favWords[i].english === englishWord) {
                    favWords.splice(i, 1);
                    serialize(JSON.stringify(favWords));
                }
            }
        };

        return service;
    });
