'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider
            .state('raven.order-history-list', {
                url: "/order-history-list",
                views: {
                    'menuContent': {
                        templateUrl: "modules/raven/order-history/order-history-list.html",
                        controller: "RavenOrderHistoryListCtrl"
                    }
                }
            })
            .state('raven.order-history-details', {
                url: "/order-history-details/:orderId",
                views: {
                    'menuContent': {
                        templateUrl: "modules/raven/order-history/order-history-details.html",
                        controller: "RavenOrderHistoryDetailsCtrl"
                    }
                }
            })
        ;
    })
;

angular.module('emve.controllers')
    .controller('RavenOrderHistoryListCtrl', function ($rootScope, $scope, $http, $ionicPopup, RavenOrders) {
        RavenOrders.get({'view': 'archive'}, function (data) {
            $scope.orders = data.orders;

            $rootScope.$on('raven_order_completed', function (event, data) {
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
    .controller('RavenOrderHistoryDetailsCtrl', function ($rootScope, $scope, $http, $ionicPopup, $ionicModal, $state, $stateParams, RavenOrders) {
        RavenOrders.get({orderId: $stateParams.orderId}, function (data) {
            $scope.order = data.order;
        });
    })
;
