angular.module('teluguLoApp.dbOperationsService', [])
    .factory('dbOperations', function($cordovaFile,$cordovaSQLite) {
        var db = $cordovaSQLite.openDB({ name: "myWords.db", bgType: 1 });
       var services = {};
       services.createTable = function(){
         var query = "CREATE TABLE IF NOT EXISTS MyWordsTable (id integer primary key, word text, ranking integer)";
         $cordovaSQLite.execute(db, query).then(function(res) {
             console.log("table created");
            }, function (err) {
                console.error(err);
            });
       };
       
       services.insertWord = function(word) {
           var findWordQuery = 'SELECT * FROM MyWordsTable WHERE word ==' + word;
           $cordovaSQLite.execute(db, findWordQuery)
           var query = "INSERT INTO MyWordsTable (word, ranking) VALUES (?,?)";
           $cordovaSQLite.execute(db, query, [word, 100]).then(function(res) {
               console.log("insertId: " + res.insertId);
            }, function (err) {
                console.error(err);
            });
        };
  return services;
    });