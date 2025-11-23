// Resume Editor - Full Functionality

let currentResumeData = resumeData || {}; // Resume data from PHP
let experienceItems = [];
let educationItems = [];
let projectItems = [];
let boardItems = [];
let portfolioItems = [];
let publicationItems = [];
let grantItems = [];
let teachingItems = [];
let referenceItems = [];

// Template configuration mapping
const TEMPLATE_CONFIG = {
    'classic': {
        type: 'professional',
        fields: []
    },
    'modern': {
        type: 'professional',
        fields: []
    },
    'professional': {
        type: 'professional',
        fields: []
    },
    'technical': {
        type: 'professional',
        fields: ['projects']
    },
    'executive': {
        type: 'professional',
        fields: ['achievements', 'board']
    },
    'creative': {
        type: 'professional',
        fields: ['portfolio']
    },
    'academic-standard': {
        type: 'academic',
        fields: ['researchInterests', 'publications', 'grants', 'teaching', 'references']
    },
    'research-scientist': {
        type: 'academic',
        fields: ['researchInterests', 'publications', 'grants', 'references']
    },
    'teaching-faculty': {
        type: 'academic',
        fields: ['researchInterests', 'publications', 'teaching', 'references']
    }
};

// Initialize editor
document.addEventListener('DOMContentLoaded', () => {
    initializeEditor();
    loadTemplatePreview();
    setupEventListeners();

    // Check if auto-download is requested
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('download') === 'true') {
        // Wait for preview to load, then auto-download
        setTimeout(() => {
            downloadPDF();
        }, 2000); // Give preview time to render
    }
});

function initializeEditor() {
    // Load experience and education from user database
    loadExperienceAndEducation();

    // Adjust fields for current template
    adjustFieldsForTemplate(currentResumeData.template_name || 'classic');

    // Set initial values if editing existing resume
    if (currentResumeData.id) {
        console.log('Editing existing resume:', currentResumeData.id);
    } else {
        console.log('Creating new resume');
    }
}

function adjustFieldsForTemplate(templateName) {
    // Hide all template-specific sections first
    document.querySelectorAll('.template-specific').forEach(section => {
        section.style.display = 'none';
    });

    // Get template configuration
    const config = TEMPLATE_CONFIG[templateName];
    if (!config) {
        console.warn('Unknown template:', templateName);
        return;
    }

    // Show relevant sections based on template type and initialize if empty
    config.fields.forEach(field => {
        const sectionMap = {
            'projects': { id: 'projectsSection', init: () => { if (projectItems.length === 0) addProjectItem(); } },
            'achievements': { id: 'achievementsSection' },
            'board': { id: 'boardSection', init: () => { if (boardItems.length === 0) addBoardItem(); } },
            'portfolio': { id: 'portfolioSection', init: () => { if (portfolioItems.length === 0) addPortfolioItem(); } },
            'researchInterests': { id: 'researchInterestsSection' },
            'publications': { id: 'publicationsSection', init: () => { if (publicationItems.length === 0) addPublicationItem(); } },
            'grants': { id: 'grantsSection', init: () => { if (grantItems.length === 0) addGrantItem(); } },
            'teaching': { id: 'teachingSection', init: () => { if (teachingItems.length === 0) addTeachingItem(); } },
            'references': { id: 'referencesSection', init: () => { if (referenceItems.length === 0) addReferenceItem(); } }
        };

        const sectionInfo = sectionMap[field];
        if (sectionInfo) {
            const section = document.getElementById(sectionInfo.id);
            if (section) {
                section.style.display = 'block';
                // Initialize with one empty item if init function exists
                if (sectionInfo.init) {
                    sectionInfo.init();
                }
            }
        }
    });

    console.log(`Adjusted fields for template: ${templateName} (${config.type})`);
}

function loadExperienceAndEducation() {
    // Fetch experience
    fetch('/ATS/api/get-user-data.php?type=experience')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.length > 0) {
                experienceItems = data.data;
                renderExperienceItems();
            } else {
                addExperienceItem(); // Add one empty item
            }
        })
        .catch(err => {
            console.error('Error loading experience:', err);
            addExperienceItem(); // Add one empty item on error
        });

    // Fetch education
    fetch('/ATS/api/get-user-data.php?type=education')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.length > 0) {
                educationItems = data.data;
                renderEducationItems();
            } else {
                addEducationItem(); // Add one empty item
            }
        })
        .catch(err => {
            console.error('Error loading education:', err);
            addEducationItem(); // Add one empty item on error
        });
}

