'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider
            .state('signup', {
                url: "/signup",
                templateUrl: "modules/common/signup/signup.html",
                controller: "SignupCtrl"
            })
            .state('signup-success', {
                url: "/signup-success",
                templateUrl: "modules/common/signup/signup-success.html",
            });
    });
;

angular.module('emve.controllers')
    .controller('SignupCtrl', function ($scope, $http, $state, $ionicPopup, API_URL) {
        $scope.signupData = {};

        $scope.trySignup = function () {
            $http.post(API_URL + '/register', $scope.signupData)
                .success(function (data) {
                    $state.go('signup-success');
                })
                .error(function (data, status, headers, config) {
                    $ionicPopup.alert({
                        title: 'Error signing up',
                        template: 'Check your email and password',
                        buttons: [{
                            text: 'OK',
                            type: 'button-clear'
                        }]
                    });
                });
        }
    })
;
