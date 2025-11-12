// ATS Score Checker JavaScript

// Toggle between file upload and paste text
const fileUploadToggle = document.getElementById('fileUploadToggle');
const pasteTextToggle = document.getElementById('pasteTextToggle');
const fileUploadOption = document.getElementById('fileUploadOption');
const pasteTextOption = document.getElementById('pasteTextOption');

if (fileUploadToggle && pasteTextToggle) {
    fileUploadToggle.addEventListener('click', () => {
        fileUploadToggle.classList.add('active');
        pasteTextToggle.classList.remove('active');
        fileUploadOption.classList.remove('hidden');
        pasteTextOption.classList.add('hidden');
    });

    pasteTextToggle.addEventListener('click', () => {
        pasteTextToggle.classList.add('active');
        fileUploadToggle.classList.remove('active');
        pasteTextOption.classList.remove('hidden');
        fileUploadOption.classList.add('hidden');
    });
}

// File upload handling
const resumeFile = document.getElementById('resumeFile');
const dropZoneLabel = document.querySelector('.drop-zone-label');
const fileSelected = document.getElementById('fileSelected');
const selectedFileName = document.getElementById('selectedFileName');
const selectedFileSize = document.getElementById('selectedFileSize');
const removeFileBtn = document.getElementById('removeFileBtn');

if (resumeFile) {
    resumeFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelection(file);
        }
    });
}

function handleFileSelection(file) {
    // Check file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
        showNotification('Please upload a PDF or DOC file');
        resumeFile.value = '';
        return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('File size must be less than 5MB');
        resumeFile.value = '';
        return;
    }

    // Display file info
    selectedFileName.textContent = file.name;
    selectedFileSize.textContent = formatFileSize(file.size);
    dropZoneLabel.style.display = 'none';
    fileSelected.classList.add('show');
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Remove file
if (removeFileBtn) {
    removeFileBtn.addEventListener('click', () => {
        resumeFile.value = '';
        dropZoneLabel.style.display = 'flex';
        fileSelected.classList.remove('show');
        showNotification('File removed');
    });
}

// Drag and drop functionality
if (dropZoneLabel) {
    const fileInput = document.getElementById('resumeFile');

    dropZoneLabel.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZoneLabel.style.borderColor = 'var(--accent-color)';
        dropZoneLabel.style.background = 'rgba(124, 58, 237, 0.05)';
    });

    dropZoneLabel.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZoneLabel.style.borderColor = '';
        dropZoneLabel.style.background = '';
    });

    dropZoneLabel.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZoneLabel.style.borderColor = '';
        dropZoneLabel.style.background = '';

        const file = e.dataTransfer.files[0];
        if (file) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;

            handleFileSelection(file);
        }
    });
}

// Character count for paste text
const resumeText = document.getElementById('resumeText');
const charCount = document.getElementById('charCount');

if (resumeText) {
    resumeText.addEventListener('input', () => {
        const count = resumeText.value.length;
        charCount.textContent = count.toLocaleString();
    });
}

// Job Description Toggle
const jobTextToggle = document.getElementById('jobTextToggle');
const jobFileToggle = document.getElementById('jobFileToggle');
const jobTextInput = document.getElementById('jobTextInput');
const jobFileInput = document.getElementById('jobFileInput');

if (jobTextToggle && jobFileToggle) {
    jobTextToggle.addEventListener('click', () => {
        jobTextToggle.classList.add('active');
        jobFileToggle.classList.remove('active');
        jobTextInput.classList.remove('hidden');
        jobFileInput.classList.add('hidden');
    });

    jobFileToggle.addEventListener('click', () => {
        jobFileToggle.classList.add('active');
        jobTextToggle.classList.remove('active');
        jobFileInput.classList.remove('hidden');
        jobTextInput.classList.add('hidden');
    });
}

// Job Description Character Count
const jobDescText = document.getElementById('jobDescText');
const jobCharCount = document.getElementById('jobCharCount');

