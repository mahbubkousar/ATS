// Dashboard specific functionality

// Sidebar navigation and tab switching
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const tabContents = document.querySelectorAll('.tab-content');

function switchTab(tabId) {
    // Hide all tab contents
    tabContents.forEach(tab => tab.classList.remove('active'));

    // Show selected tab content
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Update sidebar active state
    sidebarLinks.forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar-link[href="#${tabId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // Only handle internal navigation, not external links
        if (link.getAttribute('href').startsWith('#')) {
            e.preventDefault();

            const section = link.getAttribute('href').substring(1);
            switchTab(section);
        }
    });
});

// Resume card actions
const downloadButtons = document.querySelectorAll('.btn-download');
const shareButtons = document.querySelectorAll('.btn-share');

downloadButtons.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
        const resumeId = e.target.closest('.btn-download-resume')?.dataset.resumeId;

        if (resumeId) {
            // Download saved resume - redirect to editor with auto-download
            showNotification('Opening resume for PDF export...');
            const editorUrl = `/ATS/editor.php?id=${resumeId}&download=true`;
            window.open(editorUrl, '_blank');
        } else {
            showNotification('Download feature coming soon!');
        }
    });
});

shareButtons.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
        const resumeId = e.target.closest('.btn-share-resume')?.dataset.resumeId;

        if (resumeId) {
            currentResumeId = resumeId;
            openShareModal(resumeId);
        } else {
            showNotification('Share feature coming soon!');
        }
    });
});

// Share functionality
let currentResumeId = null;
let currentShareUrl = null;

async function openShareModal(resumeId) {
    currentResumeId = resumeId;
    document.getElementById('shareModal').style.display = 'flex';

    // Check if resume already has a share link
    try {
        const response = await fetch(`/ATS/api/get-share-stats.php?resume_id=${resumeId}`);
        const result = await response.json();

        if (result.success && result.has_link) {
            // Show existing link and stats
            currentShareUrl = result.share_url;
            document.getElementById('shareLink').value = result.share_url;
            document.getElementById('viewCount').textContent = result.stats.view_count;
            document.getElementById('downloadCount').textContent = result.stats.download_count;
            document.getElementById('statusBadge').textContent = result.is_public ? 'Public' : 'Private';

            // Update toggle button
            const toggleBtn = document.getElementById('togglePublicBtn');
            if (result.is_public) {
                toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i> <span id="publicToggleText">Make Private</span>';
            } else {
                toggleBtn.innerHTML = '<i class="fas fa-eye"></i> <span id="publicToggleText">Make Public</span>';
            }

            document.getElementById('shareContent').style.display = 'none';
            document.getElementById('shareLinkSection').style.display = 'block';
        } else {
            // Show generate button
            document.getElementById('shareContent').style.display = 'block';
            document.getElementById('shareLinkSection').style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching share stats:', error);
        // Show generate button on error
        document.getElementById('shareContent').style.display = 'block';
        document.getElementById('shareLinkSection').style.display = 'none';
    }
}

function closeShareModal() {
    document.getElementById('shareModal').style.display = 'none';
    currentResumeId = null;
    currentShareUrl = null;
}

// Generate share link
document.getElementById('generateLinkBtn')?.addEventListener('click', async () => {
    if (!currentResumeId) return;

    try {
        const response = await fetch('/ATS/api/generate-share-link.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ resume_id: currentResumeId })
        });

        const result = await response.json();

        if (result.success) {
            currentShareUrl = result.share_url;
            document.getElementById('shareLink').value = result.share_url;
            document.getElementById('viewCount').textContent = result.stats.view_count;
            document.getElementById('downloadCount').textContent = result.stats.download_count;
            document.getElementById('statusBadge').textContent = result.is_public ? 'Public' : 'Private';

            // Update toggle button based on status
            const toggleBtn = document.getElementById('togglePublicBtn');
            if (result.is_public) {
                toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i> <span id="publicToggleText">Make Private</span>';
            } else {
                toggleBtn.innerHTML = '<i class="fas fa-eye"></i> <span id="publicToggleText">Make Public</span>';
            }

            document.getElementById('shareContent').style.display = 'none';
            document.getElementById('shareLinkSection').style.display = 'block';

            if (result.is_new_link) {
                showNotification('Share link generated successfully!');
            } else {
                showNotification('Existing share link loaded!');
            }
        } else {
            showNotification('Failed to generate share link');
        }
    } catch (error) {
        console.error('Error generating share link:', error);
        showNotification('Error generating share link');
    }
});

// Copy link
document.getElementById('copyLinkBtn')?.addEventListener('click', () => {
    const linkInput = document.getElementById('shareLink');
    linkInput.select();
    document.execCommand('copy');
    showNotification('Link copied to clipboard!');
});

