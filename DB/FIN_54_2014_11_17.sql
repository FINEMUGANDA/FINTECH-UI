
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