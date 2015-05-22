'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider
            .state('client.curr-order-new', {
                url: "/curr-order-new/:orderId",
                views: {
                    'menuContent': {
                        templateUrl: "modules/client/curr-order-new/curr-order-new.html",
                        controller: "ClientCurrOrderNewCtrl"
                    }
                }
            })
    })
;

angular.module('emve.controllers')
    .controller('ClientCurrOrderNewCtrl', function ($scope, $stateParams, ClientOrders) {
        // TODO: redirect to accepted view if order is accepted
        ClientOrders.get({orderId: $stateParams.orderId}, function (data) {
            $scope.order = data.order;
        });
    })
;
