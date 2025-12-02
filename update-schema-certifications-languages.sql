-- Add certifications and languages tables for resume data

USE resumesync_db;

-- Create user_certifications table
CREATE TABLE IF NOT EXISTS user_certifications (
    certification_id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) NOT NULL,
    resume_id INT(11) DEFAULT NULL,
    certification_name VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255) DEFAULT NULL,
    issue_date VARCHAR(50) DEFAULT NULL,
    expiry_date VARCHAR(50) DEFAULT NULL,
    credential_id VARCHAR(255) DEFAULT NULL,
    credential_url VARCHAR(500) DEFAULT NULL,
    display_order INT(11) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (resume_id) REFERENCES resumes(resume_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_resume_id (resume_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create user_languages table
CREATE TABLE IF NOT EXISTS user_languages (
    language_id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) NOT NULL,
    resume_id INT(11) DEFAULT NULL,
    language_name VARCHAR(100) NOT NULL,
    proficiency_level ENUM('elementary','limited_working','professional_working','full_professional','native') DEFAULT 'professional_working',
    display_order INT(11) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (resume_id) REFERENCES resumes(resume_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_resume_id (resume_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add columns to resumes table for storing JSON data (alternative storage method)
ALTER TABLE resumes
ADD COLUMN IF NOT EXISTS certifications LONGTEXT DEFAULT NULL COMMENT 'JSON array of certifications',
ADD COLUMN IF NOT EXISTS languages LONGTEXT DEFAULT NULL COMMENT 'JSON array or text for languages',
ADD COLUMN IF NOT EXISTS skills LONGTEXT DEFAULT NULL COMMENT 'JSON array of skills with categories';

-- Verify tables were created
SELECT 'Tables created successfully!' AS status;

SHOW TABLES LIKE '%certification%';
SHOW TABLES LIKE '%language%';

-- Show new columns in resumes table
DESCRIBE resumes;
