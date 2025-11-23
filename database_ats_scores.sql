-- ATS Scores Database Schema

CREATE TABLE IF NOT EXISTS `ats_scores` (
  `score_id` INT(11) PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `resume_id` INT(11) NULL,
  `resume_text` LONGTEXT NOT NULL,
  `job_description` TEXT NULL,
  `overall_score` INT(11) NOT NULL,
  `formatting_score` INT(11) NOT NULL,
  `keywords_score` INT(11) NOT NULL,
  `content_structure_score` INT(11) NOT NULL,
  `contact_info_score` INT(11) NOT NULL,
  `experience_format_score` INT(11) NOT NULL,
  `technical_score` INT(11) NOT NULL,
  `improvements` JSON NULL,
  `strengths` JSON NULL,
  `keywords_found` JSON NULL,
  `keywords_missing` JSON NULL,
  `file_type` VARCHAR(10) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`resume_id`) ON DELETE SET NULL,
  INDEX `idx_user_scores` (`user_id`, `created_at`),
  INDEX `idx_overall_score` (`overall_score`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
