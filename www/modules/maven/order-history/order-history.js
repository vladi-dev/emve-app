'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider
            .state('maven.order-history-list', {
                url: "/order-history-list",
                views: {
                    'menuContent': {
                        templateUrl: "modules/maven/order-history/order-history-list.html",
                        controller: "MavenOrderHistoryListCtrl"
                    }
                }
            })
            .state('maven.order-history-details', {
                url: "/order-history-details/:orderId",
                views: {
                    'menuContent': {
                        templateUrl: "modules/maven/order-history/order-history-details.html",
                        controller: "MavenOrderHistoryDetailsCtrl"
                    }
                }
            })
        ;
    })
;

angular.module('emve.controllers')
    .controller('MavenOrderHistoryListCtrl', function ($rootScope, $scope, $http, $ionicPopup, MavenOrders) {
        MavenOrders.get({'view': 'archive'}, function (data) {
            $scope.orders = data.orders;

            $rootScope.$on('maven_order_completed', function (event, data) {
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
    .controller('MavenOrderHistoryDetailsCtrl', function ($rootScope, $scope, $http, $ionicPopup, $ionicModal, $state, $stateParams, MavenOrders) {
        MavenOrders.get({orderId: $stateParams.orderId}, function (data) {
            $scope.order = data.order;
        });
    })
;