// Toggle public/private
document.getElementById('togglePublicBtn')?.addEventListener('click', async () => {
    if (!currentResumeId) return;

    try {
        const response = await fetch('/ATS/api/toggle-resume-public.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ resume_id: currentResumeId })
        });

        const result = await response.json();

        if (result.success) {
            const toggleBtn = document.getElementById('togglePublicBtn');
            const statusBadge = document.getElementById('statusBadge');

            if (result.is_public) {
                toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i> <span id="publicToggleText">Make Private</span>';
                statusBadge.textContent = 'Public';
                statusBadge.parentElement.style.background = '#d1fae5';
                statusBadge.style.color = '#065f46';
            } else {
                toggleBtn.innerHTML = '<i class="fas fa-eye"></i> <span id="publicToggleText">Make Public</span>';
                statusBadge.textContent = 'Private';
                statusBadge.parentElement.style.background = '#fee2e2';
                statusBadge.style.color = '#991b1b';
            }

            showNotification(result.message);
        } else {
            showNotification('Failed to toggle resume visibility');
        }
    } catch (error) {
        console.error('Error toggling visibility:', error);
        showNotification('Error toggling resume visibility');
    }
});

// Open link in new tab
document.getElementById('openLinkBtn')?.addEventListener('click', () => {
    if (currentShareUrl) {
        window.open(currentShareUrl, '_blank');
    }
});

// Create new resume button
const createResumeBtn = document.getElementById('navCtaBtn');
if (navCtaBtn) {
    createResumeBtn.addEventListener('click', () => {
        showNotification('Opening resume builder...');
        setTimeout(() => {
            window.location.href = 'editor.html';
        }, 500);
    });
}

// Animate stats on page load
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');

    statNumbers.forEach(stat => {
        const text = stat.textContent;
        const isPercentage = text.includes('%');
        const finalValue = parseInt(text);

        if (!isNaN(finalValue)) {
            let current = 0;
            const increment = finalValue / 30;
            const duration = 1000;
            const stepTime = duration / 30;

            const timer = setInterval(() => {
                current += increment;
                if (current >= finalValue) {
                    stat.textContent = isPercentage ? finalValue + '%' : finalValue;
                    clearInterval(timer);
                } else {
                    stat.textContent = isPercentage ? Math.floor(current) + '%' : Math.floor(current);
                }
            }, stepTime);
        }
    });
}

// Run stats animation when page loads
window.addEventListener('load', () => {
    setTimeout(animateStats, 300);
});

// Add hover effects to resume cards
const resumeCards = document.querySelectorAll('.resume-card');

resumeCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Greeting based on time of day
function updateGreeting() {
    const greeting = document.querySelector('.dashboard-greeting');
    if (!greeting) return;

    const hour = new Date().getHours();
    let timeGreeting;

    if (hour < 12) {
        timeGreeting = 'Good morning';
    } else if (hour < 18) {
        timeGreeting = 'Good afternoon';
    } else {
        timeGreeting = 'Good evening';
    }

    // Extract username from current greeting
    const currentText = greeting.textContent;
    const nameMatch = currentText.match(/Welcome back, (.+?)!/);
    const userName = nameMatch ? nameMatch[1] : 'User';

    greeting.textContent = `${timeGreeting}, ${userName}!`;
}

updateGreeting();

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N: Create new resume
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createResumeBtn.click();
    }

    // Ctrl/Cmd + 1-6: Navigate sidebar
    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '6') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (sidebarLinks[index]) {
            sidebarLinks[index].click();
        }
    }
});

// Filter buttons (My Resumes tab)
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        filterButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const filter = this.getAttribute('data-filter');
        showNotification(`Filtering resumes: ${filter}`);
    });
});

// Search functionality
const searchInput = document.querySelector('.search-input');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        // In a real app, this would filter the resume cards
        console.log('Searching for:', searchTerm);
    });
}

// Template buttons
const templateButtons = document.querySelectorAll('.btn-use-template');
templateButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        const templateName = this.closest('.template-card').querySelector('.template-name').textContent;
        showNotification(`Opening ${templateName} template...`);
        setTimeout(() => {
            window.location.href = 'editor.html';
        }, 500);
    });
});

// Profile save button
const saveProfileBtn = document.querySelector('.btn-save-profile');
if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', function() {
        showNotification('Profile saved successfully!');
    });
}

// Change photo button
const changePhotoBtn = document.querySelector('.btn-change-photo');
if (changePhotoBtn) {
    changePhotoBtn.addEventListener('click', function() {
        showNotification('Photo upload feature coming soon!');
    });
}

