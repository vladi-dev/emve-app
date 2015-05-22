'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider
            .state('client.order-history-list', {
                url: "/order-history-list",
                views: {
                    'menuContent': {
                        templateUrl: "modules/client/order-history/order-history-list.html",
                        controller: "ClientOrderHistoryListCtrl"
                    }
                }
            })
            .state('client.order-history-details', {
                url: "/order-history-details/:orderId",
                views: {
                    'menuContent': {
                        templateUrl: "modules/client/order-history/order-history-details.html",
                        controller: "ClientOrderHistoryDetailsCtrl"
                    }
                }
            })
        ;
    })
;

angular.module('emve.controllers')
    .controller('ClientOrderHistoryListCtrl', function ($rootScope, $scope, $http, $ionicPopup, ClientOrders) {
        ClientOrders.get({'view': 'archive'}, function (data) {
            $scope.orders = data.orders;

            $rootScope.$on('client_order_completed', function (event, data) {
                $scope.$apply(function () {
                    $scope.orders.push(data.order);
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
    .controller('ClientOrderHistoryDetailsCtrl', function ($rootScope, $scope, $http, $ionicPopup, $ionicModal, $state, $stateParams, ClientOrders) {
        ClientOrders.get({orderId: $stateParams.orderId}, function (data) {
            $scope.order = data.order;
        });
    })
;
