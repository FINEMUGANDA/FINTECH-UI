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
            $scope.message="File is too large! File size must be less then or equal to 100 KB!";
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
          var $url = REST_URL.GROUP_TEMPLATE_RESOURCE+'?staffInSelectedOfficeOnly=true&officeId='+officeId;
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
              //Set default value for extra client information
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
        $scope.createClient.dateOfBirth = d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();

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
          var $url = PAGE_URL.EDIT_BASIC_CLIENT_INFORMATION + '/' + clientId ;          
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
          $rootScope.message="Client information is not saved, please try again!";
          if(clientId!=''){
            var $url = PAGE_URL.EDIT_BASIC_CLIENT_INFORMATION + clientId ;          
            $location.url($url);            
          }
        }
        CreateClientsService.deleteClient(REST_URL.CREATE_CLIENT+'/'+clientId).then(deleteClientBasicInfoSuccess, deleteClientBasicInfoFail);
      }
      //Finish - Save Delete Client Infromation
});

CreateClientCrtl.controller('EditClientCtrl', function ($route, $scope, $rootScope, $location, $timeout, CreateClientsService, REST_URL, APPLICATION, PAGE_URL, Utility, $upload) {
      console.log('CreateClientCtrl : EditClientCtrl');
      //To load the loadproducts page
      $scope.isLoading = false;
      $scope.editClient = {};
      $scope.editClientWithDataTable={};
      //Display Image
      $scope.displayImage = function (clientId){        
        var $url=REST_URL.CREATE_CLIENT + '/' + clientId + '/images';
        CreateClientsService.getData($url).then(function(data){
          $scope.viewImage = data.data;
        },function(data){
          console.log("Failure : Image can not be loaded : " + data.data.developerMessage);
          $scope.client.imagePresent=false;
        });        
      };
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
        else if($files[0].size/1024 > 80){
            $scope.type="error";
            $scope.message="File is too large! File size must be less then or equal to 100Kb!";
            $('html, body').animate({scrollTop : 0},800);            
        }else{
          $scope.file = $files[0];
          $upload.upload({
            url: APPLICATION.host + REST_URL.CREATE_CLIENT+'/'+$route.current.params.id+'/images',
            data: {},
            file: $scope.file
          }).then(function (imageData) {
            console.log('Success : Return from createClientsService');
            $scope.displayImage($route.current.params.id);
          },function(imageData){
            console.log('Failure : Return from createClientsService');
            $scope.type="error";
            $scope.message="Image can not be updated: "+imageData.data.defaultUserMessage;
            $scope.errors = imageData.data.errors;
            if(imageData.data.errors!='' && imageData.data.errors!='undefined'){
              for(var i=0;i<result.data.errors.length;i++){
                $('#'+$scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
              }
            }
            $('html, body').animate({scrollTop : 0},800);
          }); 
        }
      };
      //Set loan officer 
      $scope.changeOffice = function (officeId) {          
          var changeOfficeSuccess = function(result){
            console.log('Success : Return from createClientsService.');
            $scope.staffOptions = result.data.staffOptions;
            $scope.editClient.staffId = result.data.staffOptions[0].id;
          }
          var changeOfficeFail = function(result){
            console.log('Error : Return from createClientsService.');            
          }
          var $url = REST_URL.GROUP_TEMPLATE_RESOURCE+'?staffInSelectedOfficeOnly=true&staffInSelectedOfficeOnly=true&officeId='+officeId;
          CreateClientsService.getData($url).then(changeOfficeSuccess, changeOfficeFail);
      };

      //Start - extra client information template
      //Success callback
      var editClientExtraInformationTemplateSuccess = function(result) {
         $scope.isLoading = false;
         console.log('Success : Return from createClientsService');
         try {
              //Set default value for client extra information
              $scope.editClientWithDataTable.numberOfChildren=0;
              $scope.editClientWithDataTable.numberOfLoanDependents=0;
              $scope.editClientWithDataTable.YesNo_cd_maritalStatus = 34;
              $scope.editClientWithDataTable.locale = "en";
              $scope.editClientExtraInfo = result.data.data;              
              if($scope.editClientExtraInfo.length > 0){
                $scope.editClientExtraInfo = $scope.editClientExtraInfo[0];
                //Data from extra datatable i.e client_extra_information              
                $scope.editClientWithDataTable.YesNo_cd_maritalStatus = parseInt($scope.editClientExtraInfo.row[1]);                
                $scope.editClientWithDataTable.numberOfChildren = parseInt($scope.editClientExtraInfo.row[2]);
                $scope.editClientWithDataTable.numberOfLoanDependents = parseInt($scope.editClientExtraInfo.row[3]);
                $scope.editClientWithDataTable.nameOfSpouse = parseInt($scope.editClientExtraInfo.row[4]);
                $scope.editClientWithDataTable.homeContactAddress = $scope.editClientExtraInfo.row[5];
                $scope.editClientWithDataTable.homeContactPerson = $scope.editClientExtraInfo.row[6];
                $scope.editClientWithDataTable.email = $scope.editClientExtraInfo.row[7];
                $scope.editClientWithDataTable.SecondMobileNo = parseInt($scope.editClientExtraInfo.row[8]);
              }              
          } catch (e) {
            console.log(e);
          }
      }
      //failur callback
      var editClientExtraInformationTemplateFail = function(result){
          $scope.isLoading = false;
          console.log('Error : Return from createClientsService');
      }
      //Finish - extra client information template

      //Success callback
      var editClientTeplateSuccess = function(result) {
         $scope.isLoading = false;
         try {
              $rootScope.type="";
              $rootScope.message="";
              //setting the id for the header for the navigation
              $scope.id = $route.current.params.id;
              $scope.editClient.dateFormat= "dd/MM/yyyy";
              $scope.editClient.locale = "en";
              //filling the dropdowns
              $scope.client = result.data;              
              //$scope.editClient.officeId = $scope.client.officeOptions[0].id;              
              $scope.editClient.staffId = $scope.client.staffOptions[0].id;
              $scope.editClient.genderId = $scope.client.genderOptions[0].id;

              //data from m_client table
              $scope.client = result.data;
              $scope.editClient.externalId = $scope.client.externalId;
              $rootScope.officeId =$scope.client.officeId;
              //$scope.editClient.officeId =$scope.client.officeId;
              $scope.editClient.staffId = $scope.client.staffId;
              $scope.editClient.firstname = $scope.client.firstname;
              $scope.editClient.middlename = $scope.client.middlename;
              $scope.editClient.lastname = $scope.client.lastname;
              if(!Utility.isUndefinedOrNull($scope.client.dateOfBirth)){
                $scope.editClient.dateOfBirth = $scope.client.dateOfBirth[2]+'/'+$scope.client.dateOfBirth[1]+'/'+$scope.client.dateOfBirth[0];
              }
              $scope.editClient.genderId = $scope.client.gender.id;
              $scope.editClient.mobileNo = $scope.client.mobileNo;
              $scope.editClient.active = $scope.client.active;
              if(!Utility.isUndefinedOrNull($scope.client.activationDate)){
                $scope.editClient.activationDate = $scope.client.activationDate[2]+'/'+$scope.client.activationDate[1]+'/'+$scope.client.activationDate[0];
              }              
              //Set image
              if($scope.client.imagePresent){
                $scope.displayImage($route.current.params.id);                
              }
			        //Call to fill up the data from the custom datatables i.e. client_extra_information                       
              var $url = REST_URL.CREATE_CLIENT_EXTRA_INFORMATION + $route.current.params.id +'?genericResultSet=true' ;
              console.log($url);
              CreateClientsService.getData($url).then(editClientExtraInformationTemplateSuccess, editClientExtraInformationTemplateFail);
          } catch (e) {
            console.log(e);
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

      $scope.editBasicClient = function(editClient,editClientWithDataTable){
        console.log('CreateClientCtrl : CreateClient : saveBasicClient');
        var d = new Date($scope.editClient.dateOfBirth);
        $scope.editClient.dateOfBirth = d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();
        d = new Date($scope.editClient.activationDate);
        $scope.editClient.activationDate = d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();

        var editBasicClientSuccess = function(result){
          console.log('Success : Return from CreateClientsService service.');
          $scope.updateBasicClientExtraInformation(editClientWithDataTable,result.data.clientId);
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
          $('html, body').animate({scrollTop : 0},800);
        }

        console.log(angular.toJson(this.editClient));
        CreateClientsService.updateClient(REST_URL.CREATE_CLIENT+'/'+$route.current.params.id,angular.toJson(this.editClient) ).then(editBasicClientSuccess, editBasicClientFail);
      };

      $scope.updateBasicClientExtraInformation = function(editClientWithDataTable,clientId){
        console.log('EditClientCtrl : updateBasicClientExtraInformation :'+ clientId);

        var updateBasicClientExtraInformationSuccess = function(result){
          console.log('Success : Return from createClientsService service.');
          $rootScope.type="alert-success";
          $rootScope.message="Client information updated successfully";          
        }

        var updateBasicClientExtraInformationFail = function(result){
          console.log('Error : Return from createClientsService service.');                    
          $scope.type="error";
          $scope.message="Client not updated: "+result.data.defaultUserMessage;
          $scope.errors = result.data.errors;
          if(result.data.errors!='' && result.data.errors!='undefined'){
            for(var i=0;i<result.data.errors.length;i++){
              $('#'+$scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
            }
          }
          $('html, body').animate({scrollTop : 0},800);
        }
        console.log(angular.toJson(this.editClientWithDataTable));
        var $url= REST_URL.CREATE_CLIENT_EXTRA_INFORMATION + clientId;
        CreateClientsService.updateClient($url,angular.toJson(this.editClientWithDataTable)).then(updateBasicClientExtraInformationSuccess, updateBasicClientExtraInformationFail);
      };
    });

CreateClientCrtl.controller('CreateClientAdditionalInfoCtrl', function ($route, $scope, $rootScope, $location, $timeout, CreateClientsService, REST_URL, APPLICATION, PAGE_URL) {
      console.log('CreateClientCtrl : CreateClientAdditionalInfoCtrl');
      //To load the client additional page
      $scope.isLoading = false;
      $scope.createClientAdditionalInfo={};
      $scope.createAdditional=false;
      //Open calendar for visted date
      $scope.openVDate = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.openVisitingDate = true;
      };
      //Open calendar for birth date
      $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
      };
      //Fill dropdown of known introducer
      var getOfficeSuccess = function(result){
        console.log('Success : Return from createClientsService.');
        $scope.clientOptions = result.data.clientOptions;
        $scope.staffOptions = result.data.staffOptions;        
        //Client
        $scope.createClientAdditionalInfo.introducer_client = result.data.clientOptions[0].id;
        //Loan Office
        $scope.createClientAdditionalInfo.introducer_loanOfficer = result.data.staffOptions[0].id;        
        //Visited by
        $scope.createClientAdditionalInfo.visitedById = result.data.staffOptions[0].id;
      }
      var getOfficeFail = function(result){
        console.log('Error : Return from createClientsService.');            
      }

      //Get client office id
      var getClientSuccess = function(result){
        console.log('Success : Return from createClientsService.');
        var $url = REST_URL.GROUP_TEMPLATE_RESOURCE+'?staffInSelectedOfficeOnly=true&officeId='+result.data.officeId;
        CreateClientsService.getData($url).then(getOfficeSuccess, getOfficeFail);
      }
      var getClientFail = function(result){
        console.log('Error : Return from createClientsService.');            
      }

      //Success callback
      var createClientAdditionalInfoTemplateSuccess = function(result) {
         $scope.isLoading = false;
         try {              
              $scope.clientAdditionalInfo = result.data;
              $scope.id = $route.current.params.id;
              $scope.yesNoOptions = $scope.clientAdditionalInfo.columnHeaders[1].columnValues;
              $scope.citizenshipOptions = $scope.clientAdditionalInfo.columnHeaders[5].columnValues;
              $scope.educationOptions = $scope.clientAdditionalInfo.columnHeaders[6].columnValues;
              $scope.povertyStatusOptions = $scope.clientAdditionalInfo.columnHeaders[7].columnValues;
              $scope.introducedByOptions = $scope.clientAdditionalInfo.columnHeaders[8].columnValues;
              $scope.createClientAdditionalInfo.YesNo_cd_bank_account=$scope.clientAdditionalInfo.columnHeaders[1].columnValues[0].id;
              $scope.createClientAdditionalInfo.CitizenShip_cd_citizenship=$scope.clientAdditionalInfo.columnHeaders[5].columnValues[0].id;
              $scope.createClientAdditionalInfo.Education_cd_education_level=$scope.clientAdditionalInfo.columnHeaders[6].columnValues[0].id;
              $scope.createClientAdditionalInfo.Poverty_cd_poverty_status=$scope.clientAdditionalInfo.columnHeaders[7].columnValues[0].id;
              $scope.createClientAdditionalInfo.Introduced_by_cd_introduced_by=$scope.clientAdditionalInfo.columnHeaders[8].columnValues[0].id;
              //Get list of client and loan officer from office id of client
              if($rootScope.officeId!='' && $rootScope.officeId!=undefined){
                var $url = REST_URL.GROUP_TEMPLATE_RESOURCE+'?staffInSelectedOfficeOnly=true&officeId='+$rootScope.officeId;
                CreateClientsService.getData($url).then(getOfficeSuccess, getOfficeFail);
              }else{
                var $url = REST_URL.CREATE_CLIENT + '/' + $route.current.params.id +'?fields=officeId';
                CreateClientsService.getData($url).then(getClientSuccess, getClientFail);
              }
              //Set create/edit information
              if(result.data.data == ''){
                $scope.createAdditional=true;
              }else{
                $scope.createAdditional=false;
                $scope.createClientAdditionalInfo.YesNo_cd_bank_account=parseInt($scope.clientAdditionalInfo.data[0].row[1]);
                $scope.createClientAdditionalInfo.bank_account_with=$scope.clientAdditionalInfo.data[0].row[2];
                $scope.createClientAdditionalInfo.branch=$scope.clientAdditionalInfo.data[0].row[3];
                $scope.createClientAdditionalInfo.bank_account_number=parseInt($scope.clientAdditionalInfo.data[0].row[4]);
                $scope.createClientAdditionalInfo.CitizenShip_cd_citizenship=parseInt($scope.clientAdditionalInfo.data[0].row[5]);
                $scope.createClientAdditionalInfo.Education_cd_education_level=parseInt($scope.clientAdditionalInfo.data[0].row[6]);
                $scope.createClientAdditionalInfo.Poverty_cd_poverty_status=parseInt($scope.clientAdditionalInfo.data[0].row[7]);
                $scope.createClientAdditionalInfo.Introduced_by_cd_introduced_by=parseInt($scope.clientAdditionalInfo.data[0].row[8]);
                $scope.createClientAdditionalInfo.introducer_client=parseInt($scope.clientAdditionalInfo.data[0].row[9]);
                $scope.createClientAdditionalInfo.introducer_loanOfficer=parseInt($scope.clientAdditionalInfo.data[0].row[10]);
                $scope.createClientAdditionalInfo.introducer_other=parseInt($scope.clientAdditionalInfo.data[0].row[11]);                
                $scope.createClientAdditionalInfo.knownToIntroducerSince=$scope.clientAdditionalInfo.data[0].row[12];
                $scope.createClientAdditionalInfo.visitedById=parseInt($scope.clientAdditionalInfo.data[0].row[13]);
                $scope.createClientAdditionalInfo.visitingDate=$scope.clientAdditionalInfo.data[0].row[14];
              }
          } catch (e) {
            console.log(e);
          }
      }
      //failur callback
      var createClientAdditionalInfoTemplateFail = function(result){
          $scope.isLoading = false;
          console.log('Error : Return from CreateClientsService service.');
      }
      var loadCreateClientAdditionalInfoTemplate = function getData(tableState) {
        $scope.isLoading = true;
        $timeout(
          function() {
              $scope.rowCollection = [];               
              console.log("successfully got the additional client info");
              CreateClientsService.getData(REST_URL.CREATE_ADDITIONAL_CLIENT_INFO+$route.current.params.id+'?genericResultSet=true').then(createClientAdditionalInfoTemplateSuccess, createClientAdditionalInfoTemplateFail);
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

      //invalidate client additional form
      $scope.invalidateForm = function(){
       $scope.createAdditionalClientForm.invalidate = false;
      };

      $scope.saveClientAdditionalInfo = function(createClientAdditionalInfo){
        console.log('CreateClientCtrl : CreateClient : saveClientAdditionalInfo');

        //Covert date format
        $scope.createClientAdditionalInfo.dateFormat= "dd/MM/yyyy";        
        var d = new Date($scope.createClientAdditionalInfo.knownToIntroducerSince);
        $scope.createClientAdditionalInfo.knownToIntroducerSince = d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();
        d = new Date($scope.createClientAdditionalInfo.visitingDate);
        $scope.createClientAdditionalInfo.visitingDate = d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();
        $scope.createClientAdditionalInfo.locale = "en";

        var saveClientAdditionalInfoSuccess = function(result){
          console.log('Success : Return from CreateClientsService service.');
          $rootScope.type="alert-success";
          if($scope.createAdditional){
              $rootScope.message="Client Business Activity Detail saved successfully";
          }else{
              $rootScope.message="Client Business Activity Detail updated successfully";
          }
          loadCreateClientAdditionalInfoTemplate();                
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
        var json=angular.toJson(this.createClientAdditionalInfo);
        console.log(json);
        if($scope.createAdditional){
          CreateClientsService.saveClient(REST_URL.CREATE_ADDITIONAL_CLIENT_INFO+$route.current.params.id,json).then(saveClientAdditionalInfoSuccess, saveClientAdditionalInfoFail);
        }else{
          CreateClientsService.updateClient(REST_URL.CREATE_ADDITIONAL_CLIENT_INFO+$route.current.params.id,json).then(saveClientAdditionalInfoSuccess, saveClientAdditionalInfoFail);
        }        
      };
});

CreateClientCrtl.controller('ClientIdentificationCtrl', function ($route, $scope, $rootScope, $location, $timeout, CreateClientsService, REST_URL, APPLICATION, PAGE_URL) {
      console.log('CreateClientCtrl : ClientIdentificationCtrl');
      //To load the loadproducts page
      $scope.isLoading = false;
      $scope.clientIdentification={};
      $scope.clientIdentificationExtra={};
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
            $scope.message="File is too large! File size must be less then or equal to 100 KB!";
            $('html, body').animate({scrollTop : 0},800);            
        }else{
          $scope.file = $files[0];        
        }
      };

      //Success callback
      var createClientIdentificationTeplateSuccess = function(result) {
         $scope.isLoading = false;
         try {
              //Setting the id for the headers
              $scope.id = $route.current.params.id;
              $scope.client = result.data;
              $scope.identificationType =  $scope.client.allowedDocumentTypes;

              //Set the default values for the identification id
              $scope.clientIdentification.documentTypeId = 1 ;
          } catch (e) {
              console.log(e);
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
              var $url=REST_URL.CREATE_CLIENT + '/' + $route.current.params.id +'/identifiers/template';
              CreateClientsService.getData($url).then(createClientIdentificationTeplateSuccess, createClientIdentificationTemplateFail);
          }, 500
        );
      };

      loadCreateClientIdentificationTemplate();
      
      $scope.validateClientIdentification = function(clientIdentification,clientIdentificationExtra){
        console.log('CreateClientCtrl : CreateClient : validateClientIdentification');
            if ($scope.ClientIdentificationForm.$valid) {
              $scope.saveClientIdentification(clientIdentification,clientIdentificationExtra);
            } else {
              $scope.invalidateForm();
            }
      };

      //invalidate login form
      $scope.invalidateForm = function(){
       $scope.ClientIdentificationForm.invalidate = false;
      };

      $scope.saveClientIdentification = function(clientIdentification,clientIdentificationExtra){
        console.log('CreateClientCtrl : CreateClient : saveClientIdentification');

        var saveClientIdentificationSuccess = function(result){
          console.log('Success : Return from CreateClientsService service.');
          $rootScope.type="alert-success";
          $rootScope.message="Client Identification Detail saved successfully";
          
          //Upload the documents according to the client identifier
          $scope.uploadDocuments();

          $upload.upload({
            url: APPLICATION.host + REST_URL.CREATE_CLIENT+'/'+$route.current.params.id+'/images',
            data: {},
            file: $scope.file
          }).then(function (imageData) {
            console.log('Success : Return from createClientsService');
            $scope.saveClientIdentificationExtra(clientIdentificationExtra);
          },function(){
            console.log('Failur : Return from createClientsService');
            $scope.type="error";
            $scope.message="Client identification is not saved, please try again!";
            $scope.errors = result.data.errors;
            if(result.data.errors!='' && result.data.errors!='undefined'){
              for(var i=0;i<result.data.errors.length;i++){
                $('#'+$scope.errors[i].parameterName).removeClass('ng-valid').removeClass('ng-valid-required').addClass('ng-invalid').addClass('ng-invalid-required');
              }
            }           
          });
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
        var json2=angular.toJson(this.clientIdentificationExtra);
        console.log(json2);
        var $url = REST_URL.CREATE_CLIENT + '/' + $route.current.params.id +'/identifiers';
        console.log($url);
        CreateClientsService.saveClient($url, angular.toJson(this.clientIdentification)).then(saveClientIdentificationSuccess, saveClientIdentificationFail);
      };

      $scope.saveClientIdentificationExtra = function(clientIdentificationExtra){
        console.log('CreateClientCtrl : CreateClient : saveClientIdentificationExtra');

        //Set the Client identification extra information
        $scope.clientIdentificationExtra.locale="en";
        //Covert date format
        $scope.clientIdentificationExtra.dateFormat= "dd/MM/yyyy";        
        var d = new Date($scope.clientIdentificationExtra.issue_date);
        $scope.clientIdentificationExtra.issue_date = d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();  

        var saveClientIdentificationExtraSuccess = function(result){
          console.log('Success : Return from CreateClientsService service.');
          $rootScope.type="alert-success";
          $rootScope.message="Client Identification Detail saved successfully";
          loadCreateClientIdentificationTemplate();
        }

        var saveClientIdentificationExtraFail = function(result){
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
        var $url = REST_URL.CREATE_CLIENT_IDENTIFICATION+ $route.current.params.id;
        console.log($url);
        //CreateClientsService.saveClient($url, angular.toJson(this.clientIdentificationExtra)).then(saveClientIdentificationExtraSuccess, saveClientIdentificationExtraFail);
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
      //For date of birth calendar
      $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
      };
      //Change Maritial Status
      $scope.changeIncomeActivity = function(){
        $scope.isIncomeActivity = false;
        if($scope.clientBusinessActivity.YesNo_cd_other_income==33){
          $scope.isIncomeActivity=true;
        }
      }
      
      //Success callback
      var createClientBusinessActivityTeplateSuccess = function(result) {
         $scope.isLoading = false;
         try {
              //Setting the id for the urls in the header
              $scope.id = $route.current.params.id;
              //Filling the drop downs
              $scope.client = result.data;
              $scope.businessActivityOptions = $scope.client.columnHeaders[1].columnValues;
              $scope.BookingKeeping = $scope.client.columnHeaders[5].columnValues;
              $scope.otherIncome = $scope.client.columnHeaders[6].columnValues;
              $scope.otherIncomeBusinessActivity = $scope.client.columnHeaders[7].columnValues;

              //Setting the default values of the drop downs
              $scope.clientBusinessActivity.BusinessActivity_cd_business_activity = 30;
              $scope.clientBusinessActivity.YesNo_cd_book_keeping = 33;
              $scope.clientBusinessActivity.YesNo_cd_other_income = 34;
              $scope.clientBusinessActivity.dateFormat= "dd/MM/yyyy";
              $scope.clientBusinessActivity.locale = "en";
              //Set the default value of the Other income business activity dropdown
              //$scope.clientBusinessActivity.BusinessActivity_cd_other_income_business_activity = 30;

              //Check if the request is for the Update or creation of the new record
              if($scope.client.data == ''){
                $scope.$requestMethodCreate=true;
              }else{
                $scope.$requestMethodCreate=false;
                $scope.clientBusinessActivity.business_name = $scope.client.data[0].row[2];
                $scope.clientBusinessActivity.operating_since = $scope.client.data[0].row[4];
                $scope.clientBusinessActivity.business_address = $scope.client.data[0].row[3];
                $scope.clientBusinessActivity.BusinessActivity_cd_business_activity = parseInt($scope.client.data[0].row[1]);
                $scope.clientBusinessActivity.YesNo_cd_book_keeping = parseInt($scope.client.data[0].row[5]);
                $scope.clientBusinessActivity.YesNo_cd_other_income = parseInt($scope.client.data[0].row[6]);
                $scope.clientBusinessActivity.BusinessActivity_cd_other_income_business_activity = parseInt($scope.client.data[0].row[7]);                
              }

          } catch (e) {
              console.log(e);
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

        //Covert date format
        $scope.clientBusinessActivity.dateFormat= "dd/MM/yyyy";        
        var d = new Date($scope.clientBusinessActivity.operating_since);
        $scope.clientBusinessActivity.operating_since = d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();

        var saveClientBusinessActivitySuccess = function(result){
          console.log('Success : Return from CreateClientsService service.');
          $rootScope.type="alert-success";
          if($scope.$requestMethodCreate){
              $rootScope.message="Client Business Activity Detail saved successfully";
          }else{
              $rootScope.message="Client Business Activity Detail updated successfully";
          }
          loadCreateClientBusinessActivityTemplate();   
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
        var $requestUrl = REST_URL.CREATE_CLIENT_BUSINESS_ACTIVITY + $route.current.params.id ;
        console.log($requestUrl);
        if($scope.$requestMethodCreate){
          CreateClientsService.saveClient($requestUrl, json).then(saveClientBusinessActivitySuccess, saveClientBusinessActivityFail);  
        }else{
          CreateClientsService.updateClient($requestUrl, json).then(saveClientBusinessActivitySuccess, saveClientBusinessActivityFail);  
        }
      };
});