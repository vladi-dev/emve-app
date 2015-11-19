'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider.state('maven.settings', {
            url: "/settings",
            views: {
                'menuContent': {
                    templateUrl: "modules/maven/settings/settings.html",
                    controller: "MavenSettingsCtrl"
                }
            }
        })
            .state('maven.settings-phone', {
                url: "/settings/phone",
                views: {
                    'menuContent': {
                        templateUrl: "modules/maven/settings/phone.html",
                        controller: "MavenSettingsPhoneCtrl"
                    }
                }
            })
            .state('maven.settings-address', {
                url: "/settings/address",
                views: {
                    'menuContent': {
                        templateUrl: "modules/maven/settings/address.html",
                        controller: "MavenSettingsAddressCtrl"
                    }
                }
            })
            .state('maven.settings-personal-info', {
                url: "/settings/personal-info",
                views: {
                    'menuContent': {
                        templateUrl: "modules/maven/settings/personal-info.html",
                        controller: "MavenSettingsPersonalInfoCtrl"
                    }
                }
            })
            .state('maven.settings-bank-account', {
                url: "/settings/bank-account",
                views: {
                    'menuContent': {
                        templateUrl: "modules/maven/settings/bank-account.html",
                        controller: "MavenSettingsBankAccountCtrl"
                    }
                }
            });
    });

angular.module('emve.controllers')
    .controller('MavenSettingsCtrl', function ($scope, CurrentUser) {
        $scope.user = CurrentUser.get();
        $scope.doLogout = CurrentUser.doLogout;
    })
    .controller('MavenSettingsPhoneCtrl', function ($scope, $http, $ionicPopup, UserAPI, flash) {
        $scope.userData = {};

        var user = UserAPI.get({}, function (u) {
            $scope.userData.phone = u.phone;
        });

        $scope.tryUpdatePhone = function () {
            UserAPI.patch($scope.userData, function (data) {
                flash('Phone changed');
            }, function (data, status, headers, config) {
                $ionicPopup.alert({
                    title: 'Error updating phone',
                    template: 'Check',
                    buttons: [
                        {
                            text: 'OK',
                            type: 'button-clear'
                        }
                    ]
                });
            });
        }
    })
    .controller('MavenSettingsAddressCtrl', function ($scope, CurrentUser) {
        $scope.mavenAccount = CurrentUser.get().maven_account;
    })
    .controller('MavenSettingsPersonalInfoCtrl', function ($scope, CurrentUser) {
        $scope.mavenAccount = CurrentUser.get().maven_account;
    })
    .controller('MavenSettingsBankAccountCtrl', function ($scope, CurrentUser) {
        $scope.mavenAccount = CurrentUser.get().maven_account;
    })
;
