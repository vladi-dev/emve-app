'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider
            .state('transp.complete-order-step1', {
                url: "/complete-order-step1/:orderId",
                views: {
                    'menuContent': {
                        templateUrl: "modules/transp/complete-order/complete-order-step1.html",
                        controller: "TranspCompleteOrderStep1Ctrl"
                    }
                }
            })
            .state('transp.complete-order-step2', {
                url: "/complete-order-step2/:orderId/:amount",
                views: {
                    'menuContent': {
                        templateUrl: "modules/transp/complete-order/complete-order-step2.html",
                        controller: "TranspCompleteOrderStep2Ctrl"
                    }
                }
            })
            .state('transp.complete-order-step3', {
                url: "/complete-order-step3/:orderId",
                views: {
                    'menuContent': {
                        templateUrl: "modules/transp/complete-order/complete-order-step3.html",
                        controller: "TranspCompleteOrderStep3Ctrl"
                    }
                }
            })
        ;
    })
;

angular.module('emve.controllers')
    .controller('TranspCompleteOrderStep1Ctrl', function ($rootScope, $scope, $state, $stateParams, TranspOrders) {
        $scope.processAmountData = {};

        TranspOrders.get({orderId: $stateParams.orderId}, function (data) {
            $scope.order = data.order;

            $scope.tryProcessAmount = function () {
                $state.go('transp.complete-order-step2', {orderId: $scope.order.id, amount: $scope.processAmountData.amount});
            }
        });
    })
    .controller('TranspCompleteOrderStep2Ctrl', function ($rootScope, $scope, $state, $stateParams, $ionicPopup, TranspOrders) {
        $scope.fees = {};
        $scope.completeOrderData = {};

        console.log('before get');
        TranspOrders.get({'orderId': $stateParams.orderId, 'amount': $stateParams.amount}, function (data) {
            console.log('in get');
            $scope.order = data.order;
            $scope.fees = data.fees;
        });
        console.log('after get');

        $scope.tryCompleteOrder = function () {
            TranspOrders.complete({'orderId': $scope.order.id, 'amount': $scope.fees.amount, 'pin': $scope.completeOrderData.pin, 'act': 'complete'}, function (data) {
                if (data.success) {
                    console.log($scope.order);
                    $rootScope.$broadcast('transp_order_completed');
                    $state.go('transp.complete-order-step3', {orderId: $scope.order.id});
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
    .controller('TranspCompleteOrderStep3Ctrl', function ($rootScope, $scope, $state, $stateParams) {
        $scope.orderId = $stateParams.orderId;
    })
;
