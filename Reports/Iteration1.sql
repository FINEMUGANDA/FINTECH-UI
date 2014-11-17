#Make report for home page header statistic
#Report number - 157
#Report name - Home page header statistic
select client.totalActiveClient, borrower.totalBorrowers, badStanding.loansInBadStanding, repayment.repaymentsDueThisWeek from (SELECT '' title, count(*) as totalActiveClient FROM m_client where m_client.status_enum=300) client join (SELECT '' title, count(*) as totalBorrowers FROM m_client c, m_loan l where c.id=l.client_id AND l.loan_status_id in (300,800,900)) borrower on client.title=borrower.title join (SELECT '' title, count(*) as loansInBadStanding FROM m_client c, m_loan l where c.id=l.client_id AND l.loan_status_id=900) badStanding on client.title=badStanding.title join (SELECT '' title, count(duedate) as repaymentsDueThisWeek from m_loan_repayment_schedule WHERE duedate >= curdate() - INTERVAL DAYOFWEEK(curdate()) DAY AND duedate < curdate() + 7-INTERVAL DAYOFWEEK(curdate()) DAY) repayment on client.title=repayment.title

//Education into code table
INSERT INTO `mifostenant-default`.`m_code` (`code_name`, `is_system_defined`) VALUES ('Education', '1');
//Education into code_value table
INSERT INTO `mifostenant-default`.`m_code_value` (`code_id`, `code_value`, `order_position`) VALUES ('18', 'N/A', '1');
INSERT INTO `mifostenant-default`.`m_code_value` (`code_id`, `code_value`, `order_position`) VALUES ('18', 'Bachelors', '2');
INSERT INTO `mifostenant-default`.`m_code_value` (`code_id`, `code_value`, `order_position`) VALUES ('18', 'Diploma', '3');
//Poverty into code table
INSERT INTO `mifostenant-default`.`m_code` (`code_name`, `is_system_defined`) VALUES ('Poverty', '1');
//Povarty into code_value table
INSERT INTO `mifostenant-default`.`m_code_value` (`code_id`, `code_value`, `order_position`) VALUES ('19', '0-10000', '1');
INSERT INTO `mifostenant-default`.`m_code_value` (`code_id`, `code_value`, `order_position`) VALUES ('19', '10001-20000', '2');
//Alter table m_client to add column education and poverty table
ALTER TABLE `mifostenant-default`.`m_client` ADD COLUMN `education_cv_id` INT(11) NULL DEFAULT NULL  AFTER `client_classification_cv_id` , ADD COLUMN `poverty_cv_id` INT(11) NULL DEFAULT NULL  AFTER `education_cv_id` ;
//


