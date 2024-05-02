show databases;
use stu_teach_results;
show tables;
select* from results;
desc results;
truncate table studata;
insert into results values(106,'aman','2022-12-12',2);

select* from studata;
insert into studata values(101,'manoj','2022-12-12','manoj123');
alter table studata ADD password varchar(20);

select * from teacherdata;
insert into teacherdata values(101,'aslam','M','aslam123');
alter table teacherdata ADD password varchar(20);






ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
flush privileges;