if (jobDescText) {
    jobDescText.addEventListener('input', () => {
        const count = jobDescText.value.length;
        jobCharCount.textContent = count.toLocaleString();
    });
}

// Job Description File Upload
const jobDescFile = document.getElementById('jobDescFile');
const jobFileLabel = document.querySelector('.job-file-label');
const jobFileSelected = document.getElementById('jobFileSelected');
const jobFileName = document.getElementById('jobFileName');
const jobFileSize = document.getElementById('jobFileSize');
const removeJobFileBtn = document.getElementById('removeJobFileBtn');

if (jobDescFile) {
    jobDescFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleJobFileSelection(file);
        }
    });
}

function handleJobFileSelection(file) {
    // Check file type
    if (file.type !== 'application/pdf') {
        showNotification('Please upload a PDF file for job description');
        jobDescFile.value = '';
        return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('File size must be less than 5MB');
        jobDescFile.value = '';
        return;
    }

    // Display file info
    jobFileName.textContent = file.name;
    jobFileSize.textContent = formatFileSize(file.size);
    jobFileLabel.style.display = 'none';
    jobFileSelected.classList.add('show');
    showNotification('Job description uploaded');
}

// Remove job file
if (removeJobFileBtn) {
    removeJobFileBtn.addEventListener('click', () => {
        jobDescFile.value = '';
        jobFileLabel.style.display = 'flex';
        jobFileSelected.classList.remove('show');
        showNotification('Job description file removed');
    });
}

// Drag and drop for job description
if (jobFileLabel) {
    jobFileLabel.addEventListener('dragover', (e) => {
        e.preventDefault();
        jobFileLabel.style.borderColor = 'var(--accent-color)';
        jobFileLabel.style.background = 'rgba(124, 58, 237, 0.05)';
    });

    jobFileLabel.addEventListener('dragleave', (e) => {
        e.preventDefault();
        jobFileLabel.style.borderColor = '';
        jobFileLabel.style.background = '';
    });

    jobFileLabel.addEventListener('drop', (e) => {
        e.preventDefault();
        jobFileLabel.style.borderColor = '';
        jobFileLabel.style.background = '';

        const file = e.dataTransfer.files[0];
        if (file) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            jobDescFile.files = dataTransfer.files;
            handleJobFileSelection(file);
        }
    });
}

// Analyze button
const analyzeBtn = document.getElementById('analyzeBtn');
const uploadSection = document.getElementById('uploadSection');
const resultsSection = document.getElementById('resultsSection');

if (analyzeBtn) {
    analyzeBtn.addEventListener('click', () => {
        // Check if file or text is provided
        const hasFile = resumeFile && resumeFile.files.length > 0;
        const hasText = resumeText && resumeText.value.trim().length > 0;

        if (!hasFile && !hasText) {
            showNotification('Please upload a resume or paste your resume text');
            return;
        }

        // Check for job description (optional but improves accuracy)
        const hasJobText = jobDescText && jobDescText.value.trim().length > 0;
        const hasJobFile = jobDescFile && jobDescFile.files.length > 0;

        if (!hasJobText && !hasJobFile) {
            showNotification('Tip: Add a job description for more accurate keyword matching!');
        }

        // Show analyzing notification
        showNotification('Analyzing your resume...');

        // Simulate analysis (in real app, this would call your API)
        setTimeout(() => {
            performAnalysis(hasJobText || hasJobFile);
        }, 2000);
    });
}

