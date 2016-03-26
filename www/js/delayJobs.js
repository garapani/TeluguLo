setTimeout(function(){
var trieFactoryAcces = angular.element(document.getElementById('mainBody')).injector().get('trieFactory');
trieFactoryAcces.initialization();
},1000);