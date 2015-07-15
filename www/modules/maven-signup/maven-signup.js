'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider
            .state('maven-signup-splash', {
                url: "/maven-signup-splash",
                templateUrl: "modules/maven-signup/maven-signup-splash.html",
                controller: "MavenSignupSplashCtrl"
            })
            .state('maven-signup-step1', {
                url: "/maven-signup-step1",
                templateUrl: "modules/maven-signup/maven-signup-step1.html",
                controller: "MavenSignupStep1Ctrl"
            })
            .state('maven-signup-step2', {
                url: "/maven-signup-step2",
                templateUrl: "modules/maven-signup/maven-signup-step2.html",
                controller: "MavenSignupStep2Ctrl"
            })
            .state('maven-signup-confirm', {
                url: "/maven-signup-confirm",
                templateUrl: "modules/maven-signup/maven-signup-confirm.html",
                controller: "MavenSignupConfirmCtrl"
            })
            .state('maven-signup-success', {
                url: "/maven-signup-success",
                templateUrl: "modules/maven-signup/maven-signup-success.html"
            })
    });
;

angular.module('emve.controllers')
    .controller('MavenSignupSplashCtrl', function () {
    })
    .controller('MavenSignupStep1Ctrl', function ($scope, $state, MavenSignupAPI, MavenSignupHelper) {
        $scope.mavenSignupStep1Data = {};

        var tempMavenSignupId = MavenSignupHelper.getTempMavenSignupId();
        if (tempMavenSignupId) {
            MavenSignupAPI.get({id: tempMavenSignupId}, function (data) {
                if (data.signup) {
                    $scope.mavenSignupStep1Data = data.signup;

                    // Setting date
                    $scope.mavenSignupStep1Data.dob = new Date(data.signup.dob);
                }
            });
        }

        $scope.tryStep1 = function () {
            MavenSignupAPI.step1($scope.mavenSignupStep1Data, function (data) {
                MavenSignupHelper.setTempMavenSignupId(data.tempMavenSignupId)
                $state.go('maven-signup-step2');
            }, function (response) {
                $scope.errors = response.data.errors;
            });
        }
    })
    .controller('MavenSignupStep2Ctrl', function ($scope, $state, MavenSignupAPI, MavenSignupHelper) {
        $scope.mavenSignupStep2Data = {};

        var tempMavenSignupId = MavenSignupHelper.getTempMavenSignupId();
        if (tempMavenSignupId) {
            MavenSignupAPI.get({id: tempMavenSignupId}, function (data) {
                $scope.mavenSignupStep2Data = data.signup;
                $scope.mavenSignupStep2Data.tempMavenSignupId = tempMavenSignupId;
            });
        } else {
            $state.go('maven-signup-splash');
        }


        $scope.tryStep2 = function () {
            MavenSignupAPI.step2($scope.mavenSignupStep2Data, function (data) {
                $state.go('maven-signup-confirm');
            }, function (response) {
                $scope.errors = response.data.errors;
            });
        }
    })
    .controller('MavenSignupConfirmCtrl', function ($scope, $state, MavenSignupAPI, MavenSignupHelper) {
        var tempMavenSignupId = MavenSignupHelper.getTempMavenSignupId();
        if (tempMavenSignupId) {
            MavenSignupAPI.get({id: tempMavenSignupId}, function (data) {
                $scope.mavenSignup = data.signup;
            });
        } else {
            $state.go('maven-signup-splash');
        }

        $scope.tryConfirm = function () {
            MavenSignupAPI.confirm({id: tempMavenSignupId}, function (data) {
                MavenSignupHelper.setTempMavenSignupId(null);
                $state.go('maven-signup-success');
            }, function (response) {
                $scope.errors = response.data.errors;
            });
        }
    })
;
