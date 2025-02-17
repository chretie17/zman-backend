-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: agricultural_system
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `buyer_name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `government_id` varchar(50) DEFAULT NULL,
  `transaction_type` enum('subsidized','public') DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `subsidy_applied` decimal(10,2) DEFAULT '0.00',
  `final_price` decimal(10,2) DEFAULT NULL,
  `transaction_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_method` varchar(50) DEFAULT NULL,
  `beneficiary_name` varchar(255) DEFAULT NULL,
  `beneficiary_national_id` varchar(20) DEFAULT NULL,
  `beneficiary_phone` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (2,1,'Customer',NULL,NULL,'public',100.00,0.00,200.00,'2024-10-23 16:46:35','field sale',NULL,NULL,NULL),(4,1,'TC','07888',NULL,'public',100.00,0.00,100.00,'2024-10-23 16:51:08','field sale',NULL,NULL,NULL),(7,3,NULL,NULL,NULL,'subsidized',100.00,240.00,60.00,'2024-11-15 17:04:21','field sale','Gihozo zubeir','1209989999999999','0788883123'),(8,3,NULL,NULL,NULL,'subsidized',100.00,80.00,20.00,'2024-12-02 15:16:01','field sale','Gihozo zubeir','1209989999999999','0788883123'),(9,3,NULL,NULL,NULL,'subsidized',100.00,160.00,40.00,'2024-12-02 15:19:16','field sale','Gihozo zubeir','1209989999999999','0788883123'),(10,4,NULL,NULL,NULL,'public',2000.00,0.00,4000.00,'2024-12-02 15:19:39','field sale',NULL,NULL,NULL),(11,3,NULL,NULL,NULL,'subsidized',100.00,1200.00,300.00,'2024-12-02 15:32:09','field sale','Eddy','1222222222222222','07899999999'),(12,1,NULL,NULL,NULL,'public',1000.00,0.00,1000.00,'2025-02-17 12:24:31','field sale',NULL,NULL,NULL),(13,3,NULL,NULL,NULL,'subsidized',100.00,80.00,20.00,'2025-02-17 12:26:31','field sale','Eddy','1222222222222222','07899999999'),(14,3,NULL,NULL,NULL,'subsidized',100.00,160.00,40.00,'2025-02-17 12:27:24','field sale','Gihozo zubeir','1209989999999999','0788883123'),(15,3,NULL,NULL,NULL,'subsidized',100.00,160.00,40.00,'2025-02-17 13:26:05','field sale','Gihozo zubeir','1209989999999999','0788883123'),(16,3,NULL,NULL,NULL,'subsidized',100.00,720.00,180.00,'2025-02-17 13:30:23','field sale','Cyusa Elvis','190000000000000','078888888888');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-17 16:31:38
