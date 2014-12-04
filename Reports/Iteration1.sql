#Report number - 157
#Report name - Home page header statistic
#Description : home page header statistic
select client.totalActiveClient, borrower.totalBorrowers, badStanding.loansInBadStanding, repayment.repaymentsDueThisWeek from (SELECT '' title, count(*) as totalActiveClient FROM m_client where m_client.status_enum=300) client join (SELECT '' title, count(*) as totalBorrowers FROM m_client c, m_loan l where c.id=l.client_id AND l.loan_status_id in (300,800,900)) borrower on client.title=borrower.title join (SELECT '' title, count(*) as loansInBadStanding FROM m_client c, m_loan l where c.id=l.client_id AND l.loan_status_id=900) badStanding on client.title=badStanding.title join (SELECT '' title, count(duedate) as repaymentsDueThisWeek from m_loan_repayment_schedule WHERE duedate >= curdate() - INTERVAL DAYOFWEEK(curdate()) DAY AND duedate < curdate() + 7-INTERVAL DAYOFWEEK(curdate()) DAY) repayment on client.title=repayment.title;
#Report number 158
#Rerport name PageClientsScreenClients
#Description : Get all clients for clients screen on clients page
select c.id id,c.display_name name, ifnull(b.business_name,'') type, ifnull(c.external_id,'')  file_no, ifnull(cd_rej.code_value,cl_en.enum_message_property) status, ifnull(l_en.enum_message_property,'') loanStatus, ifnull(cd_edu.code_value,'') education, ifnull(cd_pov.code_value,'') povertyLevel, ifnull(s.display_name,'') loanOfficer, ifnull(i.location, 'client_image/noPhoto.jpg') location, c.status_enum statusCode, ifnull(l.loan_status_id,'') loanStatusCode from m_client c left join m_image i  on i.id=c.image_id left join m_loan l on c.id=l.client_id left join m_staff s on s.id=l.loan_officer_id left join r_enum_value l_en on l_en.enum_id=l.loan_status_id and l_en.enum_name='loan_status_id' left join m_code_value cd_edu on cd_edu.id=c.education_cv_id left join m_code_value cd_pov on cd_pov.id=c.poverty_cv_id left join m_code_value cd_rej on cd_rej.id=c.closure_reason_cv_id left join r_enum_value cl_en on cl_en.enum_id=c.status_enum and cl_en.enum_name='status_enum' left join business_details b on b.client_id=c.id;
#Report number 159
#Rerport name PageClientsScreenLoans
#Description : Get all loans for loans screen on clients page
select c.id id,c.display_name name, ifnull(b.business_name,'') type, ifnull(c.external_id,'')  file_no, ifnull(FORMAT(l.approved_principal,2),0)  loanAmount, ifnull(FORMAT(la.total_overdue_derived,2),0)  loanArrears, ifnull(l_en.enum_message_property,'') loanStatus, ifnull(s.display_name,'') loanOfficer, ifnull(i.location, 'client_image/noPhoto.jpg') location,ifnull(l.loan_status_id,'') loanStatusCode from m_client c join m_loan l on l.client_id=c.id join r_enum_value l_en on l_en.enum_id=l.loan_status_id and l_en.enum_name='loan_status_id' left join m_image i on i.id=c.image_id left join m_loan_arrears_aging la on la.loan_id=l.id left join m_staff s on s.id=l.loan_officer_id left join business_details b on b.client_id=c.id ;
#Report number 160
#Rerport name PageClientsScreenLoansPA
#Description : Get all loans pending approval for loans pending approval screen on clients page
select c.id id,c.display_name name, ifnull(c.external_id,'') file_no, ifnull(FORMAT(l.approved_principal,2),0) loanAmount, ifnull(l.term_frequency,0) installments, ifnull(FORMAT(l.annual_nominal_interest_rate,2),0) interestRate, ifnull(s.display_name,'') loanOfficer, DATE_FORMAT(l.submittedon_date,'%d %b %y') submittedon_date from m_client c join m_loan l on c.id=l.client_id  and l.loan_status_id=100 join r_enum_value l_en on l.loan_status_id=l_en.enum_id and l_en.enum_name='loan_status_id' left join m_staff s on s.id=l.loan_officer_id;
#Report number 161
#Rerport name PageClientsScreenLoansAD
#Description : Get all loan awaiting disbusement for Loan awaiting disbusement screen on clients page
select c.id id,c.display_name name, ifnull(c.external_id,'') file_no, ifnull(l.approved_principal,0) loanAmount, DATE_FORMAT(l.approvedon_date,'%d %b %y') approvedon_date, concat(ln_sub.firstname,' ',ln_sub.lastname) submitted_by, concat(ln_app.firstname,' ',ln_app.lastname) approved_by, ifnull(s.display_name,'') loanOfficer from m_client c join m_loan l on c.id=l.client_id  and l.loan_status_id=200 join r_enum_value l_en on l.loan_status_id=l_en.enum_id and l_en.enum_name='loan_status_id' left join m_staff s on s.id=l.loan_officer_id left join m_appuser ln_sub on ln_sub.id=l.submittedon_userid left join m_appuser ln_app on ln_app.id=l.approvedon_userid;
#Report number 162
#Rerport name PageClientsScreenLoansRejected
#Description : Get all rejected loan for Loan Rejected screen on clients page
select c.id id,c.display_name name, ifnull(c.external_id,'') file_no, ifnull(l.approved_principal,0) loanAmount, ifnull(s.display_name,'') loanOfficer, ifnull(n.note, '') rejectedReason from m_client c join m_loan l on c.id=l.client_id  and l.loan_status_id=500 join r_enum_value l_en on l.loan_status_id=l_en.enum_id and l_en.enum_name='loan_status_id' left join m_staff s on s.id=l.loan_officer_id left join m_note n on n.loan_id=l.id;
#Report number 163
#Rerport name PageClientsScreenLoansWritten
#Description : Get all written off loan for Loan Written off screen on clients page
select c.id id,c.display_name name, ifnull(c.external_id,'') file_no, ifnull(FORMAT(l.approved_principal,2),0) loanAmount, ifnull(FORMAT(l.total_writtenoff_derived,2),0) balanceWritten, DATE_FORMAT(l.writtenoffon_date,'%d %b %y') writtenoffon_date, ifnull(s.display_name,'') loanOfficer, ifnull(n.note,'') writtenoff_reason from m_client c join m_loan l on c.id=l.client_id  and l.loan_status_id=601 join r_enum_value l_en on l.loan_status_id=l_en.enum_id and l_en.enum_name='loan_status_id' left join m_staff s on s.id=l.loan_officer_id left join m_note n on n.loan_id=l.id;
#Date - 2014/12/02
#Report number 164
#Report name ClientIdentification
#Description : To display data on the client identification page
SELECT  ci.id 'identifier_id', ci.client_id 'client_id', ci.document_type_id 'documentTypeId', ci.document_key 'documentKey', cie.id 'extra_id', cie.issue_place 'issue_place', cie.issue_date 'issue_date', cie.issue_document 'issue_document' FROM m_client_identifier as ci  LEFT JOIN client_identification_details cie ON cie.client_id=ci.client_id and cie.identifier_id=ci.id where ci.client_id=${client_id};