function renderExperienceItems() {
    const container = document.getElementById('experienceContainer');
    container.innerHTML = '';

    experienceItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'experience-item';
        div.innerHTML = `
            <input type="text" class="form-input" placeholder="Job Title" value="${item.job_title || ''}" data-index="${index}" data-field="job_title">
            <input type="text" class="form-input" placeholder="Company Name" value="${item.company_name || ''}" data-index="${index}" data-field="company_name">
            <input type="text" class="form-input" placeholder="Location" value="${item.location || ''}" data-index="${index}" data-field="location">
            <div style="display: flex; gap: 10px;">
                <input type="text" class="form-input small" placeholder="Start Date (e.g., Jan 2020)" value="${item.start_date || ''}" data-index="${index}" data-field="start_date">
                <input type="text" class="form-input small" placeholder="End Date (e.g., Present)" value="${item.end_date || ''}" data-index="${index}" data-field="end_date">
            </div>
            <textarea class="form-textarea" placeholder="Description (separate bullet points with new lines)" rows="3" data-index="${index}" data-field="description">${item.description || ''}</textarea>
            ${experienceItems.length > 1 ? `<button class="remove-btn" onclick="removeExperience(${index})">Remove</button>` : ''}
        `;
        container.appendChild(div);
    });

    // Add event listeners
    container.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            const field = e.target.dataset.field;
            experienceItems[index][field] = e.target.value;
            debounceUpdatePreview();
        });
    });
}

function renderEducationItems() {
    const container = document.getElementById('educationContainer');
    container.innerHTML = '';

    educationItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'education-item';
        div.innerHTML = `
            <input type="text" class="form-input" placeholder="Degree" value="${item.degree || ''}" data-index="${index}" data-field="degree">
            <input type="text" class="form-input" placeholder="Institution" value="${item.institution || ''}" data-index="${index}" data-field="institution">
            <input type="text" class="form-input" placeholder="Location" value="${item.location || ''}" data-index="${index}" data-field="location">
            <div style="display: flex; gap: 10px;">
                <input type="text" class="form-input small" placeholder="Start Date" value="${item.start_date || ''}" data-index="${index}" data-field="start_date">
                <input type="text" class="form-input small" placeholder="End Date" value="${item.end_date || ''}" data-index="${index}" data-field="end_date">
            </div>
            ${educationItems.length > 1 ? `<button class="remove-btn" onclick="removeEducation(${index})">Remove</button>` : ''}
        `;
        container.appendChild(div);
    });

    // Add event listeners
    container.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            const field = e.target.dataset.field;
            educationItems[index][field] = e.target.value;
            debounceUpdatePreview();
        });
    });
}

function addExperienceItem() {
    experienceItems.push({
        job_title: '',
        company_name: '',
        location: '',
        start_date: '',
        end_date: '',
        description: ''
    });
    renderExperienceItems();
}

function addEducationItem() {
    educationItems.push({
        degree: '',
        institution: '',
        location: '',
        start_date: '',
        end_date: ''
    });
    renderEducationItems();
}

function removeExperience(index) {
    if (experienceItems.length > 1) {
        experienceItems.splice(index, 1);
        renderExperienceItems();
        debounceUpdatePreview();
    }
}

function removeEducation(index) {
    if (educationItems.length > 1) {
        educationItems.splice(index, 1);
        renderEducationItems();
        debounceUpdatePreview();
    }
}

// ============================================
// Template-Specific Field Management
// ============================================

// Projects (Technical Template)
function addProjectItem() {
    projectItems.push({
        name: '',
        technologies: '',
        description: ''
    });
    renderProjectItems();
}

function renderProjectItems() {
    const container = document.getElementById('projectsContainer');
    if (!container) return;

    container.innerHTML = '';
    projectItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'experience-item';
        div.innerHTML = `
            <input type="text" class="form-input" placeholder="Project Name" value="${item.name || ''}" data-index="${index}" data-field="name">
            <input type="text" class="form-input" placeholder="Technologies Used (e.g., React, Node.js)" value="${item.technologies || ''}" data-index="${index}" data-field="technologies">
            <textarea class="form-textarea" placeholder="Project Description" rows="3" data-index="${index}" data-field="description">${item.description || ''}</textarea>
            ${projectItems.length > 1 ? `<button class="remove-btn" onclick="removeProject(${index})">Remove</button>` : ''}
        `;
        container.appendChild(div);
    });

    container.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            const field = e.target.dataset.field;
            projectItems[index][field] = e.target.value;
            debounceUpdatePreview();
        });
    });
}

function removeProject(index) {
    if (projectItems.length > 1) {
        projectItems.splice(index, 1);
        renderProjectItems();
        debounceUpdatePreview();
    }
}

// Board Memberships (Executive Template)
function addBoardItem() {
    boardItems.push({
        title: '',
        organization: '',
        years: ''
    });
    renderBoardItems();
}

