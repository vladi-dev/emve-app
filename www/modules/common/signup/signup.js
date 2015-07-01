'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider
            .state('signup', {
                url: "/signup",
                templateUrl: "modules/common/signup/signup.html",
                controller: "SignupCtrl"
            })
            .state('signup-activate', {
                url: "/signup-activate",
                templateUrl: "modules/common/signup/signup-activate.html",
                controller: "SignupActivateCtrl"
            })
            .state('signup-success', {
                url: "/signup-success",
                templateUrl: "modules/common/signup/signup-success.html",
            });
    });
;

angular.module('emve.controllers')
    .controller('SignupCtrl', function ($scope, SignupAPI, $state, $ionicPopup, $localstorage) {
        $scope.signupData = {};

        $scope.trySignup = function () {
            SignupAPI.signup($scope.signupData, function (data) {
                    $localstorage.set('tempUserId', data.tempUserId);
                    $state.go('signup-activate');
                }, function (response) {
                $scope.errors = response.data.errors;
            });
        }
    })
    .controller('SignupActivateCtrl', function ($scope, $state, $ionicPopup, $localstorage, SignupAPI) {
        var tempUserId = $localstorage.get('tempUserId', false);

        if (!tempUserId) {
            $state.go('signup');
        }

        $scope.activateData = {};
        $scope.activateData.tempUserId = tempUserId;

        $scope.tryActivate = function () {
            SignupAPI.activate($scope.activateData, function (data) {
                $localstorage.set('tempUserId', null);
                $state.go('signup-success');
            });
        }
    })
;
