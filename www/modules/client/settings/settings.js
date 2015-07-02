'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider.state('client.settings', {
            url: "/settings",
            views: {
                'menuContent': {
                    templateUrl: "modules/client/settings/settings.html",
                    controller: "SettingsCtrl"
                }
            }
        })
            .state('client.settings-name', {
                url: "/name",
                views: {
                    'menuContent': {
                        templateUrl: "modules/client/settings/name.html",
                        controller: "SettingsNameCtrl"
                    }
                }
            })
            .state('client.settings-phone', {
                url: "/settings/phone",
                views: {
                    'menuContent': {
                        templateUrl: "modules/client/settings/phone.html",
                        controller: "SettingsPhoneCtrl"
                    }
                }
            })
            .state('client.settings-address', {
                url: "/settings/address",
                views: {
                    'menuContent': {
                        templateUrl: "modules/client/settings/address.html",
                        controller: "SettingsAddressCtrl"
                    }
                }
            })
            .state('client.settings-add-address', {
                url: "/settings/add-address",
                views: {
                    'menuContent': {
                        templateUrl: "modules/client/settings/add-address.html",
                        controller: "SettingsAddAddressCtrl"
                    }
                }
            })
            .state('client.settings-add-address-map', {
                url: "/settings/add-address-map",
                views: {
                    'menuContent': {
                        templateUrl: "modules/client/settings/add-address-map.html",
                        controller: "SettingsAddAddressMapCtrl"
                    }
                }
            })
            .state('client.settings-payment', {
                url: "/settings/payment",
                views: {
                    'menuContent': {
                        templateUrl: "modules/client/settings/payment.html",
                        controller: "SettingsPaymentCtrl"
                    }
                }
            });
    });

