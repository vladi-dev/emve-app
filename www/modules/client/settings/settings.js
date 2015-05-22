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

        $scope.saveAddress = function () {
            NewAddress.set($scope.newAddressData);
            $state.go('client.settings-add-address-map')
        }
    })
    .controller('SettingsAddAddressMapCtrl', function ($scope, $http, $ionicPopup, $state, UsersAddresses, NewAddress, uiGmapIsReady, flash) {
        $scope.newAddressData = NewAddress.get();

        $scope.map = {
            center: {latitude: 33.87, longitude: -117.79},
            control: "",
            zoom: 17
        };

        if ($scope.newAddressData) {
            var a = NewAddress.get();

            uiGmapIsReady.promise(1).then(function (instances) {
                var map = instances[0].map;
                var address = a.house + " " + a.street + " " + a.city + " " + a.state + " " + a.zip;

                if (address) {
                    var geocoder = new google.maps.Geocoder();
                    geocoder.geocode({'address': address}, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            var marker = new google.maps.Marker({
                                map: map,
                                draggable: true,
                                position: results[0].geometry.location
                            });

                            google.maps.event.addListener(marker, 'dragend', function() {
                                $scope.newAddressData.lat = marker.getPosition().lat();
                                $scope.newAddressData.lng = marker.getPosition().lng();
                            });

                            google.maps.event.trigger(marker, 'dragend');

                            map.setCenter(marker.getPosition());
                        }
                    });
                }
            });

        }

        $scope.tryAddAddress = function () {
            UsersAddresses.put($scope.newAddressData, function () {
                $scope.newAddressData = {};
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
