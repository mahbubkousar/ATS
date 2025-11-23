# Database Documentation

This document provides a detailed overview of the `resumesync_db` database schema, which is designed to power an Applicant Tracking System (ATS). The database manages user data, resumes, job applications, and related activities, providing a comprehensive platform for job seekers to manage their application process.

## Schema Overview

The database is structured around a few core concepts:

-   **Users**: The central entity, representing job seekers who use the platform.
-   **Resumes**: Documents created by users, tailored for different job applications.
-   **Job Applications**: Records of applications submitted by users to various companies.

The schema is designed to be extensible, with features like resume templates, ATS score analysis, and activity tracking to enhance the user experience.

## Tables

### `users`

The `users` table is the cornerstone of the database, storing essential information about each registered user. This includes authentication credentials, personal details, and preferences that personalize the user experience.

| Column                | Type          | Description                                             |
| --------------------- | ------------- | ------------------------------------------------------- |
| `user_id`             | `int`         | **Primary Key** - Unique identifier for the user.       |
| `email`               | `varchar(255)`| User's email address (unique).                          |
| `password_hash`       | `varchar(255)`| Hashed password for the user.                           |
| `full_name`           | `varchar(255)`| User's full name.                                       |
| `phone`               | `varchar(20)` | User's phone number.                                    |
| `date_of_birth`       | `date`        | User's date of birth.                                   |
| `address_line1`       | `varchar(255)`| User's address.                                         |
| `address_line2`       | `varchar(255)`| Additional address information.                         |
| `city`                | `varchar(100)`| City of residence.                                      |
| `state`               | `varchar(100)`| State of residence.                                     |
| `zip_code`            | `varchar(20)` | Postal code.                                            |
| `country`             | `varchar(100)`| Country of residence.                                   |
| `professional_title`  | `varchar(255)`| User's professional title.                              |
| `professional_summary`| `text`        | A summary of the user's professional background.        |
| `profile_photo_url`   | `varchar(500)`| URL to the user's profile photo.                        |
| `email_notifications` | `tinyint(1)`  | Flag for email notifications.                           |
| `resume_tips`         | `tinyint(1)`  | Flag for receiving resume tips.                         |
| `application_updates` | `tinyint(1)`  | Flag for application updates.                           |
| `profile_visibility`  | `enum`        | Profile visibility setting.                             |
| `dark_mode`           | `tinyint(1)`  | Dark mode preference.                                   |
| `two_factor_enabled`  | `tinyint(1)`  | Flag for two-factor authentication.                     |
| `email_verified`      | `tinyint(1)`  | Flag indicating if the email is verified.               |
| `verification_token`  | `varchar(255)`| Token for email verification.                           |
| `reset_token`         | `varchar(255)`| Token for password reset.                               |
| `reset_token_expiry`  | `datetime`    | Expiry date for the password reset token.               |
| `account_status`      | `enum`        | User account status.                                    |
| `created_at`          | `timestamp`   | Timestamp of account creation.                          |
| `updated_at`          | `timestamp`   | Timestamp of the last account update.                   |
| `last_login`          | `timestamp`   | Timestamp of the last login.                            |

---

### `resumes`

This table stores the resumes created by users. Each resume is linked to a user and can be customized with different templates and content.

| Column           | Type           | Description                                                        |
| ---------------- | -------------- | ------------------------------------------------------------------ |
| `resume_id`      | `int`          | **Primary Key** - Unique identifier for the resume.                |
| `user_id`        | `int`          | **Foreign Key** to `users.user_id`.                                |
| `template_id`    | `int`          | **Foreign Key** to `templates.template_id`.                        |
| `resume_title`   | `varchar(255)` | Title of the resume.                                               |
| `template_name`  | `varchar(100)` | Name of the template used.                                         |
| `personal_details`| `json`         | JSON object with personal details.                                 |
| `summary_text`   | `text`         | The professional summary text.                                     |
| `status`         | `enum`         | Status of the resume (`draft`, `published`, `archived`).           |
| `share_token`    | `varchar(64)`  | Unique token for sharing the resume.                               |
| `is_public`      | `tinyint(1)`   | Flag indicating if the resume is public.                           |
| `shared_at`      | `timestamp`    | Timestamp when the resume was shared.                              |
| `view_count`     | `int`          | Number of times the resume has been viewed.                        |
| `download_count` | `int`          | Number of times the resume has been downloaded.                    |
| `last_viewed_at` | `timestamp`    | Timestamp of the last view.                                        |
| `version`        | `int`          | Version number of the resume.                                      |
| `file_url`       | `varchar(500)` | URL to the generated resume file.                                  |
| `thumbnail_url`  | `varchar(500)` | URL to the resume's thumbnail image.                               |
| `created_at`     | `timestamp`    | Timestamp of resume creation.                                      |
| `updated_at`     | `timestamp`    | Timestamp of the last resume update.                               |
| `last_accessed`  | `timestamp`    | Timestamp of the last time the resume was accessed.                |

