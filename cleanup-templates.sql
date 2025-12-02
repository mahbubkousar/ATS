-- Cleanup Templates - Keep only Simple (modern), Professional, and Academic
-- Mark unused templates as inactive

UPDATE templates
SET is_active = 0
WHERE template_name IN ('classic', 'creative', 'executive', 'technical', 'research-scientist', 'teaching-faculty');

-- Update template display names for clarity
UPDATE templates
SET template_display_name = 'Simple'
WHERE template_name = 'modern';

UPDATE templates
SET template_display_name = 'Professional'
WHERE template_name = 'professional';

UPDATE templates
SET template_display_name = 'Academic'
WHERE template_name = 'academic-standard';

-- Verify changes
SELECT template_id, template_name, template_display_name, is_active, is_premium
FROM templates
ORDER BY is_active DESC, template_name;
