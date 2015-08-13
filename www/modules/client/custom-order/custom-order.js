'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider.state('client.custom-order', {
            url: "/custom-order",
            views: {
                'menuContent': {
                    templateUrl: "modules/client/custom-order/custom-order.html",
                    controller: "CustomOrderCtrl"
                }
            }
        });
    })
;

angular.module('emve.controllers')
    .controller('CustomOrderCtrl', function ($rootScope, $scope, $state, $ionicPopup, UsersAddresses, ClientOrders) {
        $scope.customOrderData = {};

        UsersAddresses.get({}, function (data) {
            $scope.orderAddresses = data.addresses;
        });

        $scope.tryAddCustomOrder = function () {
            ClientOrders.put($scope.customOrderData, function (data) {
                $rootScope.$broadcast('client_order_new', data);
                $state.go('client.curr-order-new', {orderId: data.order.id});
            });
        }
    })
;
