#To create datatable : {"resourceIdentifier":"client_extra_information"}
{
    "datatableName": "client_extra_information",
    "apptableName": "m_client",
    "multiRow": "true",
    "columns": [
        {
            "name": "maritalStatus",
            "type": "Dropdown",
            "code": "YesNo",
            "mandatory": true
        },
        {
            "name": "numberOfChildren",
            "type": "Number",
            "mandatory": true
        },
        {
            "name": "numberOfLoanDependents",
            "type": "Number",
            "mandatory": true
        },
        {
            "name": "nameOfSpouse",
            "type": "String",
            "length": 100
        },
        {
            "name": "homeContactAddress",
            "type": "Text",
            "mandatory": true
        },
        {
            "name": "homeContactPerson",
            "type": "String",
            "length": 100
        },
        {
            "name": "email",
            "type": "String",
            "length": 100
        },
        {
            "name": "SecondMobileNo",
            "type": "Number",
            "mandatory": true
        }
    ]
}