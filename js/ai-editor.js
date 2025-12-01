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
const saveResumeBtn = document.getElementById('saveResumeBtn');
const templateModal = document.getElementById('templateModal');
const categoryBtns = document.querySelectorAll('.category-btn');
const templateCards = document.querySelectorAll('.template-card');
const selectTemplateBtns = document.querySelectorAll('.select-template-btn');

// State
let currentZoom = 100;
let conversationHistory = [];
let resumeState = {
    template: '',
    resume_id: null,
    personal_details: {},
    summary_text: '',
    experience: [],
    education: [],
    skills: '',
    projects: [],
    achievements: '',
    portfolio: [],
    board: [],
    research_interests: '',
    publications: [],
    grants: [],
    teaching: [],
    references: [],
    conversation_stage: 'welcome',
    completed_stages: []
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Show template modal on first load
    const hasSelectedTemplate = sessionStorage.getItem('selectedTemplate');
    if (!hasSelectedTemplate) {
        templateModal.classList.add('show');
        templateModal.classList.remove('hidden');
    } else {
        // Load saved resume state
        const savedState = sessionStorage.getItem('resumeState');
        if (savedState) {
            const parsed = JSON.parse(savedState);
            Object.assign(resumeState, parsed);

            // Load template preview
            if (resumeState.template) {
                loadTemplatePreview(resumeState.template);
            }
        }
    }
});

// Template Modal: Category filtering
categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.dataset.category;

        // Filter template cards
        templateCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

// Template Modal: Select template
selectTemplateBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const templateName = btn.dataset.template;
        selectTemplate(templateName);
    });
});

// Also allow clicking on card to select
templateCards.forEach(card => {
    card.addEventListener('click', (e) => {
        // Don't trigger if clicking on the button
        if (e.target.classList.contains('select-template-btn')) return;

        const templateName = card.dataset.template;
        selectTemplate(templateName);
    });
});

function selectTemplate(templateName) {
    // Get template configuration
    const templateConfig = getTemplateConfig(templateName);

    // Update resume state
    resumeState.template = templateName;
    resumeState.conversation_stage = 'personal_details';
    resumeState.completed_stages = ['welcome'];

    // Store in session (exclude iframe reference)
    sessionStorage.setItem('selectedTemplate', templateName);
    const { previewIframe, ...stateToSave } = resumeState;
    sessionStorage.setItem('resumeState', JSON.stringify(stateToSave));

    // Hide modal
    templateModal.classList.remove('show');
    templateModal.classList.add('hidden');

    // Clear existing conversation
    chatMessages.innerHTML = '';

    // Show welcome message
    const welcomeMsg = `Great choice! Let's build your ${templateConfig.name} resume. I'll guide you through each section step by step.\n\nLet's start with your personal information. Please tell me your full name, email, phone number, and location.`;
    addMessage(welcomeMsg, 'assistant');

    // Initialize preview
    loadTemplatePreview(templateName);

    showNotification(`${templateConfig.name} template selected`);
}

// Auto-resize textarea
if (chatInput) {
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });
}

// Send message
if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();

        if (message) {
            // Check if template is selected
            if (!resumeState.template) {
                showNotification('Please select a template first');
                templateModal.classList.add('show');
                templateModal.classList.remove('hidden');
                return;
            }

            // Add user message to chat
            addMessage(message, 'user');
            chatInput.value = '';
            chatInput.style.height = 'auto';

            // Show typing indicator
            const typingIndicator = showTypingIndicator();

            try {
                // Call AI conversation API
                const response = await fetch('/ATS/api/ai-conversation.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: message,
                        resumeState: resumeState,
                        conversationHistory: conversationHistory
                    })
                });

                const result = await response.json();

                // Remove typing indicator
                typingIndicator.remove();

                console.log('=== AI CONVERSATION RESPONSE ===');
                console.log('Current stage:', result.current_stage);
                console.log('Next stage:', result.next_stage);
                console.log('Extracted data:', result.extracted_data);
                console.log('API Response:', result);

                if (result.success) {
                    // Add AI response to chat
                    const aiMessage = result.ai_message.replace(/```json.*?```/gs, '').trim();
                    addMessage(aiMessage, 'assistant');

                    // Update resume state with extracted data
                    let dataExtracted = false;
                    if (result.extracted_data && Object.keys(result.extracted_data).length > 0) {
                        console.log('Extracted data found:', result.extracted_data);
                        updateResumeState(result.extracted_data);
                        dataExtracted = true;
                    } else {
                        console.log('No extracted data in response');
                    }

                    // Update conversation stage
                    if (result.next_stage) {
                        resumeState.conversation_stage = result.next_stage;
                        if (!resumeState.completed_stages.includes(resumeState.conversation_stage)) {
                            resumeState.completed_stages.push(resumeState.conversation_stage);
                        }
                    }

                    // ALWAYS update preview when data was extracted
                    if (dataExtracted) {
                        console.log('Updating preview because data was extracted');
                        updateResumePreview();
                    }

                    // Save state to session (exclude iframe reference)
                    const { previewIframe, ...stateToSave } = resumeState;
                    sessionStorage.setItem('resumeState', JSON.stringify(stateToSave));
                } else {
                    addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
                    console.error('AI Error:', result);
                }
            } catch (error) {
                typingIndicator.remove();
                addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
                console.error('Fetch Error:', error);
            }
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

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant-message typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fa-solid fa-robot"></i>
        </div>
        <div class="message-content">
            <p>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </p>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingDiv;
}