// Toggle switches
const toggleSwitches = document.querySelectorAll('.toggle-switch input');
toggleSwitches.forEach(toggle => {
    toggle.addEventListener('change', function() {
        const settingName = this.closest('.setting-item').querySelector('.setting-name').textContent;
        const status = this.checked ? 'enabled' : 'disabled';
        showNotification(`${settingName} ${status}`);
    });
});

// Setting action buttons
const settingActionBtns = document.querySelectorAll('.btn-setting-action');
settingActionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const settingName = this.closest('.setting-item').querySelector('.setting-name').textContent;
        showNotification(`Opening ${settingName}...`);
    });
});

// Delete account button
const deleteBtns = document.querySelectorAll('.btn-danger');
deleteBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const resumeCard = this.closest('.resume-card');
        if (resumeCard) {
            const resumeTitle = resumeCard.querySelector('.resume-title').textContent;
            if (confirm(`Are you sure you want to delete "${resumeTitle}"?`)) {
                resumeCard.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    resumeCard.remove();
                    showNotification('Resume deleted successfully');
                }, 300);
            }
        } else {
            // Account deletion
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                showNotification('Account deletion initiated. Please check your email.');
            }
        }
    });
});

// Add fade out animation
const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = `
    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: scale(0.9);
        }
    }
`;
document.head.appendChild(fadeOutStyle);

// Load profile data from registration
function loadProfileData() {
    const registrationData = localStorage.getItem('registrationData');
    if (registrationData) {
        const data = JSON.parse(registrationData);

        // Load personal info
        if (data.personal) {
            document.getElementById('profileFullname').value = data.account?.fullname || '';
            document.getElementById('profileEmail').value = data.account?.email || '';
            document.getElementById('profilePhone').value = data.personal?.phone || '';
            document.getElementById('profileDob').value = data.personal?.dob || '';
            document.getElementById('profileAddress').value = data.personal?.address || '';
            document.getElementById('profileCity').value = data.personal?.city || '';
            document.getElementById('profileState').value = data.personal?.state || '';
            document.getElementById('profileZipcode').value = data.personal?.zipcode || '';
            document.getElementById('profileCountry').value = data.personal?.country || '';
            document.getElementById('profileProfessionalTitle').value = data.personal?.['professional-title'] || '';
            document.getElementById('profileBio').value = data.personal?.bio || '';
        }

        // Load education
        loadProfileEducationEntries(data.education || []);

        // Load experience
        loadProfileExperienceEntries(data.experience || []);
    }
}

// Load education entries
function loadProfileEducationEntries(educations) {
    const list = document.getElementById('profileEducationList');

    if (educations.length === 0) {
        list.innerHTML = '<div class="empty-state"><i class="fas fa-graduation-cap"></i><p>No education added yet</p></div>';
        return;
    }

    list.innerHTML = '';
    educations.forEach((edu, index) => {
        const entry = createEducationEntry(edu, index);
        list.appendChild(entry);
    });
}

