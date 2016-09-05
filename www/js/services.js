angular.module('app.services', [])
  .factory('EverteamServices',function(){
    // var _baseUrl = "http://192.168.1.217:8080/everteam/";
    var _baseUrl = "/api/";
    var service = {};
    var _token = {};
    var _taskId = '';
    var _initProcessUrl =  _baseUrl + '/ode/processes/UserInterfaceSamples/Processes/Core/UISamples/process/External_App';
    var _tokenServiceUrl = _baseUrl + '/ode/processes/TokenService.Service/'
    var _tmsUrl = _baseUrl + '/ode/processes/TaskManagementServices.TaskManagementServicesSOAP/'
    var _completeTaskUrl = _baseUrl + '/ode/processes/completeTask';
    var basePayload = function(url) {
      return {
        method:'POST',
        headers: {
          'Content-Type':'application/json/badgerfish'
        },
        url: url,
        data:{ }
      }
    }
    service.setToken = function (token){
      _token =  token;
    }
    service.setTaskId = function(taskId){
      _taskId = taskId;
    }
    service.buildCompleteTask = function(data){
      var payload = basePayload(_completeTaskUrl);
      payload.data = {
        "ib4p:completeTaskRequest":{
          "@xmlns":{
            "ib4p":"http://www.intalio.com/bpms/workflow/ib4p_20051115"
          },
          "ib4p:taskMetaData":{
            "ib4p:taskId":{
              "$":_taskId
            }
          },
          "ib4p:participantToken":{
            "$":_token
          },
          "ib4p:user":{
            "$":"app"
          },
          "ib4p:taskOutput":data
        }
      }
      return payload;
    }
    service.buildGetTaskDetail = function(){
      var payload = basePayload(_tmsUrl);
      payload.data = {
        "tas:getTaskRequest":{
          "@xmlns":{
            "tas":"http://www.intalio.com/BPMS/Workflow/TaskManagementServices-20051109/"
          },
          "tas:taskId":{
            "$":_taskId
          },
          "tas:participantToken":{
            "$":_token
          }
        }
      };
      return payload;
    }
    service.buildGetTasks = function(){
      var payload = basePayload(_tmsUrl);
      payload.data = {
        "tas:getAvailableTasksRequest":{
          "@xmlns":{
            "tas":"http://www.intalio.com/BPMS/Workflow/TaskManagementServices-20051109/"
          },
          "tas:participantToken":{
            "$":_token
          },
         "tas:taskType":{
           "$":"ACTIVITY"
         },
         "tas:subQuery":{
           "$":"(T._state = TaskState.READY and T._description like 'Review %' and T._processID like '{http://userinterfacesamples.com/Processes/Core/UISamples/process}process-%')"
         },
         "tas:fetchMetaData":{
           "$":"false"
         }
       }
     }
     return payload;
    }
    service.buildAuthenticateUser = function(data){
      var payload = basePayload(_tokenServiceUrl);
      payload.data = {
        "tok:authenticateUser":{
          "@xmlns":{
            "tok":"http://tempo.intalio.org/security/tokenService/"
          },
          "tok:user": {
            "$":data.user
          },
          "tok:password":{
            "$":data.password
          }
        }
      }
      return payload;
    }
    service.buildInitProcess = function(data){
      var payload = basePayload(_initProcessUrl);
      payload.data = {
        "proc:Recieve_request_from_systemRequest":{
            "@xmlns":{
                "proc":"http://userinterfacesamples.com/Processes/Core/UISamples/process",
                "sam":"http://www.everteam.com/SampleSchema"
            },
            "sam:Amount":{
                "$":data.amount
            },
            "sam:Reason":{
                "$":data.reason
            },
            "sam:Comments":{
                "$":data.comments
            },
            "sam:Urgent":{
                "$":data.urgent + ""
            }
        }
      }
      return payload;
    }
    return service;
  })
  .service('ETApi', function($http,$q,EverteamServices){
    var _data = {};
    this.setData = function(data){
      _data = data;
    }
    var buildApi = function(api){
      var deferred = $q.defer();
      $http(api(_data))
        .success(function(data){
          deferred.resolve(data);
        }).error(function(data){
          deferred.reject(data);
        });
      return deferred.promise;
    }
    this.startProcess = function(){
      return buildApi(EverteamServices.buildInitProcess);
    }
    this.authenticateUser = function(){
      return buildApi(EverteamServices.buildAuthenticateUser)
        .then(function(data){
          EverteamServices.setToken(data["tokenws:authenticateUserResponse"]["tokenws:token"].$);
          return data;
        });
    }
    this.getTasks = function(){
      return buildApi(EverteamServices.buildGetTasks);
    }
    this.selectTask = function(id){
      EverteamServices.setTaskId(id);
    }
    this.getTaskDetail = function(){
      return buildApi(EverteamServices.buildGetTaskDetail);
    }
    this.completeTask = function(){
      return buildApi(EverteamServices.buildCompleteTask);
    }
  });