// Update resume state with extracted data
function updateResumeState(extractedData) {
    console.log('updateResumeState called with extractedData:', extractedData);

    // Personal details
    if (extractedData.fullName || extractedData.email || extractedData.phone || extractedData.professionalTitle) {
        resumeState.personal_details = {
            ...resumeState.personal_details,
            fullName: extractedData.fullName || resumeState.personal_details.fullName || '',
            professionalTitle: extractedData.professionalTitle || resumeState.personal_details.professionalTitle || '',
            email: extractedData.email || resumeState.personal_details.email || '',
            phone: extractedData.phone || resumeState.personal_details.phone || '',
            location: extractedData.location || resumeState.personal_details.location || '',
            linkedin: extractedData.linkedin || resumeState.personal_details.linkedin || ''
        };
        console.log('Updated personal_details:', resumeState.personal_details);
    }

    // Summary
    if (extractedData.summary) {
        resumeState.summary_text = extractedData.summary;
        console.log('Updated summary_text:', resumeState.summary_text);
    }

    // Experience
    if (extractedData.experience && Array.isArray(extractedData.experience)) {
        resumeState.experience = [...resumeState.experience, ...extractedData.experience];
        console.log('Updated experience:', resumeState.experience);
    }

    // Education
    if (extractedData.education && Array.isArray(extractedData.education)) {
        resumeState.education = [...resumeState.education, ...extractedData.education];
        console.log('Updated education:', resumeState.education);
    }

    // Skills
    if (extractedData.skills) {
        resumeState.skills = extractedData.skills;
        console.log('Updated skills:', resumeState.skills);
    }

    // Projects (Technical template)
    if (extractedData.projects && Array.isArray(extractedData.projects)) {
        resumeState.projects = [...resumeState.projects, ...extractedData.projects];
    }

    // Achievements (Executive template)
    if (extractedData.achievements) {
        resumeState.achievements = extractedData.achievements;
    }

    // Research interests (Academic templates)
    if (extractedData.research_interests) {
        resumeState.research_interests = extractedData.research_interests;
    }

    // Publications (Academic templates)
    if (extractedData.publications && Array.isArray(extractedData.publications)) {
        resumeState.publications = [...resumeState.publications, ...extractedData.publications];
    }

    // References (Academic templates)
    if (extractedData.references && Array.isArray(extractedData.references)) {
        resumeState.references = [...resumeState.references, ...extractedData.references];
    }
}

// Load template preview
function loadTemplatePreview(templateName) {
    if (!templateName) {
        resumePreview.innerHTML = `
            <div class="preview-placeholder">
                <i class="fa-solid fa-file-lines"></i>
                <p>Your resume will appear here as you chat with the AI assistant</p>
            </div>
        `;
        return;
    }

    // Create iframe to load template preview
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.src = `/ATS/templates/preview-handler.php?template=${templateName}&mode=full`;
    iframe.id = 'previewIframe';

    resumePreview.innerHTML = '';
    resumePreview.appendChild(iframe);

    // Store iframe reference for later updates
    resumeState.previewIframe = iframe;

    // Wait for iframe to load, then send initial data
    iframe.onload = () => {
        console.log('Preview iframe loaded');
        updateResumePreview();
    };
}