// Create education entry element
function createEducationEntry(edu, index) {
    const div = document.createElement('div');
    div.className = 'profile-entry';
    div.innerHTML = `
        <div class="profile-entry-header">
            <div class="profile-entry-info">
                <h4>${edu.institution || 'Institution Name'}</h4>
                <p>${edu.degree || 'Degree'} in ${edu.field || 'Field of Study'}</p>
                ${edu.startDate || edu.endDate ? `<p class="entry-duration">${edu.startDate || ''} - ${edu.endDate || 'Present'}</p>` : ''}
                ${edu.gpa ? `<p style="font-size: 0.85rem; color: var(--text-light); margin-top: 0.25rem;">GPA: ${edu.gpa}</p>` : ''}
            </div>
            <div class="profile-entry-actions">
                <button class="btn-entry-action" onclick="editEducation(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-entry-action delete" onclick="deleteEducation(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    return div;
}

// Load experience entries
function loadProfileExperienceEntries(experiences) {
    const list = document.getElementById('profileExperienceList');

    if (experiences.length === 0) {
        list.innerHTML = '<div class="empty-state"><i class="fas fa-briefcase"></i><p>No work experience added yet</p></div>';
        return;
    }

    list.innerHTML = '';
    experiences.forEach((exp, index) => {
        const entry = createExperienceEntry(exp, index);
        list.appendChild(entry);
    });
}

// Create experience entry element
function createExperienceEntry(exp, index) {
    const div = document.createElement('div');
    div.className = 'profile-entry';
    div.innerHTML = `
        <div class="profile-entry-header">
            <div class="profile-entry-info">
                <h4>${exp.title || 'Job Title'}</h4>
                <p>${exp.company || 'Company Name'}${exp.location ? ` • ${exp.location}` : ''}</p>
                ${exp.startDate || exp.endDate ? `<p class="entry-duration">${exp.startDate || ''} - ${exp.current ? 'Present' : (exp.endDate || '')}</p>` : ''}
            </div>
            <div class="profile-entry-actions">
                <button class="btn-entry-action" onclick="editExperience(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-entry-action delete" onclick="deleteExperience(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        ${exp.description ? `<div class="profile-entry-description">${exp.description}</div>` : ''}
    `;
    return div;
}

// Add profile education
function addProfileEducation() {
    showNotification('Add education form feature coming soon!');
}

// Add profile experience
function addProfileExperience() {
    showNotification('Add experience form feature coming soon!');
}

// Edit education
function editEducation(index) {
    showNotification('Edit education feature coming soon!');
}

// Delete education
function deleteEducation(index) {
    if (confirm('Are you sure you want to delete this education entry?')) {
        const data = JSON.parse(localStorage.getItem('registrationData') || '{}');
        data.education.splice(index, 1);
        localStorage.setItem('registrationData', JSON.stringify(data));
        loadProfileEducationEntries(data.education);
        showNotification('Education entry deleted');
    }
}

// Edit experience
function editExperience(index) {
    showNotification('Edit experience feature coming soon!');
}

// Delete experience
function deleteExperience(index) {
    if (confirm('Are you sure you want to delete this experience entry?')) {
        const data = JSON.parse(localStorage.getItem('registrationData') || '{}');
        data.experience.splice(index, 1);
        localStorage.setItem('registrationData', JSON.stringify(data));
        loadProfileExperienceEntries(data.experience);
        showNotification('Experience entry deleted');
    }
}

// Load profile data when profile tab is opened
document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
        if (link.getAttribute('href') === '#profile') {
            loadProfileData();
        }
    });
});

// Initial load if already on profile tab
window.addEventListener('load', () => {
    const currentTab = document.querySelector('.tab-content.active');
    if (currentTab && currentTab.id === 'profile') {
        loadProfileData();
    }
});

console.log('Dashboard loaded successfully');
console.log('Keyboard shortcuts:');
console.log('- Ctrl/Cmd + N: Create new resume');
console.log('- Ctrl/Cmd + 1-6: Navigate to sidebar sections');

// Notification Modal Functionality
const notificationBtn = document.getElementById('notificationBtn');
const notificationModal = document.getElementById('notificationModal');
const notificationOverlay = document.getElementById('notificationOverlay');
const closeNotificationModal = document.getElementById('closeNotificationModal');

function openNotificationModal() {
    notificationModal.classList.add('active');
    notificationOverlay.classList.add('active');
}

function closeNotificationModalFunc() {
    notificationModal.classList.remove('active');
    notificationOverlay.classList.remove('active');
}

if (notificationBtn) {
    notificationBtn.addEventListener('click', openNotificationModal);
}

if (closeNotificationModal) {
    closeNotificationModal.addEventListener('click', closeNotificationModalFunc);
}

if (notificationOverlay) {
    notificationOverlay.addEventListener('click', closeNotificationModalFunc);
}

// Mark notification as read when clicked
const notificationItems = document.querySelectorAll('.notification-item');
notificationItems.forEach(item => {
    item.addEventListener('click', function() {
        this.classList.remove('unread');
        updateNotificationBadge();
    });
});

// Update notification badge count
function updateNotificationBadge() {
    const unreadCount = document.querySelectorAll('.notification-item.unread').length;
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && notificationModal.classList.contains('active')) {
        closeNotificationModalFunc();
    }
});

// Mark notification as read and view application
async function markAsReadAndView(notificationId, applicationId) {
    // Mark notification as read
    try {
        await fetch('/ATS/api/mark-notification-read.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ notification_id: notificationId })
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }

    // Close notification modal
    closeNotificationModalFunc();

    // Switch to applications tab
    switchTab('applications');

    // Scroll to the specific application after a short delay to allow tab switch
    setTimeout(() => {
        const applicationCard = document.querySelector(`.application-card[data-application-id="${applicationId}"]`);
        if (applicationCard) {
            applicationCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight the card briefly
            applicationCard.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.3)';
            setTimeout(() => {
                applicationCard.style.boxShadow = '';
            }, 2000);
        }
    }, 300);

    // Reload page after a delay to update notification count
    setTimeout(() => {
        location.reload();
    }, 2500);
}

// View application from notification (legacy - for compatibility)
function viewApplication(applicationId) {
    markAsReadAndView(null, applicationId);
}