function renderBoardItems() {
    const container = document.getElementById('boardContainer');
    if (!container) return;

    container.innerHTML = '';
    boardItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'education-item';
        div.innerHTML = `
            <input type="text" class="form-input" placeholder="Title (e.g., Board of Directors)" value="${item.title || ''}" data-index="${index}" data-field="title">
            <input type="text" class="form-input" placeholder="Organization Name" value="${item.organization || ''}" data-index="${index}" data-field="organization">
            <input type="text" class="form-input" placeholder="Years (e.g., 2020-Present)" value="${item.years || ''}" data-index="${index}" data-field="years">
            ${boardItems.length > 1 ? `<button class="remove-btn" onclick="removeBoard(${index})">Remove</button>` : ''}
        `;
        container.appendChild(div);
    });

    container.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            const field = e.target.dataset.field;
            boardItems[index][field] = e.target.value;
            debounceUpdatePreview();
        });
    });
}

function removeBoard(index) {
    if (boardItems.length > 1) {
        boardItems.splice(index, 1);
        renderBoardItems();
        debounceUpdatePreview();
    }
}

// Portfolio (Creative Template)
function addPortfolioItem() {
    portfolioItems.push({
        name: '',
        role: '',
        description: '',
        link: ''
    });
    renderPortfolioItems();
}

function renderPortfolioItems() {
    const container = document.getElementById('portfolioContainer');
    if (!container) return;

    container.innerHTML = '';
    portfolioItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'experience-item';
        div.innerHTML = `
            <input type="text" class="form-input" placeholder="Project Name" value="${item.name || ''}" data-index="${index}" data-field="name">
            <input type="text" class="form-input" placeholder="Role (e.g., Lead Designer)" value="${item.role || ''}" data-index="${index}" data-field="role">
            <textarea class="form-textarea" placeholder="Description" rows="2" data-index="${index}" data-field="description">${item.description || ''}</textarea>
            <input type="text" class="form-input" placeholder="Portfolio Link (optional)" value="${item.link || ''}" data-index="${index}" data-field="link">
            ${portfolioItems.length > 1 ? `<button class="remove-btn" onclick="removePortfolio(${index})">Remove</button>` : ''}
        `;
        container.appendChild(div);
    });

    container.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            const field = e.target.dataset.field;
            portfolioItems[index][field] = e.target.value;
            debounceUpdatePreview();
        });
    });
}

function removePortfolio(index) {
    if (portfolioItems.length > 1) {
        portfolioItems.splice(index, 1);
        renderPortfolioItems();
        debounceUpdatePreview();
    }
}

// Publications (Academic Templates)
function addPublicationItem() {
    publicationItems.push({
        authors: '',
        year: '',
        title: '',
        journal: '',
        details: ''
    });
    renderPublicationItems();
}

function renderPublicationItems() {
    const container = document.getElementById('publicationsContainer');
    if (!container) return;

    container.innerHTML = '';
    publicationItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'experience-item';
        div.innerHTML = `
            <input type="text" class="form-input" placeholder="Authors (e.g., Smith, J., & Doe, A.)" value="${item.authors || ''}" data-index="${index}" data-field="authors">
            <input type="text" class="form-input small" placeholder="Year" value="${item.year || ''}" data-index="${index}" data-field="year">
            <input type="text" class="form-input" placeholder="Publication Title" value="${item.title || ''}" data-index="${index}" data-field="title">
            <input type="text" class="form-input" placeholder="Journal/Conference Name" value="${item.journal || ''}" data-index="${index}" data-field="journal">
            <input type="text" class="form-input" placeholder="Details (e.g., 45(3), 234-256)" value="${item.details || ''}" data-index="${index}" data-field="details">
            ${publicationItems.length > 1 ? `<button class="remove-btn" onclick="removePublication(${index})">Remove</button>` : ''}
        `;
        container.appendChild(div);
    });

    container.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            const field = e.target.dataset.field;
            publicationItems[index][field] = e.target.value;
            debounceUpdatePreview();
        });
    });
}

function removePublication(index) {
    if (publicationItems.length > 1) {
        publicationItems.splice(index, 1);
        renderPublicationItems();
        debounceUpdatePreview();
    }
}

// Grants (Academic Templates)
function addGrantItem() {
    grantItems.push({
        title: '',
        role: '',
        amount: '',
        years: ''
    });
    renderGrantItems();
}

function renderGrantItems() {
    const container = document.getElementById('grantsContainer');
    if (!container) return;

    container.innerHTML = '';
    grantItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'education-item';
        div.innerHTML = `
            <input type="text" class="form-input" placeholder="Grant Title (e.g., NIH R01)" value="${item.title || ''}" data-index="${index}" data-field="title">
            <input type="text" class="form-input" placeholder="Role (e.g., Principal Investigator)" value="${item.role || ''}" data-index="${index}" data-field="role">
            <input type="text" class="form-input" placeholder="Amount (e.g., $500,000)" value="${item.amount || ''}" data-index="${index}" data-field="amount">
            <input type="text" class="form-input" placeholder="Years (e.g., 2023-2028)" value="${item.years || ''}" data-index="${index}" data-field="years">
            ${grantItems.length > 1 ? `<button class="remove-btn" onclick="removeGrant(${index})">Remove</button>` : ''}
        `;
        container.appendChild(div);
    });

    container.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            const field = e.target.dataset.field;
            grantItems[index][field] = e.target.value;
            debounceUpdatePreview();
        });
    });
}