// Update resume preview with current data
function updateResumePreview() {
    console.log('updateResumePreview called');
    const iframe = resumeState.previewIframe;

    if (!iframe) {
        console.error('No iframe found in resumeState');
        return;
    }

    if (!iframe.contentWindow) {
        console.error('iframe.contentWindow is null or undefined');
        return;
    }

    // Create a clean copy of resumeState without the iframe reference
    const cleanState = {
        template: resumeState.template,
        resume_id: resumeState.resume_id,
        personal_details: resumeState.personal_details,
        summary_text: resumeState.summary_text,
        experience: resumeState.experience,
        education: resumeState.education,
        skills: resumeState.skills,
        projects: resumeState.projects,
        achievements: resumeState.achievements,
        portfolio: resumeState.portfolio,
        board: resumeState.board,
        research_interests: resumeState.research_interests,
        publications: resumeState.publications,
        grants: resumeState.grants,
        teaching: resumeState.teaching,
        references: resumeState.references,
        conversation_stage: resumeState.conversation_stage,
        completed_stages: resumeState.completed_stages
    };

    console.log('Sending postMessage to iframe with data:', cleanState);

    // Send resume data to iframe (without the iframe reference)
    iframe.contentWindow.postMessage({
        type: 'updateResume',
        data: cleanState
    }, '*');

    console.log('postMessage sent successfully');
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
            // Clear session storage
            sessionStorage.removeItem('selectedTemplate');
            sessionStorage.removeItem('resumeState');

            // Reset conversation
            conversationHistory = [];
            chatMessages.innerHTML = '';

            // Reset resume state
            resumeState = {
                template: '',
                resume_id: null,
                personal_details: {},
                summary_text: '',
                experience: [],
                education: [],
                skills: '',
                projects: [],
                achievements: '',
                portfolio: [],
                board: [],
                research_interests: '',
                publications: [],
                grants: [],
                teaching: [],
                references: [],
                conversation_stage: 'welcome',
                completed_stages: []
            };

            // Reset preview
            resumePreview.innerHTML = `
                <div class="preview-placeholder">
                    <i class="fa-solid fa-file-lines"></i>
                    <p>Your resume will appear here as you chat with the AI assistant</p>
                </div>
            `;

            // Show template modal
            templateModal.classList.add('show');
            templateModal.classList.remove('hidden');
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

// Save Resume
if (saveResumeBtn) {
    saveResumeBtn.addEventListener('click', async () => {
        try {
            // Check if template is selected
            if (!resumeState.template) {
                showNotification('Please select a template first');
                templateModal.classList.add('show');
                templateModal.classList.remove('hidden');
                return;
            }

            // Check if there's any data to save
            if (!resumeState.personal_details.fullName &&
                resumeState.experience.length === 0 &&
                resumeState.education.length === 0) {
                showNotification('Please add some information before saving');
                return;
            }

            // Show loading state
            saveResumeBtn.disabled = true;
            saveResumeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

            // Prompt for resume title if not set
            let resumeTitle = resumeState.resume_title;
            if (!resumeTitle) {
                resumeTitle = prompt('Enter a title for your resume:', `${resumeState.personal_details.fullName || 'My'} Resume`);
                if (!resumeTitle) {
                    saveResumeBtn.disabled = false;
                    saveResumeBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Resume';
                    return;
                }
            }

            // Call save API
            const response = await fetch('/ATS/api/save-ai-resume.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    resume_id: resumeState.resume_id,
                    resume_title: resumeTitle,
                    template: resumeState.template,
                    resumeState: resumeState
                })
            });

            const result = await response.json();

            // Reset button
            saveResumeBtn.disabled = false;
            saveResumeBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Resume';

            if (result.success) {
                // Update resume state with new ID if created
                if (result.resume_id) {
                    resumeState.resume_id = result.resume_id;
                    resumeState.resume_title = resumeTitle;
                    const { previewIframe, ...stateToSave } = resumeState;
                    sessionStorage.setItem('resumeState', JSON.stringify(stateToSave));
                }

                showNotification(result.message || 'Resume saved successfully!');
            } else {
                showNotification('Failed to save resume: ' + (result.error || 'Unknown error'));
                console.error('Save error:', result);
            }
        } catch (error) {
            saveResumeBtn.disabled = false;
            saveResumeBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Resume';
            showNotification('Error saving resume');
            console.error('Error:', error);
        }
    });
}

// Download PDF
if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
        try {
            // Check if template is selected
            if (!resumeState.template) {
                showNotification('Please select a template first');
                templateModal.classList.add('show');
                templateModal.classList.remove('hidden');
                return;
            }

            const iframe = resumeState.previewIframe;
            if (!iframe || !iframe.contentWindow) {
                showNotification('Preview not loaded yet');
                return;
            }

            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (!iframeDoc) {
                showNotification('Cannot access preview content');
                return;
            }

            // Show loading state
            downloadBtn.disabled = true;
            downloadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';

            showNotification('Generating PDF...');

            // Get the resume container from iframe
            const resumeContainer = iframeDoc.querySelector('.resume-container') || iframeDoc.body;

            // Use html2canvas to capture the preview with high quality
            const canvas = await html2canvas(resumeContainer, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 850
            });

            // Calculate PDF dimensions
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'letter'
            });

            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');

            // Download PDF
            const fullName = resumeState.personal_details.fullName || 'AI_Generated_Resume';
            const filename = fullName.replace(/[^a-zA-Z0-9_\-\.]/g, '_') + '_Resume.pdf';
            pdf.save(filename);

            // Reset button
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i> Download PDF';

            showNotification('PDF downloaded successfully!');
        } catch (error) {
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i> Download PDF';
            console.error('Error downloading PDF:', error);
            showNotification('Error downloading PDF');
        }
    });
}

console.log('AI Editor loaded');
