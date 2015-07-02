'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider
            .state('signup', {
                url: "/signup?asMaven",
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
    .controller('SignupCtrl', function ($scope, $state, $stateParams, $ionicPopup, $localstorage, SignupAPI, SignupHelper) {
        if ($stateParams.asMaven) {
            SignupHelper.setSignupAsMavenFlag(1);
        } else {
            SignupHelper.setSignupAsMavenFlag(null);
        }

        $scope.signupData = {};

        $scope.trySignup = function () {
            SignupAPI.signup($scope.signupData, function (data) {
                    SignupHelper.setTempUserId(data.tempUserId);

                    $state.go('signup-activate');
                }, function (response) {
                $scope.errors = response.data.errors;
            });
        }
    })
    .controller('SignupActivateCtrl', function ($scope, $state, $ionicPopup, $localstorage, SignupAPI, SignupHelper, CurrentUser) {
        var tempUserId = SignupHelper.getTempUserId();

        if (!tempUserId) {
            $state.go('signup');
        }

        $scope.activateData = {};
        $scope.activateData.tempUserId = tempUserId;

        $scope.tryActivate = function () {
            SignupAPI.activate($scope.activateData, function (data) {
                var signupAsMaven = SignupHelper.getSignupAsMavenFlag();

                SignupHelper.setTempUserId(null);

                var promise = CurrentUser.doLogin(data.token);

                promise.then(function (user) {
                    if (signupAsMaven) {
                        console.log('signup-maven');
                        $state.go('signup-maven');
                    } else {
                        $state.go('client.custom-order');
                    }
                });
            });
        }
    })
;
