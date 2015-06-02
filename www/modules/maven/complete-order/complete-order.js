'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider
            .state('maven.complete-order-step1', {
                url: "/complete-order-step1/:orderId",
                views: {
                    'menuContent': {
                        templateUrl: "modules/maven/complete-order/complete-order-step1.html",
                        controller: "MavenCompleteOrderStep1Ctrl"
                    }
                }
            })
            .state('maven.complete-order-step2', {
                url: "/complete-order-step2/:orderId/:amount",
                views: {
                    'menuContent': {
                        templateUrl: "modules/maven/complete-order/complete-order-step2.html",
                        controller: "MavenCompleteOrderStep2Ctrl"
                    }
                }
            })
            .state('maven.complete-order-step3', {
                url: "/complete-order-step3/:orderId",
                views: {
                    'menuContent': {
                        templateUrl: "modules/maven/complete-order/complete-order-step3.html",
                        controller: "MavenCompleteOrderStep3Ctrl"
                    }
                }
            })
        ;
    })
;

angular.module('emve.controllers')
    .controller('MavenCompleteOrderStep1Ctrl', function ($rootScope, $scope, $state, $stateParams, MavenOrders) {
        $scope.processAmountData = {};

        MavenOrders.get({orderId: $stateParams.orderId}, function (data) {
            $scope.order = data.order;

            $scope.tryProcessAmount = function () {
                $state.go('maven.complete-order-step2', {orderId: $scope.order.id, amount: $scope.processAmountData.amount});
            }
        });
    })
    .controller('MavenCompleteOrderStep2Ctrl', function ($rootScope, $scope, $state, $stateParams, $ionicPopup, MavenOrders) {
        $scope.fees = {};
        $scope.completeOrderData = {};

        console.log('before get');
        MavenOrders.get({'orderId': $stateParams.orderId, 'amount': $stateParams.amount}, function (data) {
            console.log('in get');
            $scope.order = data.order;
            $scope.fees = data.fees;
        });
        console.log('after get');

        $scope.tryCompleteOrder = function () {
            MavenOrders.complete({'orderId': $scope.order.id, 'amount': $scope.fees.amount, 'pin': $scope.completeOrderData.pin, 'act': 'complete'}, function (data) {
                if (data.success) {
                    console.log($scope.order);
                    $rootScope.$broadcast('maven:order_completed');
                    $state.go('maven.complete-order-step3', {orderId: $scope.order.id});
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
    .controller('MavenCompleteOrderStep3Ctrl', function ($rootScope, $scope, $state, $stateParams) {
        $scope.orderId = $stateParams.orderId;
    })
;
