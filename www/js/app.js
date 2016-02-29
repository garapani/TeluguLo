function isTeluguchar(character) {
  var asciiValue = character.charCodeAt();

  if(asciiValue >= 64 && asciiValue <= 90) {
    return true;
  }
  else if(asciiValue >= 97 && asciiValue <= 122) {
    return true;
  }
  else if(asciiValue == 126 || asciiValue == 94 || asciiValue == 38) {
    return true;
  }
  return false;
}
var cursorPosition = 0;

angular.module('teluguLoApp', ['ionic','ngCordova','teluguLoApp.services','focus-if'])
.run(function($ionicPlatform,trieFactory) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    trieFactory.initialization();
  });
})

.controller('mainCtrl', function($scope,$rootScope,$cordovaSocialSharing,$cordovaClipboard) {
  $scope.focusOnInput = false;
  console.log('mainCtrl');
  var inputMethod = 0;  // RTS
  var outputMethod = 1; // unicode
  $scope.ShareDisabled = true;
  $scope.PrefferedWords = [];
  function convertEnglishToTelugu() {
    var input = "#" + $scope.inputText + "#";
    var transformer = Transformer.createTransformer(inputMethod, outputMethod);
    transformer.setRTSMode(RTSTransformer.rtsEnglish);
    $scope.outputText = transformer.convert(input);
    if($scope.outputText.length > 0) {
      $scope.ShareDisabled = false;
    }
    else {
      $scope.ShareDisabled = true;
    }
  }
  $scope.convert = function() {
    convertEnglishToTelugu();
    $rootScope.$broadcast('insert', $scope.inputText);
  };
  $rootScope.$on('show', function(e, val) {
    var transformer = Transformer.createTransformer(inputMethod, outputMethod);
    transformer.setRTSMode(RTSTransformer.rtsEnglish);
    var prefferedWord = {english:val, telugu:transformer.convert("#" + val + "#")};
    $scope.PrefferedWords.push(prefferedWord);
    console.log(val);
  });

  $rootScope.$on('clearPrefences', function(e, val) {
    $scope.PrefferedWords = [];
    console.log(val);
  });

  $scope.addPrefferedWord = function(word)
  {
    console.log(cursorPosition);
    var wordStart = 0;
    var wordLength = $scope.inputText.length;
    for(var j = cursorPosition-1; j > 0; j--) {
      console.log($scope.inputText.charAt(j));
      if(!isTeluguchar($scope.inputText.charAt(j))) {
        wordStart = j+1;
        break;
      }
    }
    $scope.inputText = $scope.inputText.substring(0, wordStart) + word.english + $scope.inputText.substring(cursorPosition, wordLength);
    convertEnglishToTelugu();
    $scope.focusOnInput = true;
    $scope.PrefferedWords = [];
    $rootScope.$broadcast('focusOnInputText', '');
  };

  $scope.shareContent = function() {
    $cordovaSocialSharing.share($scope.outputText, 'teluguLo','', '') // Share via native share sheet
    .then(function(result) {
      console.log("success");
    }, function(err) {
      console.log("failure");
    });
  };

  $scope.shareViaWhatsApp = function() {
    $cordovaSocialSharing.shareViaWhatsApp($scope.outputText,'', '')
    .then(function(result) {
      console.log("Success");
      console.log(result);
    }, function(err) {
      console.log("failure");
      console.log(err);
      // An error occurred. Show a message to the user
    });
  };

  $scope.copyText = function() {
    $cordovaClipboard.copy($scope.outputText)
    .then(function () {
      // success
    }, function () {
      // error
    });
  };
})

.directive('focusMe', function($timeout) {
  return {
    link: function(scope, element, attrs) {

      $timeout(function() {
        element[0].focus();
      },750);
    }
  };
})

.directive('inputText', ['$rootScope','trieFactory', function($rootScope,trieFactory) {
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
        else if (domElement.selectionStart || domElement.selectionStart === 0) {
          cursorPosition = domElement.selectionEnd;
          var startPos = domElement.selectionStart;
          var endPos = domElement.selectionEnd;
          // if(startPos > 0 ) {
          if(domElement.value.length > 0) {
            if(domElement.value.length - startPos >= 0) {
              var wordStart = 0;
              var wordEnd = domElement.value.length;
              for(var i = startPos-1; i > 0; i--) {
                if(!isTeluguchar(domElement.value.charAt(i))) {
                  wordStart = i;
                  break;
                }
              }
              for(var j = startPos; j < domElement.value.length; j++) {
                if(!isTeluguchar(domElement.value.charAt(j))) {
                  console.log(domElement.value.charAt(j));
                  wordEnd = j;
                  break;
                }
              }
              if(wordEnd == domElement.value.length) {
                var nodes = trieFactory.findWord(domElement.value.substring(wordStart, wordEnd).trim());
                console.log(nodes);
                $rootScope.$broadcast('clearPrefences', '');
                for(var node in nodes)
                {
                  $rootScope.$broadcast('show', nodes[node].name);
                }
              }
              else {
                console.log(domElement.value.substring(wordStart, wordEnd).trim());
                // $rootScope.$broadcast('clearPrefences', '');
                var nodes1 = trieFactory.findWord(domElement.value.substring(wordStart, wordEnd).trim());
                console.log(nodes1);
                $rootScope.$broadcast('clearPrefences', '');
                for(var node1 in nodes1)
                {
                  $rootScope.$broadcast('show', nodes1[node1].name);
                }
              }
            }
          }
          // } else {
          // }
        }
      });
      $rootScope.$on('focusOnInputText', function(e, val) {
        var domElement = element[0];
        if(typeof domElement != 'undefined' && typeof domElement.value != 'undefined') {
          var selectionStart = domElement.value.length;
          var selectionEnd = domElement.value.length;
          domElement.focus();
          if (domElement.setSelectionRange) {
            domElement.focus();
            domElement.setSelectionRange(selectionStart, selectionEnd);
          }
          else if (domElement.createTextRange) {
            var range = domElement.createTextRange();
            domElement.collapse(true);
            domElement.moveEnd('character', selectionEnd);
            domElement.moveStart('character', selectionStart);
            domElement.select();
          }
        }
      });
    }
  };
}]);
