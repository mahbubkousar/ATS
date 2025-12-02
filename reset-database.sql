-- Reset Database - Clean up test data and update templates
-- WARNING: This will delete ALL test data!

USE resumesync_db;

-- Step 1: Mark unused templates as inactive
UPDATE templates
SET is_active = 0
WHERE template_name IN ('classic', 'creative', 'executive', 'technical', 'research-scientist', 'teaching-faculty');

-- Step 2: Update template display names
UPDATE templates
SET template_display_name = 'Simple'
WHERE template_name = 'modern';

UPDATE templates
SET template_display_name = 'Professional'
WHERE template_name = 'professional';

UPDATE templates
SET template_display_name = 'Academic'
WHERE template_name = 'academic-standard';

-- Step 3: Delete all test resumes (keep only user accounts)
DELETE FROM resumes;

-- Step 4: Delete all test experience entries
DELETE FROM user_experience;

-- Step 5: Delete all test education entries
DELETE FROM user_education;

-- Step 6: Delete all test job applications
DELETE FROM job_applications;

-- Step 7: Delete related data (skip views: resume_statistics, recent_activity, user_profile_summary)
DELETE FROM resume_sections;
DELETE FROM resume_views;
DELETE FROM resume_downloads;
DELETE FROM resume_shares;
DELETE FROM application_timeline;
DELETE FROM application_activity;
DELETE FROM ats_scores;
DELETE FROM activity_logs;
DELETE FROM notifications;

-- Step 8: Reset auto-increment IDs (skip views)
ALTER TABLE resumes AUTO_INCREMENT = 1;
ALTER TABLE user_experience AUTO_INCREMENT = 1;
ALTER TABLE user_education AUTO_INCREMENT = 1;
ALTER TABLE job_applications AUTO_INCREMENT = 1;
ALTER TABLE resume_sections AUTO_INCREMENT = 1;
ALTER TABLE resume_views AUTO_INCREMENT = 1;
ALTER TABLE resume_downloads AUTO_INCREMENT = 1;
ALTER TABLE resume_shares AUTO_INCREMENT = 1;
ALTER TABLE application_timeline AUTO_INCREMENT = 1;
ALTER TABLE application_activity AUTO_INCREMENT = 1;
ALTER TABLE ats_scores AUTO_INCREMENT = 1;
ALTER TABLE activity_logs AUTO_INCREMENT = 1;
ALTER TABLE notifications AUTO_INCREMENT = 1;

-- Step 9: Verify changes
SELECT '=== ACTIVE TEMPLATES ===' AS info;
SELECT template_id, template_name, template_display_name, is_active, is_premium
FROM templates
WHERE is_active = 1
ORDER BY template_name;

SELECT '=== INACTIVE TEMPLATES ===' AS info;
SELECT template_id, template_name, template_display_name, is_active
FROM templates
WHERE is_active = 0
ORDER BY template_name;

SELECT '=== DATA CLEANUP VERIFICATION ===' AS info;
SELECT
    (SELECT COUNT(*) FROM resumes) as total_resumes,
    (SELECT COUNT(*) FROM user_experience) as total_experience,
    (SELECT COUNT(*) FROM user_education) as total_education,
    (SELECT COUNT(*) FROM job_applications) as total_applications,
    (SELECT COUNT(*) FROM resume_sections) as total_resume_sections;
