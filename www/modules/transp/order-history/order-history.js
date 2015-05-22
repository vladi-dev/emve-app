'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider
            .state('transp.order-history-list', {
                url: "/order-history-list",
                views: {
                    'menuContent': {
                        templateUrl: "modules/transp/order-history/order-history-list.html",
                        controller: "TranspOrderHistoryListCtrl"
                    }
                }
            })
            .state('transp.order-history-details', {
                url: "/order-history-details/:orderId",
                views: {
                    'menuContent': {
                        templateUrl: "modules/transp/order-history/order-history-details.html",
                        controller: "TranspOrderHistoryDetailsCtrl"
                    }
                }
            })
        ;
    })
;

angular.module('emve.controllers')
    .controller('TranspOrderHistoryListCtrl', function ($rootScope, $scope, $http, $ionicPopup, TranspOrders) {
        TranspOrders.get({'view': 'archive'}, function (data) {
            $scope.orders = data.orders;

            $rootScope.$on('transp_order_completed', function (event, data) {
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
    .controller('TranspOrderHistoryDetailsCtrl', function ($rootScope, $scope, $http, $ionicPopup, $ionicModal, $state, $stateParams, TranspOrders) {
        TranspOrders.get({orderId: $stateParams.orderId}, function (data) {
            $scope.order = data.order;
        });
    })
;
