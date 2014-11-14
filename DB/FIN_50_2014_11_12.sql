# Insert records into r_enum_value
# Add two loan status "ActiveInGoodStanding" and 'ActiveInBadStanding'
INSERT INTO `mifostenant-default`.`r_enum_value` (`enum_name`, `enum_id`, `enum_message_property`, `enum_value`, `enum_type`) VALUES ('loan_status_id', '800', 'ActiveInGoodStanding', 'ActiveInGoodStanding', '0');
INSERT INTO `mifostenant-default`.`r_enum_value` (`enum_name`, `enum_id`, `enum_message_property`, `enum_value`, `enum_type`) VALUES ('loan_status_id', '900', 'ActiveInBadStanding', 'ActiveInBadStanding', '0');