function removeGrant(index) {
    if (grantItems.length > 1) {
        grantItems.splice(index, 1);
        renderGrantItems();
        debounceUpdatePreview();
    }
}

// Teaching (Academic Templates)
function addTeachingItem() {
    teachingItems.push({
        courses: '',
        institution: '',
        years: ''
    });
    renderTeachingItems();
}

function renderTeachingItems() {
    const container = document.getElementById('teachingContainer');
    if (!container) return;

    container.innerHTML = '';
    teachingItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'education-item';
        div.innerHTML = `
            <input type="text" class="form-input" placeholder="Course(s) Taught" value="${item.courses || ''}" data-index="${index}" data-field="courses">
            <input type="text" class="form-input" placeholder="Institution" value="${item.institution || ''}" data-index="${index}" data-field="institution">
            <input type="text" class="form-input" placeholder="Years" value="${item.years || ''}" data-index="${index}" data-field="years">
            ${teachingItems.length > 1 ? `<button class="remove-btn" onclick="removeTeaching(${index})">Remove</button>` : ''}
        `;
        container.appendChild(div);
    });

    container.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            const field = e.target.dataset.field;
            teachingItems[index][field] = e.target.value;
            debounceUpdatePreview();
        });
    });
}

function removeTeaching(index) {
    if (teachingItems.length > 1) {
        teachingItems.splice(index, 1);
        renderTeachingItems();
        debounceUpdatePreview();
    }
}

// References (Academic Templates)
function addReferenceItem() {
    referenceItems.push({
        name: '',
        title: '',
        institution: '',
        email: '',
        phone: ''
    });
    renderReferenceItems();
}

function renderReferenceItems() {
    const container = document.getElementById('referencesContainer');
    if (!container) return;

    container.innerHTML = '';
    referenceItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'experience-item';
        div.innerHTML = `
            <input type="text" class="form-input" placeholder="Name (e.g., Dr. Jane Smith)" value="${item.name || ''}" data-index="${index}" data-field="name">
            <input type="text" class="form-input" placeholder="Title (e.g., Professor of Psychology)" value="${item.title || ''}" data-index="${index}" data-field="title">
            <input type="text" class="form-input" placeholder="Institution" value="${item.institution || ''}" data-index="${index}" data-field="institution">
            <input type="email" class="form-input" placeholder="Email" value="${item.email || ''}" data-index="${index}" data-field="email">
            <input type="tel" class="form-input" placeholder="Phone" value="${item.phone || ''}" data-index="${index}" data-field="phone">
            ${referenceItems.length > 1 ? `<button class="remove-btn" onclick="removeReference(${index})">Remove</button>` : ''}
        `;
        container.appendChild(div);
    });

    container.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            const field = e.target.dataset.field;
            referenceItems[index][field] = e.target.value;
            debounceUpdatePreview();
        });
    });
}

function removeReference(index) {
    if (referenceItems.length > 1) {
        referenceItems.splice(index, 1);
        renderReferenceItems();
        debounceUpdatePreview();
    }
}

function setupEventListeners() {
    // Add Experience button
    document.getElementById('addExperienceBtn')?.addEventListener('click', addExperienceItem);

    // Add Education button
    document.getElementById('addEducationBtn')?.addEventListener('click', addEducationItem);

    // Template-specific add buttons
    document.getElementById('addProjectBtn')?.addEventListener('click', addProjectItem);
    document.getElementById('addBoardBtn')?.addEventListener('click', addBoardItem);
    document.getElementById('addPortfolioBtn')?.addEventListener('click', addPortfolioItem);
    document.getElementById('addPublicationBtn')?.addEventListener('click', addPublicationItem);
    document.getElementById('addGrantBtn')?.addEventListener('click', addGrantItem);
    document.getElementById('addTeachingBtn')?.addEventListener('click', addTeachingItem);
    document.getElementById('addReferenceBtn')?.addEventListener('click', addReferenceItem);

    // Template selection
    document.getElementById('templateSelect')?.addEventListener('change', (e) => {
        currentResumeData.template_name = e.target.value;
        document.getElementById('currentTemplateName').textContent = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
        adjustFieldsForTemplate(e.target.value);
        loadTemplatePreview();
    });

    // Change Template button - opens the template dropdown
    document.getElementById('changeTemplateBtn')?.addEventListener('click', () => {
        const templateSelect = document.getElementById('templateSelect');
        if (templateSelect) {
            // Scroll to template selector
            templateSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Focus on the select to open it
            templateSelect.focus();
            // Add a brief highlight effect
            templateSelect.style.boxShadow = '0 0 0 4px rgba(124, 58, 237, 0.2)';
            setTimeout(() => {
                templateSelect.style.boxShadow = '';
            }, 1500);
        }
    });

    // All form inputs (including template-specific ones)
    const formInputs = document.querySelectorAll('.form-input, .form-textarea');
    formInputs.forEach(input => {
        input.addEventListener('input', debounceUpdatePreview);
    });

    // Template-specific text areas
    document.getElementById('achievements')?.addEventListener('input', debounceUpdatePreview);
    document.getElementById('researchInterests')?.addEventListener('input', debounceUpdatePreview);

    // Save Resume button
    document.getElementById('saveResumeBtn')?.addEventListener('click', saveResume);

    // Download PDF button
    document.getElementById('downloadBtn')?.addEventListener('click', downloadPDF);

    // Job Description Toggle
    setupJobDescriptionToggle();
}

