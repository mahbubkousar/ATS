-- Complete Database Reset - Remove ALL data including users
-- WARNING: This will delete EVERYTHING and give you a fresh start!

USE resumesync_db;

-- ====================================
-- STEP 1: DELETE ALL USER DATA
-- ====================================

-- Delete all users
DELETE FROM users;

-- Delete all sessions
DELETE FROM sessions;

-- ====================================
-- STEP 2: DELETE ALL RESUME DATA
-- ====================================

DELETE FROM resumes;
DELETE FROM user_experience;
DELETE FROM user_education;
DELETE FROM user_skills;

-- ====================================
-- STEP 3: DELETE ALL APPLICATION DATA
-- ====================================

DELETE FROM job_applications;
DELETE FROM application_timeline;
DELETE FROM application_activity;

-- ====================================
-- STEP 4: DELETE ALL ANALYTICS/TRACKING
-- ====================================

DELETE FROM resume_sections;
DELETE FROM resume_views;
DELETE FROM resume_downloads;
DELETE FROM resume_shares;
DELETE FROM ats_scores;
DELETE FROM activity_logs;
DELETE FROM notifications;

-- ====================================
-- STEP 5: RESET TEMPLATES TO DEFAULT STATE
-- ====================================

-- Delete all templates
DELETE FROM templates;

-- Recreate only the 3 active templates
INSERT INTO templates (template_id, template_name, template_display_name, description, preview_url, template_config, is_active, is_premium, usage_count, created_at, updated_at) VALUES
(1, 'modern', 'Simple', 'Clean, minimalist design with modern typography. Perfect for all industries and roles.', 'templates/modern.html', '{"layout":"two-column","font":"Arial","color_scheme":"blue-accent"}', 1, 0, 0, NOW(), NOW()),
(2, 'professional', 'Professional', 'Sophisticated serif design with boxed header. Ideal for finance, consulting, and formal corporate roles.', 'templates/professional.html', '{"layout":"single-column","font":"Georgia","color_scheme":"black-white"}', 1, 0, 0, NOW(), NOW()),
(3, 'academic-standard', 'Academic', 'Traditional academic CV for PhD candidates, postdocs, and tenure-track positions. Comprehensive publication and grant sections.', 'templates/academic-standard.html', '{"layout":"single-column","font":"Times New Roman","color_scheme":"black-white"}', 1, 0, 0, NOW(), NOW());

-- ====================================
-- STEP 6: RESET AUTO-INCREMENT IDs
-- ====================================

ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE sessions AUTO_INCREMENT = 1;
ALTER TABLE resumes AUTO_INCREMENT = 1;
ALTER TABLE user_experience AUTO_INCREMENT = 1;
ALTER TABLE user_education AUTO_INCREMENT = 1;
ALTER TABLE user_skills AUTO_INCREMENT = 1;
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
ALTER TABLE templates AUTO_INCREMENT = 4;

-- ====================================
-- STEP 7: VERIFICATION
-- ====================================

SELECT '=== ACTIVE TEMPLATES (Should be 3) ===' AS info;
SELECT template_id, template_name, template_display_name, is_active, is_premium, usage_count
FROM templates
WHERE is_active = 1
ORDER BY template_id;

SELECT '=== COMPLETE DATABASE VERIFICATION (All should be 0 except templates) ===' AS info;
SELECT
    'users' as table_name, COUNT(*) as total_records FROM users
UNION ALL SELECT 'sessions', COUNT(*) FROM sessions
UNION ALL SELECT 'resumes', COUNT(*) FROM resumes
UNION ALL SELECT 'user_experience', COUNT(*) FROM user_experience
UNION ALL SELECT 'user_education', COUNT(*) FROM user_education
UNION ALL SELECT 'user_skills', COUNT(*) FROM user_skills
UNION ALL SELECT 'job_applications', COUNT(*) FROM job_applications
UNION ALL SELECT 'resume_sections', COUNT(*) FROM resume_sections
UNION ALL SELECT 'resume_views', COUNT(*) FROM resume_views
UNION ALL SELECT 'resume_downloads', COUNT(*) FROM resume_downloads
UNION ALL SELECT 'resume_shares', COUNT(*) FROM resume_shares
UNION ALL SELECT 'application_timeline', COUNT(*) FROM application_timeline
UNION ALL SELECT 'application_activity', COUNT(*) FROM application_activity
UNION ALL SELECT 'ats_scores', COUNT(*) FROM ats_scores
UNION ALL SELECT 'activity_logs', COUNT(*) FROM activity_logs
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL SELECT 'templates (active)', COUNT(*) FROM templates WHERE is_active = 1
UNION ALL SELECT 'templates (total)', COUNT(*) FROM templates;

SELECT '=== DATABASE IS NOW FRESH AND READY TO USE! ===' AS status;
