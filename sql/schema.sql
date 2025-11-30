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
INSERT INTO `courses` VALUES (13,13,'Calculus III'),(11,13,'Lab Software Design');
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
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notes`
--

LOCK TABLES `notes` WRITE;
/*!40000 ALTER TABLE `notes` DISABLE KEYS */;
INSERT INTO `notes` VALUES (27,13,'Untitled','BALBLABABBALABBALBLABLABBALBABALBLABABBALABBALBLABLABBALBABALBLABABBALABBALBLABLABBALBABALBLABABBALABBALBLABLABBALBABALBLABABBALABBALBLABLABBALBABALBLABABBALABBALBLABLABBALBABALBLABABBALABBALBLABLABBALBA',NULL,NULL,'2025-11-30 18:50:08');
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
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pomodoro_sessions`
--

LOCK TABLES `pomodoro_sessions` WRITE;
/*!40000 ALTER TABLE `pomodoro_sessions` DISABLE KEYS */;
INSERT INTO `pomodoro_sessions` VALUES (4,13,'2025-11-17 14:04:05',1),(5,13,'2025-11-17 15:21:57',1),(6,13,'2025-11-30 15:33:28',25),(7,13,'2025-11-30 17:28:04',17),(8,13,'2025-11-30 17:28:04',23),(9,13,'2025-11-30 17:28:04',11),(10,13,'2025-11-30 17:28:04',19),(11,13,'2025-11-30 17:28:04',14),(12,13,'2025-11-30 17:28:04',25),(13,13,'2025-11-30 17:28:04',12),(14,13,'2025-11-30 17:28:04',21),(15,13,'2025-11-30 17:28:04',16),(16,13,'2025-11-30 17:28:04',24),(17,13,'2025-11-30 17:29:44',22),(18,13,'2025-11-30 17:29:45',13),(19,13,'2025-11-30 17:29:45',18),(20,13,'2025-11-30 17:29:45',24),(21,13,'2025-11-30 17:29:45',15),(22,13,'2025-11-30 17:29:45',11),(23,13,'2025-11-30 17:29:45',25),(24,13,'2025-11-30 17:29:45',12),(25,13,'2025-11-30 17:29:45',21),(26,13,'2025-11-30 17:29:45',14),(27,13,'2025-11-30 17:29:45',19),(28,13,'2025-11-30 17:29:45',23),(29,13,'2025-11-30 17:29:45',10),(30,13,'2025-11-30 17:29:45',17),(31,13,'2025-11-30 17:29:45',16),(32,13,'2025-11-30 17:29:45',20),(33,13,'2025-11-30 17:29:45',25),(34,13,'2025-11-30 17:29:45',22),(35,13,'2025-11-30 17:29:45',11),(36,13,'2025-11-30 17:29:45',18),(37,13,'2025-11-30 17:29:45',12),(38,13,'2025-11-30 17:29:45',24),(39,13,'2025-11-30 17:29:45',15),(40,13,'2025-11-30 17:29:45',22),(41,13,'2025-11-30 17:29:45',14),(42,13,'2025-11-30 17:29:45',23),(43,13,'2025-11-30 17:29:45',13),(44,13,'2025-11-30 17:29:45',16),(45,13,'2025-11-30 17:29:45',19),(46,13,'2025-11-30 17:29:45',10);
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
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (44,13,'7da865376d135912d39697f04e8c79f9637b06a060bc0c901d5c08c9baf89e9a','2025-12-04 15:01:25',0,'2025-11-27 13:01:25'),(45,13,'907c53777602c7ea3589150c43b7084a7fb053cb58219c358e37020453cbae80','2025-12-04 20:33:01',0,'2025-11-27 18:33:01'),(46,13,'9081980614c007270f090a1d2c6cd72c5c3c61423db5781e3be519f152ee8102','2025-12-06 00:51:56',0,'2025-11-28 22:51:56'),(47,13,'a02da056c90ca34b323ffbb3b51e31b03f27e6a51247763299e4c2b077419005','2025-12-06 10:33:37',0,'2025-11-29 08:33:37'),(48,13,'5d47e44b67339ff63f4729b2849676e3a6e6345f802caa04729a3bcbb8c7d182','2025-12-06 10:45:58',0,'2025-11-29 08:45:58'),(49,13,'0aa12a45e23b550b31d1ca5ef5cd90029d0218e70f31e4c2fc9292dd9c32c06e','2025-12-06 10:50:18',0,'2025-11-29 08:50:18'),(51,13,'94aa53fd8e6868af279d1a0b37dcf956a41eb7ec55454fac515a32371a6ded00','2025-12-06 19:48:34',0,'2025-11-29 17:48:34'),(54,13,'803596b2ab3e9b5eb18947b9f6b80584c1a73e89774a53bd635118033b8222a8','2025-12-07 17:57:56',0,'2025-11-30 15:57:56'),(56,13,'567728df945048606684a67104d826996c0a1472349e15a84e0075c3d1f1bfcb','2025-12-07 18:55:25',0,'2025-11-30 16:55:25'),(58,13,'bdc9577a40e788283f46ac9aa9b7c073d341f3aca647e0d0d1fb9e74618e1067','2025-12-07 19:36:57',0,'2025-11-30 17:36:57'),(59,13,'2eb762946932a76d3143f7d9b9ddf8a7649b5f5c801e47c3005ada93c0fe2aea','2025-12-07 20:02:45',0,'2025-11-30 18:02:45');
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
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (44,13,'Test','',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trash`
--

LOCK TABLES `trash` WRITE;
/*!40000 ALTER TABLE `trash` DISABLE KEYS */;
INSERT INTO `trash` (`id`, `user_id`, `note_id`, `title`, `content`, `course_id`, `deleted_at`) VALUES (3,13,24,'Test Note','This is a note that has no value whatsoever in my life',11,'2025-11-29 21:11:35'),(4,13,25,'Sequential Diagrams','Blablablablablablabbalbla',11,'2025-11-29 21:21:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (13,'Tarek','Khatib','tarekhatib','tarekalkhatibb@gmail.com','$2b$10$242BosbpzaDyh4SxjwhfM.Skek7OXkuzUZa5OfeRMP3BzO2Sgtk2u','/uploads/profile_pics/13_pfp.png','2025-10-19 11:02:28');
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

-- Dump completed on 2025-11-30 21:14:32
