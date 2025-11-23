<?php
require_once 'config/session.php';
requireLogin();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Resume Editor - ResumeSync</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/ai-editor.css">
</head>
<body class="ai-editor-body">
    <nav class="floating-nav">
        <div class="nav-content">
            <a href="index.html" class="nav-logo" style="text-decoration: none; color: inherit;">ResumeSync</a>
            <div class="nav-links">
                <a href="dashboard.php" class="nav-link">Dashboard</a>
                <a href="score-checker.php" class="nav-link">ATS Checker</a>
                <a href="about.html" class="nav-link">About</a>
                <button class="nav-cta download-btn" id="downloadBtn">Download Resume</button>
            </div>
        </div>
    </nav>

    <div class="ai-editor-container">
        <!-- Left Panel: Chat Interface -->
        <aside class="chat-panel">
            <div class="chat-header">
                <div class="chat-header-content">
                    <i class="fa-solid fa-robot"></i>
                    <div>
                        <h2>AI Resume Assistant</h2>
                        <p>Chat to build your resume</p>
                    </div>
                </div>
                <button class="new-chat-btn" id="newChatBtn">
                    <i class="fa-solid fa-plus"></i>
                    <span>New Chat</span>
                </button>
            </div>

            <div class="chat-messages" id="chatMessages">
                <div class="message assistant-message">
                    <div class="message-avatar">
                        <i class="fa-solid fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <p>Hi! I'm your AI resume assistant. I'll help you build an ATS-optimized resume through conversation.</p>
                        <p>Let's start with some basics. What's your full name and the job title you're targeting?</p>
                    </div>
                </div>

                <div class="message user-message">
                    <div class="message-avatar">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    <div class="message-content">
                        <p>Hi! I'm Mahbubur Rahman Khan and I'm targeting a Senior Software Engineer position.</p>
                    </div>
                </div>

                <div class="message assistant-message">
                    <div class="message-avatar">
                        <i class="fa-solid fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <p>Great to meet you, Mahbubur! I've added your name to the resume. Now, could you tell me about your most recent work experience? Please include your job title, company name, dates, and key responsibilities or achievements.</p>
                    </div>
                </div>

                <div class="message user-message">
                    <div class="message-avatar">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    <div class="message-content">
                        <p>I've been working as a Software Engineer at Brain Station 23 from 2021 to present. I led the development of a microservices architecture that improved system performance by 40%, mentored 5 junior developers, and implemented CI/CD pipelines using Jenkins and Docker.</p>
                    </div>
                </div>

                <div class="message assistant-message">
                    <div class="message-avatar">
                        <i class="fa-solid fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <p>Excellent experience! I've added that to your resume. Would you like to add more work experience, or should we move on to your education background?</p>
                    </div>
                </div>

                <div class="message user-message">
                    <div class="message-avatar">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    <div class="message-content">
                        <p>I have a Bachelor of Science in Computer Science and Engineering from North South University, graduated in 2020.</p>
                    </div>
                </div>

                <div class="message assistant-message">
                    <div class="message-avatar">
                        <i class="fa-solid fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <p>Perfect! I've added your education. Now, what are your key technical skills? Please list skills relevant to the Senior Software Engineer position.</p>
                    </div>
                </div>

                <div class="message user-message">
                    <div class="message-avatar">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    <div class="message-content">
                        <p>JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Kubernetes, PostgreSQL, MongoDB, CI/CD, Microservices Architecture, Agile/Scrum</p>
                    </div>
                </div>

                <div class="message assistant-message">
                    <div class="message-avatar">
                        <i class="fa-solid fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <p>Great skills! I've added them to your resume. Your resume is looking solid! You can continue adding more details, or use the download button to export your resume.</p>
                    </div>
                </div>
            </div>

            <div class="chat-input-container">
                <form class="chat-input-form" id="chatForm">
                    <textarea
                        class="chat-input"
                        id="chatInput"
                        placeholder="Type your message..."
                        rows="1"
                    ></textarea>
                    <button type="submit" class="send-btn" id="sendBtn">
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </form>
                <div class="quick-actions">
                    <button class="quick-action-btn" data-action="add-experience">
                        <i class="fa-solid fa-briefcase"></i>
                        Add Experience
                    </button>
                    <button class="quick-action-btn" data-action="add-education">
                        <i class="fa-solid fa-graduation-cap"></i>
                        Add Education
                    </button>
                    <button class="quick-action-btn" data-action="add-skills">
                        <i class="fa-solid fa-star"></i>
                        Add Skills
                    </button>
                </div>
            </div>
        </aside>

        <!-- Right Panel: Live Preview -->
        <section class="preview-panel">
            <div class="preview-header">
                <h3 class="preview-title">
                    <i class="fa-solid fa-eye"></i>
                    Live Preview
                </h3>
                <div class="preview-actions">
                    <button class="preview-action-btn" id="zoomOutBtn" title="Zoom Out">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <span class="zoom-level" id="zoomLevel">100%</span>
                    <button class="preview-action-btn" id="zoomInBtn" title="Zoom In">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                    <button class="preview-action-btn" id="refreshBtn" title="Refresh">
                        <i class="fa-solid fa-rotate-right"></i>
                    </button>
                </div>
            </div>

            <div class="preview-content" id="previewContent">
                <div class="resume-preview" id="resumePreview">
                    <div class="resume-content">
                        <h1>Mahbubur Rahman Khan</h1>
                        <p><strong>Senior Software Engineer</strong></p>
                        <p style="color: var(--text-light); font-size: 0.9rem;">mahbubur.khan@email.com | +880 1712-345678 | Dhaka, Bangladesh</p>
                        <hr style="border: 1px solid var(--border-color); margin: 1.5rem 0;">

                        <h2>Experience</h2>
                        <div style="margin-bottom: 1.5rem;">
                            <h3>Software Engineer - Brain Station 23</h3>
                            <p style="color: var(--text-light); font-size: 0.9rem; margin-bottom: 0.5rem;">2021 - Present</p>
                            <ul>
                                <li>Led the development of a microservices architecture that improved system performance by 40%</li>
                                <li>Mentored 5 junior developers on best practices and code review processes</li>
                                <li>Implemented CI/CD pipelines using Jenkins and Docker, reducing deployment time by 60%</li>
                                <li>Collaborated with cross-functional teams to deliver features on time and within budget</li>
                            </ul>
                        </div>

                        <h2>Education</h2>
                        <div style="margin-bottom: 1.5rem;">
                            <h3>Bachelor of Science in Computer Science and Engineering</h3>
                            <p style="color: var(--text-light); font-size: 0.9rem; margin-bottom: 0.5rem;">North South University - 2020</p>
                            <p>Relevant coursework: Data Structures, Algorithms, Software Engineering, Database Systems, Machine Learning</p>
                        </div>

                        <h2>Skills</h2>
                        <ul style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
                            <li>JavaScript</li>
                            <li>TypeScript</li>
                            <li>React</li>
                            <li>Node.js</li>
                            <li>Python</li>
                            <li>AWS</li>
                            <li>Docker</li>
                            <li>Kubernetes</li>
                            <li>PostgreSQL</li>
                            <li>MongoDB</li>
                            <li>CI/CD</li>
                            <li>Microservices Architecture</li>
                            <li>Agile/Scrum</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    </div>

    <script src="js/app.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="js/ai-editor.js"></script>
</body>
</html>
