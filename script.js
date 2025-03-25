let resources = [];

// DOM Element Selectors
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const resourcesContainer = document.getElementById('resources-container');
const searchForm = document.getElementById('search-form');
const resourceDetailsModal = document.getElementById('resource-details-modal');
const resourceDetails = document.getElementById('resource-details');
const closeModalBtn = document.querySelector('.close-modal');
const registrationModal = document.getElementById('registration-modal');
const openRegistrationBtn = document.getElementById('open-registration-btn');
const closeRegistrationModalBtn = document.getElementById('close-registration-modal');
const registrationForm = document.getElementById('registration-form');

// Configuration
const API_URL = 'http://localhost:3000/resources'; // Backend API endpoint

// Load resources when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadResources();
    setupEventListeners();
});

// Fetch resources from API
async function loadResources() {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        resources = data;
        displayResources(resources);
    } catch (error) {
        console.error('Error loading resources:', error);
        resourcesContainer.innerHTML = `
            <div class="error-message">
                <p>Error loading resources. Please try again later.</p>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Create resource card HTML
function createResourceCard(resource) {
    const card = document.createElement('div');
    card.classList.add('resource-card');
    card.innerHTML = `
        <h2>${resource.name}</h2>
        <p class="category">${resource.category}</p>
        <p class="services">
            <strong>Services:</strong> 
            ${resource.services ? resource.services.slice(0, 3).join(', ') : 'No services listed'}
        </p>
        <div class="resource-actions">
            <button onclick="showResourceDetails(${resource.id})">View Details</button>
            <button onclick="addLike(${resource.id})">
                👍 Like (${resource.likes || 0})
            </button>
        </div>
    `;
    return card;
}

// Display resources and handle empty results
function displayResources(resourceList) {
    resourcesContainer.innerHTML = ''; 
    
    if (!resourceList || resourceList.length === 0) {
        resourcesContainer.innerHTML = `
            <div class="no-results">
                <p>No resources found.</p>
                <p>Try adjusting your search or filter.</p>
            </div>
        `;
        return;
    }

    resourceList.forEach(resource => {
        const card = createResourceCard(resource);
        resourcesContainer.appendChild(card);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search form submission
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        filterResources();
    });

    // Real-time filtering
    searchInput.addEventListener('input', filterResources);
    categoryFilter.addEventListener('change', filterResources);

    // Close resource details modal when clicking outside
    resourceDetailsModal.addEventListener('click', (e) => {
        if (e.target === resourceDetailsModal) {
            resourceDetailsModal.style.display = 'none';
        }
    });

    // Close resource details modal button
    closeModalBtn.addEventListener('click', () => {
        resourceDetailsModal.style.display = 'none';
    });

    // Registration Modal Event Listeners
    openRegistrationBtn.addEventListener('click', () => {
        registrationModal.style.display = 'block';
    });

    closeRegistrationModalBtn.addEventListener('click', () => {
        registrationModal.style.display = 'none';
    });

    registrationModal.addEventListener('click', (e) => {
        if (e.target === registrationModal) {
            registrationModal.style.display = 'none';
        }
    });
}

// Search and Filter
function filterResources() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const categoryTerm = categoryFilter.value;

    const filteredResources = resources.filter(resource => {
        const matchesSearch = searchTerm === '' || 
            resource.name.toLowerCase().includes(searchTerm) || 
            resource.category.toLowerCase().includes(searchTerm) ||
            (resource.services && resource.services.some(service => 
                service.toLowerCase().includes(searchTerm)
            ));
        
        const matchesCategory = categoryTerm === '' || 
            resource.category === categoryTerm;
        
        return matchesSearch && matchesCategory;
    });

    displayResources(filteredResources);
}

// Show Resource Details in Modal
function showResourceDetails(resourceId) {
    const resource = resources.find(r => r.id === resourceId);
    
    if (!resource) {
        resourceDetails.innerHTML = '<p>Resource not found.</p>';
        return;
    }

    resourceDetails.innerHTML = `
        <h2>${resource.name}</h2>
        <p><strong>Category:</strong> ${resource.category}</p>
        <p><strong>Address:</strong> ${resource.address || 'Not available'}</p>
        <p><strong>Phone:</strong> ${resource.phone || 'Not available'}</p>
        <p><strong>Website:</strong> 
            ${resource.website 
                ? `<a href="${resource.website}" target="_blank" rel="noopener noreferrer">${resource.website}</a>` 
                : 'Not available'}
        </p>
        
        <h3>Services</h3>
        <ul>
            ${resource.services 
                ? resource.services.map(service => `<li>${service}</li>`).join('') 
                : '<li>No services listed</li>'}
        </ul>
        
        ${resource.hours 
            ? `<h3>Hours</h3>
               <ul>
                   ${Object.entries(resource.hours).map(([day, hours]) => 
                       `<li><strong>${day.charAt(0).toUpperCase() + day.slice(1)}:</strong> ${hours}</li>`
                   ).join('')}
               </ul>` 
            : ''}

        <div class="resource-modal-actions">
            <button onclick="addLike(${resource.id})">👍 Like (${resource.likes || 0})</button>
            <button onclick="openCommentSection(${resource.id})">💬 Comments</button>
        </div>
    `;

    resourceDetailsModal.style.display = 'block';
}

// Add Like to Resource
async function addLike(resourceId) {
    try {
        const response = await fetch(`${API_URL}/${resourceId}/like`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Failed to add like');
        }

        // Refresh resources or update specific resource
        await loadResources();
    } catch (error) {
        console.error('Error adding like:', error);
        alert('Failed to add like. Please try again.');
    }
}

// Open Comment Section (Placeholder - would be implemented with backend)
function openCommentSection(resourceId) {
    alert('Comment section coming soon! This would typically open a form to add comments.');
    // In a full implementation, this would:
    // 1. Fetch existing comments
    // 2. Show a comment input form
    // 3. Allow submitting new comments
}

// User Registration Form Submission
registrationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateRegistrationForm()) {
        return;
    }

    // Collect form data
    const formData = {
        fullName: document.getElementById('full-name').value,
        idNumber: document.getElementById('id-number').value,
        phoneContact: document.getElementById('phone-contact').value,
        interests: Array.from(document.getElementById('interests').selectedOptions)
            .map(option => option.value)
    };

    try {
        // Send registration data to backend (placeholder URL)
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Registration failed');
        }

        const result = await response.json();
        alert('Registration successful! Welcome to our resource directory.');
        
        // Reset form and close modal after successful submission
        registrationForm.reset();
        registrationModal.style.display = 'none';
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
});

// Form Validation Function
function validateRegistrationForm() {
    const fullName = document.getElementById('full-name');
    const idNumber = document.getElementById('id-number');
    const phoneContact = document.getElementById('phone-contact');
    const interests = document.getElementById('interests');

    // Full Name Validation
    if (fullName.value.trim().length < 2) {
        alert('Please enter a valid full name');
        fullName.focus();
        return false;
    }

    // ID Number Validation (example: assuming 9-12 characters)
    if (!/^\d{9,12}$/.test(idNumber.value)) {
        alert('Please enter a valid ID number (9-12 digits)');
        idNumber.focus();
        return false;
    }

    // Phone Number Validation
    if (!/^\d{10}$/.test(phoneContact.value)) {
        alert('Please enter a valid 10-digit phone number');
        phoneContact.focus();
        return false;
    }

    // Interests Validation
    if (interests.selectedOptions.length === 0) {
        alert('Please select at least one interest category');
        interests.focus();
        return false;
    }

    return true;
}