function loadTemplatePreview() {
    const iframe = document.getElementById('resumePreview');
    const templateName = currentResumeData.template_name || 'classic';
    iframe.src = `/ATS/templates/${templateName}.html`;

    // Update preview with data after iframe loads
    iframe.onload = () => {
        updatePreview();
    };
}

let updateTimer;
function debounceUpdatePreview() {
    clearTimeout(updateTimer);
    updateTimer = setTimeout(updatePreview, 300);
}

function updatePreview() {
    const iframe = document.getElementById('resumePreview');
    if (!iframe || !iframe.contentWindow) return;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (!iframeDoc) return;

    // Get form values
    const formData = {
        fullName: document.getElementById('fullName')?.value || '',
        professionalTitle: document.getElementById('professionalTitle')?.value || '',
        email: document.getElementById('email')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        location: document.getElementById('location')?.value || '',
        linkedin: document.getElementById('linkedin')?.value || '',
        summary: document.getElementById('summary')?.value || ''
    };

    // Update personal details
    Object.keys(formData).forEach(key => {
        const element = iframeDoc.querySelector(`[data-field="${key}"]`);
        if (element) {
            element.textContent = formData[key];
        }
    });

    // Update experience section
    const expContainer = iframeDoc.querySelector('[data-field="experience"]');
    if (expContainer && experienceItems.length > 0) {
        expContainer.innerHTML = '';
        experienceItems.forEach(item => {
            if (!item.job_title && !item.company_name) return; // Skip empty items

            const entryDiv = document.createElement('div');
            entryDiv.className = 'entry';

            let html = '<div class="entry-header">';
            html += '<div class="entry-title-line">';
            html += `<div class="entry-title">${item.job_title || ''}</div>`;
            html += `<div class="entry-date">${item.start_date || ''} ${item.end_date ? '- ' + item.end_date : ''}</div>`;
            html += '</div>';
            html += `<div class="entry-company">${item.company_name || ''}${item.location ? ', ' + item.location : ''}</div>`;
            html += '</div>';

            if (item.description) {
                html += '<div class="entry-description"><ul>';
                const bullets = item.description.split('\n').filter(line => line.trim());
                bullets.forEach(bullet => {
                    html += `<li>${bullet}</li>`;
                });
                html += '</ul></div>';
            }

            entryDiv.innerHTML = html;
            expContainer.appendChild(entryDiv);
        });
    }

    // Update education section
    const eduContainer = iframeDoc.querySelector('[data-field="education"]');
    if (eduContainer && educationItems.length > 0) {
        eduContainer.innerHTML = '';
        educationItems.forEach(item => {
            if (!item.degree && !item.institution) return; // Skip empty items

            const entryDiv = document.createElement('div');
            entryDiv.className = 'entry';

            let html = '<div class="entry-header">';
            html += '<div class="entry-title-line">';
            html += `<div class="entry-title">${item.degree || ''}</div>`;
            html += `<div class="entry-date">${item.start_date || ''} ${item.end_date ? '- ' + item.end_date : ''}</div>`;
            html += '</div>';
            html += `<div class="entry-company">${item.institution || ''}${item.location ? ', ' + item.location : ''}</div>`;
            html += '</div>';

            entryDiv.innerHTML = html;
            eduContainer.appendChild(entryDiv);
        });
    }

    // Update skills section
    const skills = document.getElementById('skills')?.value || '';
    const skillsContainer = iframeDoc.querySelector('[data-field="skills"]');
    if (skillsContainer && skills) {
        const templateName = currentResumeData.template_name || 'classic';

        if (templateName === 'classic') {
            // Classic template uses skill-item spans
            skillsContainer.innerHTML = '';
            const skillArray = skills.split(',').map(s => s.trim()).filter(s => s);
            skillArray.forEach(skill => {
                const span = document.createElement('span');
                span.className = 'skill-item';
                span.textContent = skill;
                skillsContainer.appendChild(span);
            });
        } else if (templateName === 'modern') {
            // Modern template uses skill categories grid
            skillsContainer.innerHTML = '';
            const skillArray = skills.split(',').map(s => s.trim()).filter(s => s);

            // Group skills (simplified - just show all in one category)
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'skill-category';
            categoryDiv.innerHTML = `
                <div class="skill-category-title">Skills</div>
                <div class="skill-items">${skillArray.join(', ')}</div>
            `;
            skillsContainer.appendChild(categoryDiv);
        } else if (templateName === 'professional') {
            // Professional template uses skill rows
            skillsContainer.innerHTML = '';
            const skillArray = skills.split(',').map(s => s.trim()).filter(s => s);

            const rowDiv = document.createElement('div');
            rowDiv.className = 'skill-row';
            rowDiv.innerHTML = `
                <span class="skill-label">Skills:</span>
                <span class="skill-items">${skillArray.join(', ')}</span>
            `;
            skillsContainer.appendChild(rowDiv);
        }
    }
}

