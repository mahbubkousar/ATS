// Modal Utility Functions for Editors
// This file provides reusable modal functions to replace browser alerts

// Debug: Check if modal elements exist when script loads
document.addEventListener('DOMContentLoaded', function() {
    const notificationModal = document.getElementById('notificationModal');
    const progressModal = document.getElementById('analysisProgressModal');

    // Check if we're on an editor page (has resumePreview element)
    const isEditorPage = document.getElementById('resumePreview') !== null;

    if (!notificationModal) {
        console.error('ERROR: Notification modal (#notificationModal) not found in DOM!');
    } else {
        console.log('✓ Notification modal loaded successfully');
    }

    // Only warn about progress modal on editor pages
    if (!progressModal && isEditorPage) {
        console.error('ERROR: Progress modal (#analysisProgressModal) not found in DOM!');
    } else if (progressModal) {
        console.log('✓ Progress modal loaded successfully');
    }
});

/**
 * Show notification modal
 * @param {string} message - The message to display
 * @param {string} type - Type of notification: 'success', 'error', 'warning', 'info'
 * @param {string} title - Optional custom title
 * @returns {Promise} - Resolves when OK button is clicked
 */
function showNotificationModal(message, type = 'info', title = null) {
    return new Promise((resolve) => {
        const modal = document.getElementById('notificationModal');
        const modalContent = document.getElementById('notificationModalContent');
        const modalIcon = modalContent.querySelector('.modal-icon i');
        const modalTitle = document.getElementById('notificationTitle');
        const modalMessage = document.getElementById('notificationMessage');
        const okBtn = document.getElementById('notificationOkBtn');

        // Remove all type classes
        modalContent.classList.remove('success', 'error', 'warning', 'info');

        // Add current type class
        modalContent.classList.add(type);

        // Set icon based on type
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        modalIcon.className = `fas ${icons[type] || icons.info}`;

        // Set title based on type if not provided
        if (!title) {
            const titles = {
                success: 'Success',
                error: 'Error',
                warning: 'Warning',
                info: 'Information'
            };
            title = titles[type] || 'Notification';
        }

        modalTitle.textContent = title;
        modalMessage.textContent = message;

        // Show modal
        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Handle click outside
        const handleClickOutside = (e) => {
            if (e.target === modal) {
                cleanup();
            }
        };

        // Handle ESC key
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                cleanup();
            }
        };

        // Handle OK button click
        const handleOk = () => {
            cleanup();
        };

        // Cleanup function
        const cleanup = () => {
            console.log('Cleaning up notification modal');
            modal.classList.remove('active');
            modal.style.display = 'none';
            document.body.style.overflow = '';
            okBtn.removeEventListener('click', handleOk);
            document.removeEventListener('keydown', handleEsc);
            modal.removeEventListener('click', handleClickOutside);
            resolve();
        };

        // Add event listeners
        okBtn.addEventListener('click', handleOk);
        document.addEventListener('keydown', handleEsc);
        modal.addEventListener('click', handleClickOutside);
    });
}

/**
 * Show progress modal for ATS analysis
 */
function showProgressModal() {
    const modal = document.getElementById('analysisProgressModal');
    if (!modal) {
        console.error('Progress modal not found in DOM');
        return;
    }
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Start progress animation
    updateProgress(0, 'Initializing analysis...');
}

/**
 * Hide progress modal
 */
function hideProgressModal() {
    const modal = document.getElementById('analysisProgressModal');
    if (!modal) {
        console.error('Progress modal not found in DOM');
        return;
    }
    modal.style.display = 'none';
    document.body.style.overflow = '';

    // Reset progress
    updateProgress(0, 'Initializing analysis...');
    resetProgressSteps();
}

/**
 * Update progress bar and stage text
 * @param {number} percentage - Progress percentage (0-100)
 * @param {string} stage - Current stage description
 */
