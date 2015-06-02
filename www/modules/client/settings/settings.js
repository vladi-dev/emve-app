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
            });
    });

angular.module('emve.controllers')
    .controller('SettingsCtrl', function ($rootScope, $scope, $window, $state) {
        $scope.doLogout = function () {
            $rootScope.$emit('websocket:close');

            delete $window.sessionStorage.token;
            $state.go('splash');
        }
    })
    .controller('SettingsNameCtrl', function ($scope, $http, $ionicPopup, CurrentUser, flash) {
        $scope.showFeedback = false;
        $scope.userData = {};

        CurrentUser.get({}, function (u) {
            $scope.userData.first_name = u.first_name;
            $scope.userData.middle_name = u.middle_name;
            $scope.userData.last_name = u.last_name;
        });

        $scope.tryUpdateName = function () {
            CurrentUser.patch($scope.userData, function (data) {
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
    .controller('SettingsPhoneCtrl', function ($scope, $http, $ionicPopup, CurrentUser, flash) {
        $scope.userData = {};

        var user = CurrentUser.get({}, function (u) {
            $scope.userData.phone = u.phone;
        });

        $scope.tryUpdatePhone = function () {
            CurrentUser.patch($scope.userData, function (data) {
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
;