function saveResume() {
    const resumeTitle = document.getElementById('resumeTitle')?.value.trim();

    if (!resumeTitle) {
        showNotification('Please enter a resume title');
        return;
    }

    const personalDetails = {
        fullName: document.getElementById('fullName')?.value || '',
        professionalTitle: document.getElementById('professionalTitle')?.value || '',
        email: document.getElementById('email')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        location: document.getElementById('location')?.value || '',
        linkedin: document.getElementById('linkedin')?.value || ''
    };

    const summary = document.getElementById('summary')?.value || '';
    const templateName = document.getElementById('templateSelect')?.value || 'classic';

    const data = {
        resume_id: currentResumeData.id || null,
        resume_title: resumeTitle,
        template_name: templateName,
        personal_details: personalDetails,
        summary_text: summary,
        status: 'draft'
    };

    showNotification('Saving resume...');

    fetch('/ATS/api/save-resume.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showNotification('Resume saved successfully!');
            currentResumeData.id = result.resume_id;

            // Update URL without reload
            if (!window.location.search.includes('id=')) {
                const newUrl = window.location.pathname + '?id=' + result.resume_id;
                window.history.pushState({}, '', newUrl);
            }
        } else {
            showNotification('Error: ' + result.message);
        }
    })
    .catch(err => {
        console.error('Save error:', err);
        showNotification('Failed to save resume');
    });
}

