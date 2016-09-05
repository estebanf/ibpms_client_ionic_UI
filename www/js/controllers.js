angular.module('app.controllers', [])

.controller('loginCtrl', ['$scope', '$stateParams','ETApi','$ionicPopup','$state',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams,ETApi,$ionicPopup,$state) {
  function clear(){
    $scope.data = {
      user:'admin',
      password:''
    }
  }
  clear();
  $scope.authenticate = function(){
    ETApi.setData($scope.data);
    ETApi.authenticateUser()
      .then(function(data){
        clear();
        $state.go("tabsController.tasks");
      },function(data){
        var alertPopup = $ionicPopup.alert({
          title: 'Authentication failed',
          template: 'Please enter correct credentials'
        })
          .then(function(res){
            clear();
          });
      })
  }
}])

.controller('startProcessCtrl', ['$scope', '$stateParams','ETApi','$ionicPopup', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams,ETApi,$ionicPopup) {
  $scope.data = {
    amount:'',
    reason:'',
    urgent:false,
    comments:''
  }
  $scope.submitProcess = function(){
    ETApi.setData($scope.data);
    ETApi.startProcess()
      .then(function(data){
        id = "Request id: " + data.Recieve_request_from_systemResponse["SampleSchema:processInstanceId"].$;
        var alertPopup = $ionicPopup.alert({
          title: 'Process created!',
          template: id
        });

        alertPopup.then(function(res) {
          $scope.data = {
            amount:'',
            reason:'',
            urgent:false,
            comments:''
          }
        });

      },function(data){
        console.log(data);
      });
  }

}])

.controller('taskDetailCtrl', ['$scope', '$stateParams', 'ETApi','$ionicLoading','$ionicHistory', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams,ETApi,$ionicLoading,$ionicHistory) {
  $scope.task = {}
  $scope.show = function(text) {
    $ionicLoading.show({
      template: text
    });
  };

  $scope.hide = function(){
    $ionicLoading.hide();
  };
  $scope.show('Loading task...');
  ETApi.getTaskDetail()
    .then(function(data){
      $scope.object = data["tms:getTaskResponse"]["tms:task"]["tms:input"]
      $scope.task.amount = data["tms:getTaskResponse"]["tms:task"]["tms:input"].FormModel.Amount.$;
      $scope.task.comments = data["tms:getTaskResponse"]["tms:task"]["tms:input"].FormModel.Comments.$;
      $scope.task.reason = data["tms:getTaskResponse"]["tms:task"]["tms:input"].FormModel.Reason.$;
      $scope.task.requestid = data["tms:getTaskResponse"]["tms:task"]["tms:input"].FormModel.RequestID.$;
      $scope.task.date = data["tms:getTaskResponse"]["tms:task"]["tms:input"].FormModel.Request_date.$;
      $scope.task.requestor = data["tms:getTaskResponse"]["tms:task"]["tms:input"].FormModel.Requestor.$;
      $scope.task.urgent = data["tms:getTaskResponse"]["tms:task"]["tms:input"].FormModel.Urgent.$;
      $scope.hide();
    })
  $scope.approve = function(){
    $scope.object.FormModel.Decision.$="Approved";
    $scope.submit();
  }
  $scope.reject = function(){
    $scope.object.FormModel.Decision.$="Rejected";
    $scope.submit();
  }
  $scope.submit = function(){
    $scope.show('Completing task...');
    ETApi.setData($scope.object);
    ETApi.completeTask()
      .then(function(data){
        $scope.hide();
        $ionicHistory.goBack();
      })
  }
}])

.controller('tasksCtrl', ['$scope', '$stateParams', 'ETApi','$ionicLoading','$state',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams,ETApi,$ionicLoading,$state) {
  $scope.tasks = [];
  $scope.show = function() {
    $ionicLoading.show({
      template: 'Loading tasks...'
    });
  };

  $scope.hide = function(){
    $ionicLoading.hide();
  };

  $scope.taskSelected = function(task){
    ETApi.selectTask(task.taskId);
    $state.go("tabsController.taskDetail");
  }
  $scope.doRefresh = function() {
    ETApi.getTasks()
      .then(function(data){
        console.log(data);
        if(!angular.isArray(data["tms:getAvailableTasksResponse"]["tms:task"])){
          if(!data["tms:getAvailableTasksResponse"]["tms:task"]){
            $scope.tasks = [];
          }
          else{
            $scope.tasks = [{
              taskId: data["tms:getAvailableTasksResponse"]["tms:task"]["tms:taskId"].$,
              description: data["tms:getAvailableTasksResponse"]["tms:task"]["tms:description"].$,
            }];
          }
        }
        else{
          $scope.tasks = data["tms:getAvailableTasksResponse"]["tms:task"].map(function(item){
            return {
              taskId: item["tms:taskId"].$,
              description: item["tms:description"].$
            };
          });
        }
        $scope.hide();
        $scope.$broadcast('scroll.refreshComplete');
      })
  }

  $scope.show();
  $scope.doRefresh();

}])
