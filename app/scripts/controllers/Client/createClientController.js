'use strict';
 
  // Here we attach this controller to our testApp module
var CreateClientCrtl = angular.module('createClientController',['createClientsService','Constants', 'smart-table']);

CreateClientCrtl.controller('CreateClientCtrl', function ($route, $scope, $rootScope, $location, $timeout, CreateClientsService, REST_URL, APPLICATION, PAGE_URL, $upload, Base64) {
      console.log('CreateClientCtrl : CreateClientCtrl');
      //To load the loadproducts page
      $scope.isLoading = false;
      $scope.createClient = {};
      $scope.createClientWithDataTable={};      
      //Change Maritial Status
      $scope.changeMaritialStatus = function(){
        $scope.isMarried = false;
        if($scope.createClientWithDataTable.YesNo_cd_maritalStatus==33){
          $scope.isMarried=true;
        }
      }
      //For date of birth calendar
      $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
      };
      
      //Validate and set uploaded file
      $scope.onFileSelect = function ($files) {        
        var reg = /(\.jpg|\.jpeg|\.bmp|\.gif|\.png)$/i;
        if(reg.test($files[0])){          
          $scope.type="error";
          $scope.message="File extension not supported!";
          $('html, body').animate({scrollTop : 0},800);
        }
        else if($files[0].size/1024 > 100){
            $scope.type="error";
            $scope.message="File is too large! File size must be less then or equal to 100!";
            $('html, body').animate({scrollTop : 0},800);            
        }else{
          $scope.file = $files[0];        
        }
      };
      //Set loan officer 
      $scope.changeOffice = function (officeId) {          
          var changeOfficeSuccess = function(result){
            console.log('Success : Return from createClientsService.');
            $scope.staffOptions = result.data.staffOptions;
            $scope.createClient.staffId = result.data.staffOptions[0].id;
          }
          var changeOfficeFail = function(result){
            console.log('Error : Return from createClientsService.');            
          }
          var $url = REST_URL.GROUP_TEMPLATE_RESOURCE+'?staffInSelectedOfficeOnly=true&staffInSelectedOfficeOnly=true&officeId='+officeId;
          CreateClientsService.getData($url).then(changeOfficeSuccess, changeOfficeFail);
      };
      //Start Client Template
      //Success - callback
      var createClientTeplateSuccess = function(result) {
         $scope.isLoading = false;
         try {
              $scope.client = result.data;
              $scope.staffOptions = $scope.client.staffOptions;
              $scope.createClient.officeId = $scope.client.officeOptions[0].id;              
              $scope.createClient.genderId = $scope.client.genderOptions;
              //Set the default values
              $scope.createClient.staffId = $scope.client.staffOptions[0].id;
              $scope.createClient.officeId = 1;
              $scope.createClient.genderId = 22;
              $scope.createClient.active = "false";
              $scope.createClient.dateFormat= "dd/MM/yyyy";
              var d=new Date();
              var activationDate = d.getDate()+'/'+d.getMonth()+'/'+d.getFullYear(); 
              console.log("activationDate"+activationDate);
              //$scope.createClient.activationDate= activationDate;
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
          console.log('Error : Return from createClientsService.');
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
      //Finish - Client Template

      //Validate ctreate client
      $scope.validateCreateClient = function(createClient,createClientWithDataTable){
        console.log('CreateClientCtrl : CreateClient : validateCreateClient');
          if ($scope.createBasicClientForm.$valid && $scope.file) {
            $scope.saveBasicClient(createClient,createClientWithDataTable);
          } else {
            $scope.invalidateForm();
            $scope.type="error";
            $scope.message="Highlighted fields are required";
            if($scope.createBasicClientForm.email.$invalid){
              $scope.message="Please enter valid Email id!";            
            }            
            $('html, body').animate({scrollTop : 0},800);
          }
      };
      //invalidate login form
      $scope.invalidateForm = function(){
       $scope.createBasicClientForm.invalidate = false;
      };      

      //Start - Save Basic Client Infromation
      $scope.saveBasicClient = function(createClient,createClientWithDataTable){
        console.log('CreateClientCtrl : CreateClient : saveBasicClient');
        var d = new Date($scope.createClient.dateOfBirth);
        $scope.createClient.dateOfBirth = d.getDate()+'/'+d.getMonth()+'/'+d.getFullYear();         

        var saveBasicClientSuccess = function(result){
          console.log('Success : Return from createClientsService');
          $upload.upload({
            url: APPLICATION.host + REST_URL.CREATE_CLIENT+'/'+result.data.clientId+'/images',
            data: {},
            file: $scope.file
          }).then(function (imageData) {
            console.log('Success : Return from createClientsService');
            $scope.saveBasicClientExtraInformation(createClientWithDataTable,result.data.clientId); 
          },function(){
            console.log('Failur : Return from createClientsService');
            $scope.deleteClientBasicInfo(result.data.clientId);            
          });          
        }
        var saveBasicClientFail = function(result){
          console.log('Error : Return from createClientsService');                    
          $scope.type="error";
          $scope.message="Client not saved: "+result.data.defaultUserMessage;
          $scope.errors = result.data.errors;
          if(result.data.errors!='' && result.data.errors!='undefined'){
            for(var i=0;i<result.data.errors.length;i++){
              $('#'+$scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
            }
          }
          $('html, body').animate({scrollTop : 0},800);
        }
        console.log(angular.toJson(this.createClient));
        CreateClientsService.saveClient(REST_URL.CREATE_CLIENT,angular.toJson(this.createClient)).then(saveBasicClientSuccess, saveBasicClientFail);
      };
      //Finish - Save Basic Client Infromation

      //Start - Save Basic Client Extra Infromation
      $scope.saveBasicClientExtraInformation = function(createClientWithDataTable,clientId){
        console.log('CreateClientCtrl : CreateClient : saveBasicClientExtraInformation :'+ clientId);

        var saveBasicClientExtraInformationSuccess = function(result){
          console.log('Success : Return from createClientsService service.');
          $rootScope.type="alert-success";
          $rootScope.message="Client basic information are saved successfully";
          var $url = PAGE_URL.EDIT_BASIC_CLIENT_INFORMATION + clientId ;          
          $location.url($url);
        }

        var saveBasicClientExtraInformationFail = function(result){
          console.log('Error : Return from createClientsService service.');                    
          $rootScope.type="error";
          $rootScope.message="Some details of client are not saved: "+result.data.defaultUserMessage;
          $rootScope.errors = result.data.errors;
          if(result.data.errors!='' && result.data.errors!='undefined'){
            for(var i=0;i<result.data.errors.length;i++){
              $('#'+$scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
            }
          }
          if(clientId!=''){
            var $url = PAGE_URL.EDIT_BASIC_CLIENT_INFORMATION + clientId ;          
            $location.url($url);
          }
        }
        console.log(angular.toJson(this.createClientWithDataTable));
        var $url= REST_URL.CREATE_CLIENT_EXTRA_INFORMATION + clientId;        
        CreateClientsService.saveClient($url,angular.toJson(this.createClientWithDataTable)).then(saveBasicClientExtraInformationSuccess, saveBasicClientExtraInformationFail);
      };
      //Finish - Save Basic Client Infromation

      //Start - Save Delete Client Infromation
      $scope.deleteClientBasicInfo = function(clientId) {
        console.log(('CreateClientCtrl : CreateClient : deleteClientBasicInfo :'+ clientId))

        var deleteClientBasicInfoSuccess = function(result){
          console.log('Success : Return from createClientsService.');
          $scope.type="error";
          $scope.message="Cleint information is not saved, please try again!";
          $('html, body').animate({scrollTop : 0},800);
        }
        var deleteClientBasicInfoFail = function(result){
          console.log('Error : Return from createClientsService.');
          $rootScope.type="error";
          $rootScope.message="Cleint information is not saved, please try again!";
          if(clientId!=''){
            var $url = PAGE_URL.EDIT_BASIC_CLIENT_INFORMATION + clientId ;          
            $location.url($url);            
          }
        }
        CreateClientsService.deleteClient(REST_URL.CREATE_CLIENT+'/'+clientId).then(deleteClientBasicInfoSuccess, deleteClientBasicInfoFail);
      }
      //Finish - Save Delete Client Infromation
});

CreateClientCrtl.controller('EditClientCtrl', function ($route, $scope, $rootScope, $location, $timeout, CreateClientsService, REST_URL, APPLICATION, PAGE_URL) {
      console.log('CreateClientCtrl : EditClientCtrl');
      //To load the loadproducts page
      $scope.isLoading = false;
      $scope.editClient = {};
      $scope.editClientWithDataTable={};

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

      //Success callback
      var editClientTeplateSuccess = function(result) {
         $scope.isLoading = false;
         try {
              $rootScope.type="";
              $rootScope.message="";
              //setting the id for the header for the navigation
              $scope.id = $route.current.params.id; 
              //Call to fill up the data from the custom datatables i.e. client_extra_information
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
			  //Call to fill up the data from the custom datatables i.e. client_extra_information
              //$scope.loadEditClientExtraInformationTemplate();
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
CreateClientCrtl.controller('CreateClientAdditionalInfoCtrl', function ($route, $scope, $rootScope, $location, $timeout, CreateClientsService, REST_URL, APPLICATION, PAGE_URL) {
      console.log('CreateClientCtrl : CreateClientAdditionalInfoCtrl');
      //To load the loadproducts page
      $scope.isLoading = false;
      $scope.createClientAdditionalInfo={};
      //Success callback
      var createClientAdditionalInfoTeplateSuccess = function(result) {
         $scope.isLoading = false;
         try {
              //Setting the id for the headers
              $scope.id = $route.current.params.id;

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

CreateClientCrtl.controller('ClientIdentificationCtrl', function ($route, $scope, $rootScope, $location, $timeout, CreateClientsService, REST_URL, APPLICATION, PAGE_URL) {
      console.log('CreateClientCtrl : ClientIdentificationCtrl');
      //To load the loadproducts page
      $scope.isLoading = false;
      $scope.clientIdentification={};
      //Success callback
      var createClientIdentificationTeplateSuccess = function(result) {
         $scope.isLoading = false;
         try {
              //Setting the id for the headers
              $scope.id = $route.current.params.id;


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

CreateClientCrtl.controller('ClientNextToKeenCtrl', function ($route, $scope, $rootScope, $location, $timeout, CreateClientsService, REST_URL, APPLICATION, PAGE_URL) {
      console.log('CreateClientCtrl : ClientNextToKeenCtrl');
      //To load the loadproducts page
      $scope.isLoading = false;
      $scope.clientNextToKeen={};
      //Success callback
      var createClientNextToKeenTeplateSuccess = function(result) {
         $scope.isLoading = false;
         try {
              //Setting the id for the headers
              $scope.id = $route.current.params.id;

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

CreateClientCrtl.controller('ClientBusinessActivityCtrl', function ($route, $scope, $rootScope, $location, $timeout, CreateClientsService, REST_URL, APPLICATION, PAGE_URL) {
      console.log('CreateClientCtrl : ClientBusinessActivityCtrl');
      //To load the loadproducts page
      $scope.isLoading = false;
      $scope.clientBusinessActivity={};
      //Success callback
      var createClientBusinessActivityTeplateSuccess = function(result) {
         $scope.isLoading = false;
         try {
              //Setting the id for the urls in the header
              $scope.id = $route.current.params.id;

              //Filling the drop downs
              $scope.client = result.data;
              $scope.businessActivityOptions = $scope.client.columnHeaders[2].columnValues;
              $scope.BookingKeeping = $scope.client.columnHeaders[6].columnValues;
              $scope.otherIncome = $scope.client.columnHeaders[7].columnValues;
              $scope.otherIncomeBusinessActivity = $scope.client.columnHeaders[8].columnValues;

              //Setting the default values of the drop downs
              $scope.clientBusinessActivity.BusinessActivity_cd_business_activity = 30;
              $scope.clientBusinessActivity.YesNo_cd_book_keeping = 33;
              $scope.clientBusinessActivity.YesNo_cd_other_income = 34;
              $scope.clientBusinessActivity.dateFormat= "dd/MM/yyyy";
              $scope.clientBusinessActivity.locale = "en";
              //Set the default value of the Other income business activity dropdown
              //$scope.clientBusinessActivity.BusinessActivity_cd_other_income_business_activity = 30;
          } catch (e) {
          }
      }
      //failur callback
      var createClientBusinessActivityTemplateFail = function(result){
          $scope.isLoading = false;
          console.log('Error : Return from CreateClientsService service.');
      }
      var loadCreateClientBusinessActivityTemplate = function getData(tableState) {
        $scope.isLoading = true;
        $timeout(
          function() {
              $scope.rowCollection = [];               
              console.log("successfully got the client Business Activity info");
              var $url=REST_URL.CREATE_CLIENT_BUSINESS_ACTIVITY + $route.current.params.id +'?genericResultSet=true';
              CreateClientsService.getData($url).then(createClientBusinessActivityTeplateSuccess, createClientBusinessActivityTemplateFail);
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
        var $url = REST_URL.CREATE_CLIENT_BUSINESS_ACTIVITY + $route.current.params.id ;
        console.log($url);
        CreateClientsService.saveClient($url, json).then(saveClientBusinessActivitySuccess, saveClientBusinessActivityFail);
      };
});