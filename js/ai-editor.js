// AI Editor JavaScript

// Elements
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChatBtn');
const quickActionBtns = document.querySelectorAll('.quick-action-btn');
const resumePreview = document.getElementById('resumePreview');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomLevel = document.getElementById('zoomLevel');
const refreshBtn = document.getElementById('refreshBtn');
const downloadBtn = document.getElementById('downloadBtn');

// State
let currentZoom = 100;
let conversationHistory = [];
let resumeData = {
    name: '',
    title: '',
    contact: {},
    summary: '',
    experience: [],
    education: [],
    skills: []
};

// Auto-resize textarea
if (chatInput) {
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });
}

// Send message
if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();

        if (message) {
            addMessage(message, 'user');
            chatInput.value = '';
            chatInput.style.height = 'auto';

            // Simulate AI response
            setTimeout(() => {
                generateAIResponse(message);
            }, 1000);
        }
    });
}

// Add message to chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'assistant'
        ? '<i class="fa-solid fa-robot"></i>'
        : '<i class="fa-solid fa-user"></i>';

    const content = document.createElement('div');
    content.className = 'message-content';

    const p = document.createElement('p');
    p.textContent = text;
    content.appendChild(p);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    conversationHistory.push({ sender, text });
}

// Generate AI response (simulated)
function generateAIResponse(userMessage) {
    let response = '';

    const lowerMessage = userMessage.toLowerCase();

    // Detect what user is talking about and respond accordingly
    if (lowerMessage.includes('name') || conversationHistory.length <= 2) {
        response = "Great! Now, could you tell me about your most recent work experience? Please include your job title, company name, dates, and key responsibilities.";

        // Extract name if possible
        if (userMessage.includes(' ')) {
            resumeData.name = userMessage.split(' ').slice(0, 2).join(' ');
            updateResumePreview();
        }
    } else if (lowerMessage.includes('experience') || lowerMessage.includes('work') || lowerMessage.includes('job')) {
        response = "Excellent! I've added that experience to your resume. Would you like to add more work experience, or should we move on to your education?";

        // Add experience
        resumeData.experience.push({
            title: 'Job Title',
            company: 'Company Name',
            period: '2020 - Present',
            description: userMessage
        });
        updateResumePreview();
    } else if (lowerMessage.includes('education') || lowerMessage.includes('degree') || lowerMessage.includes('university')) {
        response = "Perfect! I've noted your education. Now, what are your key skills? Please list skills relevant to your target position.";

        // Add education
        resumeData.education.push({
            degree: 'Degree',
            school: 'Institution',
            year: '2020',
            description: userMessage
        });
        updateResumePreview();
    } else if (lowerMessage.includes('skill') || lowerMessage.includes('technical') || lowerMessage.includes('proficient')) {
        response = "Great skills! I've added them to your resume. Your resume is looking good! Would you like to add anything else, or should I help you optimize it for ATS?";

        // Add skills
        const skills = userMessage.split(',').map(s => s.trim());
        resumeData.skills.push(...skills);
        updateResumePreview();
    } else {
        response = "I understand. Is there anything specific you'd like to add or modify in your resume? I can help with experience, education, skills, or any other section.";
    }

    addMessage(response, 'assistant');
}

