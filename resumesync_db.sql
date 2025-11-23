-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 23, 2025 at 05:52 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `resumesync_db`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `CleanExpiredSessions` ()   BEGIN
    DELETE FROM sessions WHERE expires_at < NOW();
    SELECT ROW_COUNT() AS deleted_sessions;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `CreateResumeWithSections` (IN `p_user_id` INT, IN `p_resume_title` VARCHAR(255), IN `p_template_name` VARCHAR(100), OUT `p_resume_id` INT)   BEGIN
    -- Insert resume
    INSERT INTO resumes (user_id, resume_title, template_name, status)
    VALUES (p_user_id, p_resume_title, p_template_name, 'draft');

    SET p_resume_id = LAST_INSERT_ID();

    -- Create default sections
    INSERT INTO resume_sections (resume_id, section_type, section_title, display_order)
    VALUES
        (p_resume_id, 'experience', 'Work Experience', 1),
        (p_resume_id, 'education', 'Education', 2),
        (p_resume_id, 'skills', 'Skills', 3);

    -- Update template usage count
    UPDATE templates
    SET usage_count = usage_count + 1
    WHERE template_name = p_template_name;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetResumeDetails` (IN `p_resume_id` INT)   BEGIN
    -- Resume basic info
    SELECT
        r.*,
        u.full_name,
        u.email,
        u.phone,
        t.template_display_name
    FROM resumes r
    JOIN users u ON r.user_id = u.user_id
    LEFT JOIN templates t ON r.template_id = t.template_id
    WHERE r.resume_id = p_resume_id;

    -- Resume sections
    SELECT * FROM resume_sections
    WHERE resume_id = p_resume_id AND is_visible = TRUE
    ORDER BY display_order;

    -- Latest ATS score
    SELECT * FROM ats_scores
    WHERE resume_id = p_resume_id
    ORDER BY created_at DESC
    LIMIT 1;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetUserCompleteProfile` (IN `p_user_id` INT)   BEGIN
    -- User basic info
    SELECT * FROM users WHERE user_id = p_user_id;

    -- Education
    SELECT * FROM user_education WHERE user_id = p_user_id ORDER BY display_order, end_date DESC;

    -- Experience
    SELECT * FROM user_experience WHERE user_id = p_user_id ORDER BY display_order, end_date DESC;

    -- Skills
    SELECT * FROM user_skills WHERE user_id = p_user_id ORDER BY display_order;

    -- Resumes
    SELECT * FROM resumes WHERE user_id = p_user_id ORDER BY updated_at DESC;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `LogActivity` (IN `p_user_id` INT, IN `p_activity_type` VARCHAR(100), IN `p_activity_description` TEXT, IN `p_ip_address` VARCHAR(45), IN `p_user_agent` TEXT)   BEGIN
    INSERT INTO activity_logs (user_id, activity_type, activity_description, ip_address, user_agent)
    VALUES (p_user_id, p_activity_type, p_activity_description, p_ip_address, p_user_agent);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `log_id` bigint(20) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `activity_type` varchar(100) NOT NULL,
  `activity_description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`log_id`, `user_id`, `activity_type`, `activity_description`, `ip_address`, `user_agent`, `metadata`, `created_at`) VALUES
(1, 1, 'resume_created', 'Resume created: Senior Software Engineer - Tech Companies', NULL, NULL, NULL, '2025-11-22 09:30:40'),
(2, 1, 'resume_created', 'Resume created: Full Stack Developer - Startups', NULL, NULL, NULL, '2025-11-22 09:30:40'),
(3, 2, 'resume_created', 'Resume created: UX Designer - Product Companies', NULL, NULL, NULL, '2025-11-22 09:30:40'),
(4, 2, 'resume_created', 'Resume created: UI/UX Designer - Creative Role', NULL, NULL, NULL, '2025-11-22 09:30:40'),
(5, 3, 'resume_created', 'Resume created: Data Scientist - AI/ML Focus', NULL, NULL, NULL, '2025-11-22 09:30:40'),
(6, 4, 'resume_created', 'Resume created: Marketing Manager - Digital Focus', NULL, NULL, NULL, '2025-11-22 09:30:40'),
(7, 5, 'resume_created', 'Resume created: Senior Product Manager', NULL, NULL, NULL, '2025-11-22 09:30:40'),
(8, 5, 'resume_created', 'Resume created: Product Manager - Early Career', NULL, NULL, NULL, '2025-11-22 09:30:40'),
(9, 6, 'resume_created', 'Resume created: Graphic Designer Portfolio', NULL, NULL, NULL, '2025-11-22 09:30:40'),
(10, 7, 'resume_created', 'Resume created: Financial Analyst - Investment Banking', NULL, NULL, NULL, '2025-11-22 09:30:40'),
(11, 8, 'resume_created', 'Resume created: Registered Nurse - ICU', NULL, NULL, NULL, '2025-11-22 09:30:40'),
(12, 9, 'resume_created', 'Resume created: Corporate Attorney - M&A', NULL, NULL, NULL, '2025-11-22 09:30:40'),
(13, 10, 'resume_created', 'Resume created: Mathematics Teacher', NULL, NULL, NULL, '2025-11-22 09:30:40'),
(14, 1, 'login', 'User logged in', '192.168.1.100', NULL, NULL, '2025-11-22 02:30:00'),
(15, 1, 'resume_updated', 'Updated resume: Senior Software Engineer - Tech Companies', '192.168.1.100', NULL, NULL, '2025-11-22 02:45:00'),
(16, 1, 'ats_check', 'Ran ATS check on resume ID 1', '192.168.1.100', NULL, NULL, '2025-11-22 03:00:00'),
(17, 2, 'login', 'User logged in', '192.168.1.105', NULL, NULL, '2025-11-21 10:45:00'),
(18, 2, 'resume_created', 'Created new resume: UI/UX Designer - Creative Role', '192.168.1.105', NULL, NULL, '2025-11-21 11:00:00'),
(19, 3, 'login', 'User logged in', '192.168.1.110', NULL, NULL, '2025-11-22 02:00:00'),
(20, 3, 'profile_updated', 'Updated professional summary', '192.168.1.110', NULL, NULL, '2025-11-22 02:15:00'),
(21, 4, 'login', 'User logged in', '192.168.1.115', NULL, NULL, '2025-11-21 13:15:00'),
(22, 4, 'resume_downloaded', 'Downloaded resume ID 6', '192.168.1.115', NULL, NULL, '2025-11-21 13:30:00'),
(23, 5, 'login', 'User logged in', '192.168.1.120', NULL, NULL, '2025-11-19 06:00:00'),
(24, 5, 'resume_shared', 'Shared resume ID 7 via link', '192.168.1.120', NULL, NULL, '2025-11-19 06:15:00'),
(25, 6, 'login', 'User logged in', '192.168.1.125', NULL, NULL, '2025-11-20 05:30:00'),
(26, 6, 'education_added', 'Added education entry: General Assembly', '192.168.1.125', NULL, NULL, '2025-11-20 05:45:00'),
(27, 7, 'login', 'User logged in', '192.168.1.130', NULL, NULL, '2025-11-22 03:45:00'),
(28, 7, 'ats_check', 'Ran ATS check on resume ID 10', '192.168.1.130', NULL, NULL, '2025-11-22 04:00:00'),
(29, 8, 'login', 'User logged in', '192.168.1.135', NULL, NULL, '2025-11-18 11:20:00'),
(30, 8, 'profile_photo_updated', 'Updated profile photo', '192.168.1.135', NULL, NULL, '2025-11-18 11:30:00'),
(31, 9, 'login', 'User logged in', '192.168.1.140', NULL, NULL, '2025-11-21 04:15:00'),
(32, 9, 'resume_updated', 'Updated resume: Corporate Attorney - M&A', '192.168.1.140', NULL, NULL, '2025-11-21 04:30:00'),
(33, 10, 'login', 'User logged in', '192.168.1.145', NULL, NULL, '2025-11-20 07:00:00'),
(34, 10, 'experience_added', 'Added work experience: Denver South High School', '192.168.1.145', NULL, NULL, '2025-11-20 07:15:00'),
(35, 1, 'logout', 'User logged out', '192.168.1.100', NULL, NULL, '2025-11-22 04:00:00'),
(36, 2, 'logout', 'User logged out', '192.168.1.105', NULL, NULL, '2025-11-21 12:00:00'),
(37, 3, 'logout', 'User logged out', '192.168.1.110', NULL, NULL, '2025-11-22 03:00:00'),
(38, 4, 'logout', 'User logged out', '192.168.1.115', NULL, NULL, '2025-11-21 14:00:00'),
(39, 5, 'logout', 'User logged out', '192.168.1.120', NULL, NULL, '2025-11-19 07:00:00'),
(40, 11, 'registration', 'User registered successfully', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', NULL, '2025-11-22 10:12:15'),
(41, 11, 'login', 'User logged in', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', NULL, '2025-11-22 10:12:34'),
(42, 11, 'logout', 'User logged out', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', NULL, '2025-11-22 10:37:54'),
(43, 11, 'resume_created', 'Resume created: ok', NULL, NULL, NULL, '2025-11-22 17:14:11'),
(44, 11, 'resume_created', 'Resume created: CS Job', NULL, NULL, NULL, '2025-11-22 21:52:08');

-- --------------------------------------------------------

--
-- Table structure for table `application_activity`
--

CREATE TABLE `application_activity` (
  `activity_id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `activity_type` varchar(100) NOT NULL,
  `activity_description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `application_activity`
--

INSERT INTO `application_activity` (`activity_id`, `application_id`, `activity_type`, `activity_description`, `created_at`) VALUES
(1, 1, 'created', 'Application created for SWE at Google', '2025-11-22 21:08:53'),
(2, 1, 'status_changed', 'Status changed from \'Applied\' to \'Interview Scheduled\' for SWE at Google', '2025-11-22 21:12:58'),
(3, 2, 'created', 'Application created for aa at Dhaka', '2025-11-22 21:23:52');

-- --------------------------------------------------------

--
-- Table structure for table `application_timeline`
--

CREATE TABLE `application_timeline` (
  `timeline_id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `event_type` enum('application_submitted','status_changed','interview_scheduled','interview_completed','offer_received','follow_up','note_added','other') NOT NULL,
  `event_title` varchar(255) NOT NULL,
  `event_description` text DEFAULT NULL,
  `event_date` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `application_timeline`
