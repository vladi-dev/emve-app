'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider
            .state('maven.curr-order', {
                url: "/curr-order/:orderId",
                abstract: true,
                views: {
                    'menuContent': {
                        templateUrl: "modules/maven/curr-order/curr-order.html",
                        controller: "MavenCurrOrderCtrl"
                    }
                }
            })
            .state('maven.curr-order.map', {
                url: "/map",
                views: {
                    'map': {
                        templateUrl: "modules/maven/curr-order/map.html"
                    }
                }
            })
            .state('maven.curr-order.details', {
                url: "/details",
                views: {
                    'details': {
                        templateUrl: "modules/maven/curr-order/details.html"
                    }
                }
            })
            .state('maven.curr-order.messages', {
                url: "/messages",
                views: {
                    'messages': {
                        templateUrl: "modules/maven/curr-order/messages.html"
                    }
                }
            })
        ;
    })
;

angular.module('emve.controllers')
    .controller('MavenCurrOrderCtrl', function ($rootScope, $scope, $state, $stateParams, $ionicPopup, leafletData, leafletBoundsHelpers, MavenOrders, RecentPosition) {
        var markers = {}, center = {
            lat: 34.1625,
            lng: -118.4659,
            zoom: 11
        };

        // Make default marker show maven recent position
        // Need when his position isn't changing
        // thus 'maven_map' event doesn't trigger
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

        MavenOrders.get({orderId: $stateParams.orderId}, function (data) {
                $scope.order = data.order;

                // TODO: incapsulate maven location detection
                leafletData.getMap('maven_curr_order_map').then(function (map) {
                    console.log('currorder get map');
                    $scope.markers[1] = {
                        lat: $scope.order.lat,
                        lng: $scope.order.lng,
                        message: 'Drop Off'
                    }

                    map.panTo($scope.markers[1], {animate: true, duration: 8});

                    console.log('leaflet data');
                    $scope.offMavenPos = $rootScope.$on('maven_pos', function (event, position) {
                        console.log('maven_pos');
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

                $state.go('maven.order-list');
            }
        );

        $scope.$on('$destroy', function () {
            console.log('controller destroyed');
            leafletData.unresolveMap('maven_curr_order_map');

            if ($scope.offMavenPos != void 0) {
                $scope.offMavenPos();
                $scope.offMavenPos = null;
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
