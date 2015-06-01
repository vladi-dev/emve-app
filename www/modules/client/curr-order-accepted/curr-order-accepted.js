'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider
            .state('client.curr-order-accepted', {
                url: "/curr-order-accepted",
                abstract: true,
                views: {
                    'menuContent': {
                        templateUrl: "modules/client/curr-order-accepted/curr-order-accepted.html"
                    }
                }
            })
            .state('client.curr-order-accepted.track', {
                url: "/track/{orderId:int}",
                views: {
                    'track': {
                        templateUrl: "modules/client/curr-order-accepted/track.html",
                        controller: "ClientCurrOrderAcceptedTrackCtrl"
                    }
                },
                resolve: {
                    getOrder: function ($stateParams, ClientOrders) {
                        return ClientOrders.get({orderId: $stateParams.orderId});
                    }
                }
            })
            .state('client.curr-order-accepted.details', {
                url: "/details/{orderId:int}",
                views: {
                    'details': {
                        templateUrl: "modules/client/curr-order-accepted/details.html"
                    }
                },
                resolve: {
                    getOrder: function ($stateParams, ClientOrders) {
                        return ClientOrders.get({orderId: $stateParams.orderId});
                    }
                }
            })
            .state('client.curr-order-accepted.messages', {
                url: "/messages/{orderId:int}",
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
    .controller('ClientCurrOrderAcceptedTrackCtrl', function ($rootScope, $scope, leafletData, getOrder, $stateParams) {
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

        getOrder.$promise.then(function (data) {
            console.log(data);
            $scope.order = data.order;
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
            $scope.offTrackEvent = $rootScope.$on('client:track_order_' + $scope.order.id, function (event, data) {
                if (data.order_id != $scope.order.id) {
                    return;
                }

                $scope.markers[1] = {
                    lat: data.pos.latitude,
                    lng: data.pos.longitude,
                    message: 'Raven'
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

        $scope.$on('$destroy', function () {
            leafletData.unresolveMap();

            if ($scope.offTrackEvent != void 0) {
                $scope.offTrackEvent();
                $scope.offTrackEvent = null;
            }

            angular.extend($scope, {
                center: null,
                defaults: null,
                markers: {},
                order: null
            });
        });
    })
;
