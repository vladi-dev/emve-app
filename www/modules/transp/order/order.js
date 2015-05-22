'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider
            .state('transp.order-list', {
                url: "/order-list",
                views: {
                    'menuContent': {
                        templateUrl: "modules/transp/order/order-list.html",
                        controller: "TranspOrderListCtrl"
                    }
                }
            })
            .state('transp.order', {
                url: "/order/:orderId",
                views: {
                    'menuContent': {
                        templateUrl: "modules/transp/order/order.html",
                        controller: "TranspOrderCtrl"
                    }
                }
            })
        ;
    })
;

angular.module('emve.controllers')
    .controller('TranspOrderListCtrl', function ($rootScope, $scope, $http, $ionicPopup, TranspOrders) {
        TranspOrders.get({'view': 'new'}, function (data) {
            $scope.orders = data.orders;

            $rootScope.$on('new_order', function (event, data) {
                $scope.$apply(function () {
                    $scope.orders.push(data.order);
                });
            });

            $rootScope.$on('remove_order', function (event, data) {
                console.log('remove_order');
                angular.forEach($scope.orders, function (order, idx) {

                    if (order.id == data.order_id) {
                        $scope.$apply(function () {
                            $scope.orders.splice(idx, 1);
                        });
                    }
                });
            });
        }, function (response) {
            $ionicPopup.alert({
                title: response.data.error,
                template: response.data.error,
                buttons: [{
                    text: 'OK',
                    type: 'button-clear'
                }]
            });
        });
    })
    .controller('TranspOrderCtrl', function ($rootScope, $scope, $http, $ionicPopup, $state, $stateParams, TranspOrders, RecentPosition, leafletData, $ionicModal) {
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
            markers: markers,
            events: {
                map: {
                    enable: ['click'],
                    logic: 'emit'
                }
            },
            center2: center,
            defaults2: {
                tileLayer: "https://{s}.tiles.mapbox.com/v4/emve-dev.l8pjd86f/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZW12ZS1kZXYiLCJhIjoiNWo4dEVUWSJ9._AFAtSxwrUNknqpVkzdYZw",
                tileLayerOptions: {
                    attribution: 'MapBox'
                }
            },
            markers2: markers
        });

        $ionicModal.fromTemplateUrl('modules/transp/order/order-modal-map.html', {
            scope: $scope,
            animation: 'slide-in-up',
            backdropClickToClose: false,
            hardwareBackButtonClose: false
        }).then(function (modal) {
            $scope.detailsModal = modal;

            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                $scope.detailsModal.remove();
            });
        });


        $scope.$on('leafletDirectiveMap.click', function (e, args) {
            console.log(args.leafletObject);
            console.log(args.leafletObject._container);
            $scope.detailsModal.show();
        });

        TranspOrders.get({orderId: $stateParams.orderId}, function (data) {
            $scope.order = data.order;

            // TODO: incapsulate transporter location detection
            leafletData.getMap('transp_order_map').then(function (map) {
                $scope.markers[1] = {
                    lat: $scope.order.lat,
                    lng: $scope.order.lng,
                    message: 'Drop Off'
                };
                $scope.markers2[1] = {
                    lat: $scope.order.lat,
                    lng: $scope.order.lng,
                    message: 'Drop Off'
                }

                map.panTo($scope.markers[1], {animate: true, duration: 8});

                $scope.offTranspPos = $scope.$on('transp_pos', function (event, position) {
                    $scope.markers[0] = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        message: 'You'
                    };
                    $scope.markers2[0] = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        message: 'You'
                    };
                });
            });
        });


        $scope.tryAccept = function () {
            TranspOrders.accept({orderId: $stateParams.orderId}, function (data) {
                $rootScope.$broadcast('transp_order_accepted', data);
                $state.go('transp.curr-order.map', {orderId: data.order.id});
            }, function (error) {
                $ionicPopup.alert({
                    title: 'Error accepting order',
                    template: error.data.error,
                    buttons: [{
                        text: 'OK',
                        type: 'button-clear'
                    }]
                });
            });
        }
    })
;