function performAnalysis(hasJobDescription) {
    // Hide upload section and show results
    uploadSection.classList.add('hidden');
    const jobSection = document.querySelector('.job-section');
    if (jobSection) jobSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Generate random scores for demo
    // If job description is provided, give slightly better keyword score
    const overallScore = Math.floor(Math.random() * 30) + 65; // 65-95
    const formattingScore = Math.floor(Math.random() * 30) + 70;
    const keywordsScore = hasJobDescription
        ? Math.floor(Math.random() * 20) + 75  // 75-95 with job desc
        : Math.floor(Math.random() * 25) + 60; // 60-85 without
    const sectionsScore = Math.floor(Math.random() * 20) + 75;
    const contactScore = Math.floor(Math.random() * 15) + 80;
    const parsabilityScore = Math.floor(Math.random() * 20) + 75;

    // Animate overall score
    animateScore(overallScore);

    // Animate breakdown scores
    setTimeout(() => {
        updateBreakdownScore('formatting', formattingScore);
        updateBreakdownScore('keywords', keywordsScore);
        updateBreakdownScore('sections', sectionsScore);
        updateBreakdownScore('contact', contactScore);
        updateBreakdownScore('parsability', parsabilityScore);
    }, 1000);

    showNotification('Analysis complete!');
}

function animateScore(score) {
    const scoreElement = document.getElementById('overallScore');
    const progressCircle = document.getElementById('scoreProgress');
    const statusElement = document.getElementById('scoreStatus');
    const messageElement = document.getElementById('scoreMessage');

    // Animate number
    let currentScore = 0;
    const increment = score / 50;
    const timer = setInterval(() => {
        currentScore += increment;
        if (currentScore >= score) {
            currentScore = score;
            clearInterval(timer);
        }
        scoreElement.textContent = Math.floor(currentScore);
    }, 30);

    // Animate circle (radius = 85, strokeDasharray already set in CSS)
    const circumference = 2 * Math.PI * 85;
    const offset = circumference - (score / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;

    // Update status and message
    if (score >= 85) {
        statusElement.textContent = 'Excellent';
        messageElement.textContent = 'Your resume is highly optimized for ATS systems!';
        progressCircle.style.stroke = '#10b981';
    } else if (score >= 70) {
        statusElement.textContent = 'Good';
        messageElement.textContent = 'Your resume is well-optimized with room for improvement';
        progressCircle.style.stroke = '#3b82f6';
    } else if (score >= 50) {
        statusElement.textContent = 'Fair';
        messageElement.textContent = 'Your resume needs improvements to pass ATS screening';
        progressCircle.style.stroke = '#f59e0b';
    } else {
        statusElement.textContent = 'Needs Improvement';
        messageElement.textContent = 'Your resume requires significant optimization for ATS';
        progressCircle.style.stroke = '#ef4444';
    }
}

function updateBreakdownScore(category, score) {
    const scoreElement = document.getElementById(`${category}Score`);
    const progressElement = document.getElementById(`${category}Progress`);

    if (scoreElement && progressElement) {
        scoreElement.textContent = score + '%';
        progressElement.style.width = score + '%';

        // Color based on score
        if (score >= 80) {
            progressElement.style.background = '#10b981';
        } else if (score >= 60) {
            progressElement.style.background = '#3b82f6';
        } else if (score >= 40) {
            progressElement.style.background = '#f59e0b';
        } else {
            progressElement.style.background = '#ef4444';
        }
    }
}

// Check another resume button
const checkAnotherBtn = document.getElementById('checkAnotherBtn');

if (checkAnotherBtn) {
    checkAnotherBtn.addEventListener('click', () => {
        // Reset resume inputs
        resumeFile.value = '';
        resumeText.value = '';
        charCount.textContent = '0';
        dropZoneLabel.style.display = 'flex';
        fileSelected.classList.remove('show');

        // Reset job description inputs
        if (jobDescFile) jobDescFile.value = '';
        if (jobDescText) jobDescText.value = '';
        if (jobCharCount) jobCharCount.textContent = '0';
        if (jobFileLabel) jobFileLabel.style.display = 'flex';
        if (jobFileSelected) jobFileSelected.classList.remove('show');

        // Show upload and job sections, hide results
        uploadSection.classList.remove('hidden');
        const jobSection = document.querySelector('.job-section');
        if (jobSection) jobSection.classList.remove('hidden');
        resultsSection.classList.add('hidden');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        showNotification('Ready to analyze another resume');
    });
}

console.log('ATS Score Checker loaded');
