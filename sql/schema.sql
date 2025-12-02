-- MySQL dump 10.13  Distrib 9.4.0, for macos26.0 (arm64)
--
-- Host: localhost    Database: mindhive_db
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_course` (`user_id`,`name`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leaderboard`
--

DROP TABLE IF EXISTS `leaderboard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leaderboard` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `points` int NOT NULL,
  `rank_position` int DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `leaderboard_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leaderboard`
--

LOCK TABLES `leaderboard` WRITE;
/*!40000 ALTER TABLE `leaderboard` DISABLE KEYS */;
/*!40000 ALTER TABLE `leaderboard` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notes`
--

DROP TABLE IF EXISTS `notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `content` text,
  `course_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `notes_course_fk` (`course_id`),
  CONSTRAINT `notes_course_fk` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `notes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notes`
--

LOCK TABLES `notes` WRITE;
/*!40000 ALTER TABLE `notes` DISABLE KEYS */;
INSERT INTO `notes` VALUES (39,13,'Test Note','alo',NULL,NULL,'2025-12-01 16:30:47');
/*!40000 ALTER TABLE `notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pomodoro_sessions`
--

DROP TABLE IF EXISTS `pomodoro_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pomodoro_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `points` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `pomodoro_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pomodoro_sessions`
--

LOCK TABLES `pomodoro_sessions` WRITE;
/*!40000 ALTER TABLE `pomodoro_sessions` DISABLE KEYS */;
INSERT INTO `pomodoro_sessions` VALUES (58,13,'2025-12-01 19:00:06',17),(59,13,'2025-12-01 19:00:06',23),(60,13,'2025-12-01 19:00:06',11),(61,13,'2025-12-01 19:00:06',19),(62,13,'2025-12-01 19:00:06',14),(63,13,'2025-12-01 19:00:06',25),(64,13,'2025-12-01 19:00:06',12),(65,13,'2025-12-01 19:00:06',21),(66,13,'2025-12-01 19:00:06',16),(67,13,'2025-12-01 19:00:06',24),(68,28,'2025-12-01 19:00:34',12),(69,28,'2025-12-01 19:00:34',24),(70,28,'2025-12-01 19:00:34',15),(71,28,'2025-12-01 19:00:34',22),(72,28,'2025-12-01 19:00:34',14),(73,28,'2025-12-01 19:00:34',23),(74,28,'2025-12-01 19:00:34',13),(75,28,'2025-12-01 19:00:34',16),(76,13,'2025-12-01 19:20:09',1),(77,13,'2025-12-01 19:22:08',1),(78,13,'2025-12-01 19:26:56',1),(79,13,'2025-12-01 19:27:57',1),(80,13,'2025-12-01 19:32:56',1),(81,13,'2025-12-01 19:50:49',1),(82,13,'2025-12-01 19:54:17',1),(83,13,'2025-12-01 19:56:49',1);
/*!40000 ALTER TABLE `pomodoro_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `revoked` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (65,13,'26bfcd4baeb1cfda85ae080d77dc87b927112160b777554359d2d55e42618108','2025-12-08 00:30:59',1,'2025-11-30 22:30:59'),(66,13,'9396184cb88bb3ef595bf72abd9b6efa89f485522a0e15832f3ee46d47f70fb9','2025-12-08 00:45:24',1,'2025-11-30 22:45:24'),(67,13,'4ab1725af4dbb2f60b83d5ab3bc87838b2109e413bb830f10d863f2867f486bd','2025-12-08 02:48:29',1,'2025-12-01 00:48:29'),(68,13,'0c70c28c9f6ec2ffb4d50387ac7d69a99e6593ba1c8edbcd8d6024a6933d314e','2025-12-08 11:41:56',1,'2025-12-01 09:41:56'),(69,13,'421257c507323560bfaeabb6c0015fb7e3be8189db9c6dd93fa22cfbb8ef4c87','2025-12-08 14:53:57',1,'2025-12-01 12:53:57'),(70,13,'7ddbe4e37dc6549e8e47b91df7f77f5f54b4ca8e44682fe51084439002dec5f1','2025-12-08 17:28:44',1,'2025-12-01 15:28:44'),(71,13,'5d1885a12cdf8b09b203d0dc4307ccd873763581c9b537a75e88982e1e23b13d','2025-12-08 17:28:51',1,'2025-12-01 15:28:51'),(72,13,'a3329eed58fa09a5ad7c81e98d35fc5f35057f6dffededd8f8be21f32e516f96','2025-12-08 17:31:07',1,'2025-12-01 15:31:07'),(73,13,'e130fc9e50fbe70992f96fc7d5fa57c1e1e398290f684b2a34ed849bf514f3f5','2025-12-08 17:31:29',1,'2025-12-01 15:31:29'),(74,13,'2a76bc38eab15fbede8c9e02eb01f8d4e90b7093669896bb60cc8ddde0bc07e7','2025-12-08 17:31:48',1,'2025-12-01 15:31:48'),(75,13,'9daaab3b10bae292b27e1b801b641d7edfc6919c248a1c0db11beabc780f3b29','2025-12-08 17:31:54',1,'2025-12-01 15:31:54'),(76,13,'896bf1f65d102a6be7cbe064822e011ff53604bbab322e6bd146d140b2459d99','2025-12-08 17:37:29',1,'2025-12-01 15:37:29'),(77,13,'84e64f56c5eb5877f28678b7a6d88ef22168c08b74087d566bda25e77b2e69f8','2025-12-08 17:38:07',1,'2025-12-01 15:38:07'),(78,13,'f20ce5729dd32408c1cbe9764e55cbf71c20693d596aa7015bff18ba64868ae3','2025-12-08 17:39:39',1,'2025-12-01 15:39:39'),(79,13,'ca89f41229b0bcfa973421e41e4e4dd68d3db98c68768b8c3d171bae56c68466','2025-12-08 17:46:46',1,'2025-12-01 15:46:46'),(80,13,'18e1d8ab89bd3b762e5e6015e54123a6b08ebc2bdc7e80707bb69d26e5af0ea0','2025-12-08 17:51:26',1,'2025-12-01 15:51:26'),(81,13,'95ce5b2280e44b3f9687a8e88cdc228a38c619e9276242d184c625a513b7ef20','2025-12-08 18:00:59',1,'2025-12-01 16:00:59'),(82,13,'6af7a67507343be264e86ee134847ff60f4f4fbaf8841ba7516d97930b76ee42','2025-12-08 18:02:49',1,'2025-12-01 16:02:49'),(83,13,'f72877e8f6e44d2c6f52130929d68545d73db6f9dd5b0ec338d968ef9be347eb','2025-12-08 20:59:52',1,'2025-12-01 18:59:52'),(84,13,'410f057ed6129370501f7822a51264fab30cd2ce72d5c1b1332d8b6392659898','2025-12-09 00:13:35',0,'2025-12-01 22:13:35');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `due_date` datetime DEFAULT NULL,
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  `completed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (45,29,'New Task','','2025-12-01 00:00:00',0,NULL),(46,29,'New Task','v','2025-12-05 00:00:00',0,NULL),(47,29,'New Task','qerg','2025-11-18 00:00:00',0,NULL),(56,13,'New Task','hey brow','2025-11-28 00:00:00',1,'2025-12-01 16:14:01'),(57,13,'aefgsrhtjy','ok','2025-12-12 00:00:00',0,NULL),(59,13,'old task','','2025-11-05 00:00:00',0,NULL);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trash`
--

DROP TABLE IF EXISTS `trash`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trash` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `note_id` int NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` text,
  `course_id` int DEFAULT NULL,
  `deleted_at` datetime NOT NULL,
  `expires_at` datetime GENERATED ALWAYS AS ((`deleted_at` + interval 30 day)) VIRTUAL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `trash_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trash`
--

LOCK TABLES `trash` WRITE;
/*!40000 ALTER TABLE `trash` DISABLE KEYS */;
INSERT INTO `trash` (`id`, `user_id`, `note_id`, `title`, `content`, `course_id`, `deleted_at`) VALUES (8,13,34,'Untitled','',NULL,'2025-12-01 14:06:09'),(9,13,33,'Untitled','',NULL,'2025-12-01 14:06:13'),(10,13,37,'','',NULL,'2025-12-01 15:15:57'),(11,13,36,'','',NULL,'2025-12-01 15:16:02'),(12,13,35,'','',NULL,'2025-12-01 15:16:06'),(14,13,38,'iish','okookok',NULL,'2025-12-01 15:45:55');
/*!40000 ALTER TABLE `trash` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `username_2` (`username`),
  UNIQUE KEY `email_2` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (13,'Tarek','Khatib','tarekhatib','tarekalkhatibb@gmail.com','$2b$10$242BosbpzaDyh4SxjwhfM.Skek7OXkuzUZa5OfeRMP3BzO2Sgtk2u',NULL,'2025-10-19 11:02:28'),(28,'Ramy','Khachab','rkdgoat','ramykhachab@gmail.com','$2b$10$Lm060cfMTj6GrIxsO0LATeAYsBe80HmRQa5VkPFMkdSIluFREGxza',NULL,'2025-11-30 21:33:29'),(29,'Test','User','testuser','test@gmail.com','$2b$10$.GLWlXozCEiUG6vLislr..MryO1DYiR04i.UFkycTAROzmf3h1Tyu',NULL,'2025-11-30 21:35:31');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-02  1:25:13
