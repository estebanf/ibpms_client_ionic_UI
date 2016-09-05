angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider



  .state('tabsController', {
    url: '/main',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

  .state('tabsController.login', {
    url: '/login',
    views: {
      'tab1': {
        templateUrl: 'templates/login.html',
        controller: 'loginCtrl'
      }
    }
  })
  .state('tabsController.tasks', {
    url: '/tasks',
    views: {
      'tab1':{
        templateUrl: 'templates/tasks.html',
        controller: 'tasksCtrl'
      }
    }
  })
  .state('tabsController.taskDetail', {
    url: '/taskDetail',
    views: {
      'tab1':{
        templateUrl: 'templates/taskDetail.html',
        controller: 'taskDetailCtrl'
      }
    }
  })
  .state('tabsController.startProcess', {
    url: '/init_process',
    views: {
      'tab2': {
        templateUrl: 'templates/startProcess.html',
        controller: 'startProcessCtrl'
      }
    }
  })
$urlRouterProvider.otherwise('/main/login')



});