angular.module('emve.controllers')
    .controller('SettingsCtrl', function ($scope, CurrentUser) {
        $scope.user = CurrentUser.get();
        $scope.doLogout = CurrentUser.doLogout;
    })
    .controller('SettingsNameCtrl', function ($scope, $http, $ionicPopup, UserAPI, flash) {
        $scope.showFeedback = false;
        $scope.userData = {};

        UserAPI.get({}, function (u) {
            $scope.userData.first_name = u.first_name;
            $scope.userData.middle_name = u.middle_name;
            $scope.userData.last_name = u.last_name;
        });

        $scope.tryUpdateName = function () {
            UserAPI.patch($scope.userData, function (data) {
                flash('Name changed');
            }, function (data, status, headers, config) {
                $ionicPopup.alert({
                    title: 'Error updating phone',
                    template: 'Check',
                    buttons: [{
                        text: 'OK',
                        type: 'button-clear'
                    }]
                });
            });
        }
    })
    .controller('SettingsPhoneCtrl', function ($scope, $http, $ionicPopup, UserAPI, flash) {
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
                    buttons: [{
                        text: 'OK',
                        type: 'button-clear'
                    }]
                });
            });
        }
    })
    .controller('SettingsAddressCtrl', function ($scope, $http, $ionicPopup, UsersAddresses, flash) {
        UsersAddresses.get({}, function (data) {
            $scope.addresses = data.addresses;
        });

        $scope.tryDeleteAddress = function (idx) {
            var addressToDelete = $scope.addresses[idx];

            UsersAddresses.delete({userAddressId: addressToDelete.id}, function () {
                $scope.addresses.splice(idx, 1);

                flash('Address deleted');
            }, function (data, status, headers, config) {
                $ionicPopup.alert({
                    title: 'Error deleting address',
                    template: 'Check',
                    buttons: [{
                        text: 'OK',
                        type: 'button-clear'
                    }]
                });
            });
        }
    })
    .controller('SettingsAddAddressCtrl', function ($scope, $http, $ionicPopup, $state, UsersAddresses, NewAddress) {
        $scope.newAddressData = NewAddress.get();
        console.log($scope.newAddressData);

        $scope.saveAddress = function () {
            NewAddress.set($scope.newAddressData);
            $state.go('client.settings-add-address-map')
        }
    })
    .controller('SettingsAddAddressMapCtrl', function ($rootScope, $scope, $http, $ionicPopup, $state, UsersAddresses, NewAddress, leafletData, flash) {
        $rootScope.$broadcast('loading:show');
        $scope.newAddressData = NewAddress.get();

        angular.extend($scope, {
            center: {
                lat: 34.1625,
                lng: -118.4659,
                zoom: 11
            },
            defaults: {
                tileLayer: "https://{s}.tiles.mapbox.com/v4/emve-dev.l8pjd86f/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZW12ZS1kZXYiLCJhIjoiNWo4dEVUWSJ9._AFAtSxwrUNknqpVkzdYZw",
                tileLayerOptions: {
                    attribution: 'MapBox'
                }
            },
            markers: {}
        });

        if ($scope.newAddressData) {
            var a = NewAddress.get();

            leafletData.getMap().then(function (map) {
                var address = a.house + " " + a.street + " " + a.city + " " + a.state + " " + a.zip;

                if (address) {
                    var geocodeUrl = encodeURI('https://api.tiles.mapbox.com/v4/geocode/mapbox.places/' + address + '.json?access_token=pk.eyJ1IjoiZW12ZS1kZXYiLCJhIjoiNWo4dEVUWSJ9._AFAtSxwrUNknqpVkzdYZw');

                    var xmlHttp = new XMLHttpRequest();
                    xmlHttp.open("GET", geocodeUrl, true);
                    xmlHttp.send(null);
                    xmlHttp.onreadystatechange = function () {
                        if (xmlHttp.readyState === 4) {
                            if (xmlHttp.status != 200 && req.status != 304) return;
                            var response = JSON.parse(xmlHttp.response);
                            var position = response.features[0].geometry;

                            $scope.newAddressData.lat = position.coordinates[1];
                            $scope.newAddressData.lng = position.coordinates[0];

                            $scope.markers[0] = {
                                lat: $scope.newAddressData.lat,
                                lng: $scope.newAddressData.lng,
                                message: address,
                                draggable: true
                            };

                            $scope.center = {
                                lat: $scope.markers[0].lat,
                                lng: $scope.markers[0].lng,
                                zoom: 11
                            };

                            $scope.$on('leafletDirectiveMarker.dragend', function (e, args) {
                                $scope.newAddressData.lat = args.model.lat;
                                $scope.newAddressData.lng = args.model.lng;
                            });
                        }

                        $rootScope.$broadcast('loading:hide');
                    };
                }
            });

        }

        $scope.tryAddAddress = function () {
            UsersAddresses.put($scope.newAddressData, function () {
                NewAddress.set({});
                flash('Address added');
                $state.go('client.settings-address')
            }, function (data, status, headers, config) {
                $ionicPopup.alert({
                    title: 'Error adding address',
                    template: 'Check',
                    buttons: [{
                        text: 'OK',
                        type: 'button-clear'
                    }]
                });
            });
        }
    })
    .controller('SettingsPaymentCtrl', function ($scope, $ionicPopup, PaymentAPI, $state) {

        var initController = function () {
            PaymentAPI.get({}, function (data) {
                if (data.payment_method !== void 0) {
                    $scope.paymentExists = true;
                    $scope.paymentMethod = data.payment_method;

                    $scope.tryDeletePayment = function () {
                        PaymentAPI.delete({}, function (data) {
                            initController();
                        }, function (response) {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: response.data.errors.join("\n"),
                                buttons: [{
                                    text: 'OK',
                                    type: 'button-clear'
                                }]
                            });
                        });
                    }
                } else {
                    $scope.paymentExists = false;
                    $scope.paymentData = {};

                    // Get client token from backend
                    PaymentAPI.get({'act': 'get_token'}, function (data) {
                        var client = new braintree.api.Client({clientToken: data.token});

                        $scope.connectPayment = function () {

                            client.tokenizeCard({
                                number: $scope.paymentData.number,
                                cardholderName: $scope.paymentData.cardholderName,
                                expirationDate: $scope.paymentData.expirationDate,
                                cvv: $scope.paymentData.cvv,
                                billingAddress: {
                                    firstName: $scope.paymentData.billingAddress.firstName,
                                    lastName: $scope.paymentData.billingAddress.lastName,
                                    streetAddress: $scope.paymentData.billingAddress.streetAddress,
                                    extendedAddress: $scope.paymentData.billingAddress.extendedAddress,
                                    locality: $scope.paymentData.billingAddress.locality,
                                    region: $scope.paymentData.billingAddress.region,
                                    postalCode: $scope.paymentData.billingAddress.postalCode
                                }
                            }, function (err, nonce) {
                                // Send nonce to your server
                                console.log(err); // Always null, even if credit card number is empty - Why?
                                console.log(nonce); // Always present - Why?

                                // Send nonce to backend
                                PaymentAPI.post({'nonce': nonce}, function (data) {
                                    initController();
                                }, function (response) {
                                    $ionicPopup.alert({
                                        title: "Credit card declined",
                                        template: response.data.errors.join("\n"),
                                        buttons: [{
                                            text: "OK",
                                            type: "button-clear"
                                        }]
                                    })
                                })
                            });
                        }
                    });
                }
            });
        }

        initController();
    })
;