--

INSERT INTO `application_timeline` (`timeline_id`, `application_id`, `event_type`, `event_title`, `event_description`, `event_date`, `created_at`) VALUES
(1, 1, 'application_submitted', 'Applied to SWE', 'Application submitted to Google for SWE position', '2025-11-22 00:00:00', '2025-11-22 21:23:46'),
(2, 2, 'application_submitted', 'Applied to aa', 'Application submitted to Dhaka for aa position', '2025-11-22 00:00:00', '2025-11-22 21:23:52'),
(3, 2, 'interview_scheduled', 'Interview Scheduled', 'Interview scheduled for aa at Dhaka at aa', '2025-11-21 03:22:00', '2025-11-22 21:23:52');

-- --------------------------------------------------------

--
-- Table structure for table `ats_scores`
--

CREATE TABLE `ats_scores` (
  `score_id` int(11) NOT NULL,
  `resume_id` int(11) NOT NULL,
  `overall_score` int(11) NOT NULL CHECK (`overall_score` between 0 and 100),
  `job_description` text DEFAULT NULL,
  `job_title` varchar(255) DEFAULT NULL,
  `keyword_score` int(11) DEFAULT NULL CHECK (`keyword_score` between 0 and 100),
  `formatting_score` int(11) DEFAULT NULL CHECK (`formatting_score` between 0 and 100),
  `experience_score` int(11) DEFAULT NULL CHECK (`experience_score` between 0 and 100),
  `education_score` int(11) DEFAULT NULL CHECK (`education_score` between 0 and 100),
  `analysis_results` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`analysis_results`)),
  `recommendations` text DEFAULT NULL,
  `matched_keywords` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`matched_keywords`)),
  `missing_keywords` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`missing_keywords`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ats_scores`
--

INSERT INTO `ats_scores` (`score_id`, `resume_id`, `overall_score`, `job_description`, `job_title`, `keyword_score`, `formatting_score`, `experience_score`, `education_score`, `analysis_results`, `recommendations`, `matched_keywords`, `missing_keywords`, `created_at`) VALUES
(1, 1, 92, 'We are seeking a Senior Software Engineer with strong experience in cloud architecture, microservices, and team leadership. Required: 5+ years experience, React, Node.js, AWS. Preferred: Kubernetes, system design.', 'Senior Software Engineer', 95, 90, 94, 88, '{\"strengths\": [\"Strong technical skills match\", \"Relevant leadership experience\", \"Cloud architecture expertise\"], \"weaknesses\": [\"Could add more specific metrics\"]}', 'Excellent match! Consider adding more quantifiable achievements. Mention specific AWS services used.', '[\"React\", \"Node.js\", \"AWS\", \"Kubernetes\", \"cloud architecture\", \"microservices\", \"team leadership\"]', '[\"CI/CD\", \"specific AWS services\"]', '2025-11-15 04:30:00'),
(2, 1, 88, 'Looking for Full Stack Developer for startup environment. Must have: JavaScript, React, Node.js, PostgreSQL. Bonus: Docker, AWS, startup experience.', 'Full Stack Developer', 90, 85, 92, 80, '{\"strengths\": [\"Perfect technical stack match\", \"Startup experience\"], \"weaknesses\": [\"Resume is more senior-focused\"]}', 'Great fit! Emphasize your startup experience. Add PostgreSQL projects if applicable.', '[\"JavaScript\", \"React\", \"Node.js\", \"Docker\", \"AWS\", \"startup\"]', '[\"PostgreSQL\"]', '2025-11-18 08:20:00'),
(3, 3, 94, 'Senior UX Designer needed for product team. Requirements: 5+ years UX design, Figma expertise, user research experience, design systems. Must have portfolio.', 'Senior UX Designer', 96, 92, 95, 90, '{\"strengths\": [\"Extensive UX experience\", \"Strong Figma skills\", \"User research background\", \"Design system experience\"], \"weaknesses\": [\"None significant\"]}', 'Outstanding match! Your experience aligns perfectly. Ensure portfolio link is prominent.', '[\"UX design\", \"Figma\", \"user research\", \"design systems\", \"Adobe\", \"prototyping\"]', '[]', '2025-11-10 03:15:00'),
(4, 5, 90, 'Hiring Data Scientist for ML team. Required: PhD or Masters in quantitative field, Python, machine learning, deep learning frameworks. Experience with production ML systems.', 'Senior Data Scientist', 92, 88, 91, 95, '{\"strengths\": [\"PhD in Data Science\", \"Strong ML background\", \"Production ML experience\", \"Deep learning expertise\"], \"weaknesses\": [\"Could mention more specific projects\"]}', 'Excellent candidate! Highlight specific ML models deployed to production. Add project outcomes.', '[\"PhD\", \"Python\", \"machine learning\", \"TensorFlow\", \"PyTorch\", \"production ML\"]', '[\"specific ML projects\", \"model performance metrics\"]', '2025-11-16 05:45:00'),
(5, 6, 87, 'Marketing Manager position. Need 5+ years digital marketing, proven track record in SEO, content strategy, team management. MBA preferred.', 'Marketing Manager', 85, 90, 88, 85, '{\"strengths\": [\"Strong digital marketing background\", \"Team management\", \"MBA\"], \"weaknesses\": [\"Could add more SEO specifics\"]}', 'Strong match! Add specific SEO achievements and metrics. Highlight team size managed.', '[\"digital marketing\", \"SEO\", \"content strategy\", \"team management\", \"MBA\"]', '[\"conversion optimization\", \"marketing automation tools\"]', '2025-11-14 07:30:00'),
(6, 7, 93, 'Senior Product Manager for consumer app with 50M+ users. Required: 6+ years PM experience, technical background, data-driven, proven track record shipping products.', 'Senior Product Manager', 94, 92, 95, 90, '{\"strengths\": [\"Strong PM experience\", \"Technical background\", \"Large scale product experience\", \"Data-driven approach\"], \"weaknesses\": [\"Could add more specific metrics\"]}', 'Exceptional fit! Emphasize the 50M+ users you\'ve served at Spotify. Add specific product metrics.', '[\"Product Manager\", \"6+ years\", \"technical background\", \"data-driven\", \"large scale\", \"MBA\"]', '[\"specific product KPIs\"]', '2025-11-17 04:00:00'),
(7, 9, 91, 'Graphic Designer for major brand. Need: Strong portfolio, Adobe Creative Suite expert, branding experience, print and digital design. Agency or brand experience.', 'Senior Graphic Designer', 90, 95, 92, 87, '{\"strengths\": [\"Strong Adobe skills\", \"Branding experience\", \"Brand experience at Nike\", \"Print and digital\"], \"weaknesses\": [\"Could emphasize portfolio more\"]}', 'Great match! Make portfolio link very prominent. Showcase Nike branding work.', '[\"Adobe Photoshop\", \"Adobe Illustrator\", \"branding\", \"print design\", \"digital design\", \"Nike\"]', '[\"motion graphics\"]', '2025-11-13 09:00:00'),
(8, 10, 89, 'Senior Financial Analyst for investment bank. CFA required or in progress. Need strong Excel, financial modeling, valuation. 5+ years experience.', 'Senior Financial Analyst', 88, 90, 90, 88, '{\"strengths\": [\"CFA Level II candidate\", \"Strong Excel skills\", \"Financial modeling\", \"Investment banking experience\"], \"weaknesses\": [\"Could add deal sizes\"]}', 'Strong candidate! Mention specific deal sizes and transaction values. Complete CFA if possible.', '[\"CFA\", \"Excel\", \"financial modeling\", \"valuation\", \"investment bank\", \"Goldman Sachs\"]', '[\"deal sizes\", \"transaction values\"]', '2025-11-11 10:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `job_applications`
--

CREATE TABLE `job_applications` (
  `application_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `resume_id` int(11) DEFAULT NULL,
  `company_name` varchar(255) NOT NULL,
  `job_title` varchar(255) NOT NULL,
  `job_location` varchar(255) DEFAULT NULL,
  `job_type` enum('Full-time','Part-time','Contract','Internship','Freelance') DEFAULT 'Full-time',
  `salary_range` varchar(100) DEFAULT NULL,
  `application_date` date NOT NULL,
  `status` enum('Applied','In Review','Interview Scheduled','Interview Completed','Offer Received','Accepted','Rejected','Withdrawn') DEFAULT 'Applied',
  `application_url` varchar(500) DEFAULT NULL,
  `job_description` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(50) DEFAULT NULL,
  `follow_up_date` date DEFAULT NULL,
  `interview_date` datetime DEFAULT NULL,
  `interview_location` varchar(500) DEFAULT NULL,
  `interview_notes` text DEFAULT NULL,
  `priority` enum('Low','Medium','High') DEFAULT 'Medium',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `job_applications`
--

INSERT INTO `job_applications` (`application_id`, `user_id`, `resume_id`, `company_name`, `job_title`, `job_location`, `job_type`, `salary_range`, `application_date`, `status`, `application_url`, `job_description`, `notes`, `contact_person`, `contact_email`, `contact_phone`, `follow_up_date`, `interview_date`, `interview_location`, `interview_notes`, `priority`, `created_at`, `updated_at`) VALUES
(1, 11, NULL, 'Google', 'SWE', 'Dhaka', 'Contract', '10K', '2025-11-22', 'Interview Scheduled', '', NULL, '', '', '', NULL, NULL, '2025-11-26 04:54:00', '', '', 'Medium', '2025-11-22 21:08:53', '2025-11-22 22:54:54'),
(2, 11, NULL, 'Dhaka', 'aa', 'aaa', 'Full-time', '11', '2025-11-22', 'Interview Scheduled', 'http://aa.com', NULL, 'aa', 'aaaa', 'aa@aa.aaaa', NULL, NULL, '2025-11-21 03:22:00', 'aa', 'aa', 'Medium', '2025-11-22 21:23:52', '2025-11-22 21:23:52');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `application_id` int(11) DEFAULT NULL,
  `notification_type` enum('interview_reminder','follow_up_reminder','status_update','general') DEFAULT 'general',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `link` varchar(500) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `scheduled_for` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `user_id`, `application_id`, `notification_type`, `title`, `message`, `link`, `is_read`, `created_at`, `scheduled_for`) VALUES
