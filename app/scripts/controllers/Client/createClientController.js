'use strict';
 
  // Here we attach this controller to our testApp module
var CreateClientCrtl = angular.module('createClientController',['createClientsService','Constants', 'smart-table']);

CreateClientCrtl.controller('CreateClientCtrl', function ($scope, $rootScope, $location, $timeout, CreateClientsService, REST_URL, APPLICATION, PAGE_URL) {
      console.log('CreateClientCtrl : CreateClientCtrl');
      //To load the loadproducts page
      $scope.isLoading = false;
      $scope.createClient = {};
      $scope.createClientWithDataTable={};
      //Success callback
      var createClientTeplateSuccess = function(result) {
         $scope.isLoading = false;
         try {
              $scope.client = result.data;
              $scope.createClient.officeId = $scope.client.officeOptions[0].id;
              $scope.createClient.staffId = $scope.client.staffOptions;
              $scope.createClient.genderId = $scope.client.genderOptions;
              //Set the default values
              $scope.createClient.staffId = 1;
              $scope.createClient.officeId = 1;
              $scope.createClient.genderId = 22;
              $scope.createClient.active = "true";
              $scope.createClient.dateFormat= "dd/MM/yyyy";
              var d=new Date();
              var activationDate = d.getDate()+'/'+d.getMonth()+'/'+d.getFullYear(); 
              console.log("activationDate"+activationDate);
              $scope.createClient.activationDate= activationDate;
              $scope.createClient.locale = "en";

              $scope.createClientWithDataTable.numberOfChildren=0;
              $scope.createClientWithDataTable.numberOfLoanDependents=0;
              $scope.createClientWithDataTable.YesNo_cd_maritalStatus = 34;
              $scope.createClientWithDataTable.locale = "en";
          } catch (e) {
          }
      }
      //failur callback
      var createClientTemplateFail = function(result){
          $scope.isLoading = false;
          console.log('Error : Return from loanProducts service.');
      }
      var loadCreateClientTemplate = function getData(tableState) {
        $scope.isLoading = true;
        $timeout(
          function() {
              $scope.rowCollection = [];              
              CreateClientsService.getData(REST_URL.CREATE_CLIENT_TEMPLATE).then(createClientTeplateSuccess, createClientTemplateFail);
          }, 500
        );
      };

      loadCreateClientTemplate();
      
      $scope.validateCreateClient = function(createClient,createClientWithDataTable){
        console.log('CreateClientCtrl : CreateClient : validateCreateClient');
            if ($scope.createBasicClientForm.$valid) {
              $scope.saveBasicClient(createClient,createClientWithDataTable);
            } else {
              $scope.invalidateForm();
            }
      };

      //invalidate login form
      $scope.invalidateForm = function(){
       $scope.createBasicClientForm.invalidate = false;
      };

      $scope.saveBasicClient = function(createClient,createClientWithDataTable){
        console.log('CreateClientCtrl : CreateClient : saveBasicClient');

        var saveBasicClientSuccess = function(result){
          console.log('Success : Return from loanProducts service.');
          $scope.saveBasicClientExtraInformation(createClientWithDataTable,result.data.clientId); 
        }

        var saveBasicClientFail = function(result){
          console.log('Error : Return from loanProducts service.');                    
          $scope.type="error";
          $scope.message="Loan product not saved: "+result.data.defaultUserMessage;
          $scope.errors = result.data.errors;
          if(result.data.errors!='' && result.data.errors!='undefined'){
            for(var i=0;i<result.data.errors.length;i++){
              $('#'+$scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
            }
          }
        }
        console.log(angular.toJson(this.createClient));
        CreateClientsService.saveClient(REST_URL.CREATE_CLIENT,angular.toJson(this.createClient)).then(saveBasicClientSuccess, saveBasicClientFail);
      };

       $scope.saveBasicClientExtraInformation = function(createClientWithDataTable,clientId){
        console.log('CreateClientCtrl : CreateClient : saveBasicClientExtraInformation :'+ clientId);

        var saveBasicClientExtraInformationSuccess = function(result){
          console.log('Success : Return from loanProducts service.');
          var $url = PAGE_URL.EDIT_BASIC_CLIENT_INFORMATION + clientId ;
          console.log($url);
          $location.url($url);
        }

        var saveBasicClientExtraInformationFail = function(result){
          console.log('Error : Return from loanProducts service.');                    
          $scope.type="error";
          $scope.message="Loan product not saved: "+result.data.defaultUserMessage;
          $scope.errors = result.data.errors;
          if(result.data.errors!='' && result.data.errors!='undefined'){
            for(var i=0;i<result.data.errors.length;i++){
              $('#'+$scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
            }
          }
        }
        console.log(angular.toJson(this.createClientWithDataTable));
        var $url= REST_URL.CREATE_CLIENT_EXTRA_INFORMATION + clientId;
        console.log($url);
        CreateClientsService.saveClient($url,angular.toJson(this.createClientWithDataTable)).then(saveBasicClientExtraInformationSuccess, saveBasicClientExtraInformationFail);
      };
});

CreateClientCrtl.controller('EditClientCtrl', function ($route, $scope, $rootScope, $location, $timeout, CreateClientsService, REST_URL, APPLICATION, PAGE_URL) {
      console.log('CreateClientCtrl : EditClientCtrl');
      //To load the loadproducts page
      $scope.isLoading = false;
      $scope.editClient = {};
      $scope.editClientWithDataTable={};
      //Success callback
      var editClientTeplateSuccess = function(result) {
         $scope.isLoading = false;
         try {
              //Call to fill up the data from the custom datatables i.e. client_extra_information
              $scope.loadEditClientExtraInformationTemplate();

              //filling the dropdowns
              $scope.client = result.data;
              $scope.editClient.officeId = $scope.client.officeOptions[0].id;
              $scope.editClient.staffId = $scope.client.staffOptions;
              $scope.editClient.genderId = $scope.client.genderOptions;

              //data from m_client table
              $scope.client = result.data;
              $scope.editClient.externalId = $scope.client.externalId;
              $scope.editClient.officeId =$scope.client.officeId;
              $scope.editClient.staffId = $scope.client.staffId;
              $scope.editClient.firstname = $scope.client.firstname;
              $scope.editClient.middlename = $scope.client.middlename;
              $scope.editClient.lastname = $scope.client.lastname;
              $scope.editClient.dateOfBirth = $scope.client.dateOfBirth;
              $scope.editClient.genderId = $scope.client.gender.id;
              $scope.editClient.mobileNo = $scope.client.mobileNo;
              $scope.editClient.active = $scope.client.active;
              $scope.editClient.dateFormat = $scope.client.dateFormat;
              $scope.editClient.activationDate = $scope.client.activationDate;
              $scope.editClient.locale = $scope.client.locale;
          } catch (e) {
          }
      }
      //failur callback
      var editClientTemplateFail = function(result){
          $scope.isLoading = false;
          console.log('Error : Return from loanProducts service.');
      }
      var loadEditClientTemplate = function getData(tableState) {
        $scope.isLoading = true;
        $timeout(
          function() {
              $scope.rowCollection = [];              
              //TODO Make two request to bring the client templates from the m_client table and the datatable client_extra_information table togather and fill it in the edit form
              //var $URL=REST_URL.EDIT_BASIC_CLIENT_INFORMATION_TEMPLATE+'/1'+'?template=true'
              //CreateClientsService.getData($URL).then(editClientTeplateSuccess, editClientTemplateFail);
              var $url = REST_URL.CREATE_CLIENT + '/' + $route.current.params.id +'?template=true'
              CreateClientsService.getData($url).then(editClientTeplateSuccess, editClientTemplateFail);
              
          }, 500
        );
      };
      
      $scope.loadEditClientExtraInformationTemplate = function() {
        $scope.isLoading = true;
          //Success callback
          var editClientExtraInformationTeplateSuccess = function(result) {
             $scope.isLoading = false;
             try {
                  //Data from extra datatable i.e client_extra_information
                  $scope.editClientWithDataTable.YesNo_cd_maritalStatus = $scope.client.YesNo_cd_maritalStatus;
                  $scope.editClientWithDataTable.nameOfSpouse = $scope.client.nameOfSpouse;
                  $scope.editClientWithDataTable.numberOfChildren = $scope.client.numberOfChildren;
                  $scope.editClientWithDataTable.numberOfLoanDependents = $scope.client.numberOfLoanDependents;
                  $scope.editClientWithDataTable.homeContactAddress = $scope.client.homeContactAddress;
                  $scope.editClientWithDataTable.homeContactPerson = $scope.client.homeContactPerson;
                  $scope.editClientWithDataTable.email = $scope.client.email;
                  $scope.editClientWithDataTable.SecondMobileNo = $scope.client.SecondMobileNo;
                  $scope.editClientWithDataTable.locale = $scope.client.locale;
              } catch (e) {
              }
          }
          //failur callback
          var editClientExtraInformationTemplateFail = function(result){
              $scope.isLoading = false;
              console.log('Error : Return from loanProducts service.');
          }
          $scope.rowCollection = [];              
          var $url = REST_URL.CREATE_CLIENT + '/' + $route.current.params.id ;
          console.log($url);
          CreateClientsService.getData($url).then(editClientExtraInformationTeplateSuccess, editClientExtraInformationFail);
      };

      loadEditClientTemplate();
      
      $scope.validateEditClient = function(editClient,editClientWithDataTable){
        console.log('CreateClientCtrl : CreateClient : validateEditClient');
            if ($scope.editBasicClientForm.$valid) {
              $scope.editBasicClient(editClient,editClientWithDataTable);
            } else {
              $scope.invalidateForm();
            }
      };

      //invalidate login form
      $scope.invalidateForm = function(){
       $scope.createBasicClientForm.invalidate = false;
      };

      $scope.editBasicClient = function(createClient,createClientWithDataTable){
        console.log('CreateClientCtrl : CreateClient : saveBasicClient');

        var editBasicClientSuccess = function(result){
          console.log('Success : Return from CreateClientsService service.');
          $rootScope.type="alert-success";
          $rootScope.message="Client updated successfully";
          //$location.url(PAGE_URL.LOANPRODUCTS);                  
        }

        var editBasicClientFail = function(result){
          console.log('Error : Return from CreateClientsService service.');                    
          $scope.type="error";
          $scope.message="Client not updated: "+result.data.defaultUserMessage;
          $scope.errors = result.data.errors;
          if(result.data.errors!='' && result.data.errors!='undefined'){
            for(var i=0;i<result.data.errors.length;i++){
              $('#'+$scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
            }
          }
        }
        //TODO Replace the hardcoded urls with the user defined and replace the batch api request with simple request
        console.log("Client updated successfully");
        //CreateClientsService.saveProduct(REST_URL., ).then(editBasicClientSuccess, editBasicClientFail);
        //fire this url to go to the edit page PAGE_URL.EDIT_BASIC_CLIENT_INFORMATION/{{response.data.id}}
      };
    });
CreateClientCrtl.controller('CreateClientAdditionalInfoCtrl', function ($scope, $rootScope, $location, $timeout, CreateClientsService, REST_URL, APPLICATION, PAGE_URL) {
      console.log('CreateClientCtrl : CreateClientAdditionalInfoCtrl');
      //To load the loadproducts page
      $scope.isLoading = false;
      $scope.createClientAdditionalInfo={};
      //Success callback
      var createClientAdditionalInfoTeplateSuccess = function(result) {
         $scope.isLoading = false;
         try {
              $scope.client = result.data;
              $scope.createClientAdditionalInfo.bankAccount = 34 ;
              $scope.createClientAdditionalInfo.introducedById = 3 ;
          } catch (e) {
          }
      }
      //failur callback
      var createClientAdditionalInfoTemplateFail = function(result){
          $scope.isLoading = false;
          console.log('Error : Return from CreateClientsService service.');
      }
      var loadCreateClientAdditionalInfoTemplate = function getData(tableState) {
        //$scope.isLoading = true;
        $timeout(
          function() {
              $scope.rowCollection = [];               
              console.log("successfully got the additional client info");
              //CreateClientsService.getData(REST_URL.CREATE_CLIENT_TEMPLATE).then(createClientAdditionalInfoTeplateSuccess, createClientAdditionalInfoTemplateFail);
          }, 500
        );
      };

      loadCreateClientAdditionalInfoTemplate();
      
      $scope.validateCreateClientAdditionalInfo = function(createClientAdditionalInfo){
        console.log('CreateClientCtrl : CreateClient : validateCreateClientAdditionalInfo');
            if ($scope.createAdditionalClientForm.$valid) {
              $scope.saveClientAdditionalInfo(createClientAdditionalInfo);
            } else {
              $scope.invalidateForm();
            }
      };

      //invalidate login form
      $scope.invalidateForm = function(){
       $scope.createAdditionalClientForm.invalidate = false;
      };

      $scope.saveClientAdditionalInfo = function(createClientAdditionalInfo){
        console.log('CreateClientCtrl : CreateClient : saveClientAdditionalInfo');

        var saveClientAdditionalInfoSuccess = function(result){
          console.log('Success : Return from CreateClientsService service.');
          $rootScope.type="alert-success";
          $rootScope.message="Client Additional Detail saved successfully";
          //$location.url(PAGE_URL.LOANPRODUCTS);                  
        }

        var saveClientAdditionalInfoFail = function(result){
          console.log('Error : Return from CreateClientsService service.');                    
          $scope.type="error";
          $scope.message="Client Additional Detail not saved: "+result.data.defaultUserMessage;
          $scope.errors = result.data.errors;
          if(result.data.errors!='' && result.data.errors!='undefined'){
            for(var i=0;i<result.data.errors.length;i++){
              $('#'+$scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
            }
          }
        }
        //TODO Make a call to the database to insert the client Additional information into the database
        var json=angular.toJson(this.createClientAdditionalInfo);
        console.log(json);
        console.log("Successfully saved the client Additional Information");
        //CreateClientsService.saveProduct(REST_URL., ).then(saveClientAdditionalInfoSuccess, saveClientAdditionalInfoFail);
      };
});

CreateClientCrtl.controller('ClientIdentificationCtrl', function ($scope, $rootScope, $location, $timeout, CreateClientsService, REST_URL, APPLICATION, PAGE_URL) {
      console.log('CreateClientCtrl : ClientIdentificationCtrl');
      //To load the loadproducts page
      $scope.isLoading = false;
      $scope.clientIdentification={};
      //Success callback
      var createClientIdentificationTeplateSuccess = function(result) {
         $scope.isLoading = false;
         try {
              $scope.client = result.data;
              $scope.clientIdentification.identificationType = 34 ;
          } catch (e) {
          }
      }
      //failur callback
      var createClientIdentificationTemplateFail = function(result){
          $scope.isLoading = false;
          console.log('Error : Return from CreateClientsService service.');
      }
      var loadCreateClientIdentificationTemplate = function getData(tableState) {
        //$scope.isLoading = true;
        $timeout(
          function() {
              $scope.rowCollection = [];               
              console.log("successfully got the client Identification info");
              //CreateClientsService.getData(REST_URL.CREATE_CLIENT_TEMPLATE).then(createClientIdentificationTeplateSuccess, createClientIdentificationTemplateFail);
          }, 500
        );
      };

      loadCreateClientIdentificationTemplate();
      
      $scope.validateClientIdentification = function(clientIdentification){
        console.log('CreateClientCtrl : CreateClient : validateClientIdentification');
            if ($scope.ClientIdentificationForm.$valid) {
              $scope.saveClientIdentification(clientIdentification);
            } else {
              $scope.invalidateForm();
            }
      };

      //invalidate login form
      $scope.invalidateForm = function(){
       $scope.ClientIdentificationForm.invalidate = false;
      };

      $scope.saveClientIdentification = function(clientIdentification){
        console.log('CreateClientCtrl : CreateClient : saveClientIdentification');

        var saveClientIdentificationSuccess = function(result){
          console.log('Success : Return from CreateClientsService service.');
          $rootScope.type="alert-success";
          $rootScope.message="Client Identification Detail saved successfully";
          //$location.url(PAGE_URL.LOANPRODUCTS);                  
        }

        var saveClientIdentificationFail = function(result){
          console.log('Error : Return from CreateClientsService service.');                    
          $scope.type="error";
          $scope.message="Client Identification Detail not saved: "+result.data.defaultUserMessage;
          $scope.errors = result.data.errors;
          if(result.data.errors!='' && result.data.errors!='undefined'){
            for(var i=0;i<result.data.errors.length;i++){
              $('#'+$scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
            }
          }
        }
        //TODO Make a call to the database to insert the client Additional information into the database
        var json=angular.toJson(this.clientIdentification);
        console.log(json);
        console.log("Successfully saved the client Identification Information");
        //CreateClientsService.saveProduct(REST_URL., ).then(saveClientAdditionalInfoSuccess, saveClientAdditionalInfoFail);
      };
});

CreateClientCrtl.controller('ClientNextToKeenCtrl', function ($scope, $rootScope, $location, $timeout, CreateClientsService, REST_URL, APPLICATION, PAGE_URL) {
      console.log('CreateClientCtrl : ClientNextToKeenCtrl');
      //To load the loadproducts page
      $scope.isLoading = false;
      $scope.clientNextToKeen={};
      //Success callback
      var createClientNextToKeenTeplateSuccess = function(result) {
         $scope.isLoading = false;
         try {
              $scope.client = result.data;
              $scope.clientNextToKeen.relationship = 34 ;
          } catch (e) {
          }
      }
      //failur callback
      var createClientNextToKeenTemplateFail = function(result){
          $scope.isLoading = false;
          console.log('Error : Return from CreateClientsService service.');
      }
      var loadCreateClientNextToKeenTemplate = function getData(tableState) {
        //$scope.isLoading = true;
        $timeout(
          function() {
              $scope.rowCollection = [];               
              console.log("successfully got the client Identification info");
              //CreateClientsService.getData(REST_URL.CREATE_CLIENT_TEMPLATE).then(createClientNextToKeenTeplateSuccess, createClientNextToKeenTemplateFail);
          }, 500
        );
      };

      loadCreateClientNextToKeenTemplate();
      
      $scope.validateClientNextToKeen = function(clientNextToKeen){
        console.log('CreateClientCtrl : CreateClient : validateClientNextToKeen');
            if ($scope.ClientNextToKeenForm.$valid) {
              $scope.saveClientNextToKeen(clientNextToKeen);
            } else {
              $scope.invalidateForm();
            }
      };

      //invalidate login form
      $scope.invalidateForm = function(){
       $scope.ClientNextToKeenForm.invalidate = false;
      };

      $scope.saveClientNextToKeen = function(clientNextToKeen){
        console.log('CreateClientCtrl : CreateClient : saveClientNextToKeen');

        var saveClientNextToKeenSuccess = function(result){
          console.log('Success : Return from CreateClientsService service.');
          $rootScope.type="alert-success";
          $rootScope.message="Client Next To Keen Detail saved successfully";
          //$location.url(PAGE_URL.LOANPRODUCTS);                  
        }

        var saveClientNextToKeenFail = function(result){
          console.log('Error : Return from CreateClientsService service.');                    
          $scope.type="error";
          $scope.message="Client Next To Keen Detail not saved: "+result.data.defaultUserMessage;
          $scope.errors = result.data.errors;
          if(result.data.errors!='' && result.data.errors!='undefined'){
            for(var i=0;i<result.data.errors.length;i++){
              $('#'+$scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
            }
          }
        }
        //TODO Make a call to the database to insert the client Additional information into the database
        var json=angular.toJson(this.clientNextToKeen);
        console.log(json);
        console.log("Successfully saved the client Next To Keen Information");
        //CreateClientsService.saveProduct(REST_URL., ).then(saveClientNextToKeenSuccess, saveClientNextToKeenFail);
      };
});

CreateClientCrtl.controller('ClientBusinessActivityCtrl', function ($scope, $rootScope, $location, $timeout, CreateClientsService, REST_URL, APPLICATION, PAGE_URL) {
      console.log('CreateClientCtrl : ClientBusinessActivityCtrl');
      //To load the loadproducts page
      $scope.isLoading = false;
      $scope.clientBusinessActivity={};
      //Success callback
      var createClientBusinessActivityTeplateSuccess = function(result) {
         $scope.isLoading = false;
         try {
              $scope.client = result.data;
              $scope.clientBusinessActivity.businessActivity = 34 ;
              $scope.clientBusinessActivity.bookkeeping = 34 ;
              $scope.clientBusinessActivity.extraIncomeActivityList = 34 ;
          } catch (e) {
          }
      }
      //failur callback
      var createClientBusinessActivityTemplateFail = function(result){
          $scope.isLoading = false;
          console.log('Error : Return from CreateClientsService service.');
      }
      var loadCreateClientBusinessActivityTemplate = function getData(tableState) {
        //$scope.isLoading = true;
        $timeout(
          function() {
              $scope.rowCollection = [];               
              console.log("successfully got the client Business Activity info");
              //CreateClientsService.getData(REST_URL.CREATE_CLIENT_TEMPLATE).then(createClientBusinessActivityTeplateSuccess, createClientBusinessActivityTemplateFail);
          }, 500
        );
      };

      loadCreateClientBusinessActivityTemplate();
      
      $scope.validateClientBusinessActivity = function(clientBusinessActivity){
        console.log('CreateClientCtrl : CreateClient : validateClientBusinessActivity');
            if ($scope.ClientBusinessActivityForm.$valid) {
              $scope.saveClientBusinessActivity(clientBusinessActivity);
            } else {
              $scope.invalidateForm();
            }
      };

      //invalidate login form
      $scope.invalidateForm = function(){
       $scope.ClientBusinessActivityForm.invalidate = false;
      };

      $scope.saveClientBusinessActivity = function(clientBusinessActivity){
        console.log('CreateClientCtrl : CreateClient : saveClientBusinessActivity');

        var saveClientBusinessActivitySuccess = function(result){
          console.log('Success : Return from CreateClientsService service.');
          $rootScope.type="alert-success";
          $rootScope.message="Client Business Activity Detail saved successfully";
          //$location.url(PAGE_URL.LOANPRODUCTS);                  
        }

        var saveClientBusinessActivityFail = function(result){
          console.log('Error : Return from CreateClientsService service.');                    
          $scope.type="error";
          $scope.message="Client Business Activity Detail not saved: "+result.data.defaultUserMessage;
          $scope.errors = result.data.errors;
          if(result.data.errors!='' && result.data.errors!='undefined'){
            for(var i=0;i<result.data.errors.length;i++){
              $('#'+$scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
            }
          }
        }
        //TODO Make a call to the database to insert the client Additional information into the database
        var json=angular.toJson(this.clientBusinessActivity);
        console.log(json);
        console.log("Successfully saved the client Business Activity Information");
        //CreateClientsService.saveProduct(REST_URL., ).then(saveClientBusinessActivitySuccess, saveClientBusinessActivityFail);
      };
});