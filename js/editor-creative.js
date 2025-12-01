// Ucreative Template Editor JavaScript
// This is a dedicated editor for the Ucreative resume template

let resumeState = {
    id: resumeData.id,
    resume_title: resumeData.resume_title,
    template_name: 'creative',
    personal_details: resumeData.personal_details || {},
    summary_text: resumeData.summary_text || '',
    experience: [],
    education: [],
    skills: []
};

let previewIframe = null;
let isTemplateLoading = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    previewIframe = document.getElementById('resumePreview');

    // Load the creative template
    loadTemplatePreview();

    // Set up event listeners for all form fields
    setupEventListeners();

    // Load saved data if editing
    if (resumeData.id) {
        loadResumeData();
    }

    // Set up save button
    document.getElementById('saveResumeBtn').addEventListener('click', saveResume);

    // Set up download button
    document.getElementById('downloadBtn').addEventListener('click', downloadPDF);

    // Set up zoom controls
    setupZoomControls();
});

function loadTemplatePreview() {
    isTemplateLoading = true;
    const timestamp = new Date().getTime();
    previewIframe.src = `/ATS/templates/creative.html?v=${timestamp}`;

    previewIframe.onload = () => {
        setTimeout(() => {
            isTemplateLoading = false;
            updatePreview();
        }, 100);
    };
}

function setupEventListeners() {
    // Personal details
    const personalFields = ['fullName', 'professionalTitle', 'email', 'phone', 'location', 'linkedin'];
    personalFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener('input', debounce(() => {
                resumeState.personal_details[fieldId] = element.value;
                updatePreview();
            }, 300));
        }
    });

    // Summary
    const summaryElement = document.getElementById('summary');
    if (summaryElement) {
        summaryElement.addEventListener('input', debounce(() => {
            resumeState.summary_text = summaryElement.value;
            updatePreview();
        }, 300));
    }

    // Skills
    const skillsElement = document.getElementById('skills');
    if (skillsElement) {
        skillsElement.addEventListener('input', debounce(() => {
            resumeState.skills = skillsElement.value.split(',').map(s => s.trim()).filter(s => s);
            updatePreview();
        }, 300));
    }

    // Experience and Education buttons
    document.getElementById('addExperienceBtn').addEventListener('click', addExperience);
    document.getElementById('addEducationBtn').addEventListener('click', addEducation);
}

function updatePreview() {
    if (isTemplateLoading) return;

    const iframeDoc = previewIframe.contentDocument || previewIframe.contentWindow.document;
    if (!iframeDoc) return;

    // Update personal details
    const fieldMapping = {
        fullName: 'name',
        professionalTitle: 'title'
    };

    Object.keys(resumeState.personal_details).forEach(key => {
        const value = resumeState.personal_details[key];
        const dataField = fieldMapping[key] || key;
        const element = iframeDoc.querySelector(`[data-field="${dataField}"]`);
        if (element && value) {
            element.textContent = value;
        }
    });

    // Update summary
    const summaryElement = iframeDoc.querySelector('[data-field="summary"]');
    if (summaryElement && resumeState.summary_text) {
        summaryElement.textContent = resumeState.summary_text;
    }

    // Update experience list
    updateExperienceList(iframeDoc);

    // Update education list
    updateEducationList(iframeDoc);

    // Update skills
    updateSkillsList(iframeDoc);
}

function updateExperienceList(iframeDoc) {
    const container = iframeDoc.querySelector('[data-field="experience-list"]');
    if (!container) return;

    container.innerHTML = '';
    resumeState.experience.forEach(item => {
        const entry = iframeDoc.createElement('div');
        entry.className = 'entry';

        const header = `
            <div class="entry-header">
                <div class="entry-title-line">
                    <div class="entry-title">${item.position || ''}</div>
                    <div class="entry-date">${item.startDate || ''} - ${item.endDate || ''}</div>
                </div>
                <div class="entry-company">${item.company || ''}, ${item.location || ''}</div>
            </div>
        `;

        let description = '';
        if (item.description) {
            const points = item.description.split('\n').filter(p => p.trim());
            if (points.length > 0) {
                description = '<div class="entry-description"><ul>';
                points.forEach(point => {
                    description += `<li>${point.trim()}</li>`;
                });
                description += '</ul></div>';
            }
        }

        entry.innerHTML = header + description;
        container.appendChild(entry);
    });
}

