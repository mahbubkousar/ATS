// Minimal editor functionality (UI only, not fully functional)

// Download button
const downloadBtn = document.getElementById('downloadBtn');
if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        showNotification('Downloading resume as PDF...');
    });
}

// Change template button
const changeTemplateBtn = document.querySelector('.change-template-btn');
if (changeTemplateBtn) {
    changeTemplateBtn.addEventListener('click', () => {
        showNotification('Template selector coming soon!');
    });
}

// Add Experience button
const addExperienceBtns = document.querySelectorAll('.add-btn');
addExperienceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const sectionTitle = btn.closest('.form-section').querySelector('.form-section-title').textContent;
        showNotification(`Adding new ${sectionTitle}...`);
    });
});

// Analyze button
const analyzeBtn = document.querySelector('.analyze-btn');
if (analyzeBtn) {
    analyzeBtn.addEventListener('click', () => {
        showNotification('Analyzing resume against job description...');
    });
}

// Form inputs - show notification when typing (debounced)
let typingTimer;
const formInputs = document.querySelectorAll('.form-input');
formInputs.forEach(input => {
    input.addEventListener('input', () => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            // Simulate updating the preview
            updatePreview(input);
        }, 500);
    });
});

function updatePreview(input) {
    const placeholder = input.getAttribute('placeholder');
    // In a real app, this would update the resume preview
    console.log(`Updated ${placeholder}:`, input.value);
}

// Scroll sync between form and preview (subtle highlight effect)
const formSections = document.querySelectorAll('.form-section');
formSections.forEach(section => {
    section.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(139, 159, 212, 0.05)';
        this.style.borderRadius = '12px';
        this.style.padding = '0.5rem';
        this.style.margin = '-0.5rem';
        this.style.marginBottom = '1.5rem';
        this.style.transition = 'all 0.3s ease';
    });

    section.addEventListener('mouseleave', function() {
        this.style.background = 'transparent';
        this.style.padding = '0';
        this.style.margin = '0';
        this.style.marginBottom = '2rem';
    });
});

// Job Description Input Toggle
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

// File Upload Handling
const jobDescFile = document.getElementById('jobDescFile');
const fileUploadLabel = document.querySelector('.file-upload-label');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const removeFileBtn = document.getElementById('removeFile');

if (jobDescFile) {
    jobDescFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check if file is PDF
            if (file.type !== 'application/pdf') {
                showNotification('Please upload a PDF file only');
                jobDescFile.value = '';
                return;
            }

            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showNotification('File size must be less than 10MB');
                jobDescFile.value = '';
                return;
            }

            // Display file info
            fileName.textContent = file.name;
            fileUploadLabel.style.display = 'none';
            fileInfo.classList.remove('hidden');
            showNotification('File uploaded successfully');
        }
    });
}

// Remove file
if (removeFileBtn) {
    removeFileBtn.addEventListener('click', () => {
        jobDescFile.value = '';
        fileUploadLabel.style.display = 'flex';
        fileInfo.classList.add('hidden');
        showNotification('File removed');
    });
}

// Drag and drop functionality
if (fileUploadLabel) {
    fileUploadLabel.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadLabel.style.borderColor = 'var(--accent-color)';
        fileUploadLabel.style.background = 'rgba(124, 58, 237, 0.05)';
    });

    fileUploadLabel.addEventListener('dragleave', (e) => {
        e.preventDefault();
        fileUploadLabel.style.borderColor = '';
        fileUploadLabel.style.background = '';
    });

    fileUploadLabel.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadLabel.style.borderColor = '';
        fileUploadLabel.style.background = '';

        const file = e.dataTransfer.files[0];
        if (file) {
            // Create a new FileList-like object
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            jobDescFile.files = dataTransfer.files;

            // Trigger change event
            const event = new Event('change', { bubbles: true });
            jobDescFile.dispatchEvent(event);
        }
    });
}

console.log('Resume Editor loaded');
console.log('This is a visual prototype - full functionality coming soon!');