async function downloadPDF() {
    try {
        // Get the preview iframe
        const iframe = document.getElementById('resumePreview');
        if (!iframe || !iframe.contentWindow) {
            showNotification('Preview not loaded yet');
            return;
        }

        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (!iframeDoc) {
            showNotification('Cannot access preview content');
            return;
        }

        showNotification('Generating PDF...');

        // Get the resume container from iframe
        const resumeContainer = iframeDoc.querySelector('.resume-container') || iframeDoc.body;

        // Use html2canvas to capture the preview with high quality
        const canvas = await html2canvas(resumeContainer, {
            scale: 2, // Higher quality
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 850, // Standard resume width
            windowHeight: resumeContainer.scrollHeight
        });

        // Find intelligent break points AFTER capturing (to get correct scaling)
        const canvasScale = canvas.height / resumeContainer.scrollHeight;
        const breakPoints = findIntelligentBreakPoints(iframeDoc, resumeContainer, canvasScale);

        // Create PDF using jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: 'letter',
            hotfixes: ['px_scaling']
        });

        // PDF page dimensions in pixels
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Calculate how the canvas width should fit to PDF width
        const ratio = pdfWidth / canvas.width;
        const canvasHeight = canvas.height;
        const scaledCanvasHeight = canvasHeight * ratio;

        console.log(`Canvas: ${canvas.width}x${canvas.height}, PDF Page: ${pdfWidth}x${pdfHeight}, Ratio: ${ratio.toFixed(3)}`);
        console.log(`Canvas scale: ${canvasScale.toFixed(3)}, Break points found: ${breakPoints.length}`);
        console.log('All break points:', breakPoints.map(p => p.toFixed(0)));

        // If content fits in one page, just add it
        if (scaledCanvasHeight <= pdfHeight) {
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, scaledCanvasHeight);

            const fullName = document.getElementById('fullName')?.value || 'Resume';
            const filename = fullName.replace(/[^a-zA-Z0-9_\-\.]/g, '_') + '_Resume.pdf';
            pdf.save(filename);
            showNotification('PDF downloaded successfully! (1 page)');
            return;
        }

        // Multi-page PDF with intelligent breaks
        let currentY = 0;
        let pageNumber = 0;
        const pageHeightCanvas = pdfHeight / ratio;
        const topPadding = 60; // Top padding in canvas pixels for new pages (after page 1)
        const topPaddingPDF = topPadding * ratio;

        while (currentY < canvasHeight) {
            if (pageNumber > 0) {
                pdf.addPage();
            }

            // Calculate ideal page break position in canvas pixels
            // For pages after the first, account for top padding
            const availableHeight = pageNumber === 0 ? pageHeightCanvas : (pageHeightCanvas - topPadding);
            let nextBreakY = Math.min(currentY + availableHeight, canvasHeight);

            // Intelligent break point selection with scoring system
            let bestBreak = null;
            let bestScore = -Infinity;

            // Define acceptable range for breaks
            const minPageHeight = pageHeightCanvas * 0.75; // Don't break too early (75% of page)
            const maxPageHeight = pageHeightCanvas * 1.10; // Can go slightly over (110% of page)
            const minBreakY = currentY + minPageHeight;
            const maxBreakY = Math.min(currentY + maxPageHeight, canvasHeight);

            for (const breakPoint of breakPoints) {
                // Only consider break points in acceptable range
                if (breakPoint < minBreakY || breakPoint > maxBreakY) {
                    continue;
                }

                // Calculate score for this break point
                let score = 0;

                // 1. Distance from ideal (closer is better) - weight: 40%
                const distanceFromIdeal = Math.abs(breakPoint - nextBreakY);
                const maxDistance = maxPageHeight - minPageHeight;
                const distanceScore = (1 - (distanceFromIdeal / maxDistance)) * 40;
                score += distanceScore;

                // 2. Prefer breaks that are close to ideal but slightly before (not after) - weight: 20%
                if (breakPoint <= nextBreakY) {
                    score += 20;
                } else {
                    // Penalize going over ideal position
                    const overageRatio = (breakPoint - nextBreakY) / (maxBreakY - nextBreakY);
                    score += 20 * (1 - overageRatio);
                }

                // 3. Avoid very short or very long pages - weight: 20%
                const pageUtilization = (breakPoint - currentY) / pageHeightCanvas;
                if (pageUtilization >= 0.85 && pageUtilization <= 1.0) {
                    score += 20; // Optimal utilization (85-100%)
                } else if (pageUtilization >= 0.75 && pageUtilization < 0.85) {
                    score += 15; // Good utilization (75-85%)
                } else if (pageUtilization > 1.0 && pageUtilization <= 1.10) {
                    score += 12; // Acceptable overage (100-110%)
                } else {
                    score += 5; // Poor utilization
                }

                // 4. Prefer breaks that give more even page distribution - weight: 20%
                const remainingContent = canvasHeight - breakPoint;
                const remainingPages = Math.ceil(remainingContent / pageHeightCanvas);
                if (remainingPages > 0) {
                    const avgRemainingPageHeight = remainingContent / remainingPages;
                    const evenness = 1 - Math.abs(avgRemainingPageHeight - pageHeightCanvas) / pageHeightCanvas;
                    score += evenness * 20;
                } else {
                    score += 20; // Last page
                }

                // Track best break point
                if (score > bestScore) {
                    bestScore = score;
                    bestBreak = breakPoint;
                }
            }

            // Fallback: If no break found in acceptable range, find closest before max
            if (bestBreak === null) {
                let closestBefore = null;
                for (const breakPoint of breakPoints) {
                    if (breakPoint > currentY + 50 && breakPoint <= maxBreakY) {
                        if (closestBefore === null || breakPoint > closestBefore) {
                            closestBefore = breakPoint;
                        }
                    }
                }
                if (closestBefore !== null) {
                    bestBreak = closestBefore;
                    console.log(`Page ${pageNumber + 1}: Using fallback break at ${bestBreak.toFixed(0)} (ideal: ${nextBreakY.toFixed(0)}, score: N/A)`);
                }
            } else {
                const distance = Math.abs(bestBreak - nextBreakY);
                const utilization = ((bestBreak - currentY) / pageHeightCanvas * 100).toFixed(1);
                console.log(`Page ${pageNumber + 1}: Using intelligent break at ${bestBreak.toFixed(0)} (ideal: ${nextBreakY.toFixed(0)}, distance: ${distance.toFixed(0)}, score: ${bestScore.toFixed(1)}, utilization: ${utilization}%)`);
            }

            // Use the best break point if found, otherwise use default
            if (bestBreak !== null) {
                nextBreakY = bestBreak;
            } else {
                console.log(`Page ${pageNumber + 1}: WARNING - Using default break at ${nextBreakY.toFixed(0)} (NO suitable break points found)`);
            }

            // Calculate the height for this page
            const sourceHeight = nextBreakY - currentY;

            // Create a temporary canvas for this page slice
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;

            // Add top padding for pages after the first
            if (pageNumber > 0) {
                pageCanvas.height = sourceHeight + topPadding;
            } else {
                pageCanvas.height = sourceHeight;
            }

            const pageCtx = pageCanvas.getContext('2d');

            // Fill with white background
            pageCtx.fillStyle = '#ffffff';
            pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

            // Draw the slice from the original canvas (with top padding offset for pages > 0)
            const destY = pageNumber > 0 ? topPadding : 0;
            pageCtx.drawImage(
                canvas,
                0, currentY, canvas.width, sourceHeight,
                0, destY, canvas.width, sourceHeight
            );

            // Add to PDF - scale to fit page width
            const pageImgData = pageCanvas.toDataURL('image/png');
            const imgHeight = pageCanvas.height * ratio;
            pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, imgHeight);

            currentY = nextBreakY;
            pageNumber++;

            // Safety check to prevent infinite loops
            if (pageNumber > 50) {
                console.error('Too many pages generated, stopping');
                break;
            }
        }

        // Download PDF
        const fullName = document.getElementById('fullName')?.value || 'Resume';
        const filename = fullName.replace(/[^a-zA-Z0-9_\-\.]/g, '_') + '_Resume.pdf';
        pdf.save(filename);

        showNotification(`PDF downloaded successfully! (${pageNumber} page${pageNumber > 1 ? 's' : ''})`);
    } catch (error) {
        console.error('Error downloading PDF:', error);
        showNotification('Error downloading PDF');
    }
}

