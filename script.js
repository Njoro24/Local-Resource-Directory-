// Configuration
const API_URL = 'http://localhost:3000/resources';

// DOM Element Selectors
const resourceDirectory = document.getElementById('resource-directory');
const resourcesContainer = document.getElementById('resources-container');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const searchForm = document.getElementById('search-form');
const resourceDetailsModal = document.getElementById('resource-details-modal');
const resourceDetails = document.getElementById('resource-details');
const registrationModal = document.getElementById('registration-modal');
const registrationForm = document.getElementById('registration-form');

// Navigation Elements
const exploreResourcesBtn = document.querySelector('.btn-primary');
const landingRegisterBtn = document.querySelector('.register-button');
const openRegistrationBtn = document.getElementById('open-registration-btn');
const learnMoreBtn = document.querySelector('.btn-secondary');
const closeModalBtns = document.querySelectorAll('.close-modal');

let resources = [];

// Navigation Functions
function showResourceDirectory() {
    document.querySelector('.main-content').style.display = 'none';
    resourceDirectory.style.display = 'block';
}

function showLandingPage() {
    document.querySelector('.main-content').style.display = 'block';
    resourceDirectory.style.display = 'none';
}

// Close Modal Function
function closeModal(modalElement) {
    if (modalElement) {
        modalElement.style.display = 'none';
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Explore Resources Button
    exploreResourcesBtn?.addEventListener('click', showResourceDirectory);

    // Register Buttons
    landingRegisterBtn?.addEventListener('click', () => {
        showResourceDirectory();
        registrationModal.style.display = 'block';
    });

    // Open Registration Button
    openRegistrationBtn?.addEventListener('click', () => {
        registrationModal.style.display = 'block';
    });

    // Close Modal Buttons
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal);
        });
    });

    // Learn More Button
    learnMoreBtn?.addEventListener('click', () => {
        alert('More information about Local Resource Directory coming soon!');
    });

    // Search Form
    searchForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        filterResources();
    });

    // Real-time filtering
    searchInput?.addEventListener('input', filterResources);
    categoryFilter?.addEventListener('change', filterResources);

    // Registration Form
    registrationForm?.addEventListener('submit', handleRegistration);
}

// Handle User Registration
function handleRegistration(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('full-name').value;
    const idNumber = document.getElementById('id-number').value;
    const phoneContact = document.getElementById('phone-contact').value;
    const interests = Array.from(document.getElementById('interests').selectedOptions)
        .map(option => option.value);

    // Basic validation
    if (!fullName || !idNumber || !phoneContact || interests.length === 0) {
        alert('Please fill in all required fields');
        return;
    }

    const registrationData = {
        fullName,
        idNumber,
        phoneContact,
        interests
    };

    // TODO: Implement actual registration logic (e.g., API call)
    console.log('Registration Data:', registrationData);
    alert('Registration submitted successfully!');
    
    // Close registration modal
    closeModal(registrationModal);
}

// Fetch resources from API
async function loadResources() {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        resources = await response.json();
        displayResources(resources);
        populateCategoryFilter(resources);
    } catch (error) {
        console.error('Error loading resources:', error);
        if (resourcesContainer) {
            resourcesContainer.innerHTML = `
                <div class="error-message">
                    <p>Error loading resources. Please try again later.</p>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
}

// Filter resources based on search and category
function filterResources() {
    if (!searchInput || !categoryFilter) return;

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

// Populate Category Filter Dropdown
function populateCategoryFilter(resourceList) {
    if (!categoryFilter) return;

    const uniqueCategories = [...new Set(resourceList.map(resource => resource.category))];
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Display resources
function displayResources(resourceList) {
    if (!resourcesContainer) return;

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

// Create resource card
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
        
        <!-- Comments Section -->
        <div class="comments-section">
            <h3>Comments</h3>
            <div class="comments-list" id="comments-${resource.id}">
                ${resource.comments && resource.comments.length > 0 
                    ? resource.comments.map(comment => `
                        <div class="comment">
                            <p class="comment-text">${comment.text}</p>
                            <div class="comment-meta">
                                <span class="comment-author">${comment.author}</span>
                                <span class="comment-date">${formatDate(comment.date)}</span>
                            </div>
                        </div>
                    `).join('') 
                    : '<p class="no-comments">No comments yet</p>'
                }
            </div>
            <div class="add-comment">
                <textarea 
                    id="comment-input-${resource.id}" 
                    placeholder="Add a comment..."
                ></textarea>
                <button onclick="submitComment(${resource.id})">Post Comment</button>
            </div>
        </div>
    `;
    return card;
}

// Function to format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Submit comment function
function submitComment(resourceId) {
    const commentInput = document.getElementById(`comment-input-${resourceId}`);
    const commentText = commentInput.value.trim();
    
    if (!commentText) {
        alert('Please enter a comment');
        return;
    }

    
    const newComment = {
        text: commentText,
        author: 'Anonymous',
        date: new Date()
    };

    // Add comment to the comments list
    const commentsList = document.getElementById(`comments-${resourceId}`);
    const noCommentsElement = commentsList.querySelector('.no-comments');
    
    if (noCommentsElement) {
        commentsList.innerHTML = '';
    }

    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');
    commentElement.innerHTML = `
        <p class="comment-text">${newComment.text}</p>
        <div class="comment-meta">
            <span class="comment-author">${newComment.author}</span>
            <span class="comment-date">${formatDate(newComment.date)}</span>
        </div>
    `;

    commentsList.appendChild(commentElement);
    
   
    commentInput.value = '';
}

// Show Resource Details in Modal
function showResourceDetails(resourceId) {
    if (!resourceDetailsModal || !resourceDetails) return;

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
    `;

    resourceDetailsModal.style.display = 'block';
}

// Add Like to Resource
async function addLike(resourceId) {
    try {
        // Find the resource in the local resources array
        const resourceIndex = resources.findIndex(r => r.id === resourceId);
        
        if (resourceIndex === -1) {
            throw new Error('Resource not found');
        }

        // Optimistically update the like count
        resources[resourceIndex].likes = (resources[resourceIndex].likes || 0) + 1;
        
        // Update the display to reflect the new like count
        displayResources(resources);

        // Attempt to send like to the server
        const response = await fetch(`${API_URL}/${resourceId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // If server request fails, revert the like
            resources[resourceIndex].likes--;
            displayResources(resources);
            throw new Error('Failed to add like on server');
        }

        // Optionally, handle server response if needed
        const updatedResource = await response.json();
        resources[resourceIndex] = updatedResource;
        displayResources(resources);

    } catch (error) {
        console.error('Error adding like:', error);
        alert('Failed to add like. Please try again.');
    }
}

// Initialize on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initial page setup
    showLandingPage();

    // Load resources and setup event listeners
    loadResources();
    setupEventListeners();
});