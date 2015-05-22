'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider
            .state('transp.curr-order', {
                url: "/curr-order/:orderId",
                abstract: true,
                views: {
                    'menuContent': {
                        templateUrl: "modules/transp/curr-order/curr-order.html",
                        controller: "TranspCurrOrderCtrl"
                    }
                }
            })
            .state('transp.curr-order.map', {
                url: "/map",
                views: {
                    'map': {
                        templateUrl: "modules/transp/curr-order/map.html"
                    }
                }
            })
            .state('transp.curr-order.details', {
                url: "/details",
                views: {
                    'details': {
                        templateUrl: "modules/transp/curr-order/details.html"
                    }
                }
            })
            .state('transp.curr-order.messages', {
                url: "/messages",
                views: {
                    'messages': {
                        templateUrl: "modules/transp/curr-order/messages.html"
                    }
                }
            })
        ;
    })
;

angular.module('emve.controllers')
    .controller('TranspCurrOrderCtrl', function ($rootScope, $scope, $state, $stateParams, $ionicPopup, leafletData, leafletBoundsHelpers, TranspOrders, RecentPosition) {
        var markers = {}, center = {
            lat: 34.1625,
            lng: -118.4659,
            zoom: 11
        };

        // Make default marker show transporters recent position
        // Need when his position isn't changing
        // thus 'transp_map' event doesn't trigger
        var position = RecentPosition.get();
        if (position) {
            center = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                zoom: 11
            };
            markers[0] = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                message: 'You'
            };
        }

        angular.extend($scope, {
            center: center,
            defaults: {
                tileLayer: "https://{s}.tiles.mapbox.com/v4/emve-dev.l8pjd86f/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZW12ZS1kZXYiLCJhIjoiNWo4dEVUWSJ9._AFAtSxwrUNknqpVkzdYZw",
                tileLayerOptions: {
                    attribution: 'MapBox'
                }
            },
            markers: markers
        });

        TranspOrders.get({orderId: $stateParams.orderId}, function (data) {
                $scope.order = data.order;

                // TODO: incapsulate transporter location detection
                leafletData.getMap('transp_curr_order_map').then(function (map) {
                    console.log('currorder get map');
                    $scope.markers[1] = {
                        lat: $scope.order.lat,
                        lng: $scope.order.lng,
                        message: 'Drop Off'
                    }

                    map.panTo($scope.markers[1], {animate: true, duration: 8});

                    console.log('leaflet data');
                    $scope.offTranspPos = $rootScope.$on('transp_pos', function (event, position) {
                        console.log('transp_pos');
                        $scope.markers[0] = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            message: 'You'
                        };
                    });
                });
            }, function (response) {
                $ionicPopup.alert({
                    title: 'You have no current orders',
                    template: 'You have no current orders'
                });

                $state.go('transp.order-list');
            }
        );

        $scope.$on('$destroy', function () {
            console.log('controller destroyed');
            leafletData.unresolveMap('transp_curr_order_map');

            if (typeof $scope.offTranspPos != void 0) {
                $scope.offTranspPos();
                $scope.offTranspPos = null;
            }

            angular.extend($scope, {
                center: null,
                defaults: null,
                markers: null,
                order: null
            });
        });
    })
;