function findIntelligentBreakPoints(iframeDoc, container, canvasScale) {
    const breakPoints = [];

    // Selectors for elements that are good candidates for page breaks
    const breakCandidates = [
        '.section',           // Section breaks
        '.entry',             // Experience/education entries
        '.education-entry',   // Education entries
        '.experience-entry',  // Experience entries
        '.publication',       // Publications
        '.grant',             // Grants
        '.project-item',      // Projects
        '.portfolio-item',    // Portfolio items
        '.reference',         // References
        '.board-item',        // Board memberships
        'h2', 'h3',          // Headings
        '.section-title',     // Section titles
        '.degree-line',       // Academic degree lines
        'hr'                  // Horizontal rules
    ];

    // Get the container's top position
    const containerRect = container.getBoundingClientRect();
    const scrollTop = container.scrollTop || 0;

    // Get all potential break elements
    breakCandidates.forEach(selector => {
        const elements = container.querySelectorAll(selector);
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();

            // Calculate position relative to container top in actual pixels
            const relativeTop = (rect.top - containerRect.top + scrollTop);

            // Convert to canvas pixels using the scale
            const canvasY = relativeTop * canvasScale;

            // Only add if it's not at the very top (avoid break at 0)
            if (canvasY > 100) { // At least 100px from top
                breakPoints.push(canvasY);
            }
        });
    });

    // Sort and remove duplicates (within 20px tolerance in canvas pixels)
    breakPoints.sort((a, b) => a - b);

    const uniqueBreakPoints = [];
    let lastPoint = -100;

    for (const point of breakPoints) {
        if (point - lastPoint > 20) { // At least 20px apart in canvas
            uniqueBreakPoints.push(point);
            lastPoint = point;
        }
    }

    console.log('Break points (canvas pixels):', uniqueBreakPoints.slice(0, 10).map(p => p.toFixed(0)));

    return uniqueBreakPoints;
}

function setupJobDescriptionToggle() {
    const textToggle = document.getElementById('textToggle');
    const fileToggle = document.getElementById('fileToggle');
    const textInput = document.getElementById('textInput');
    const fileInput = document.getElementById('fileInput');

    if (textToggle && fileToggle) {
        textToggle.addEventListener('click', () => {
            textToggle.classList.add('active');
            fileToggle.classList.remove('active');
            textInput.classList.remove('hidden');
            fileInput.classList.add('hidden');
        });

        fileToggle.addEventListener('click', () => {
            fileToggle.classList.add('active');
            textToggle.classList.remove('active');
            fileInput.classList.remove('hidden');
            textInput.classList.add('hidden');
        });
    }

    // File upload handling
    const jobDescFile = document.getElementById('jobDescFile');
    const fileUploadLabel = document.querySelector('.file-upload-label');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const removeFileBtn = document.getElementById('removeFile');

    if (jobDescFile) {
        jobDescFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.type !== 'application/pdf') {
                    showNotification('Please upload a PDF file only');
                    jobDescFile.value = '';
                    return;
                }

                if (file.size > 10 * 1024 * 1024) {
                    showNotification('File size must be less than 10MB');
                    jobDescFile.value = '';
                    return;
                }

                fileName.textContent = file.name;
                fileUploadLabel.style.display = 'none';
                fileInfo.classList.remove('hidden');
                showNotification('File uploaded successfully');
            }
        });
    }

    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', () => {
            jobDescFile.value = '';
            fileUploadLabel.style.display = 'flex';
            fileInfo.classList.add('hidden');
        });
    }
}

console.log('Resume Editor initialized');
