function isTeluguchar(character) {
    var asciiValue = character.charCodeAt();

    if (asciiValue >= 64 && asciiValue <= 90) {
        return true;
    }
    else if (asciiValue >= 97 && asciiValue <= 122) {
        return true;
    }
    else if (asciiValue == 126 || asciiValue == 94 || asciiValue == 38) {
        return true;
    }
    return false;
}

var cursorPosition = 0;
var w;
var teluguLoApp = angular.module('teluguLoApp', ['ionic', 'ui.router', 'ngCordova', 'teluguLoApp.services', 'teluguLoApp.favServices', 'focus-if']);
teluguLoApp.run(function($ionicPlatform,$cordovaGoogleAnalytics, trieFactory, favFactory, $cordovaSplashscreen,$ionicHistory,$ionicPopup,$cordovaStatusbar) {
        //  WorkerService.setAngularUrl('/libs/angular/angular.min.js');
        $ionicPlatform.ready(function() {
            $cordovaStatusbar.styleHex('#6b46e5');
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
            // webWorkerService.doWork();
            // WorkerService.setAngularUrl("js/worker.js");
            //  var workerPromise = WorkerService.createAngularWorker(['input', 'output','trieFactory','favFactory', function (input, output,trieFactory,favFactory) {
            //      console.log(input);
            //     trieFactory.initialization();
            //     favFactory.initialization();
            // }]);
            // workerPromise.then(function success(angularWorker) {
            //     console.log(angularWorker);
            //     //The input must be serializable
            //     return angularWorker.run("venkat");
            // });
    
            // var myWorker = WebworkerProvider.create(init);
            // myWorker.run($scope.value).then(function(result) {
            //     //alert("Answer: " + result);
            // });
            
            // var workerPromise = WorkerService.createAngularWorker(['input', 'output', '$http', function (input, output, $http) {
            //     trieFactory.initialization();
            //     favFactory.initialization();    
            // }]);
            trieFactory.initialization();
            favFactory.initialization(); 
            $cordovaSplashscreen.hide();
            if(window.Connection) {
                if(navigator.connection.type != Connection.NONE) {
                    // $cordovaGoogleAnalytics.debugMode();
                    $cordovaGoogleAnalytics.startTrackerWithId('UA-29779172-15');
                }
                else {
                    console.log(navigator.connection.type);
                }
            }
            else {
                console.log("window.Connection is null");
            }
        });
        
        $ionicPlatform.registerBackButtonAction(function (e) {
            if ($ionicHistory.backView()) {
                $ionicHistory.goBack();
            } else {
                ionic.Platform.exitApp();
            }
            e.preventDefault();
            return false;
        }, 101);
    })
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: "/home",
                abstract: false,
                templateUrl: 'mainPage.html'
            })
            .state('help', {
                url: "/help",
                abstract: false,
                templateUrl: 'help.html',
                controller: 'helpCtrl'
            })
            .state('favs', {
                url: "/favs",
                abstract: false,
                templateUrl: 'favs.html',
                controller: 'favCtrl'
            });
        $urlRouterProvider.otherwise('/home');

    })
    .controller('helpCtrl', function($scope, $state) {
        $scope.backButtonClicked = function() {
            $state.go('help');
        };
    })
    .filter('object2Array', function() {
        return function(input) {
            var out = [];
            for (var i in input) {
                out.push(input[i]);
            }
            return out;
        };
    })
    .controller('favCtrl', function($scope, $rootScope, favFactory, $ionicHistory) {

        var inputMethod = 0;  // RTS
        var outputMethod = 1; // unicode
        
        $scope.noFavorites = true;
        $scope.favsWords = favFactory.getFavoriteStrings();
        if (typeof $scope.favsWords == 'undefined' || $scope.favsWords.length <= 0) {
            $scope.noFavorites = true;
        }
        else {
            $scope.noFavorites = false;
        }

        $scope.convertWord = function(word) {
            var input = "#" + word.english + "#";
            var transformer = Transformer.createTransformer(inputMethod, outputMethod);
            transformer.setRTSMode(RTSTransformer.rtsEnglish);
            return transformer.convert(input);
        };

        $scope.selectWord = function(word) {
            $rootScope.$broadcast('favWordClicked', word);
            // $scope.inputText = word.english;
            // $scope.outputText = $scope.convertWord(word.english);
            $ionicHistory.goBack();
        };

        $scope.removeFavWord = function(word) {
            favFactory.removeFav(word.english);
            $scope.favsWords = favFactory.getFavoriteStrings();
            if (typeof $scope.favsWords == 'undefined' || $scope.favsWords.length <= 0) {
                $scope.noFavorites = true;
            }
            else {
                $scope.noFavorites = false;
            }
        };
    })
    .controller('mainCtrl', function($scope, $rootScope, $cordovaSocialSharing, $cordovaClipboard, trieFactory, favFactory, $cordovaKeyboard, $ionicHistory,$cordovaToast) {
        $scope.focusOnInput = false;
        console.log('mainCtrl');
        var inputMethod = 0;  // RTS
        var outputMethod = 1; // unicode
        $scope.ShareDisabled = true;
        $scope.CanShowPrefferedWords = false;
        $scope.PrefferedWords = [];
        $scope.IntermText = "";
        $scope.selectedWord = "";
        $scope.noFavorites = true;
        // $scope.CanshowOutput = cordova.plugins.Keyboard.isVisible;
        window.addEventListener('native.keyboardshow', keyboardShowHandler);
        function keyboardShowHandler(e) {
            $scope.whileWriting = true;
            AdMob.hideBanner();
        }
        
        $scope.favsWords = favFactory.getFavoriteStrings();
        window.addEventListener('native.keyboardhide', keyboardHideHandler);
        function keyboardHideHandler(e) {
            $scope.inputDivStyle = { 'height': '39%' };
            $scope.outputDivStyle = { 'height': '39%' };
            $scope.outputDivStyle = {'margin-top': '15px'};
            $scope.inputDivStyle = {'margin-top': '5px'};
            $scope.CanShowPrefferedWords = false;
            $scope.whileWriting = false;
            if(window.Connection) {
                if(navigator.connection.type != Connection.NONE) {
                    AdMob.showBanner(AdMob.AD_POSITION.BOTTOM_CENTER);
                }
                else {
                    console.log(navigator.connection.type);
                }
            }
            else{
                console.log("window.Connection is null");
            }
        }

        $rootScope.$on('favWordClicked', function(e, val) {
            $scope.inputText = val.english;
            $scope.outputText = $scope.convertWord(val);
        });

        $scope.removeWord = function(word) {
            // console.log(word);
            var index = $scope.favsWords.indexOf(word);
            if (index > -1) {
                $scope.favsWords.splice(index, 1);
            }
        };

        function convertEnglishToTelugu() {
            var input = "#" + $scope.inputText + "#";
            var transformer = Transformer.createTransformer(inputMethod, outputMethod);
            transformer.setRTSMode(RTSTransformer.rtsEnglish);
            $scope.outputText = transformer.convert(input);
            if ($scope.outputText.length > 0) {
                $scope.ShareDisabled = false;
            }
            else {
                $scope.ShareDisabled = true;
            }
        }

        $scope.convert = function() {
            $scope.whileWriting = true;
            if ($scope.inputText.length > 0) {
                $scope.CanshowOutput = true;
                $scope.inputDivStyle = { 'height': '20%' };
                $scope.outputDivStyle = { 'height': '20%' };
                $scope.outputDivStyle = {'margin-top': '5px'};
                $scope.inputDivStyle = {'margin-top': '5px'};
            }
            else {
                $scope.CanshowOutput = false;
            }
            convertEnglishToTelugu();
            $scope.IntermText = "";
            $rootScope.$broadcast('insert', $scope.inputText);
        };

        $rootScope.$on('intermShow', function(e, val) {
            var transformer = Transformer.createTransformer(inputMethod, outputMethod);
            transformer.setRTSMode(RTSTransformer.rtsEnglish);
            var teluguWord = { english: val, telugu: transformer.convert("#" + val + "#") };
            $scope.IntermText = teluguWord;
        });

        $rootScope.$on('showPreferWords', function(e, val) {
            var transformer = Transformer.createTransformer(inputMethod, outputMethod);
            transformer.setRTSMode(RTSTransformer.rtsEnglish);
            var prefferedWord = { english: val.name, telugu: transformer.convert("#" + val.name + "#"), ranking: val.ranking };
            //console.log(prefferedWord);
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
            for (var j = cursorPosition - 1; j > 0; j--) {
                if (!isTeluguchar($scope.inputText.charAt(j))) {
                    wordStart = j + 1;
                    break;
                }
            }
            //word.ranking = word.ranking + 1;
            $scope.inputText = $scope.inputText.substring(0, wordStart) + word.english + $scope.inputText.substring(cursorPosition, wordLength);
            var inputTextArea = document.querySelector('.inputtextArea');
            inputTextArea.focus();

            convertEnglishToTelugu();
            // trieFactory.addRanking(word);
            // console.log(word);
            $scope.IntermText = "";
            $scope.focusOnInput = true;
            $scope.PrefferedWords = [];
            $scope.CanShowPrefferedWords = false;
            cordova.plugins.Keyboard.show();
            $rootScope.$broadcast('focusOnInputText', '');
        };
        
        var addWords = function () {
            var res = $scope.inputText.split(" ");
            if(typeof res != 'undefined' && res.length > 0) {
                for(var i = 0; i < res.length; i++) {
                    trieFactory.addWord(res[i]);
                }
            }
        };
        
        $scope.shareContent = function() {
            addWords();
            trieFactory.SaveChanges();
            $cordovaSocialSharing.share($scope.outputText, 'teluguLo', '', '') // Share via native share sheet
                .then(function(result) {
                    console.log("success");
                }, function(err) {
                    console.log("failure");
                });
        };

        $scope.copyText = function() {
            addWords();
            trieFactory.SaveChanges();
            $cordovaClipboard.copy($scope.outputText)
                .then(function() {
                    $cordovaToast.showShortBottom('copied').then(function(success) {
                        // success
                    }, function(error) {
                        // error
                    });
                    // success
                }, function() {
                    // error
                });
        };
        
        $scope.shareViaWhatsApp = function() {
            addWords();
            trieFactory.SaveChanges();
            $cordovaSocialSharing.shareViaWhatsApp($scope.outputText, '', '')
                .then(function(result) {
                    console.log("Success");
                    // console.log(result);
                }, function(err) {
                    console.log("failure");
                    // console.log(err);
                    // An error occurred. Show a message to the user
                });
        };

        $scope.addFavWord = function() {
            favFactory.addFav($scope.inputText);
            $scope.favsWords = favFactory.getFavoriteStrings();
            if (typeof $scope.favsWords == 'undefined' || $scope.favsWords.length <= 0) {
                $scope.noFavorites = true;
            }
            else {
                $scope.noFavorites = false;
                $cordovaToast.showShortBottom('added to favorites').then(function(success) {
                    // success
                }, function(error) {
                    // error
                });
            }
        };

        $scope.convertWord = function(word) {
            var input = "#" + word.english + "#";
            var transformer = Transformer.createTransformer(inputMethod, outputMethod);
            transformer.setRTSMode(RTSTransformer.rtsEnglish);
            return transformer.convert(input);
        };

        $scope.selectWord = function(word) {
            $scope.inputText = word.english;
            $scope.outputText = $scope.convertWord(word.english);
            $ionicHistory.goBack();
        };

        $scope.removeFavWord = function(word) {
            favFactory.removeFav(word);
            $scope.favsWords = favFactory.getFavoriteStrings();
            if (typeof $scope.favsWords == 'undefined' || $scope.favsWords.length <= 0) {
                $scope.noFavorites = true;
            }
            else {
                $scope.noFavorites = false;
            }
        };
        setTimeout(showAd, 500);
        function showAd() {
            if(window.Connection) {
                if(navigator.connection.type != Connection.NONE) {
                    if (! AdMob ) { alert( 'admob plugin not ready' ); }
                    else {
                        AdMob.createBanner( {
                            adId:"ca-app-pub-6109385373902645/2671227326",
                            isTesting:false,
                            position:AdMob.AD_POSITION.BOTTOM_CENTER,
                            autoShow:true} );
                        }
                    }
                    else {
                        console.log(navigator.connection.type);
                    }
                }
                else {
                    console.log("window.Connection is empty");
                }
            }
        })
        .directive('focusMe', function($timeout) {
        return {
            link: function(scope, element, attrs) {

                $timeout(function() {
                    element[0].focus();
                }, 750);
            }
        };
    })

    .directive('isFocused', function($timeout) {
        return {
            scope: {
                trigger: '&isFocused'
            },
            link: function(scope, element) {
                if (scope.trigger()) {
                    $timeout(function() {
                        element[0].focus();
                        element[0].click();
                        cordova.plugins.Keyboard.show();
                    });
                }
            }
        };
    })
    .directive('inputText', ['$rootScope', 'trieFactory', function($rootScope, trieFactory) {
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
                        if (domElement.value.length > 0) {
                            if (domElement.value.length - startPos >= 0) {
                                var wordStart = 0;
                                var wordEnd = domElement.value.length;
                                for (var i = startPos - 1; i > 0; i--) {
                                    if (!isTeluguchar(domElement.value.charAt(i))) {
                                        wordStart = i;
                                        break;
                                    }
                                }
                                for (var j = startPos; j < domElement.value.length; j++) {
                                    if (!isTeluguchar(domElement.value.charAt(j))) {
                                        // console.log(domElement.value.charAt(j));
                                        wordEnd = j;
                                        break;
                                    }
                                }
                                // console.log(wordStart);
                                // console.log(wordEnd);
                                var wordToConvert = domElement.value.substring(wordStart, wordEnd).trim();
                                // console.log(wordToConvert);
                                if (wordToConvert.length > 0) {
                                    $rootScope.$broadcast('intermShow', wordToConvert);
                                    var nodes = trieFactory.findWord(wordToConvert,5);
                                    $rootScope.$broadcast('clearPrefences', '');
                                    for (var node in nodes) {
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
                    if (typeof domElement != 'undefined' && typeof domElement.value != 'undefined') {
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