(2, 11, 1, 'interview_reminder', 'Interview Scheduled in 3 days', 'You have an interview with Google for the position of SWE on Nov 26, 2025 at 4:54 AM', 'dashboard.php#applications', 1, '2025-11-22 23:01:48', '2025-11-26 04:54:00');

-- --------------------------------------------------------

--
-- Stand-in structure for view `recent_activity`
-- (See below for the actual view)
--
CREATE TABLE `recent_activity` (
`log_id` bigint(20)
,`user_id` int(11)
,`full_name` varchar(255)
,`email` varchar(255)
,`activity_type` varchar(100)
,`activity_description` text
,`ip_address` varchar(45)
,`created_at` timestamp
);

-- --------------------------------------------------------

--
-- Table structure for table `resumes`
--

CREATE TABLE `resumes` (
  `resume_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `template_id` int(11) DEFAULT 1,
  `resume_title` varchar(255) NOT NULL,
  `template_name` varchar(100) DEFAULT 'classic',
  `personal_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`personal_details`)),
  `summary_text` text DEFAULT NULL,
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `share_token` varchar(64) DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 0,
  `shared_at` timestamp NULL DEFAULT NULL,
  `view_count` int(11) DEFAULT 0,
  `download_count` int(11) DEFAULT 0,
  `last_viewed_at` timestamp NULL DEFAULT NULL,
  `version` int(11) DEFAULT 1,
  `file_url` varchar(500) DEFAULT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_accessed` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `resumes`
--

INSERT INTO `resumes` (`resume_id`, `user_id`, `template_id`, `resume_title`, `template_name`, `personal_details`, `summary_text`, `status`, `share_token`, `is_public`, `shared_at`, `view_count`, `download_count`, `last_viewed_at`, `version`, `file_url`, `thumbnail_url`, `created_at`, `updated_at`, `last_accessed`) VALUES
(1, 11, 1, 'Senior Software Engineer - Tech Companies', 'classic', '{\"name\": \"John Doe\", \"email\": \"john.doe@email.com\", \"phone\": \"+1-555-0101\", \"location\": \"San Francisco, CA\"}', 'Experienced software engineer with 8+ years in full-stack development, specializing in React, Node.js, and cloud architecture.', 'published', NULL, 0, NULL, 0, 0, NULL, 1, NULL, NULL, '2024-06-01 04:00:00', '2025-11-22 14:23:53', '2025-11-20 03:15:00'),
(2, 1, 2, 'Full Stack Developer - Startups', 'modern', '{\"name\": \"John Doe\", \"email\": \"john.doe@email.com\", \"phone\": \"+1-555-0101\", \"location\": \"San Francisco, CA\"}', 'Full-stack developer passionate about building scalable applications and innovative solutions.', 'draft', NULL, 0, NULL, 0, 0, NULL, 1, NULL, NULL, '2024-08-15 05:30:00', '2025-11-18 10:45:00', '2025-11-18 10:45:00'),
(3, 2, 2, 'UX Designer - Product Companies', 'modern', '{\"name\": \"Sarah Johnson\", \"email\": \"sarah.johnson@email.com\", \"phone\": \"+1-555-0102\", \"location\": \"Austin, TX\"}', 'Creative UX designer with a keen eye for detail and user-centered design principles.', 'published', NULL, 0, NULL, 0, 0, NULL, 1, NULL, NULL, '2024-07-20 03:00:00', '2025-11-10 05:20:00', '2025-11-21 04:30:00'),
(4, 2, 3, 'UI/UX Designer - Creative Role', 'creative', '{\"name\": \"Sarah Johnson\", \"email\": \"sarah.johnson@email.com\", \"phone\": \"+1-555-0102\", \"location\": \"Austin, TX\"}', 'Award-winning designer specializing in creating beautiful and intuitive user experiences.', 'published', NULL, 0, NULL, 0, 0, NULL, 1, NULL, NULL, '2024-09-05 08:15:00', '2025-11-12 07:00:00', '2025-11-19 09:20:00'),
(5, 3, 1, 'Data Scientist - AI/ML Focus', 'classic', '{\"name\": \"Michael Chen\", \"email\": \"michael.chen@email.com\", \"phone\": \"+1-555-0103\", \"location\": \"Seattle, WA\"}', 'Data scientist specializing in machine learning and predictive analytics with strong statistical background.', 'published', NULL, 0, NULL, 0, 0, NULL, 1, NULL, NULL, '2024-08-10 04:30:00', '2025-11-16 04:00:00', '2025-11-22 02:00:00'),
(6, 4, 2, 'Marketing Manager - Digital Focus', 'modern', '{\"name\": \"Emily Rodriguez\", \"email\": \"emily.rodriguez@email.com\", \"phone\": \"+1-555-0104\", \"location\": \"Boston, MA\"}', 'Results-driven marketing professional with expertise in digital marketing and content strategy.', 'published', NULL, 0, NULL, 0, 0, NULL, 1, NULL, NULL, '2024-09-20 09:00:00', '2025-11-14 06:30:00', '2025-11-21 08:00:00'),
(7, 5, 4, 'Senior Product Manager', 'executive', '{\"name\": \"David Kim\", \"email\": \"david.kim@email.com\", \"phone\": \"+1-555-0105\", \"location\": \"New York, NY\"}', 'Strategic product manager with 6+ years experience driving product vision and roadmap.', 'published', NULL, 0, NULL, 0, 0, NULL, 1, NULL, NULL, '2024-10-01 03:30:00', '2025-11-17 05:15:00', '2025-11-19 03:45:00'),
(8, 5, 1, 'Product Manager - Early Career', 'classic', '{\"name\": \"David Kim\", \"email\": \"david.kim@email.com\", \"phone\": \"+1-555-0105\", \"location\": \"New York, NY\"}', 'Product manager with consulting background and strong analytical skills.', 'archived', NULL, 0, NULL, 0, 0, NULL, 1, NULL, NULL, '2024-05-15 04:00:00', '2024-10-01 03:00:00', '2024-11-01 04:00:00'),
(9, 6, 3, 'Graphic Designer Portfolio', 'creative', '{\"name\": \"Lisa Anderson\", \"email\": \"lisa.anderson@email.com\", \"phone\": \"+1-555-0106\", \"location\": \"Los Angeles, CA\"}', 'Award-winning graphic designer specializing in branding, print, and digital media.', 'published', NULL, 0, NULL, 0, 0, NULL, 1, NULL, NULL, '2024-11-01 05:00:00', '2025-11-13 09:30:00', '2025-11-20 06:00:00'),
(10, 7, 4, 'Financial Analyst - Investment Banking', 'executive', '{\"name\": \"James Wilson\", \"email\": \"james.wilson@email.com\", \"phone\": \"+1-555-0107\", \"location\": \"Chicago, IL\"}', 'Detail-oriented financial analyst with expertise in financial modeling and valuation. CFA Level II candidate.', 'published', NULL, 0, NULL, 0, 0, NULL, 1, NULL, NULL, '2024-10-15 07:00:00', '2025-11-11 08:00:00', '2025-11-22 01:30:00'),
(11, 8, 1, 'Registered Nurse - ICU', 'classic', '{\"name\": \"Maria Garcia\", \"email\": \"maria.garcia@email.com\", \"phone\": \"+1-555-0108\", \"location\": \"Miami, FL\"}', 'Compassionate registered nurse with critical care experience and strong clinical skills.', 'published', NULL, 0, NULL, 0, 0, NULL, 1, NULL, NULL, '2024-11-10 04:00:00', '2025-11-09 03:00:00', '2025-11-18 10:00:00'),
(12, 9, 4, 'Corporate Attorney - M&A', 'executive', '{\"name\": \"Robert Taylor\", \"email\": \"robert.taylor@email.com\", \"phone\": \"+1-555-0109\", \"location\": \"Washington, DC\"}', 'Experienced corporate attorney specializing in mergers & acquisitions and corporate governance.', 'published', NULL, 0, NULL, 0, 0, NULL, 1, NULL, NULL, '2024-10-20 08:30:00', '2025-11-08 04:30:00', '2025-11-21 02:45:00'),
(13, 10, 2, 'Mathematics Teacher', 'modern', '{\"name\": \"Jennifer Brown\", \"email\": \"jennifer.brown@email.com\", \"phone\": \"+1-555-0110\", \"location\": \"Denver, CO\"}', 'Enthusiastic educator passionate about inspiring students in mathematics and computer science.', 'published', NULL, 0, NULL, 0, 0, NULL, 1, NULL, NULL, '2024-11-05 03:00:00', '2025-11-07 07:00:00', '2025-11-20 05:00:00'),
(14, 11, 1, 'ok', 'classic', '{\"fullName\":\"Mahbubur Rahman Khan\",\"professionalTitle\":\"\",\"email\":\"mahbubkousar@gmail.com\",\"phone\":\"01753019520\",\"location\":\"\",\"linkedin\":\"\"}', '', 'draft', 'ea78f1a4f7dfeb1f030a5ddf9b539ffca2fb8947dae0eba09bd57017734f7ee6', 0, '2025-11-22 22:15:16', 2, 1, '2025-11-22 22:45:49', 1, NULL, NULL, '2025-11-22 17:14:11', '2025-11-22 22:46:05', NULL),
(15, 11, 1, 'CS Job', 'professional', '{\"fullName\":\"Mahbubur Rahman Khan\",\"professionalTitle\":\"Software Engineer\",\"email\":\"mahbubkousar@gmail.com\",\"phone\":\"01753019520\",\"location\":\"Dhaka\",\"linkedin\":\"\\/in\\/mahbubur-khan\"}', 'I am very passionate about this matter.', 'draft', NULL, 0, NULL, 0, 0, NULL, 1, NULL, NULL, '2025-11-22 21:52:08', '2025-11-22 21:56:45', NULL);

--
-- Triggers `resumes`
--
DELIMITER $$
CREATE TRIGGER `after_resume_insert` AFTER INSERT ON `resumes` FOR EACH ROW BEGIN
    INSERT INTO activity_logs (user_id, activity_type, activity_description)
    VALUES (NEW.user_id, 'resume_created', CONCAT('Resume created: ', NEW.resume_title));
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `before_resume_delete` BEFORE DELETE ON `resumes` FOR EACH ROW BEGIN
    INSERT INTO activity_logs (user_id, activity_type, activity_description)
    VALUES (OLD.user_id, 'resume_deleted', CONCAT('Resume deleted: ', OLD.resume_title));
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `resume_downloads`
--

CREATE TABLE `resume_downloads` (
  `download_id` bigint(20) NOT NULL,
  `resume_id` int(11) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `downloaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `resume_downloads`