// Update resume preview
function updateResumePreview() {
    if (!resumeData.name && resumeData.experience.length === 0 && resumeData.education.length === 0) {
        return;
    }

    let html = '<div class="resume-content">';

    // Header
    if (resumeData.name) {
        html += `<h1>${resumeData.name}</h1>`;
        if (resumeData.title) {
            html += `<p><strong>${resumeData.title}</strong></p>`;
        }
        html += '<hr style="border: 1px solid var(--border-color); margin: 1.5rem 0;">';
    }

    // Experience
    if (resumeData.experience.length > 0) {
        html += '<h2>Experience</h2>';
        resumeData.experience.forEach(exp => {
            html += `
                <div style="margin-bottom: 1.5rem;">
                    <h3>${exp.title} - ${exp.company}</h3>
                    <p style="color: var(--text-light); font-size: 0.9rem; margin-bottom: 0.5rem;">${exp.period}</p>
                    <p>${exp.description}</p>
                </div>
            `;
        });
    }

    // Education
    if (resumeData.education.length > 0) {
        html += '<h2>Education</h2>';
        resumeData.education.forEach(edu => {
            html += `
                <div style="margin-bottom: 1.5rem;">
                    <h3>${edu.degree}</h3>
                    <p style="color: var(--text-light); font-size: 0.9rem; margin-bottom: 0.5rem;">${edu.school} - ${edu.year}</p>
                    <p>${edu.description}</p>
                </div>
            `;
        });
    }

    // Skills
    if (resumeData.skills.length > 0) {
        html += '<h2>Skills</h2>';
        html += '<ul>';
        resumeData.skills.forEach(skill => {
            html += `<li>${skill}</li>`;
        });
        html += '</ul>';
    }

    html += '</div>';

    resumePreview.innerHTML = html;
}

// Quick actions
quickActionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        let prompt = '';

        switch(action) {
            case 'add-experience':
                prompt = 'Add my work experience';
                break;
            case 'add-education':
                prompt = 'Add my education';
                break;
            case 'add-skills':
                prompt = 'Add my skills';
                break;
        }

        chatInput.value = prompt;
        chatInput.focus();
    });
});

// New chat
if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
        if (confirm('Start a new chat? This will clear your current conversation.')) {
            // Clear messages except first one
            const firstMessage = chatMessages.firstElementChild;
            chatMessages.innerHTML = '';
            chatMessages.appendChild(firstMessage);

            conversationHistory = [];
            resumeData = {
                name: '',
                title: '',
                contact: {},
                summary: '',
                experience: [],
                education: [],
                skills: []
            };

            resumePreview.innerHTML = `
                <div class="preview-placeholder">
                    <i class="fa-solid fa-file-lines"></i>
                    <p>Your resume will appear here as you chat with the AI assistant</p>
                </div>
            `;
        }
    });
}

// Zoom controls
if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
        if (currentZoom < 150) {
            currentZoom += 10;
            updateZoom();
        }
    });
}

if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
        if (currentZoom > 50) {
            currentZoom -= 10;
            updateZoom();
        }
    });
}

function updateZoom() {
    resumePreview.style.transform = `scale(${currentZoom / 100})`;
    resumePreview.style.transformOrigin = 'top center';
    zoomLevel.textContent = currentZoom + '%';
}

// Refresh preview
if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        updateResumePreview();
        showNotification('Preview refreshed');
    });
}

// Download
if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
        try {
            // Get the preview iframe
            if (!resumePreview || !resumePreview.contentWindow) {
                showNotification('Preview not loaded yet');
                return;
            }

            const previewDoc = resumePreview.contentDocument || resumePreview.contentWindow.document;
            if (!previewDoc) {
                showNotification('Cannot access preview content');
                return;
            }

            showNotification('Generating PDF...');

            // Get the resume container from iframe
            const resumeContainer = previewDoc.querySelector('.resume-container') || previewDoc.body;

            // Use html2canvas to capture the preview with high quality
            const canvas = await html2canvas(resumeContainer, {
                scale: 2, // Higher quality
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 850, // Standard resume width
                windowHeight: resumeContainer.scrollHeight
            });

            // Calculate PDF dimensions (US Letter: 8.5 x 11 inches)
            const imgWidth = 210; // A4 width in mm (close to Letter)
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Create PDF using jsPDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'letter'
            });

            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');

            // Download PDF
            const fullName = previewDoc.querySelector('[data-field="name"]')?.textContent || 'AI_Generated_Resume';
            const filename = fullName.replace(/[^a-zA-Z0-9_\-\.]/g, '_') + '_Resume.pdf';
            pdf.save(filename);

            showNotification('PDF downloaded successfully!');
        } catch (error) {
            console.error('Error downloading PDF:', error);
            showNotification('Error downloading PDF');
        }
    });
}

console.log('AI Editor loaded');
