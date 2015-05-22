'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider
            .state('client.curr-order-accepted', {
                url: "/curr-order-accepted/:orderId",
                abstract: true,
                views: {
                    'menuContent': {
                        templateUrl: "modules/client/curr-order-accepted/curr-order-accepted.html",
                        controller: "ClientCurrOrderAcceptedCtrl"
                    }
                }
            })
            .state('client.curr-order-accepted.track', {
                url: "/track",
                views: {
                    'track': {
                        templateUrl: "modules/client/curr-order-accepted/track.html",
                        controller: "ClientCurrOrderAcceptedTrackCtrl"
                    }
                }
            })
            .state('client.curr-order-accepted.details', {
                url: "/details",
                views: {
                    'details': {
                        templateUrl: "modules/client/curr-order-accepted/details.html"
                    }
                }
            })
            .state('client.curr-order-accepted.messages', {
                url: "/messages",
                views: {
                    'messages': {
                        templateUrl: "modules/client/curr-order-accepted/messages.html"
                    }
                }
            })
        ;
    })
;

angular.module('emve.controllers')
    .controller('ClientCurrOrderAcceptedCtrl', function ($scope, $stateParams, ClientOrders) {
        $scope.getOrder = ClientOrders.get({orderId: $stateParams.orderId}, function (data) {
            $scope.order = data.order;
        });
    })
    .controller('ClientCurrOrderAcceptedTrackCtrl', function ($rootScope, $scope, leafletData) {

        angular.extend($scope, {
            center:{
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

        $scope.getOrder.$promise.then(function () {
            $scope.markers[0] = {
                lat: $scope.order.lat,
                lng: $scope.order.lng,
                message: 'Drop Off'
            };

            $scope.center = {
                lat: $scope.order.lat,
                lng: $scope.order.lng,
                zoom: 11
            };

            var centered = false;
            leafletData.getMap('transp_curr_order_map').then(function (map) {
                $scope.offTrackEvent = $rootScope.$on('track', function (event, data) {
                    console.log('transp_pos');
                    $scope.markers[1] = {
                        lat: data.pos.latitude,
                        lng: data.pos.longitude,
                        message: 'Transporter'
                    };

                    if (!centered) {
                        centered = true;
                        $scope.center = {
                            lat: data.pos.latitude,
                            lng: data.pos.longitude,
                            zoom: 11
                        };
                    }
                });
            });
        });
    })
;
