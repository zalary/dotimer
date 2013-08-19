angular.module('timer', [])
    .directive('timer', function ($timeout, $compile) {
        return  {
            restrict: 'E',
            replace: false,
            scope: {
                interval: '=interval',
                countdownattr: '=countdown'
            },
            controller: function ($scope, $element) {
                if ($element.html().trim().length === 0) {
                    $element.append($compile('<span>{{millis}}</span>')($scope));
                }

                $scope.startTime = null;
                $scope.timeoutId = null;
                $scope.countdown = $scope.countdownattr && parseInt($scope.countdownattr, 10) > 0 ? parseInt($scope.countdownattr, 10) : undefined;
                $scope.isRunning = false;

                $scope.$on('timer-start', function () {
                    $scope.start();
                });

                $scope.$on('timer-resume', function () {
                    $scope.resume();
                });

                $scope.$on('timer-stop', function () {
                    $scope.stop();
                });

                $scope.$on('timer-clear', function () {
                    $scope.clear();
                });

                function resetTimeout() {
                    if ($scope.timeoutId) {
                        $timeout.cancel($scope.timeoutId);
                    }
                }

                $scope.start = $element[0].start = function () {
                    $scope.startTime = new Date();
                    resetTimeout();
                    tick();
                };

                $scope.resume = $element[0].resume = function () {
                    resetTimeout();
                    $scope.startTime = new Date() - ($scope.stoppedTime - $scope.startTime);
                    tick();
                };

                $scope.stop = $element[0].stop = function () {
                    $scope.stoppedTime = new Date();
                    $timeout.cancel($scope.timeoutId);
                    $scope.timeoutId = null;
                };

                $scope.clear = $element[0].clear = function () {
                    $scope.startTime = '0';
                    $scope.minutes = '0';
                    $scope.seconds = '0';
                    $scope.hours = '0';
                    resetTimeout();
                };


                $scope.destroy = $element.bind('$destroy', function () {
                    $timeout.cancel($scope.timeoutId);
                });

                $element.bind('$destroy', function () {
                    $timeout.cancel($scope.timeoutId);
                });

                var tick = function () {
                    if ($scope.countdown > 0) {
                        $scope.countdown--;
                    }
                    else if ($scope.countdown <= 0) {
                        $scope.stop();
                    }

                    $scope.millis = new Date() - $scope.startTime;
                    
                    if ($scope.countdown > 0) {
                        $scope.millis = $scope.countdown * 1000
                    }
                    
                    $scope.seconds = Math.floor(($scope.millis / 1000) % 60);
                    $scope.minutes = Math.floor((($scope.millis / (1000 * 60)) % 60));
                    $scope.hours = Math.floor((($scope.millis / (1000 * 60 * 60)) % 24));
                    $scope.timeoutId = $timeout(function () {
                        tick();
                    }, $scope.interval);

                    $scope.$emit('timer-tick', {timeoutId: $scope.timeoutId, millis: $scope.millis});
                };

                // if you use .stop here, it only half works - the onclick in the html triggers the resume, not the start, 
                // so you can't get a clean slate.  
                // $scope.start();
            }
        };
    });
