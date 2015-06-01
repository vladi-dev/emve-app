'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider
            .state('raven.complete-order-step1', {
                url: "/complete-order-step1/:orderId",
                views: {
                    'menuContent': {
                        templateUrl: "modules/raven/complete-order/complete-order-step1.html",
                        controller: "RavenCompleteOrderStep1Ctrl"
                    }
                }
            })
            .state('raven.complete-order-step2', {
                url: "/complete-order-step2/:orderId/:amount",
                views: {
                    'menuContent': {
                        templateUrl: "modules/raven/complete-order/complete-order-step2.html",
                        controller: "RavenCompleteOrderStep2Ctrl"
                    }
                }
            })
            .state('raven.complete-order-step3', {
                url: "/complete-order-step3/:orderId",
                views: {
                    'menuContent': {
                        templateUrl: "modules/raven/complete-order/complete-order-step3.html",
                        controller: "RavenCompleteOrderStep3Ctrl"
                    }
                }
            })
        ;
    })
;

angular.module('emve.controllers')
    .controller('RavenCompleteOrderStep1Ctrl', function ($rootScope, $scope, $state, $stateParams, RavenOrders) {
        $scope.processAmountData = {};

        RavenOrders.get({orderId: $stateParams.orderId}, function (data) {
            $scope.order = data.order;

            $scope.tryProcessAmount = function () {
                $state.go('raven.complete-order-step2', {orderId: $scope.order.id, amount: $scope.processAmountData.amount});
            }
        });
    })
    .controller('RavenCompleteOrderStep2Ctrl', function ($rootScope, $scope, $state, $stateParams, $ionicPopup, RavenOrders) {
        $scope.fees = {};
        $scope.completeOrderData = {};

        console.log('before get');
        RavenOrders.get({'orderId': $stateParams.orderId, 'amount': $stateParams.amount}, function (data) {
            console.log('in get');
            $scope.order = data.order;
            $scope.fees = data.fees;
        });
        console.log('after get');

        $scope.tryCompleteOrder = function () {
            RavenOrders.complete({'orderId': $scope.order.id, 'amount': $scope.fees.amount, 'pin': $scope.completeOrderData.pin, 'act': 'complete'}, function (data) {
                if (data.success) {
                    console.log($scope.order);
                    $rootScope.$broadcast('raven:order_completed');
                    $state.go('raven.complete-order-step3', {orderId: $scope.order.id});
                }
            }, function (error) {
                $ionicPopup.alert({
                    title: 'Error completing order',
                    template: error.data.errors._,
                    buttons: [{
                        text: 'OK',
                        type: 'button-clear'
                    }]
                });
            });
        }
    })
    .controller('RavenCompleteOrderStep3Ctrl', function ($rootScope, $scope, $state, $stateParams) {
        $scope.orderId = $stateParams.orderId;
    })
;
