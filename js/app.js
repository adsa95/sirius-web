var app = angular.module("sirius", ['ngMaterial']);

var BASEPATH = "https://sirius-backend.herokuapp.com";

app.controller('MainController', ['$scope', '$http', '$mdToast', function($scope, $http, $mdToast){

    $scope.saving = false;
    $scope.extensions = [];
    $scope.token = "";
    $scope.siriusId = "";

    if (localStorage.slack_token) {
        $scope.token = localStorage.slack_token;
    }

    if (localStorage.sirius_id) {
        $scope.siriusId = localStorage.sirius_id;
    }

    $http.get(BASEPATH + '/extensions').then(function(res){
        $scope.extensions = res.data;

        if($scope.siriusId !== ""){
            $http.get(BASEPATH + '/configs/' + $scope.siriusId).then(function(res){
                let config = res.data;
                for (var i = 0; i < $scope.extensions.length; i++) {
                    if(config.extensions.hasOwnProperty($scope.extensions[i].name)){
                        $scope.extensions[i].selected = true;

                        if(Array.isArray($scope.extensions[i].config)){
                            for (var j = 0; j < $scope.extensions[i].config.length; j++) {
                                let key = $scope.extensions[i].config[j].key;
                                if(config.extensions[$scope.extensions[i].name].hasOwnProperty(key)){
                                    $scope.extensions[i].config[j].value = config.extensions[$scope.extensions[i].name][key];
                                }
                            }
                        }
                    }
                }
            })
        }
    });

    $scope.generateConfig = function(){
        let extensions = {};

        for (var i = 0; i < $scope.extensions.length; i++) {
            let p = $scope.extensions[i];
            if(p.selected){
                let options = {};

                if(p.config !== null){
                    for (var j = 0; j < p.config.length; j++) {
                        let o = p.config[j];
                        options[o.key] = o.value ? o.value : o.default;
                    }
                }

                extensions[p.name] = options;
            }
        }

        let config = {
            slack_token: $scope.token,
            extensions: extensions
        };

        return config;
    }

    $scope.save = function(){
        $scope.saving = true;

        $http.post(BASEPATH + '/configs', $scope.generateConfig()).then(function(res){
            localStorage.setItem('sirius_id', res.data.sirius_id);
            localStorage.setItem('slack_token', res.data.slack_token);
            $mdToast.show($mdToast.simple().textContent('Registration saved successfully!'));
        }, function(res){
            alert('An error occured!');
        }).finally(function(){
            $scope.saving = false;
        });
    }
}])
