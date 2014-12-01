#To create datatable : {"resourceIdentifier":"client_extra_information"}
{
    "datatableName": "client_extra_information",
    "apptableName": "m_client",
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
            "type": "Number"
        }
    ]
}

#To create the datatable for : {"resourceIdentifier":"business_details"}
{
    "datatableName": "business_details",
    "apptableName": "m_client",
    "columns": [
        {
            "name": "business_activity",
            "type": "Dropdown",
            "code": "BusinessActivity"
        },
        {
            "name": "business_name",
            "type": "String",
            "length": 100,
            "mandatory": true
        },
        {
            "name": "business_address",
            "type": "String",
            "length": 255
        },
        {
            "name": "operating_since",
            "type": "Date"
        },
        {
            "name": "book_keeping",
            "type": "Dropdown",
            "code": "YesNo"
        },
        {
            "name": "other_income",
            "type": "Dropdown",
            "code": "YesNo"
        },
        {
            "name": "other_income_business_activity",
            "type": "Dropdown",
            "code": "BusinessActivity"
        }
    ]
}

#to create Datatable : {"resourceIdentifier":"client_identification_details"}
{
    "datatableName": "client_identification_details",
    "apptableName": "m_client",
    "columns": [
        {
            "name": "issue_place",
            "type": "String",
            "length": 100
        },
        {
            "name": "issue_date",
            "type": "Date"
        },
        {
            "name": "issue_document",
            "type": "String",
            "length": 500
        }
    ]
}

#To make the datatables for : {"resourceIdentifier":"client_next_to_keen_details"}
{
    "datatableName": "client_next_to_keen_details",
    "apptableName": "m_client",
    "multiRow": "true",
    "columns": [
        {
            "name": "relationship",
            "type": "Dropdown",
            "code": "GuarantorRelationship"
        },
        {
            "name": "firstname",
            "type": "String",
        "length": 100,
            "mandatory": true
        },
        {
            "name": "middlename",
            "type": "String",
        "length": 100
        },
        {
            "name": "lastname",
            "type": "String",
        "length": 100,
            "mandatory": true
        },
        {
            "name": "date_of_birth",
            "type": "Date"
        },
        {
            "name": "address",
            "type": "Text"
        },
        {
            "name": "telephone",
            "type": "Number"
        },
        {
            "name": "second_telephone",
            "type": "Number"
        }
    ]
}

#Create the code values and the code for citizenship and introduces by for the additional client page
INSERT INTO `mifostenant-default`.`m_code` (`code_name`, `is_system_defined`) VALUES ('CitizenShip', '1');
INSERT INTO `mifostenant-default`.`m_code` (`code_name`, `is_system_defined`) VALUES ('Introduced_by', '1');

INSERT INTO `mifostenant-default`.`m_code_value` (`code_id`, `code_value`, `order_position`, `code_score`) VALUES ('22', 'Afghan', '1', '');
INSERT INTO `mifostenant-default`.`m_code_value` (`code_id`, `code_value`, `order_position`, `code_score`) VALUES ('22', 'Armenian', '1', '');
INSERT INTO `mifostenant-default`.`m_code_value` (`code_id`, `code_value`, `order_position`, `code_score`) VALUES ('22', 'Guinean', '1', '');
INSERT INTO `mifostenant-default`.`m_code_value` (`code_id`, `code_value`, `order_position`, `code_score`) VALUES ('22', 'Ghanaian', '1', '');
INSERT INTO `mifostenant-default`.`m_code_value` (`code_id`, `code_value`, `order_position`, `code_score`) VALUES ('22', 'Lebanese', '1', '');
INSERT INTO `mifostenant-default`.`m_code_value` (`code_id`, `code_value`, `order_position`, `code_score`) VALUES ('22', 'Indian', '1', '');
INSERT INTO `mifostenant-default`.`m_code_value` (`code_id`, `code_value`, `order_position`, `code_score`) VALUES ('22', 'Emirati', '1', '');
INSERT INTO `mifostenant-default`.`m_code_value` (`code_id`, `code_value`, `order_position`, `code_score`) VALUES ('22', 'US', '1', '');

INSERT INTO `mifostenant-default`.`m_code_value` (`code_id`, `code_value`, `order_position`, `code_score`) VALUES ('23', 'existing_client', '1', '');
INSERT INTO `mifostenant-default`.`m_code_value` (`code_id`, `code_value`, `order_position`, `code_score`) VALUES ('23', 'loan_officer', '1', '');
INSERT INTO `mifostenant-default`.`m_code_value` (`code_id`, `code_value`, `order_position`, `code_score`) VALUES ('23', 'other', '1', '');

#Create the datatable for : {"resourceIdentifier": "client_additional_details"}
{
    "datatableName": "client_additional_details",
    "apptableName": "m_client",
    "columns": [
        {
            "name": "bank_account",
            "type": "Dropdown",
            "code": "YesNo"
        },
        {
            "name": "bank_account_with",
            "type": "String",
            "length": 100
        },
        {
            "name": "branch",
            "type": "String",
            "length": 100
        },
        {
            "name": "bank_account_number",
            "type": "Number"
        },
        {
            "name": "citizenship",
            "type": "Dropdown",
            "code": "CitizenShip"
        },
        {
            "name": "education_level",
            "type": "Dropdown",
            "code": "Education"
        },
        {
            "name": "poverty_status",
            "type": "Dropdown",
            "code": "Poverty"
        },
        {
            "name": "introduced_by",
            "type": "Dropdown",
            "code": "Introduced_by"
        },
        {
            "name": "introducer_client",
            "type": "Number"
        },
        {
            "name": "introducer_loanOfficer",
            "type": "Number"
        },
        {
            "name": "introducer_other",
            "type": "String",
            "length": 100
        },
        {
            "name": "knownToIntroducerSince",
            "type": "Date",
            "mandatory": true
        },
        {
            "name": "visitedById",
            "type": "Number",
            "mandatory": true
        },
        {
            "name": "visitingDate",
            "type": "Date",
            "mandatory": true
        }
    ]
}

