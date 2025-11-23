// Profile Manager - Handle Education and Experience

// Modal functions
function closeEducationModal() {
    document.getElementById('addEducationModal').style.display = 'none';
    document.getElementById('educationForm').reset();
}

function closeExperienceModal() {
    document.getElementById('addExperienceModal').style.display = 'none';
    document.getElementById('experienceForm').reset();
}

// Add Education button
document.getElementById('addEducationBtn')?.addEventListener('click', () => {
    document.getElementById('addEducationModal').style.display = 'flex';
});

// Add Experience button
document.getElementById('addExperienceBtn')?.addEventListener('click', () => {
    document.getElementById('addExperienceModal').style.display = 'flex';
});

// Current job checkbox
document.getElementById('isCurrentJob')?.addEventListener('change', (e) => {
    const endDateInput = document.getElementById('expEndDate');
    if (e.target.checked) {
        endDateInput.value = '';
        endDateInput.disabled = true;
    } else {
        endDateInput.disabled = false;
    }
});

// Education Form Submit
document.getElementById('educationForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {
        institution: formData.get('institution'),
        degree: formData.get('degree'),
        field: formData.get('field'),
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
        gpa: formData.get('gpa')
    };

    try {
        const response = await fetch('/ATS/api/add-education.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Education added successfully!');
            closeEducationModal();
            // Reload the page to show new education
            location.reload();
        } else {
            showNotification('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error adding education:', error);
        showNotification('Failed to add education');
    }
});

// Experience Form Submit
document.getElementById('experienceForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {
        title: formData.get('title'),
        company: formData.get('company'),
        location: formData.get('location'),
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
        is_current: formData.get('is_current') === 'on',
        description: formData.get('description')
    };

    try {
        const response = await fetch('/ATS/api/add-experience.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Experience added successfully!');
            closeExperienceModal();
            // Reload the page to show new experience
            location.reload();
        } else {
            showNotification('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error adding experience:', error);
        showNotification('Failed to add experience');
    }
});

// Delete functions
async function deleteEducation(id) {
    if (!confirm('Are you sure you want to delete this education record?')) {
        return;
    }

    try {
        const response = await fetch(`/ATS/api/delete-education.php?id=${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Education deleted successfully!');
            location.reload();
        } else {
            showNotification('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting education:', error);
        showNotification('Failed to delete education');
    }
}

async function deleteExperience(id) {
    if (!confirm('Are you sure you want to delete this work experience?')) {
        return;
    }

    try {
        const response = await fetch(`/ATS/api/delete-experience.php?id=${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Experience deleted successfully!');
            location.reload();
        } else {
            showNotification('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting experience:', error);
        showNotification('Failed to delete experience');
    }
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    const eduModal = document.getElementById('addEducationModal');
    const expModal = document.getElementById('addExperienceModal');

    if (e.target === eduModal) {
        closeEducationModal();
    }
    if (e.target === expModal) {
        closeExperienceModal();
    }
});