function updateProgress(percentage, stage) {
    const progressBar = document.getElementById('progressBarFill');
    const progressPercentage = document.getElementById('progressPercentage');
    const progressStage = document.getElementById('progressStage');

    if (progressBar) progressBar.style.width = percentage + '%';
    if (progressPercentage) progressPercentage.textContent = Math.round(percentage) + '%';
    if (progressStage) progressStage.textContent = stage;
}

/**
 * Set active step in progress modal
 * @param {number} stepNumber - Step number (1-5)
 */
function setStepActive(stepNumber) {
    for (let i = 1; i <= 5; i++) {
        const step = document.getElementById('step' + i);
        if (step) {
            step.classList.remove('active', 'completed');
            if (i < stepNumber) {
                step.classList.add('completed');
            } else if (i === stepNumber) {
                step.classList.add('active');
            }
        }
    }
}

/**
 * Reset all progress steps
 */
function resetProgressSteps() {
    for (let i = 1; i <= 5; i++) {
        const step = document.getElementById('step' + i);
        if (step) {
            step.classList.remove('active', 'completed');
        }
    }
}

/**
 * Show confirmation modal (replaces browser confirm)
 * @param {string} message - The confirmation message
 * @param {string} title - Optional custom title
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
 */
function showConfirmationModal(message, title = 'Confirm Action') {
    return new Promise((resolve) => {
        console.log('showConfirmationModal called with:', { message, title });

        const modal = document.getElementById('confirmationModal');
        const modalContent = document.getElementById('confirmationModalContent');
        const modalTitle = document.getElementById('confirmationTitle');
        const modalMessage = document.getElementById('confirmationMessage');
        const okBtn = document.getElementById('confirmationOkBtn');
        const cancelBtn = document.getElementById('confirmationCancelBtn');

        console.log('Modal elements found:', {
            modal: !!modal,
            modalContent: !!modalContent,
            modalTitle: !!modalTitle,
            modalMessage: !!modalMessage,
            okBtn: !!okBtn,
            cancelBtn: !!cancelBtn
        });

        if (!modal || !modalContent || !modalTitle || !modalMessage || !okBtn || !cancelBtn) {
            console.error('Confirmation modal elements not found, falling back to browser confirm');
            console.log('Missing elements:', {
                modal: !modal ? 'confirmationModal' : null,
                modalContent: !modalContent ? 'confirmationModalContent' : null,
                modalTitle: !modalTitle ? 'confirmationTitle' : null,
                modalMessage: !modalMessage ? 'confirmationMessage' : null,
                okBtn: !okBtn ? 'confirmationOkBtn' : null,
                cancelBtn: !cancelBtn ? 'confirmationCancelBtn' : null
            });
            resolve(confirm(message));
            return;
        }

        console.log('Setting modal content and showing...');

        modalTitle.textContent = title;
        modalMessage.textContent = message;

        // Show modal
        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Handle OK button click
        const handleOk = () => {
            cleanup();
            resolve(true);
        };

        // Handle Cancel button click
        const handleCancel = () => {
            cleanup();
            resolve(false);
        };

        // Handle click outside
        const handleClickOutside = (e) => {
            if (e.target === modal) {
                handleCancel();
            }
        };

        // Handle ESC key
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
            }
        };

        // Cleanup function
        const cleanup = () => {
            console.log('Cleaning up confirmation modal');
            modal.classList.remove('active');
            modal.style.display = 'none';
            document.body.style.overflow = '';
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
            document.removeEventListener('keydown', handleEsc);
            modal.removeEventListener('click', handleClickOutside);
        };

        // Add event listeners
        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', handleCancel);
        document.addEventListener('keydown', handleEsc);
        modal.addEventListener('click', handleClickOutside);
    });
}

/**
 * Replace the old showNotification function with modal version
 * This provides backward compatibility
 */
if (typeof showNotification === 'undefined') {
    function showNotification(message, type = 'info') {
        showNotificationModal(message, type);
    }
}
