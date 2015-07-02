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
    .controller('LoginCtrl', function ($scope, $http, $state, $ionicPopup, API_URL, CurrentUser) {
        $scope.loginData = {};

        $scope.tryLogin = function () {
            $http.post(API_URL + '/login', $scope.loginData)
                .success(function (data) {
                    var promise = CurrentUser.doLogin(data.token);

                    promise.then(function (user) {
                        if (user.is_maven) {
                            $state.go('maven.map');
                        } else {
                            $state.go('client.custom-order');
                        }
                    });
                })
                .error(function (data, status, headers, config) {
                    $ionicPopup.alert({
                        title: 'Error logging in',
                        template: data.description,
                        buttons: [{
                            text: 'OK',
                            type: 'button-clear'
                        }]
                    });
                });
        }
    })
;