function updateEducationList(iframeDoc) {
    const container = iframeDoc.querySelector('[data-field="education-list"]');
    if (!container) return;

    container.innerHTML = '';
    resumeState.education.forEach(item => {
        const entry = iframeDoc.createElement('div');
        entry.className = 'entry';

        entry.innerHTML = `
            <div class="entry-header">
                <div class="entry-title-line">
                    <div class="entry-title">${item.degree || ''}</div>
                    <div class="entry-date">${item.startDate || ''} - ${item.endDate || ''}</div>
                </div>
                <div class="entry-company">${item.institution || ''}, ${item.location || ''}</div>
            </div>
        `;

        container.appendChild(entry);
    });
}

function updateSkillsList(iframeDoc) {
    const skillsElement = iframeDoc.querySelector('[data-field="skills"]');
    if (!skillsElement) return;

    if (resumeState.skills && resumeState.skills.length > 0) {
        skillsElement.textContent = resumeState.skills.join(' • ');
    }
}

function addExperience() {
    const container = document.getElementById('experienceContainer');
    const index = resumeState.experience.length;

    const experienceItem = {
        position: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        description: ''
    };

    resumeState.experience.push(experienceItem);

    const itemDiv = document.createElement('div');
    itemDiv.className = 'form-item';
    itemDiv.innerHTML = `
        <div class="form-item-header">
            <span>Experience ${index + 1}</span>
            <button type="button" class="remove-item-btn" onclick="removeExperience(${index})">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
        <input type="text" class="form-input" placeholder="Position" data-exp-field="position" data-exp-index="${index}">
        <input type="text" class="form-input" placeholder="Company" data-exp-field="company" data-exp-index="${index}">
        <input type="text" class="form-input" placeholder="Location" data-exp-field="location" data-exp-index="${index}">
        <div class="form-row">
            <input type="text" class="form-input" placeholder="Start Date" data-exp-field="startDate" data-exp-index="${index}">
            <input type="text" class="form-input" placeholder="End Date" data-exp-field="endDate" data-exp-index="${index}">
        </div>
        <textarea class="form-textarea" placeholder="Description (one bullet point per line)" rows="4" data-exp-field="description" data-exp-index="${index}"></textarea>
    `;

    container.appendChild(itemDiv);

    // Add event listeners to new fields
    itemDiv.querySelectorAll('[data-exp-field]').forEach(field => {
        field.addEventListener('input', debounce((e) => {
            const idx = parseInt(e.target.dataset.expIndex);
            const fieldName = e.target.dataset.expField;
            resumeState.experience[idx][fieldName] = e.target.value;
            updatePreview();
        }, 300));
    });
}

function removeExperience(index) {
    resumeState.experience.splice(index, 1);
    rebuildExperienceUI();
    updatePreview();
}

function rebuildExperienceUI() {
    const container = document.getElementById('experienceContainer');
    container.innerHTML = '';
    resumeState.experience.forEach((_, index) => {
        addExperience();
    });
}

function addEducation() {
    const container = document.getElementById('educationContainer');
    const index = resumeState.education.length;

    const educationItem = {
        degree: '',
        institution: '',
        location: '',
        startDate: '',
        endDate: ''
    };

    resumeState.education.push(educationItem);

    const itemDiv = document.createElement('div');
    itemDiv.className = 'form-item';
    itemDiv.innerHTML = `
        <div class="form-item-header">
            <span>Education ${index + 1}</span>
            <button type="button" class="remove-item-btn" onclick="removeEducation(${index})">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
        <input type="text" class="form-input" placeholder="Degree" data-edu-field="degree" data-edu-index="${index}">
        <input type="text" class="form-input" placeholder="Institution" data-edu-field="institution" data-edu-index="${index}">
        <input type="text" class="form-input" placeholder="Location" data-edu-field="location" data-edu-index="${index}">
        <div class="form-row">
            <input type="text" class="form-input" placeholder="Start Date" data-edu-field="startDate" data-edu-index="${index}">
            <input type="text" class="form-input" placeholder="End Date" data-edu-field="endDate" data-edu-index="${index}">
        </div>
    `;

    container.appendChild(itemDiv);

    // Add event listeners to new fields
    itemDiv.querySelectorAll('[data-edu-field]').forEach(field => {
        field.addEventListener('input', debounce((e) => {
            const idx = parseInt(e.target.dataset.eduIndex);
            const fieldName = e.target.dataset.eduField;
            resumeState.education[idx][fieldName] = e.target.value;
            updatePreview();
        }, 300));
    });
}

