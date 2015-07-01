'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider
            .state('client', {
                url: "/client",
                abstract: true,
                templateUrl: "modules/client/app/menu.html",
                controller: 'AppCtrl'
            });
    })
;

angular.module('emve.controllers')
    .controller('AppCtrl', function ($rootScope, $scope, CurrentUser, ClientOrders) {
        var u = CurrentUser.get();
        $scope.name = u.name;

        ClientOrders.get({'view': 'current'}, function (data) {
            $scope.curr_orders = data.orders;

            $rootScope.$on('client_order_new', function (event, data) {
                $scope.curr_orders.push(data.order);
            });

            $rootScope.$on('client_order_completed', function (event, data) {
                angular.forEach($scope.curr_orders, function (order, idx) {

                    if (order.id == data.order.id) {
                        $scope.$apply(function () {
                            $scope.curr_orders.splice(idx, 1);
                        });
                    }
                });
            });

            $rootScope.$on('client_order_accepted', function (event, data) {
                angular.forEach($scope.curr_orders, function (order, idx) {

                    if (order.id == data.order.id) {
                        $scope.$apply(function () {
                            $scope.curr_orders[idx] = data.order;
                        });
                    }
                });
            })
        });
    })