--

INSERT INTO `resume_downloads` (`download_id`, `resume_id`, `ip_address`, `downloaded_at`) VALUES
(1, 14, '::1', '2025-11-22 22:45:40');

-- --------------------------------------------------------

--
-- Table structure for table `resume_sections`
--

CREATE TABLE `resume_sections` (
  `section_id` int(11) NOT NULL,
  `resume_id` int(11) NOT NULL,
  `section_type` enum('experience','education','skills','certifications','projects','custom') NOT NULL,
  `section_title` varchar(255) DEFAULT NULL,
  `section_content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`section_content`)),
  `display_order` int(11) DEFAULT 0,
  `is_visible` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `resume_sections`
--

INSERT INTO `resume_sections` (`section_id`, `resume_id`, `section_type`, `section_title`, `section_content`, `display_order`, `is_visible`, `created_at`, `updated_at`) VALUES
(1, 1, 'experience', 'Professional Experience', '[{\"company\": \"Google\", \"title\": \"Senior Software Engineer\", \"dates\": \"2019 - Present\", \"description\": \"Lead development of cloud infrastructure serving 100M+ users\"}, {\"company\": \"Facebook\", \"title\": \"Software Engineer\", \"dates\": \"2016 - 2019\", \"description\": \"Developed features for News Feed reaching 2B+ users\"}]', 1, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(2, 1, 'education', 'Education', '[{\"school\": \"Stanford University\", \"degree\": \"MS Computer Science\", \"year\": \"2014\"}, {\"school\": \"UC Berkeley\", \"degree\": \"BS Computer Engineering\", \"year\": \"2012\"}]', 2, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(3, 1, 'skills', 'Technical Skills', '{\"skills\": \"JavaScript, React, Node.js, Python, AWS, Docker, Kubernetes, System Design\"}', 3, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(4, 3, 'experience', 'Work Experience', '[{\"company\": \"Adobe\", \"title\": \"Senior UX Designer\", \"dates\": \"2020 - Present\", \"description\": \"Lead UX design for Creative Cloud mobile applications\"}, {\"company\": \"Airbnb\", \"title\": \"UX Designer\", \"dates\": \"2017 - 2019\", \"description\": \"Designed intuitive interfaces resulting in 25% increase in conversions\"}]', 1, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(5, 3, 'education', 'Education', '[{\"school\": \"Rhode Island School of Design\", \"degree\": \"BFA Graphic Design\", \"year\": \"2014\"}]', 2, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(6, 3, 'skills', 'Skills', '{\"skills\": \"Figma, Adobe XD, User Research, Prototyping, Wireframing, Design Systems\"}', 3, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(7, 5, 'experience', 'Professional Experience', '[{\"company\": \"Amazon Web Services\", \"title\": \"Senior Data Scientist\", \"dates\": \"2020 - Present\", \"description\": \"Build ML models for demand forecasting and anomaly detection\"}, {\"company\": \"Microsoft\", \"title\": \"Data Scientist\", \"dates\": \"2017 - 2020\", \"description\": \"Developed recommendation algorithms for Azure Marketplace\"}]', 1, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(8, 5, 'education', 'Education', '[{\"school\": \"MIT\", \"degree\": \"PhD Data Science\", \"year\": \"2017\"}, {\"school\": \"Carnegie Mellon\", \"degree\": \"BS Statistics\", \"year\": \"2010\"}]', 2, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(9, 5, 'skills', 'Technical Skills', '{\"skills\": \"Python, R, Machine Learning, TensorFlow, PyTorch, SQL, Apache Spark\"}', 3, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40');

-- --------------------------------------------------------

--
-- Table structure for table `resume_shares`
--

CREATE TABLE `resume_shares` (
  `share_id` int(11) NOT NULL,
  `resume_id` int(11) NOT NULL,
  `share_token` varchar(255) NOT NULL,
  `share_type` enum('link','email','linkedin','twitter') DEFAULT 'link',
  `is_active` tinyint(1) DEFAULT 1,
  `password_protected` tinyint(1) DEFAULT 0,
  `password_hash` varchar(255) DEFAULT NULL,
  `expiry_date` datetime DEFAULT NULL,
  `view_count` int(11) DEFAULT 0,
  `last_viewed` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `resume_shares`
--

INSERT INTO `resume_shares` (`share_id`, `resume_id`, `share_token`, `share_type`, `is_active`, `password_protected`, `password_hash`, `expiry_date`, `view_count`, `last_viewed`, `created_at`) VALUES
(1, 1, 'abc123xyz789def456', 'link', 1, 0, NULL, NULL, 15, '2025-11-20 08:30:00', '2025-11-01 04:00:00'),
(2, 1, 'linkedin_share_001', 'linkedin', 1, 0, NULL, NULL, 8, '2025-11-19 10:00:00', '2025-11-05 05:30:00'),
(3, 3, 'uxdesigner_share_42', 'link', 1, 0, NULL, NULL, 22, '2025-11-21 03:15:00', '2025-10-28 08:00:00'),
(4, 5, 'datascience_xyz_789', 'link', 1, 0, NULL, NULL, 12, '2025-11-18 05:00:00', '2025-11-10 03:00:00'),
(5, 6, 'marketing_share_555', 'email', 1, 0, NULL, NULL, 5, '2025-11-17 09:30:00', '2025-11-12 04:30:00'),
(6, 7, 'pm_portfolio_abc123', 'link', 1, 0, NULL, NULL, 18, '2025-11-20 04:45:00', '2025-11-08 07:00:00'),
(7, 9, 'designer_work_xyz', 'link', 1, 0, NULL, NULL, 25, '2025-11-21 06:00:00', '2025-10-25 05:00:00'),
(8, 10, 'finance_resume_2024', 'link', 1, 0, NULL, NULL, 7, '2025-11-16 08:00:00', '2025-11-09 09:00:00'),
(9, 11, 'nurse_share_miami', 'email', 1, 0, NULL, NULL, 3, '2025-11-15 04:00:00', '2025-11-11 03:30:00'),
(10, 12, 'attorney_resume_dc', 'link', 1, 0, NULL, NULL, 9, '2025-11-19 07:30:00', '2025-11-07 06:00:00');

--
-- Triggers `resume_shares`
--
DELIMITER $$
CREATE TRIGGER `after_share_view` AFTER UPDATE ON `resume_shares` FOR EACH ROW BEGIN
    IF NEW.view_count > OLD.view_count THEN
        UPDATE resume_shares
        SET last_viewed = NOW()
        WHERE share_id = NEW.share_id;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in structure for view `resume_statistics`
-- (See below for the actual view)
--
CREATE TABLE `resume_statistics` (
`resume_id` int(11)
,`resume_title` varchar(255)
,`user_id` int(11)
,`user_name` varchar(255)
,`template_name` varchar(100)
,`status` enum('draft','published','archived')
,`created_at` timestamp
,`updated_at` timestamp
,`total_sections` bigint(21)
,`total_ats_checks` bigint(21)
,`best_ats_score` int(11)
,`total_shares` bigint(21)
,`total_views` decimal(32,0)
);

-- --------------------------------------------------------

--
-- Table structure for table `resume_views`
--

CREATE TABLE `resume_views` (
  `view_id` bigint(20) NOT NULL,
  `resume_id` int(11) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `referer` varchar(500) DEFAULT NULL,
  `viewed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `resume_views`
--

INSERT INTO `resume_views` (`view_id`, `resume_id`, `ip_address`, `user_agent`, `referer`, `viewed_at`) VALUES
(1, 14, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', NULL, '2025-11-22 22:45:36'),
(2, 14, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', NULL, '2025-11-22 22:45:49');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `session_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`session_data`)),
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_activity` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`session_id`, `user_id`, `ip_address`, `user_agent`, `session_data`, `expires_at`, `created_at`, `last_activity`) VALUES
('sess_david_kim_005', 5, '192.168.1.120', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NULL, '2025-11-23 09:30:40', '2025-11-19 06:00:00', '2025-11-19 06:30:00'),
('sess_emily_rodriguez_004', 4, '192.168.1.115', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', NULL, '2025-11-23 09:30:40', '2025-11-21 13:15:00', '2025-11-21 13:45:00'),
('sess_john_doe_active_001', 1, '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', NULL, '2025-11-23 09:30:40', '2025-11-22 02:30:00', '2025-11-22 03:00:00'),
('sess_michael_chen_003', 3, '192.168.1.110', 'Mozilla/5.0 (X11; Linux x86_64)', NULL, '2025-11-23 09:30:40', '2025-11-22 02:00:00', '2025-11-22 02:45:00'),
('sess_sarah_johnson_002', 2, '192.168.1.105', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NULL, '2025-11-23 09:30:40', '2025-11-21 10:45:00', '2025-11-21 11:30:00');

--
-- Triggers `sessions`
--
DELIMITER $$
CREATE TRIGGER `after_session_insert` AFTER INSERT ON `sessions` FOR EACH ROW BEGIN
    UPDATE users
    SET last_login = NOW()
    WHERE user_id = NEW.user_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `templates`
--

CREATE TABLE `templates` (
  `template_id` int(11) NOT NULL,
  `template_name` varchar(100) NOT NULL,
  `template_display_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `preview_url` varchar(500) DEFAULT NULL,
  `template_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`template_config`)),
  `is_active` tinyint(1) DEFAULT 1,
  `is_premium` tinyint(1) DEFAULT 0,
  `usage_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `templates`
--

INSERT INTO `templates` (`template_id`, `template_name`, `template_display_name`, `description`, `preview_url`, `template_config`, `is_active`, `is_premium`, `usage_count`, `created_at`, `updated_at`) VALUES
(1, 'classic', 'Classic Professional', 'Traditional single-column layout with clean typography. Perfect for corporate and professional environments.', NULL, '{\"layout\": \"single-column\", \"font\": \"Times New Roman\", \"color_scheme\": \"black-white\"}', 1, 0, 0, '2025-11-22 09:30:12', '2025-11-22 09:30:12'),
(2, 'modern', 'Modern Minimalist', 'Clean two-column design with modern fonts. Great for tech and creative industries.', NULL, '{\"layout\": \"two-column\", \"font\": \"Arial\", \"color_scheme\": \"blue-accent\"}', 1, 0, 0, '2025-11-22 09:30:12', '2025-11-22 09:30:12'),
(3, 'creative', 'Creative Bold', 'Eye-catching layout with bold headers. Ideal for designers and creative professionals.', NULL, '{\"layout\": \"asymmetric\", \"font\": \"Helvetica\", \"color_scheme\": \"colorful\"}', 1, 1, 0, '2025-11-22 09:30:12', '2025-11-22 09:30:12'),
(4, 'executive', 'Executive Elite', 'Sophisticated design for senior positions. Premium template with elegant styling.', NULL, '{\"layout\": \"single-column\", \"font\": \"Georgia\", \"color_scheme\": \"navy-gold\"}', 1, 1, 0, '2025-11-22 09:30:12', '2025-11-22 09:30:12'),
(5, 'technical', 'Technical Pro', 'Optimized for technical roles with sections for projects and certifications.', NULL, '{\"layout\": \"two-column\", \"font\": \"Calibri\", \"color_scheme\": \"dark-blue\"}', 1, 0, 0, '2025-11-22 09:30:12', '2025-11-22 09:30:12');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `address_line1` varchar(255) DEFAULT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `zip_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `professional_title` varchar(255) DEFAULT NULL,
  `professional_summary` text DEFAULT NULL,
  `profile_photo_url` varchar(500) DEFAULT NULL,
  `email_notifications` tinyint(1) DEFAULT 1,
  `resume_tips` tinyint(1) DEFAULT 1,
  `application_updates` tinyint(1) DEFAULT 1,
  `profile_visibility` enum('public','private','contacts') DEFAULT 'private',
  `dark_mode` tinyint(1) DEFAULT 0,
  `two_factor_enabled` tinyint(1) DEFAULT 0,
  `email_verified` tinyint(1) DEFAULT 0,
  `verification_token` varchar(255) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  `account_status` enum('active','suspended','deleted') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `email`, `password_hash`, `full_name`, `phone`, `date_of_birth`, `address_line1`, `address_line2`, `city`, `state`, `zip_code`, `country`, `professional_title`, `professional_summary`, `profile_photo_url`, `email_notifications`, `resume_tips`, `application_updates`, `profile_visibility`, `dark_mode`, `two_factor_enabled`, `email_verified`, `verification_token`, `reset_token`, `reset_token_expiry`, `account_status`, `created_at`, `updated_at`, `last_login`) VALUES
(1, 'john.doe@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Doe', '+1-555-0101', '1990-05-15', '123 Main Street', NULL, 'San Francisco', 'California', '94102', 'United States', 'Senior Software Engineer', 'Experienced software engineer with 8+ years in full-stack development, specializing in React, Node.js, and cloud architecture. Passionate about building scalable applications and mentoring junior developers.', NULL, 1, 1, 1, 'private', 0, 0, 1, NULL, NULL, NULL, 'active', '2024-01-15 04:30:00', '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(2, 'sarah.johnson@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah Johnson', '+1-555-0102', '1992-08-22', '456 Oak Avenue', NULL, 'Austin', 'Texas', '78701', 'United States', 'UX/UI Designer', 'Creative designer with a keen eye for detail and user-centered design principles. 5+ years of experience creating intuitive interfaces for web and mobile applications.', NULL, 1, 1, 1, 'private', 0, 0, 1, NULL, NULL, NULL, 'active', '2024-02-10 03:15:00', '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(3, 'michael.chen@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Michael Chen', '+1-555-0103', '1988-03-10', '789 Tech Boulevard', NULL, 'Seattle', 'Washington', '98101', 'United States', 'Data Scientist', 'Data scientist specializing in machine learning and predictive analytics. Expert in Python, R, and big data technologies with a strong background in statistics.', NULL, 1, 1, 1, 'private', 0, 0, 1, NULL, NULL, NULL, 'active', '2024-03-05 05:20:00', '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(4, 'emily.rodriguez@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Emily Rodriguez', '+1-555-0104', '1995-11-18', '321 Innovation Drive', NULL, 'Boston', 'Massachusetts', '02101', 'United States', 'Marketing Manager', 'Results-driven marketing professional with expertise in digital marketing, content strategy, and brand management. Proven track record of increasing engagement and ROI.', NULL, 1, 1, 1, 'private', 0, 0, 1, NULL, NULL, NULL, 'active', '2024-04-12 07:45:00', '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(5, 'david.kim@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'David Kim', '+1-555-0105', '1991-07-25', '654 Business Park', NULL, 'New York', 'New York', '10001', 'United States', 'Product Manager', 'Strategic product manager with 6+ years experience driving product vision and roadmap. Skilled in agile methodologies, user research, and cross-functional team leadership.', NULL, 1, 1, 1, 'private', 0, 0, 1, NULL, NULL, NULL, 'active', '2024-05-20 09:00:00', '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(6, 'lisa.anderson@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lisa Anderson', '+1-555-0106', '1993-02-14', '987 Creative Lane', NULL, 'Los Angeles', 'California', '90001', 'United States', 'Graphic Designer', 'Award-winning graphic designer specializing in branding, print, and digital media. Passionate about creating visually stunning designs that tell compelling stories.', NULL, 1, 1, 1, 'private', 0, 0, 1, NULL, NULL, NULL, 'active', '2024-06-08 04:30:00', '2025-11-22 09:30:40', '2025-11-20 05:30:00'),
(7, 'james.wilson@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'James Wilson', '+1-555-0107', '1989-09-30', '147 Finance Street', NULL, 'Chicago', 'Illinois', '60601', 'United States', 'Financial Analyst', 'Detail-oriented financial analyst with strong analytical skills and expertise in financial modeling, forecasting, and data analysis. CFA Level II candidate.', NULL, 1, 1, 1, 'private', 0, 0, 1, NULL, NULL, NULL, 'active', '2024-07-15 03:00:00', '2025-11-22 09:30:40', '2025-11-22 03:45:00'),
(8, 'maria.garcia@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Maria Garcia', '+1-555-0108', '1994-12-05', '258 Healthcare Plaza', NULL, 'Miami', 'Florida', '33101', 'United States', 'Registered Nurse', 'Compassionate and dedicated registered nurse with 4+ years of experience in critical care. Strong clinical skills and commitment to patient-centered care.', NULL, 1, 1, 1, 'private', 0, 0, 0, NULL, NULL, NULL, 'active', '2024-08-22 08:15:00', '2025-11-22 09:30:40', '2025-11-18 11:20:00'),
(9, 'robert.taylor@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Robert Taylor', '+1-555-0109', '1987-04-20', '369 Legal Avenue', NULL, 'Washington', 'District of Columbia', '20001', 'United States', 'Corporate Lawyer', 'Experienced corporate attorney specializing in mergers & acquisitions, contract law, and corporate governance. Licensed in DC, NY, and CA.', NULL, 1, 1, 1, 'private', 0, 0, 1, NULL, NULL, NULL, 'active', '2024-09-10 05:30:00', '2025-11-22 09:30:40', '2025-11-21 04:15:00'),
(10, 'jennifer.brown@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jennifer Brown', '+1-555-0110', '1996-06-12', '741 Education Road', NULL, 'Denver', 'Colorado', '80201', 'United States', 'High School Teacher', 'Enthusiastic educator with passion for inspiring students. Specialized in Mathematics and Computer Science. Committed to creating engaging learning environments.', NULL, 1, 1, 1, 'private', 0, 0, 1, NULL, NULL, NULL, 'active', '2024-10-05 02:45:00', '2025-11-22 09:30:40', '2025-11-20 07:00:00'),
(11, 'mahbubkousar@gmail.com', '$2y$10$Sv0VPbqP50YP6.ERHUTeMOn0pub15V7aEoj/bBjKXO/NevWiF.tI6', 'Mahbubur Rahman Khan', '+8801753019520', '2002-05-17', 'N/A', NULL, 'Dhaka', 'Dhaka', '1206', 'Bangladesh', 'BS in CSE', '', NULL, 1, 1, 1, 'private', 0, 0, 0, NULL, NULL, NULL, 'active', '2025-11-22 10:12:15', '2025-11-22 10:12:34', '2025-11-22 10:12:34');

-- --------------------------------------------------------

--
-- Table structure for table `user_education`
--

CREATE TABLE `user_education` (
  `education_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `institution_name` varchar(255) NOT NULL,
  `degree` varchar(255) DEFAULT NULL,
  `field_of_study` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `current_student` tinyint(1) DEFAULT 0,
  `gpa` varchar(10) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_education`
--

INSERT INTO `user_education` (`education_id`, `user_id`, `institution_name`, `degree`, `field_of_study`, `start_date`, `end_date`, `current_student`, `gpa`, `description`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 1, 'Stanford University', 'Master of Science', 'Computer Science', '2012-09-01', '2014-06-15', 0, '3.85', NULL, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(2, 1, 'University of California, Berkeley', 'Bachelor of Science', 'Computer Engineering', '2008-09-01', '2012-05-20', 0, '3.72', NULL, 2, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(3, 2, 'Rhode Island School of Design', 'Bachelor of Fine Arts', 'Graphic Design', '2010-09-01', '2014-05-15', 0, '3.90', NULL, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(4, 2, 'General Assembly', 'Certificate', 'UX Design Immersive', '2018-01-10', '2018-04-20', 0, NULL, NULL, 2, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(5, 3, 'MIT', 'Ph.D.', 'Data Science', '2012-09-01', '2017-05-30', 0, '3.95', NULL, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(6, 3, 'Carnegie Mellon University', 'Bachelor of Science', 'Statistics', '2006-09-01', '2010-05-20', 0, '3.88', NULL, 2, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(7, 4, 'Northwestern University', 'MBA', 'Marketing', '2017-09-01', '2019-06-15', 0, '3.78', NULL, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(8, 4, 'University of Texas at Austin', 'Bachelor of Business Administration', 'Marketing', '2013-09-01', '2017-05-20', 0, '3.65', NULL, 2, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(9, 5, 'Harvard Business School', 'MBA', 'Business Administration', '2015-09-01', '2017-05-20', 0, '3.82', NULL, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(10, 5, 'University of Michigan', 'Bachelor of Science', 'Industrial Engineering', '2009-09-01', '2013-05-15', 0, '3.70', NULL, 2, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(11, 6, 'Parsons School of Design', 'Bachelor of Fine Arts', 'Communication Design', '2011-09-01', '2015-05-20', 0, '3.88', NULL, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(12, 7, 'University of Pennsylvania - Wharton', 'Master of Finance', 'Finance', '2013-09-01', '2015-05-20', 0, '3.75', NULL, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(13, 7, 'New York University', 'Bachelor of Science', 'Economics', '2007-09-01', '2011-05-15', 0, '3.68', NULL, 2, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(14, 8, 'University of Miami', 'Bachelor of Science in Nursing', 'Nursing', '2016-09-01', '2020-05-15', 0, '3.80', NULL, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(15, 9, 'Yale Law School', 'Juris Doctor', 'Law', '2009-09-01', '2012-05-20', 0, '3.92', NULL, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(16, 9, 'Princeton University', 'Bachelor of Arts', 'Political Science', '2005-09-01', '2009-05-15', 0, '3.85', NULL, 2, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(17, 10, 'University of Colorado Boulder', 'Master of Education', 'Secondary Education', '2018-09-01', '2020-05-20', 0, '3.92', NULL, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(18, 10, 'Colorado State University', 'Bachelor of Science', 'Mathematics', '2014-09-01', '2018-05-15', 0, '3.75', NULL, 2, '2025-11-22 09:30:40', '2025-11-22 09:30:40');

-- --------------------------------------------------------

--
-- Table structure for table `user_experience`
--

CREATE TABLE `user_experience` (
  `experience_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `job_title` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `current_position` tinyint(1) DEFAULT 0,
  `description` text DEFAULT NULL,
  `responsibilities` text DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_experience`
--

INSERT INTO `user_experience` (`experience_id`, `user_id`, `company_name`, `job_title`, `location`, `start_date`, `end_date`, `current_position`, `description`, `responsibilities`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 1, 'Google', 'Senior Software Engineer', 'Mountain View, CA', '2019-03-01', NULL, 1, 'Lead development of cloud-based infrastructure serving 100M+ users. Architect and implement microservices using Node.js, React, and Kubernetes. Mentor team of 5 junior engineers and conduct technical interviews.', NULL, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(2, 1, 'Facebook', 'Software Engineer', 'Menlo Park, CA', '2016-07-01', '2019-02-28', 0, 'Developed features for News Feed reaching 2B+ users. Built scalable backend services using Python and GraphQL. Improved system performance by 40% through optimization and caching strategies.', NULL, 2, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(3, 1, 'Startup Inc.', 'Full Stack Developer', 'San Francisco, CA', '2014-06-01', '2016-06-30', 0, 'Built complete web applications from concept to deployment. Worked with React, Node.js, PostgreSQL, and AWS. Collaborated directly with founders to define product roadmap.', NULL, 3, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(4, 2, 'Adobe', 'Senior UX Designer', 'San Jose, CA', '2020-01-15', NULL, 1, 'Lead UX design for Creative Cloud mobile applications. Conduct user research, create wireframes and prototypes, and collaborate with product managers and engineers. Increased user engagement by 35%.', NULL, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(5, 2, 'Airbnb', 'UX Designer', 'San Francisco, CA', '2017-08-01', '2019-12-31', 0, 'Designed intuitive user interfaces for host dashboard and booking flow. Conducted A/B testing resulting in 25% increase in conversion rates. Created comprehensive design systems and style guides.', NULL, 2, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(6, 2, 'Design Studio XYZ', 'Junior Designer', 'Austin, TX', '2014-06-01', '2017-07-31', 0, 'Created visual designs for web and mobile applications. Developed brand identities for startup clients. Collaborated with developers to ensure design implementation accuracy.', NULL, 3, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(7, 3, 'Amazon Web Services', 'Senior Data Scientist', 'Seattle, WA', '2020-06-01', NULL, 1, 'Build machine learning models for demand forecasting and anomaly detection. Lead team of 4 data scientists. Deploy models serving millions of predictions daily using SageMaker and PyTorch.', NULL, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(8, 3, 'Microsoft', 'Data Scientist', 'Redmond, WA', '2017-07-01', '2020-05-31', 0, 'Developed recommendation algorithms for Azure Marketplace. Analyzed large-scale datasets using Spark and SQL. Published 3 papers on deep learning applications in production systems.', NULL, 2, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(9, 4, 'HubSpot', 'Marketing Manager', 'Boston, MA', '2021-02-01', NULL, 1, 'Manage digital marketing campaigns across multiple channels. Lead team of 6 marketing specialists. Increased qualified leads by 60% and reduced customer acquisition cost by 30%.', NULL, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(10, 4, 'Salesforce', 'Digital Marketing Specialist', 'San Francisco, CA', '2019-07-01', '2021-01-31', 0, 'Executed content marketing strategy and SEO optimization. Managed social media presence with 500K+ followers. Increased organic traffic by 85% year-over-year.', NULL, 2, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(11, 4, 'Tech Startup', 'Marketing Coordinator', 'Austin, TX', '2017-06-01', '2019-06-30', 0, 'Coordinated marketing campaigns and events. Created content for blog and social media. Assisted with email marketing campaigns achieving 25% open rates.', NULL, 3, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(12, 5, 'Spotify', 'Senior Product Manager', 'New York, NY', '2019-09-01', NULL, 1, 'Own product roadmap for podcast discovery features used by 50M+ users. Collaborate with engineering, design, and data teams. Launched 5 major features resulting in 40% increase in podcast engagement.', NULL, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(13, 5, 'Uber', 'Product Manager', 'San Francisco, CA', '2017-06-01', '2019-08-31', 0, 'Managed rider experience features for Uber app. Conducted user research and analyzed metrics to inform product decisions. Led cross-functional team of 15 engineers and designers.', NULL, 2, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(14, 5, 'McKinsey & Company', 'Business Analyst', 'Boston, MA', '2013-06-01', '2015-08-31', 0, 'Consulted for Fortune 500 clients on strategy and operations. Analyzed market trends and competitive landscapes. Presented findings to C-level executives.', NULL, 3, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(15, 6, 'Nike', 'Senior Graphic Designer', 'Portland, OR', '2020-03-01', NULL, 1, 'Create visual designs for global marketing campaigns. Design packaging, advertisements, and digital content. Collaborate with brand teams to maintain consistency across all touchpoints.', NULL, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(16, 6, 'Freelance', 'Graphic Designer', 'Los Angeles, CA', '2017-06-01', '2020-02-28', 0, 'Provided design services for 50+ clients including startups and agencies. Created brand identities, marketing materials, and web designs. Managed projects from concept to delivery.', NULL, 2, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(17, 6, 'Creative Agency', 'Junior Designer', 'Los Angeles, CA', '2015-06-01', '2017-05-31', 0, 'Designed print and digital marketing materials. Assisted senior designers on branding projects. Created social media graphics and email templates.', NULL, 3, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(18, 7, 'Goldman Sachs', 'Senior Financial Analyst', 'New York, NY', '2018-07-01', NULL, 1, 'Conduct financial modeling and valuation analysis for M&A transactions. Prepare investment recommendations and pitch materials. Manage relationships with institutional clients managing $2B+ in assets.', NULL, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(19, 7, 'JP Morgan Chase', 'Financial Analyst', 'Chicago, IL', '2015-06-01', '2018-06-30', 0, 'Analyzed financial statements and market trends. Built complex financial models in Excel. Supported senior bankers on deal execution and client presentations.', NULL, 2, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(20, 8, 'Jackson Memorial Hospital', 'Registered Nurse - ICU', 'Miami, FL', '2020-06-01', NULL, 1, 'Provide critical care nursing for ICU patients. Monitor vital signs and administer medications. Collaborate with interdisciplinary team to develop patient care plans. Train new nurses on ICU protocols.', NULL, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(21, 9, 'Latham & Watkins LLP', 'Corporate Attorney', 'Washington, DC', '2015-09-01', NULL, 1, 'Advise clients on complex corporate transactions including M&A, securities offerings, and corporate governance. Draft and negotiate acquisition agreements. Lead due diligence teams.', NULL, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(22, 9, 'Sullivan & Cromwell LLP', 'Associate Attorney', 'New York, NY', '2012-09-01', '2015-08-31', 0, 'Supported corporate transactions and regulatory compliance matters. Conducted legal research and drafted contracts. Worked on cross-border M&A deals worth $5B+.', NULL, 2, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(23, 10, 'Denver South High School', 'Mathematics Teacher', 'Denver, CO', '2020-08-01', NULL, 1, 'Teach Algebra, Geometry, and AP Calculus to grades 9-12. Develop engaging lesson plans and utilize technology in classroom. Sponsor Math Club and coordinate tutoring program. Student test scores improved 20%.', NULL, 1, '2025-11-22 09:30:40', '2025-11-22 09:30:40'),
(24, 10, 'Aurora High School', 'Student Teacher', 'Aurora, CO', '2020-01-15', '2020-05-15', 0, 'Completed student teaching practicum under supervision of master teacher. Taught Algebra II and Pre-Calculus classes. Created assessments and provided individualized student support.', NULL, 2, '2025-11-22 09:30:40', '2025-11-22 09:30:40');

-- --------------------------------------------------------

--
-- Stand-in structure for view `user_profile_summary`
-- (See below for the actual view)
--
CREATE TABLE `user_profile_summary` (
`user_id` int(11)
,`full_name` varchar(255)
,`email` varchar(255)
,`professional_title` varchar(255)
,`created_at` timestamp
,`last_login` timestamp
,`total_resumes` bigint(21)
,`total_education` bigint(21)
,`total_experience` bigint(21)
,`total_skills` bigint(21)
);

-- --------------------------------------------------------

--
-- Table structure for table `user_skills`
--

CREATE TABLE `user_skills` (
  `skill_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `skill_name` varchar(255) NOT NULL,
  `skill_category` varchar(100) DEFAULT NULL,
  `proficiency_level` enum('beginner','intermediate','advanced','expert') DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_skills`
--

INSERT INTO `user_skills` (`skill_id`, `user_id`, `skill_name`, `skill_category`, `proficiency_level`, `display_order`, `created_at`) VALUES
(1, 1, 'JavaScript', 'Technical', 'expert', 1, '2025-11-22 09:30:40'),
(2, 1, 'React', 'Technical', 'expert', 2, '2025-11-22 09:30:40'),
(3, 1, 'Node.js', 'Technical', 'expert', 3, '2025-11-22 09:30:40'),
(4, 1, 'Python', 'Technical', 'advanced', 4, '2025-11-22 09:30:40'),
(5, 1, 'AWS', 'Technical', 'advanced', 5, '2025-11-22 09:30:40'),
(6, 1, 'Docker & Kubernetes', 'Technical', 'advanced', 6, '2025-11-22 09:30:40'),
(7, 1, 'System Design', 'Technical', 'expert', 7, '2025-11-22 09:30:40'),
(8, 1, 'Team Leadership', 'Soft', 'advanced', 8, '2025-11-22 09:30:40'),
(9, 1, 'Agile/Scrum', 'Technical', 'advanced', 9, '2025-11-22 09:30:40'),
(10, 2, 'Figma', 'Technical', 'expert', 1, '2025-11-22 09:30:40'),
(11, 2, 'Adobe XD', 'Technical', 'expert', 2, '2025-11-22 09:30:40'),
(12, 2, 'Sketch', 'Technical', 'advanced', 3, '2025-11-22 09:30:40'),
(13, 2, 'User Research', 'Technical', 'expert', 4, '2025-11-22 09:30:40'),
(14, 2, 'Prototyping', 'Technical', 'expert', 5, '2025-11-22 09:30:40'),
(15, 2, 'Wireframing', 'Technical', 'expert', 6, '2025-11-22 09:30:40'),
(16, 2, 'Design Systems', 'Technical', 'advanced', 7, '2025-11-22 09:30:40'),
(17, 2, 'HTML/CSS', 'Technical', 'intermediate', 8, '2025-11-22 09:30:40'),
(18, 2, 'Creative Thinking', 'Soft', 'expert', 9, '2025-11-22 09:30:40'),
(19, 3, 'Python', 'Technical', 'expert', 1, '2025-11-22 09:30:40'),
(20, 3, 'R', 'Technical', 'expert', 2, '2025-11-22 09:30:40'),
(21, 3, 'Machine Learning', 'Technical', 'expert', 3, '2025-11-22 09:30:40'),
(22, 3, 'TensorFlow', 'Technical', 'advanced', 4, '2025-11-22 09:30:40'),
(23, 3, 'PyTorch', 'Technical', 'advanced', 5, '2025-11-22 09:30:40'),
(24, 3, 'SQL', 'Technical', 'expert', 6, '2025-11-22 09:30:40'),
(25, 3, 'Apache Spark', 'Technical', 'advanced', 7, '2025-11-22 09:30:40'),
(26, 3, 'Statistical Analysis', 'Technical', 'expert', 8, '2025-11-22 09:30:40'),
(27, 3, 'Data Visualization', 'Technical', 'advanced', 9, '2025-11-22 09:30:40'),
(28, 4, 'Digital Marketing', 'Technical', 'expert', 1, '2025-11-22 09:30:40'),
(29, 4, 'SEO/SEM', 'Technical', 'expert', 2, '2025-11-22 09:30:40'),
(30, 4, 'Google Analytics', 'Technical', 'advanced', 3, '2025-11-22 09:30:40'),
(31, 4, 'Content Strategy', 'Technical', 'expert', 4, '2025-11-22 09:30:40'),
(32, 4, 'Social Media Marketing', 'Technical', 'expert', 5, '2025-11-22 09:30:40'),
(33, 4, 'Email Marketing', 'Technical', 'advanced', 6, '2025-11-22 09:30:40'),
(34, 4, 'Marketing Automation', 'Technical', 'advanced', 7, '2025-11-22 09:30:40'),
(35, 4, 'Communication', 'Soft', 'expert', 8, '2025-11-22 09:30:40'),
(36, 4, 'Project Management', 'Soft', 'advanced', 9, '2025-11-22 09:30:40'),
(37, 5, 'Product Strategy', 'Technical', 'expert', 1, '2025-11-22 09:30:40'),
(38, 5, 'Agile Methodologies', 'Technical', 'expert', 2, '2025-11-22 09:30:40'),
(39, 5, 'User Stories & Requirements', 'Technical', 'expert', 3, '2025-11-22 09:30:40'),
(40, 5, 'Data Analysis', 'Technical', 'advanced', 4, '2025-11-22 09:30:40'),
(41, 5, 'A/B Testing', 'Technical', 'advanced', 5, '2025-11-22 09:30:40'),
(42, 5, 'Roadmap Planning', 'Technical', 'expert', 6, '2025-11-22 09:30:40'),
(43, 5, 'Stakeholder Management', 'Soft', 'expert', 7, '2025-11-22 09:30:40'),
(44, 5, 'Leadership', 'Soft', 'advanced', 8, '2025-11-22 09:30:40'),
(45, 5, 'SQL', 'Technical', 'intermediate', 9, '2025-11-22 09:30:40'),
(46, 6, 'Adobe Photoshop', 'Technical', 'expert', 1, '2025-11-22 09:30:40'),
(47, 6, 'Adobe Illustrator', 'Technical', 'expert', 2, '2025-11-22 09:30:40'),
(48, 6, 'Adobe InDesign', 'Technical', 'expert', 3, '2025-11-22 09:30:40'),
(49, 6, 'Branding', 'Technical', 'expert', 4, '2025-11-22 09:30:40'),
(50, 6, 'Typography', 'Technical', 'advanced', 5, '2025-11-22 09:30:40'),
(51, 6, 'Print Design', 'Technical', 'expert', 6, '2025-11-22 09:30:40'),
(52, 6, 'Digital Design', 'Technical', 'expert', 7, '2025-11-22 09:30:40'),
(53, 6, 'Creativity', 'Soft', 'expert', 8, '2025-11-22 09:30:40'),
(54, 7, 'Financial Modeling', 'Technical', 'expert', 1, '2025-11-22 09:30:40'),
(55, 7, 'Excel', 'Technical', 'expert', 2, '2025-11-22 09:30:40'),
(56, 7, 'Valuation Analysis', 'Technical', 'expert', 3, '2025-11-22 09:30:40'),
(57, 7, 'Bloomberg Terminal', 'Technical', 'advanced', 4, '2025-11-22 09:30:40'),
(58, 7, 'Financial Reporting', 'Technical', 'expert', 5, '2025-11-22 09:30:40'),
(59, 7, 'Forecasting', 'Technical', 'advanced', 6, '2025-11-22 09:30:40'),
(60, 7, 'Analytical Thinking', 'Soft', 'expert', 7, '2025-11-22 09:30:40'),
(61, 7, 'Attention to Detail', 'Soft', 'expert', 8, '2025-11-22 09:30:40'),
(62, 8, 'Critical Care Nursing', 'Technical', 'advanced', 1, '2025-11-22 09:30:40'),
(63, 8, 'Patient Assessment', 'Technical', 'expert', 2, '2025-11-22 09:30:40'),
(64, 8, 'IV Therapy', 'Technical', 'expert', 3, '2025-11-22 09:30:40'),
(65, 8, 'Medication Administration', 'Technical', 'expert', 4, '2025-11-22 09:30:40'),
(66, 8, 'Electronic Health Records', 'Technical', 'advanced', 5, '2025-11-22 09:30:40'),
(67, 8, 'BLS & ACLS Certified', 'Technical', 'expert', 6, '2025-11-22 09:30:40'),
(68, 8, 'Compassion', 'Soft', 'expert', 7, '2025-11-22 09:30:40'),
(69, 8, 'Team Collaboration', 'Soft', 'advanced', 8, '2025-11-22 09:30:40'),
(70, 9, 'Corporate Law', 'Technical', 'expert', 1, '2025-11-22 09:30:40'),
(71, 9, 'Contract Negotiation', 'Technical', 'expert', 2, '2025-11-22 09:30:40'),
(72, 9, 'Mergers & Acquisitions', 'Technical', 'expert', 3, '2025-11-22 09:30:40'),
(73, 9, 'Legal Research', 'Technical', 'expert', 4, '2025-11-22 09:30:40'),
(74, 9, 'Securities Law', 'Technical', 'advanced', 5, '2025-11-22 09:30:40'),
(75, 9, 'Due Diligence', 'Technical', 'expert', 6, '2025-11-22 09:30:40'),
(76, 9, 'Legal Writing', 'Technical', 'expert', 7, '2025-11-22 09:30:40'),
(77, 9, 'Client Relations', 'Soft', 'expert', 8, '2025-11-22 09:30:40'),
(78, 10, 'Curriculum Development', 'Technical', 'advanced', 1, '2025-11-22 09:30:40'),
(79, 10, 'Classroom Management', 'Technical', 'expert', 2, '2025-11-22 09:30:40'),
(80, 10, 'Mathematics Instruction', 'Technical', 'expert', 3, '2025-11-22 09:30:40'),
(81, 10, 'Google Classroom', 'Technical', 'advanced', 4, '2025-11-22 09:30:40'),
(82, 10, 'Student Assessment', 'Technical', 'advanced', 5, '2025-11-22 09:30:40'),
(83, 10, 'Differentiated Instruction', 'Technical', 'advanced', 6, '2025-11-22 09:30:40'),
(84, 10, 'Communication', 'Soft', 'expert', 7, '2025-11-22 09:30:40'),
(85, 10, 'Patience', 'Soft', 'expert', 8, '2025-11-22 09:30:40');

-- --------------------------------------------------------

--
-- Structure for view `recent_activity`
--
DROP TABLE IF EXISTS `recent_activity`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `recent_activity`  AS SELECT `al`.`log_id` AS `log_id`, `al`.`user_id` AS `user_id`, `u`.`full_name` AS `full_name`, `u`.`email` AS `email`, `al`.`activity_type` AS `activity_type`, `al`.`activity_description` AS `activity_description`, `al`.`ip_address` AS `ip_address`, `al`.`created_at` AS `created_at` FROM (`activity_logs` `al` left join `users` `u` on(`al`.`user_id` = `u`.`user_id`)) ORDER BY `al`.`created_at` DESC LIMIT 0, 100 ;

-- --------------------------------------------------------

--
-- Structure for view `resume_statistics`
--
DROP TABLE IF EXISTS `resume_statistics`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `resume_statistics`  AS SELECT `r`.`resume_id` AS `resume_id`, `r`.`resume_title` AS `resume_title`, `r`.`user_id` AS `user_id`, `u`.`full_name` AS `user_name`, `r`.`template_name` AS `template_name`, `r`.`status` AS `status`, `r`.`created_at` AS `created_at`, `r`.`updated_at` AS `updated_at`, count(distinct `rs`.`section_id`) AS `total_sections`, count(distinct `ats`.`score_id`) AS `total_ats_checks`, coalesce(max(`ats`.`overall_score`),0) AS `best_ats_score`, count(distinct `sh`.`share_id`) AS `total_shares`, coalesce(sum(`sh`.`view_count`),0) AS `total_views` FROM ((((`resumes` `r` left join `users` `u` on(`r`.`user_id` = `u`.`user_id`)) left join `resume_sections` `rs` on(`r`.`resume_id` = `rs`.`resume_id`)) left join `ats_scores` `ats` on(`r`.`resume_id` = `ats`.`resume_id`)) left join `resume_shares` `sh` on(`r`.`resume_id` = `sh`.`resume_id`)) GROUP BY `r`.`resume_id` ;

-- --------------------------------------------------------

--
-- Structure for view `user_profile_summary`
--
DROP TABLE IF EXISTS `user_profile_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `user_profile_summary`  AS SELECT `u`.`user_id` AS `user_id`, `u`.`full_name` AS `full_name`, `u`.`email` AS `email`, `u`.`professional_title` AS `professional_title`, `u`.`created_at` AS `created_at`, `u`.`last_login` AS `last_login`, count(distinct `r`.`resume_id`) AS `total_resumes`, count(distinct `ue`.`education_id`) AS `total_education`, count(distinct `uex`.`experience_id`) AS `total_experience`, count(distinct `us`.`skill_id`) AS `total_skills` FROM ((((`users` `u` left join `resumes` `r` on(`u`.`user_id` = `r`.`user_id`)) left join `user_education` `ue` on(`u`.`user_id` = `ue`.`user_id`)) left join `user_experience` `uex` on(`u`.`user_id` = `uex`.`user_id`)) left join `user_skills` `us` on(`u`.`user_id` = `us`.`user_id`)) WHERE `u`.`account_status` = 'active' GROUP BY `u`.`user_id` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_activity_type` (`activity_type`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `application_activity`
--
ALTER TABLE `application_activity`
  ADD PRIMARY KEY (`activity_id`),
  ADD KEY `idx_application_id` (`application_id`);

--
-- Indexes for table `application_timeline`
--
ALTER TABLE `application_timeline`
  ADD PRIMARY KEY (`timeline_id`),
  ADD KEY `idx_application_id` (`application_id`),
  ADD KEY `idx_event_date` (`event_date`);

--
-- Indexes for table `ats_scores`
--
ALTER TABLE `ats_scores`
  ADD PRIMARY KEY (`score_id`),
  ADD KEY `idx_resume_id` (`resume_id`),
  ADD KEY `idx_overall_score` (`overall_score`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `job_applications`
--
ALTER TABLE `job_applications`
  ADD PRIMARY KEY (`application_id`),
  ADD KEY `resume_id` (`resume_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_application_date` (`application_date`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `application_id` (`application_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_is_read` (`is_read`),
  ADD KEY `idx_scheduled_for` (`scheduled_for`);

--
-- Indexes for table `resumes`
--
ALTER TABLE `resumes`
  ADD PRIMARY KEY (`resume_id`),
  ADD UNIQUE KEY `share_token` (`share_token`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_template_id` (`template_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_updated_at` (`updated_at`),
  ADD KEY `idx_share_token` (`share_token`);

--
-- Indexes for table `resume_downloads`
--
ALTER TABLE `resume_downloads`
  ADD PRIMARY KEY (`download_id`),
  ADD KEY `idx_resume_downloads` (`resume_id`,`downloaded_at`);

--
-- Indexes for table `resume_sections`
--
ALTER TABLE `resume_sections`
  ADD PRIMARY KEY (`section_id`),
  ADD KEY `idx_resume_id` (`resume_id`),
  ADD KEY `idx_section_type` (`section_type`),
  ADD KEY `idx_display_order` (`display_order`);

--
-- Indexes for table `resume_shares`
--
ALTER TABLE `resume_shares`
  ADD PRIMARY KEY (`share_id`),
  ADD UNIQUE KEY `share_token` (`share_token`),
  ADD KEY `idx_resume_id` (`resume_id`),
  ADD KEY `idx_share_token` (`share_token`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `resume_views`
--
ALTER TABLE `resume_views`
  ADD PRIMARY KEY (`view_id`),
  ADD KEY `idx_resume_views` (`resume_id`,`viewed_at`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- Indexes for table `templates`
--
ALTER TABLE `templates`
  ADD PRIMARY KEY (`template_id`),
  ADD UNIQUE KEY `template_name` (`template_name`),
  ADD KEY `idx_template_name` (`template_name`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_account_status` (`account_status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `user_education`
--
ALTER TABLE `user_education`
  ADD PRIMARY KEY (`education_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_display_order` (`display_order`);

--
-- Indexes for table `user_experience`
--
ALTER TABLE `user_experience`
  ADD PRIMARY KEY (`experience_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_display_order` (`display_order`),
  ADD KEY `idx_current_position` (`current_position`);

--
-- Indexes for table `user_skills`
--
ALTER TABLE `user_skills`
  ADD PRIMARY KEY (`skill_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_skill_category` (`skill_category`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `log_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `application_activity`
--
ALTER TABLE `application_activity`
  MODIFY `activity_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `application_timeline`
--
ALTER TABLE `application_timeline`
  MODIFY `timeline_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `ats_scores`
--
ALTER TABLE `ats_scores`
  MODIFY `score_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `job_applications`
--
ALTER TABLE `job_applications`
  MODIFY `application_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `resumes`
--
ALTER TABLE `resumes`
  MODIFY `resume_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `resume_downloads`
--
ALTER TABLE `resume_downloads`
  MODIFY `download_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `resume_sections`
--
ALTER TABLE `resume_sections`
  MODIFY `section_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `resume_shares`
--
ALTER TABLE `resume_shares`
  MODIFY `share_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `resume_views`
--
ALTER TABLE `resume_views`
  MODIFY `view_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `templates`
--
ALTER TABLE `templates`
  MODIFY `template_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `user_education`
--
ALTER TABLE `user_education`
  MODIFY `education_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `user_experience`
--
ALTER TABLE `user_experience`
  MODIFY `experience_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `user_skills`
--
ALTER TABLE `user_skills`
  MODIFY `skill_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `application_activity`
--
ALTER TABLE `application_activity`
  ADD CONSTRAINT `application_activity_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `job_applications` (`application_id`) ON DELETE CASCADE;

--
-- Constraints for table `application_timeline`
--
ALTER TABLE `application_timeline`
  ADD CONSTRAINT `application_timeline_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `job_applications` (`application_id`) ON DELETE CASCADE;

--
-- Constraints for table `ats_scores`
--
ALTER TABLE `ats_scores`
  ADD CONSTRAINT `ats_scores_ibfk_1` FOREIGN KEY (`resume_id`) REFERENCES `resumes` (`resume_id`) ON DELETE CASCADE;

--
-- Constraints for table `job_applications`
--
ALTER TABLE `job_applications`
  ADD CONSTRAINT `job_applications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `job_applications_ibfk_2` FOREIGN KEY (`resume_id`) REFERENCES `resumes` (`resume_id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`application_id`) REFERENCES `job_applications` (`application_id`) ON DELETE CASCADE;

--
-- Constraints for table `resumes`
--
ALTER TABLE `resumes`
  ADD CONSTRAINT `resumes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `resumes_ibfk_2` FOREIGN KEY (`template_id`) REFERENCES `templates` (`template_id`) ON DELETE SET NULL;

--
-- Constraints for table `resume_downloads`
--
ALTER TABLE `resume_downloads`
  ADD CONSTRAINT `resume_downloads_ibfk_1` FOREIGN KEY (`resume_id`) REFERENCES `resumes` (`resume_id`) ON DELETE CASCADE;

--
-- Constraints for table `resume_sections`
--
ALTER TABLE `resume_sections`
  ADD CONSTRAINT `resume_sections_ibfk_1` FOREIGN KEY (`resume_id`) REFERENCES `resumes` (`resume_id`) ON DELETE CASCADE;

--
-- Constraints for table `resume_shares`
--
ALTER TABLE `resume_shares`
  ADD CONSTRAINT `resume_shares_ibfk_1` FOREIGN KEY (`resume_id`) REFERENCES `resumes` (`resume_id`) ON DELETE CASCADE;

--
-- Constraints for table `resume_views`
--
ALTER TABLE `resume_views`
  ADD CONSTRAINT `resume_views_ibfk_1` FOREIGN KEY (`resume_id`) REFERENCES `resumes` (`resume_id`) ON DELETE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_education`
--
ALTER TABLE `user_education`
  ADD CONSTRAINT `user_education_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_experience`
--
ALTER TABLE `user_experience`
  ADD CONSTRAINT `user_experience_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_skills`
--
ALTER TABLE `user_skills`
  ADD CONSTRAINT `user_skills_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

DELIMITER $$
--
-- Events
--
CREATE DEFINER=`root`@`localhost` EVENT `clean_expired_sessions_daily` ON SCHEDULE EVERY 1 DAY STARTS '2025-11-22 15:30:12' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
    DELETE FROM sessions WHERE expires_at < NOW();
END$$

CREATE DEFINER=`root`@`localhost` EVENT `clean_old_activity_logs_monthly` ON SCHEDULE EVERY 1 MONTH STARTS '2025-11-22 15:30:12' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
    DELETE FROM activity_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
END$$

CREATE DEFINER=`root`@`localhost` EVENT `clean_expired_shares_daily` ON SCHEDULE EVERY 1 DAY STARTS '2025-11-22 15:30:12' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
    UPDATE resume_shares
    SET is_active = FALSE
    WHERE expiry_date IS NOT NULL AND expiry_date < NOW() AND is_active = TRUE;
END$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
