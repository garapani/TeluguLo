// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var db;
function isTeluguchar(character)
{
  var asciiValue = character.charCodeAt();

  if(asciiValue >= 64 && asciiValue <= 90) //Ato Z and @
  {
    return true;
  }
  if(asciiValue >= 97 && asciiValue <= 122)
  {
    return true;
  }
  if(asciiValue == 126 || asciiValue == 94 || asciiValue == 38)
  {
    return true;
  }
  return false;
}

angular.module('teluguLoApp', ['ionic'])
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    var trie = new Trie({
      '#': 1,
      'a': 2,
      'b': 3,
      'c': 4,
      'd': 5,
      'e': 6,
      'f': 7,
      'g': 8,
      'h': 9,
      'i': 10,
      'j': 11,
      'k': 12,
      'l': 13,
      'm': 14,
      'n': 15,
      'o': 16,
      'p': 17,
      'q': 18,
      'r': 19,
      's': 20,
      't': 21,
      'u': 22,
      'v': 23,
      'w': 24,
      'x': 25,
      'y': 26,
      'z': 27,
      'A': 28,
      'B': 29,
      'C': 30,
      'D': 31,
      'E': 32,
      'F': 33,
      'G': 34,
      'H': 35,
      'I': 36,
      'J': 37,
      'K': 38,
      'L': 39,
      'M': 40,
      'N': 41,
      'O': 42,
      'P': 43,
      'Q': 44,
      'R': 45,
      'S': 46,
      'T': 47,
      'U': 48,
      'V': 49,
      'W': 50,
      'X': 51,
      'Y': 52,
      'Z': 53,
      '~': 54,
      '&': 55,
      '^': 56,
      '@': 57
    });
    trie.insert('bad#');
    trie.insert('back#');
    console.log(trie.contains('bad#'));
    console.log(trie.contains('back#'));
    console.log(trie.contains('hello'));
    trie.remove('back#');
    console.log(trie.contains('back#'));
    // db = $cordovaSQLite.openDB("words.db");
    // $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS Messages (id INTEGER PRIMARY KEY AUTOINCREMENT, word TEXT)');
  });
})
.controller('mainCtrl', function($scope,$rootScope ) {
  console.log('mainCtrl');
  var inputMethod = 0;  // RTS
  var outputMethod = 1; // unicode

  $scope.convert = function()
  {
    var input = "#" + $scope.inputText + "#";
    var transformer = Transformer.createTransformer(inputMethod, outputMethod);
    transformer.setRTSMode(RTSTransformer.rtsEnglish);
    $rootScope.$broadcast('insert', $scope.inputText);
    $scope.outputText = transformer.convert(input);
  };
  $rootScope.$on('show', function(e, val) {
    $scope.outputText = val;
  });
})

.directive('inputText', ['$rootScope', function($rootScope) {
  return {
    link: function(scope, element, attrs) {
      $rootScope.$on('insert', function(e, val) {
        var domElement = element[0];
        if (document.selection) {
          //domElement.focus();
          var sel = document.selection.createRange();
          sel.text = val;
          //domElement.focus();
        }
        else if (domElement.selectionStart || domElement.selectionStart === 0)
        {
          var startPos = domElement.selectionStart;
          var endPos = domElement.selectionEnd;
          var scrollTop = domElement.scrollTop;
          if(startPos > 0 )
          {
            if(domElement.value.length > 0)
            {
              if(domElement.value.length - startPos >= 0) /*could be middle of the string*/
              {
                var wordStart = 0;
                var wordEnd = domElement.value.length;
                for(var i = startPos-1; i > 0; i--)
                {
                  console.log(domElement.value.charAt(i));
                  if(!isTeluguchar(domElement.value.charAt(i)))
                  {
                    wordStart = i;
                    break;
                  }
                }
                for(var i = startPos; i < domElement.value.length; i++)
                {
                  console.log(domElement.value.charAt(i));
                  if(!isTeluguchar(domElement.value.charAt(i)))
                  {
                    wordEnd = i;
                    break;
                  }
                }
                console.log(domElement.value.substring(wordStart, wordEnd).trim());
              }
            }
            var selectedText = domElement.value.substring(0, startPos)  + domElement.value.substring(endPos, domElement.value.length);
            //console.log(selectedText);
            //domElement.value = domElement.value.substring(0, startPos) + val + domElement.value.substring(endPos, domElement.value.length);
            //domElement.focus();
            domElement.selectionStart = startPos + val.length;
            domElement.selectionEnd = startPos + val.length;
            domElement.scrollTop = scrollTop;
          } else {
            //domElement.value += val;
            //domElement.focus();
          }
        }
        // $rootScope.$broadcast('show', val);
      });
    }
  }
}])