function removeEducation(index) {
    resumeState.education.splice(index, 1);
    rebuildEducationUI();
    updatePreview();
}

function rebuildEducationUI() {
    const container = document.getElementById('educationContainer');
    container.innerHTML = '';
    resumeState.education.forEach((_, index) => {
        addEducation();
    });
}

function loadResumeData() {
    // Load experience
    if (resumeData.experience) {
        try {
            const expData = typeof resumeData.experience === 'string' ? JSON.parse(resumeData.experience) : resumeData.experience;
            resumeState.experience = expData;
            expData.forEach(() => addExperience());
        } catch (e) {
            console.error('Error loading experience:', e);
        }
    }

    // Load education
    if (resumeData.education) {
        try {
            const eduData = typeof resumeData.education === 'string' ? JSON.parse(resumeData.education) : resumeData.education;
            resumeState.education = eduData;
            eduData.forEach(() => addEducation());
        } catch (e) {
            console.error('Error loading education:', e);
        }
    }

    // Load skills
    if (resumeData.skills) {
        try {
            const skillsData = typeof resumeData.skills === 'string' ? JSON.parse(resumeData.skills) : resumeData.skills;
            resumeState.skills = skillsData;
            document.getElementById('skills').value = skillsData.join(', ');
        } catch (e) {
            console.error('Error loading skills:', e);
        }
    }
}

async function saveResume() {
    const saveBtn = document.getElementById('saveResumeBtn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;

    try {
        const resumeTitle = document.getElementById('resumeTitle').value || 'Untitled Resume';

        const formData = new FormData();
        formData.append('resume_id', resumeState.id || '');
        formData.append('resume_title', resumeTitle);
        formData.append('template_name', 'creative');
        formData.append('personal_details', JSON.stringify(resumeState.personal_details));
        formData.append('summary_text', resumeState.summary_text);
        formData.append('experience', JSON.stringify(resumeState.experience));
        formData.append('education', JSON.stringify(resumeState.education));
        formData.append('skills', JSON.stringify(resumeState.skills));
        formData.append('status', 'draft');

        const response = await fetch('/ATS/api/save-resume.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            resumeState.id = result.resume_id;
            showNotification('Resume saved successfully!', 'success');

            // Update URL if this was a new resume
            if (!resumeData.id) {
                const newUrl = `${window.location.pathname}?id=${result.resume_id}`;
                window.history.pushState({}, '', newUrl);
                resumeData.id = result.resume_id;
            }
        } else {
            showNotification('Error saving resume: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Save error:', error);
        showNotification('Error saving resume. Please try again.', 'error');
    } finally {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }
}

async function downloadPDF() {
    const downloadBtn = document.getElementById('downloadBtn');
    const originalText = downloadBtn.textContent;
    downloadBtn.textContent = 'Generating...';
    downloadBtn.disabled = true;

    try {
        const iframeDoc = previewIframe.contentDocument || previewIframe.contentWindow.document;
        const { jsPDF } = window.jspdf;

        const canvas = await html2canvas(iframeDoc.body, {
            scale: 2,
            useCORS: true,
            logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

        const fileName = (document.getElementById('resumeTitle').value || 'resume') + '.pdf';
        pdf.save(fileName);

        showNotification('PDF downloaded successfully!', 'success');
    } catch (error) {
        console.error('Download error:', error);
        showNotification('Error generating PDF. Please try again.', 'error');
    } finally {
        downloadBtn.textContent = originalText;
        downloadBtn.disabled = false;
    }
}

function setupZoomControls() {
    // Check if zoom controls exist
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const wrapper = document.getElementById('previewWrapper');
    const zoomDisplay = document.getElementById('zoomLevel');

    if (!zoomInBtn || !zoomOutBtn || !wrapper || !zoomDisplay) return;

    let zoomLevel = 100;

    zoomInBtn.addEventListener('click', () => {
        if (zoomLevel < 150) {
            zoomLevel += 10;
            wrapper.style.transform = `scale(${zoomLevel / 100})`;
            zoomDisplay.textContent = zoomLevel + '%';
        }
    });

    zoomOutBtn.addEventListener('click', () => {
        if (zoomLevel > 50) {
            zoomLevel -= 10;
            wrapper.style.transform = `scale(${zoomLevel / 100})`;
            zoomDisplay.textContent = zoomLevel + '%';
        }
    });

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadTemplatePreview();
        });
    }
}

function showNotification(message, type = 'info') {
    // Simple notification - you can enhance this
    alert(message);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
