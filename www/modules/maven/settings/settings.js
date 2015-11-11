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
    .controller('MavenSettingsBankAccountCtrl', function ($scope, $ionicPopup, PaymentAPI, $state, stripe) {
        var initController = function () {
            $scope.bankAccountData = {};
            $scope.bankAccountExists = false;
            $scope.bankAccount = {};

            PaymentAPI.get({}, function (data) {
                $scope.bankAccountExists = true;
                $scope.bankAccount = data.bank_account;
            }, function () {
            });

            $scope.tryDeletePayment = function () {
                PaymentAPI.delete({}, function (data) {
                    initController();
                }, function (response) {
                    $ionicPopup.alert({
                        title: 'Error',
                        template: response.data.errors.join("\n"),
                        buttons: [
                            {
                                text: 'OK',
                                type: 'button-clear'
                            }
                        ]
                    });
                });
            }

            $scope.connectBankAccount = function () {

                stripe.bankAccount.createToken({
                    routing_number: $scope.bankAccountData.routing_number,
                    account_number: $scope.bankAccountData.account_number,
                    country: "US",
                    currency: "USD"
                })
                    .then(function (token) {
                        console.log('token created for card ending in ', token.card.last4);
                        console.log(token);
                        PaymentAPI.post({'token': token.id}, function (data) {
                            initController();
                        })
                    })
                    .catch(function (err) {
                        console.log(err)
                        $ionicPopup.alert({
                            title: "Credit card declined",
                            template: err.message,
                            buttons: [
                                {
                                    text: "OK",
                                    type: "button-clear"
                                }
                            ]
                        })
                    });
            }
        }

        initController();
    })
;
