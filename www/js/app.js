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

angular.module('teluguLoApp', ['ionic','ui.router','ngCordova','teluguLoApp.services','focus-if'])
.run(function($ionicPlatform,trieFactory,$cordovaSplashscreen) {
  $ionicPlatform.ready(function() {
    $cordovaSplashscreen.hide();
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

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
      url: "/home",
      abstract: false,
      templateUrl: 'mainPage.html'
    })
    .state('help',{
      url: "/help",
      abstract:false,
      templateUrl: 'help.html',
      controller: 'helpCtrl'
    });
  $urlRouterProvider.otherwise('/home');

})
.controller('helpCtrl', function($scope,$state)
{
  $scope.backButtonClicked = function()
  {
    $state.go('help');
  };
})

.filter('object2Array', function() {
  return function(input) {
    var out = [];
    for(var i in input) {
      out.push(input[i]);
    }
    return out;
  };
})
.controller('mainCtrl', function($scope,$rootScope,$cordovaSocialSharing,$cordovaClipboard,trieFactory) {
  $scope.focusOnInput = false;
  console.log('mainCtrl');
  var inputMethod = 0;  // RTS
  var outputMethod = 1; // unicode
  $scope.ShareDisabled = true;
  $scope.CanShowPrefferedWords = false;
  $scope.PrefferedWords = [];
  $scope.IntermText = "";

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
    $scope.IntermText = "";
    $rootScope.$broadcast('insert', $scope.inputText);
  };

  $rootScope.$on('intermShow', function(e, val) {
    var transformer = Transformer.createTransformer(inputMethod, outputMethod);
    transformer.setRTSMode(RTSTransformer.rtsEnglish);
    var teluguWord = {english:val, telugu:transformer.convert("#" + val + "#")};
    $scope.IntermText = teluguWord;
  });

  $rootScope.$on('showPreferWords', function(e, val) {
    var transformer = Transformer.createTransformer(inputMethod, outputMethod);
    transformer.setRTSMode(RTSTransformer.rtsEnglish);
    var prefferedWord = {english:val.name, telugu:transformer.convert("#" + val.name +"#"),ranking:val.ranking};
    console.log(prefferedWord);
    // prefferedWord.english = val.name;
    // prefferedWord.telugu = transformer.convert("#" + val.name + "#");
    // prefferedWord.ranking = val.ranking;
    $scope.CanShowPrefferedWords = true;
    $scope.PrefferedWords.push(prefferedWord);
  });

  $rootScope.$on('clearPrefences', function(e, val) {
    $scope.PrefferedWords = [];
    $scope.CanShowPrefferedWords = false;
  });
  $rootScope.$on('clearIntermWord', function(e, val) {
    $scope.IntermText = "";
  });

  $scope.addPrefferedWord = function(word) {
    var wordStart = 0;
    var wordLength = $scope.inputText.length;
    for(var j = cursorPosition-1; j > 0; j--) {
      if(!isTeluguchar($scope.inputText.charAt(j))) {
        wordStart = j+1;
        break;
      }
    }
    //word.ranking = word.ranking + 1;
    $scope.inputText = $scope.inputText.substring(0, wordStart) + word.english + $scope.inputText.substring(cursorPosition, wordLength);
    convertEnglishToTelugu();
    trieFactory.addRanking(word);
    console.log(word);
    $scope.IntermText = "";
    $scope.focusOnInput = true;
    $scope.PrefferedWords = [];
    $scope.CanShowPrefferedWords = false;
    cordova.plugins.Keyboard.show();
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
              var wordToConvert = domElement.value.substring(wordStart, wordEnd).trim();
              if(wordToConvert.length > 0) {
                $rootScope.$broadcast('intermShow',wordToConvert);
                var nodes = trieFactory.findWord(wordToConvert);
                $rootScope.$broadcast('clearPrefences', '');
                for(var node in nodes) {
                  $rootScope.$broadcast('showPreferWords', nodes[node]);
                }
              }
              else {
                $rootScope.$broadcast('clearPrefences', '');
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
        cordova.plugins.Keyboard.show();
      });
    }
  };
}]);
