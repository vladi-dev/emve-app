'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider.state('login', {
            url: "/login",
            templateUrl: "modules/common/login/login.html",
            controller: "LoginCtrl"
        })
    })
;

angular.module('emve.controllers')
    .controller('LoginCtrl', function ($rootScope, $scope, $http, $window, $state, $ionicPopup, WebsocketService, API_URL) {
        $scope.loginData = {};

        $scope.token = $window.sessionStorage.token;
        $scope.tryLogin = function () {
            $http.post(API_URL + '/login', $scope.loginData)
                .success(function (data, status, headers, config) {
                    $window.sessionStorage.token = data.token;

                    $rootScope.$emit('websocket:start');

                    $state.go('client.custom-order');

                })
                .error(function (data, status, headers, config) {
                    $ionicPopup.alert({
                        title: 'Error logging in',
                        template: 'Check your username and password',
                        buttons: [{
                            text: 'OK',
                            type: 'button-clear'
                        }]
                    });
                    delete $window.sessionStorage.token;
                });
        }
    })
;
