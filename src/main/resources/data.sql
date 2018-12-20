REPLACE INTO `role` VALUES (1,'ADMIN');
REPLACE INTO `role` VALUES(2,'TECH_USER');


REPLACE INTO `event_type` VALUES('FILE_DOWNLOAD', 'Download files from URL');
REPLACE INTO `event_type` VALUES('EXECUTE_SCRIPT', ' Execute given Script');

REPLACE INTO `event` VALUES(300, 'File Downloading', 'FILE_DOWNLOAD', 'http://mirror.filearena.net/pub/speed/SpeedTest_16MB.dat?_ga=2.128745996.1626063043.1545063591-2124372131.1545063591', 'FILE_DOWNLOAD');
REPLACE INTO `event` VALUES(300, 'Execute Script', 'EXECUTE_SCRIPT', 'http://mirror.filearena.net/pub/speed/SpeedTest_16MB.dat?_ga=2.128745996.1626063043.1545063591-2124372131.1545063591', 'EXECUTE_SCRIPT');