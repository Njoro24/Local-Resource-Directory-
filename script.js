// Global variables
let resources = [];

// DOM Element Selectors
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const resourcesContainer = document.getElementById('resources-container');
const searchForm = document.getElementById('search-form');
const resourceDetailsModal = document.getElementById('resource-details-modal');
const resourceDetails = document.getElementById('resource-details');
const closeModalBtn = document.querySelector('.close-modal');

//http://localhost:3000/resources

// Load resources when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadResources();
});

// Fetch resources from JSON file
async function loadResources() {
    try {
        const response = await fetch('db.json');
        const data = await response.json();
        resources = data.resources;
        displayResources(resources);
    } catch (error) {
        console.error('Error loading resources:', error);
        resourcesContainer.innerHTML = '<p>Error loading resources. Please try again later.</p>';
    }
}

// Create resource card HTML
function createResourceCard(resource) {
    const card = document.createElement('div');
    card.classList.add('resource-card');
    card.innerHTML = `
        <h2>${resource.name}</h2>
        <p class="category">${resource.category}</p>
        <p class="services">Services: ${resource.services.slice(0, 3).join(', ')}</p>
        <button onclick="showResourceDetails(${resource.id})">View Details</button>
    `;
    return card;
}

// Display resources and Clear previous results
function displayResources(resourceList) {
    resourcesContainer.innerHTML = ''; 
    
    if (resourceList.length === 0) {
        resourcesContainer.innerHTML = '<p>No resources found.</p>';
        return;
    }

    resourceList.forEach(resource => {
        const card = createResourceCard(resource);
        resourcesContainer.appendChild(card);
    });
}

// Search and Filter
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    filterResources();
});

function filterResources() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const categoryTerm = categoryFilter.value;

    const filteredResources = resources.filter(resource => {
        const matchesSearch = searchTerm === '' || 
            resource.name.toLowerCase().includes(searchTerm) || 
            resource.category.toLowerCase().includes(searchTerm) ||
            resource.services.some(service => 
                service.toLowerCase().includes(searchTerm)
            );
        
        const matchesCategory = categoryTerm === '' || 
            resource.category === categoryTerm;
        
        return matchesSearch && matchesCategory;
    });

    displayResources(filteredResources);
}

// Show Resource Details in Modal
function showResourceDetails(resourceId) {
    const resource = resources.find(r => r.id === resourceId);
    
    if (!resource) return;

    resourceDetails.innerHTML = `
        <h2>${resource.name}</h2>
        <p><strong>Category:</strong> ${resource.category}</p>
        <p><strong>Address:</strong> ${resource.address}</p>
        <p><strong>Phone:</strong> ${resource.phone}</p>
        <p><strong>Website:</strong> <a href="${resource.website}" target="_blank">${resource.website}</a></p>
        
        <h3>Services</h3>
        <ul>
            ${resource.services.map(service => `<li>${service}</li>`).join('')}
        </ul>
        
        <h3>Hours</h3>
        <ul>
            ${Object.entries(resource.hours).map(([day, hours]) => 
                `<li><strong>${day.charAt(0).toUpperCase() + day.slice(1)}:</strong> ${hours}</li>`
            ).join('')}
        </ul>
    `;

    resourceDetailsModal.style.display = 'block';
}

// Close Modal
closeModalBtn.addEventListener('click', () => {
    resourceDetailsModal.style.display = 'none';
});

// Close modal when clicking outside of it
window.addEventListener('click', (e) => {
    if (e.target === resourceDetailsModal) {
        resourceDetailsModal.style.display = 'none';
    }
});