---

### `resume_sections`

This table holds the content for the different sections of a resume, such as work experience, education, and skills. The `section_content` is stored in JSON format to provide flexibility.

| Column            | Type           | Description                                                        |
| ----------------- | -------------- | ------------------------------------------------------------------ |
| `section_id`      | `int`          | **Primary Key** - Unique identifier for the section.               |
| `resume_id`       | `int`          | **Foreign Key** to `resumes.resume_id`.                            |
| `section_type`    | `enum`         | Type of the section (e.g., `experience`, `education`, `skills`).   |
| `section_title`   | `varchar(255)` | Title of the section.                                              |
| `section_content` | `json`         | JSON object containing the content of the section.                 |
| `display_order`   | `int`          | Order in which the section is displayed.                           |
| `is_visible`      | `tinyint(1)`   | Flag indicating if the section is visible.                         |
| `created_at`      | `timestamp`    | Timestamp of section creation.                                     |
| `updated_at`      | `timestamp`    | Timestamp of the last section update.                              |

---

### `job_applications`

This table is crucial for tracking the progress of job applications. It links users to the jobs they've applied for and maintains a record of the application status and other relevant details.

| Column              | Type           | Description                                                                 |
| ------------------- | -------------- | --------------------------------------------------------------------------- |
| `application_id`    | `int`          | **Primary Key** - Unique identifier for the application.                    |
| `user_id`           | `int`          | **Foreign Key** to `users.user_id`.                                         |
| `resume_id`         | `int`          | **Foreign Key** to `resumes.resume_id`.                                     |
| `company_name`      | `varchar(255)` | Name of the company.                                                        |
| `job_title`         | `varchar(255)` | Title of the job.                                                           |
| `job_location`      | `varchar(255)` | Location of the job.                                                        |
| `job_type`          | `enum`         | Type of job (e.g., `Full-time`, `Contract`).                                |
| `salary_range`      | `varchar(100)` | Salary range for the job.                                                   |
| `application_date`  | `date`         | Date the application was submitted.                                         |
| `status`            | `enum`         | Current status of the application (e.g., `Applied`, `Interview Scheduled`). |
| `application_url`   | `varchar(500)` | URL to the job application.                                                 |
| `job_description`   | `text`         | Description of the job.                                                     |
| `notes`             | `text`         | User's notes about the application.                                         |
| `contact_person`    | `varchar(255)` | Contact person for the application.                                         |
| `contact_email`     | `varchar(255)` | Contact email for the application.                                          |
| `contact_phone`     | `varchar(50)`  | Contact phone for the application.                                          |
| `follow_up_date`    | `date`         | Date for follow-up.                                                         |
| `interview_date`    | `datetime`     | Date and time of the interview.                                             |
| `interview_location`| `varchar(500)` | Location of the interview.                                                  |
| `interview_notes`   | `text`         | User's notes about the interview.                                           |
| `priority`          | `enum`         | Priority of the application (`Low`, `Medium`, `High`).                      |
| `created_at`        | `timestamp`    | Timestamp of application creation.                                          |
| `updated_at`        | `timestamp`    | Timestamp of the last application update.                                   |

---

## Views

Views provide a simplified and secure way to access data from one or more tables.

-   **`recent_activity`**: Provides a summary of recent user activities, making it easy to monitor engagement and troubleshoot issues.
-   **`resume_statistics`**: Aggregates statistics for each resume, such as view counts and ATS scores, offering valuable insights into resume performance.
-   **`user_profile_summary`**: Offers a summarized view of user profiles, including counts of resumes, education, and experience entries.

## Stored Procedures

Stored procedures encapsulate complex database operations, improving performance and security.

-   **`CleanExpiredSessions()`**: Removes expired user sessions from the `sessions` table to maintain a clean and efficient database.
-   **`CreateResumeWithSections()`**: Creates a new resume with default sections for a user, streamlining the resume creation process.
-   **`GetResumeDetails()`**: Retrieves detailed information about a specific resume, including its sections and ATS scores.
-   **`GetUserCompleteProfile()`**: Fetches a user's complete profile, including education, experience, and skills, in a single call.
-   **`LogActivity()`**: Inserts a new record into the `activity_logs` table to track user actions.

## Events

Events are tasks that are automatically executed by the database at a scheduled time.

-   **`clean_expired_sessions_daily`**: A daily event that cleans up expired user sessions to improve performance and security.
-   **`clean_old_activity_logs_monthly`**: A monthly event that removes old activity logs to keep the database size manageable.
-   **`clean_expired_shares_daily`**: A daily event that deactivates expired resume share links to ensure that shared content is not accessible beyond its intended lifespan.