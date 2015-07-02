'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider.state('splash', {
            url: "/",
            templateUrl: "modules/common/splash/splash.html"
            //controller: "SplashCtrl"
        })
    });
;

// Disabled. I think in app there is not going to be sutiation when logged in user visits this page
//angular.module('emve.controllers')
    //.controller('SplashCtrl', function ($scope, $window, $state) {
        //if (CurrentUser.get() !== void 0) {
        //    $state.go('client.custom-order');
        //}
    //})
;
