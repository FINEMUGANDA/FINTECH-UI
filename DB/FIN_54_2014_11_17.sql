
# Insert Education detail into code table
INSERT INTO `mifostenant-default`.`m_code` (`code_name`, `is_system_defined`) VALUES ('Education', '1');
# Insert Education values into code_value table
INSERT INTO `mifostenant-default`.`m_code_value` (`code_id`, `code_value`, `order_position`) VALUES ('18', 'N/A', '1');
INSERT INTO `mifostenant-default`.`m_code_value` (`code_id`, `code_value`, `order_position`) VALUES ('18', 'Bachelors', '2');
INSERT INTO `mifostenant-default`.`m_code_value` (`code_id`, `code_value`, `order_position`) VALUES ('18', 'Diploma', '3');
# Insert Poverty detail into code table
INSERT INTO `mifostenant-default`.`m_code` (`code_name`, `is_system_defined`) VALUES ('Poverty', '1');
# Insert Povarty values code_value table
INSERT INTO `mifostenant-default`.`m_code_value` (`code_id`, `code_value`, `order_position`) VALUES ('19', '0-10000', '1');
INSERT INTO `mifostenant-default`.`m_code_value` (`code_id`, `code_value`, `order_position`) VALUES ('19', '10001-20000', '2');
# Alter table m_client to add column education_cv_id and poverty_cv_id table
ALTER TABLE `mifostenant-default`.`m_client` ADD COLUMN `education_cv_id` INT(11) NULL DEFAULT NULL  AFTER `client_classification_cv_id` , ADD COLUMN `poverty_cv_id` INT(11) NULL DEFAULT NULL  AFTER `education_cv_id` ;
# Update m_loan table : Add loan_officer_id
UPDATE `mifostenant-default`.`m_loan` SET `loan_officer_id`='1' WHERE `id`='1';
UPDATE `mifostenant-default`.`m_loan` SET `loan_officer_id`='2' WHERE `id`='2';
# Insert data into m_loan and m_note : loan written off
INSERT INTO `mifostenant-default`.`m_loan` (`id`, `account_no`, `external_id`, `client_id`, `product_id`, `fund_id`, `loan_officer_id`, `loan_status_id`, `loan_type_enum`, `currency_code`, `currency_digits`, `currency_multiplesof`, `principal_amount`, `approved_principal`, `nominal_interest_rate_per_period`, `interest_period_frequency_enum`, `annual_nominal_interest_rate`, `interest_method_enum`, `interest_calculated_in_period_enum`, `term_frequency`, `term_period_frequency_enum`, `repay_every`, `repayment_period_frequency_enum`, `number_of_repayments`, `amortization_method_enum`, `submittedon_date`, `submittedon_userid`, `approvedon_date`, `approvedon_userid`, `expected_disbursedon_date`, `expected_maturedon_date`, `maturedon_date`, `total_charges_due_at_disbursement_derived`, `principal_disbursed_derived`, `principal_repaid_derived`, `principal_writtenoff_derived`, `principal_outstanding_derived`, `interest_charged_derived`, `interest_repaid_derived`, `interest_waived_derived`, `interest_writtenoff_derived`, `interest_outstanding_derived`, `fee_charges_charged_derived`, `fee_charges_repaid_derived`, `fee_charges_waived_derived`, `fee_charges_writtenoff_derived`, `fee_charges_outstanding_derived`, `penalty_charges_charged_derived`, `penalty_charges_repaid_derived`, `penalty_charges_waived_derived`, `penalty_charges_writtenoff_derived`, `penalty_charges_outstanding_derived`, `total_expected_repayment_derived`, `total_repayment_derived`, `total_expected_costofloan_derived`, `total_costofloan_derived`, `total_waived_derived`, `total_writtenoff_derived`, `total_outstanding_derived`, `writtenoffon_date`, `loan_transaction_strategy_id`, `is_npa`) VALUES ('3', '000000003', '', '7', '1', '1', '2', '601', '1', 'USD', '2', '0', '10000.000000', '10000.000000', '26.000000', '3', '26.000000', '1', '1', '25', '1', '1', '1', '25', '1', '2014-06-02', '1', '2014-06-11', '1', '2014-06-16', '2014-12-08', '2014-12-08', '500.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '5000', '0.000000', '2014-12-08', '1', '0');
INSERT INTO `mifostenant-default`.`m_note` (`id`, `client_id`, `loan_id`, `note`, `created_date`, `createdby_id`, `lastmodified_date`, `lastmodifiedby_id`) VALUES ('1', '7', '3', 'This is test for written off', '2014-06-11', '1', '2014-06-11', '1');
# Insert data into m_loan : loan rejected loan
INSERT INTO `mifostenant-default`.`m_loan` (`id`, `account_no`, `client_id`, `product_id`, `fund_id`, `loan_officer_id`, `loan_status_id`, `loan_type_enum`, `currency_code`, `currency_digits`, `currency_multiplesof`, `principal_amount`, `approved_principal`, `nominal_interest_rate_per_period`, `interest_period_frequency_enum`, `annual_nominal_interest_rate`, `interest_method_enum`, `interest_calculated_in_period_enum`, `term_frequency`, `term_period_frequency_enum`, `repay_every`, `repayment_period_frequency_enum`, `number_of_repayments`, `amortization_method_enum`, `submittedon_date`, `submittedon_userid`, `approvedon_date`, `approvedon_userid`, `expected_disbursedon_date`, `expected_maturedon_date`, `maturedon_date`, `total_charges_due_at_disbursement_derived`, `principal_disbursed_derived`, `principal_repaid_derived`, `principal_writtenoff_derived`, `principal_outstanding_derived`, `interest_charged_derived`, `interest_repaid_derived`, `interest_waived_derived`, `interest_writtenoff_derived`, `interest_outstanding_derived`, `fee_charges_charged_derived`, `fee_charges_repaid_derived`, `fee_charges_waived_derived`, `fee_charges_writtenoff_derived`, `fee_charges_outstanding_derived`, `penalty_charges_charged_derived`, `penalty_charges_repaid_derived`, `penalty_charges_waived_derived`, `penalty_charges_writtenoff_derived`, `penalty_charges_outstanding_derived`, `total_expected_repayment_derived`, `total_repayment_derived`, `total_expected_costofloan_derived`, `total_costofloan_derived`, `total_waived_derived`, `total_writtenoff_derived`, `total_outstanding_derived`, `rejectedon_date`, `rejectedon_userid`, `writtenoffon_date`, `loan_transaction_strategy_id`, `is_npa`) VALUES ('4', '000000004', '5', '1', '1', '1', '500', '1', 'USD', '2', '0', '10000.000000', '10000.000000', '26.000000', '3', '26.000000', '1', '1', '25', '1', '1', '1', '25', '1', '2014-06-02', '1', '2014-06-11', '1', '2014-06-16', '2014-12-08', '2014-12-08', '500.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '5000.000000', '0.000000', '2014-12-08', '1', '2014-12-08', '1', '0');
INSERT INTO `mifostenant-default`.`m_note` (`id`, `client_id`, `loan_id`, `note_type_enum`, `note`, `created_date`, `createdby_id`, `lastmodified_date`, `lastmodifiedby_id`) VALUES ('2', '5', '4', '0', 'This is test for rejcted loan', '2014-06-11 00:00:00', '1', '2014-06-11 00:00:00', '1');
# Insert data into m_loan : loan pending approval
INSERT INTO `mifostenant-default`.`m_loan` (`id`, `account_no`, `client_id`, `product_id`, `fund_id`, `loan_officer_id`, `loan_status_id`, `loan_type_enum`, `currency_code`, `currency_digits`, `currency_multiplesof`, `principal_amount`, `approved_principal`, `nominal_interest_rate_per_period`, `interest_period_frequency_enum`, `annual_nominal_interest_rate`, `interest_method_enum`, `interest_calculated_in_period_enum`, `term_frequency`, `term_period_frequency_enum`, `repay_every`, `repayment_period_frequency_enum`, `number_of_repayments`, `amortization_method_enum`, `submittedon_date`, `submittedon_userid`, `approvedon_date`, `approvedon_userid`, `expected_disbursedon_date`, `expected_maturedon_date`, `maturedon_date`, `total_charges_due_at_disbursement_derived`, `principal_disbursed_derived`, `principal_repaid_derived`, `principal_writtenoff_derived`, `principal_outstanding_derived`, `interest_charged_derived`, `interest_repaid_derived`, `interest_waived_derived`, `interest_writtenoff_derived`, `interest_outstanding_derived`, `fee_charges_charged_derived`, `fee_charges_repaid_derived`, `fee_charges_waived_derived`, `fee_charges_writtenoff_derived`, `fee_charges_outstanding_derived`, `penalty_charges_charged_derived`, `penalty_charges_repaid_derived`, `penalty_charges_waived_derived`, `penalty_charges_writtenoff_derived`, `penalty_charges_outstanding_derived`, `total_expected_repayment_derived`, `total_repayment_derived`, `total_expected_costofloan_derived`, `total_costofloan_derived`, `total_waived_derived`, `total_writtenoff_derived`, `total_outstanding_derived`, `rejectedon_date`, `rejectedon_userid`, `writtenoffon_date`, `loan_transaction_strategy_id`, `is_npa`) VALUES ('5', '000000005', '4', '1', '1', '1', '100', '1', 'USD', '2', '0', '10000.000000', '10000.000000', '26.000000', '3', '26.000000', '1', '1', '25', '1', '1', '1', '25', '1', '2014-06-02', '1', '2014-06-11', '1', '2014-06-16', '2014-12-08', '2014-12-08', '500.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '0.000000', '5000.000000', '0.000000', '2014-12-08', '1', '2014-12-08', '1', '0');
# Update m_client to add external_id(file_no)
UPDATE `mifostenant-default`.`m_client` SET `external_id`='001' WHERE `id`='1';
UPDATE `mifostenant-default`.`m_client` SET `external_id`='002' WHERE `id`='2';
UPDATE `mifostenant-default`.`m_client` SET `external_id`='003' WHERE `id`='4';
UPDATE `mifostenant-default`.`m_client` SET `external_id`='004' WHERE `id`='5';
UPDATE `mifostenant-default`.`m_client` SET `external_id`='005' WHERE `id`='6';
UPDATE `mifostenant-default`.`m_client` SET `external_id`='006' WHERE `id`='7';
UPDATE `mifostenant-default`.`m_client` SET `external_id`='007' WHERE `id`='8';
# Create Business code into code table
INSERT INTO `mifostenant-default`.`m_code` (`id`, `code_name`, `is_system_defined`) VALUES ('20', 'BusinessActivity', '1');
# Insert data for Business into code_value
INSERT INTO `mifostenant-default`.`m_code_value` (`id`, `code_id`, `code_value`, `order_position`) VALUES ('30', '20', 'Retail', '1');
INSERT INTO `mifostenant-default`.`m_code_value` (`id`, `code_id`, `code_value`, `order_position`) VALUES ('31', '20', 'Vendor', '2');
INSERT INTO `mifostenant-default`.`m_code_value` (`id`, `code_id`, `code_value`, `order_position`) VALUES ('32', '20', 'Supplies', '3');
# Create Yes/No code into code table
INSERT INTO `mifostenant-default`.`m_code_value` (`id`, `code_id`, `code_value`, `order_position`) VALUES ('33', '5', 'Yes', '1');
INSERT INTO `mifostenant-default`.`m_code_value` (`id`, `code_id`, `code_value`, `order_position`) VALUES ('34', '5', 'No', '2');
#To create datatable : {"resourceIdentifier":"business_details"}
{
    "datatableName": "business_details",
    "apptableName": "m_client",
    "multiRow":"true",
    "columns": [      
        {
            "name": "business_activity",
            "type": "Dropdown",
            "code": "BusinessActivity"
        },
        {
            "name": "business_name",
            "type": "String",
	    "length":100,
            "mandatory": true
        },
        {
            "name": "business_address",
            "type": "String",
            "length":255
        },
        {
            "name": "operating_since",
            "type": "Date"
        },
        {
            "name": "BookingKeeping",
            "type": "Dropdown",
            "code": "YesNo"
        }
    ]
}
# Add data into datatable business_details : {"officeId":1,"clientId":1,"resourceId":1}
{
    "BusinessActivity_cd_business_activity": "30",
    "business_name": "Software",
    "business_address": "Mumbai",
    "operating_since": "2014-17-10",    
    "YesNo_cd_BookingKeeping": "33",
    "dateFormat": "yyyy-dd-MM",
    "locale": "en"
}
# Add images to database
# TODO : This is just for demo purpose. Need to store images on server side
INSERT INTO `mifostenant-default`.`m_image` (`id`, `location`) VALUES ('1', 'client_image/amitrami.jpg');
INSERT INTO `mifostenant-default`.`m_image` (`id`, `location`) VALUES ('2', 'client_image/ndabhi.jpg');
INSERT INTO `mifostenant-default`.`m_image` (`id`, `location`) VALUES ('3', 'client_image/pgandhi.jpg');
INSERT INTO `mifostenant-default`.`m_image` (`id`, `location`) VALUES ('4', 'client_image/ppatel.jpg');
INSERT INTO `mifostenant-default`.`m_image` (`id`, `location`) VALUES ('5', 'client_image/pshah.jpg');
INSERT INTO `mifostenant-default`.`m_image` (`id`, `location`) VALUES ('6', 'client_image/rkrangiya.jpg');

# Update m_clent table

UPDATE `mifostenant-default`.`m_client` SET `image_id`='1' WHERE `id`='1';
UPDATE `mifostenant-default`.`m_client` SET `image_id`='2' WHERE `id`='2';
UPDATE `mifostenant-default`.`m_client` SET `image_id`='3' WHERE `id`='4';
UPDATE `mifostenant-default`.`m_client` SET `image_id`='4' WHERE `id`='5';
UPDATE `mifostenant-default`.`m_client` SET `image_id`='5' WHERE `id`='6';
UPDATE `mifostenant-default`.`m_client` SET `image_id`='6' WHERE `id`='7';
