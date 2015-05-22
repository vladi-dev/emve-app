'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider.state('splash', {
            url: "/",
            templateUrl: "modules/common/splash/splash.html",
            controller: "SplashCtrl"
        })
    });
;

angular.module('emve.controllers')
    .controller('SplashCtrl', function ($scope, $window, $state) {
        if ($window.sessionStorage.token != void 0) {
            $state.go('client.custom-order');
        }
    })
;
