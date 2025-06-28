// Animation System
class AnimationManager {
    constructor() {
        this.animatedElements = [];
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupTypingAnimation();
        this.setupIntersectionObserver();
    }

    setupScrollAnimations() {
        // Add animation classes to elements
        const elementsToAnimate = document.querySelectorAll('.animate-on-scroll, .animate-fade-in-left, .animate-fade-in-right, .animate-scale-in');
        elementsToAnimate.forEach(el => {
            this.animatedElements.push(el);
        });
    }

    setupTypingAnimation() {
        const typingElement = document.querySelector('.typing-animation');
        if (!typingElement) return;

        // Reset typing animation on page load
        setTimeout(() => {
            typingElement.style.animation = 'none';
            typingElement.offsetHeight; // Trigger reflow
            typingElement.style.animation = 'typing 3s steps(40, end), blink 0.75s step-end infinite';
        }, 100);
    }

    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    
                    // Add staggered animation for achievement counters
                    if (entry.target.classList.contains('achievement')) {
                        this.animateCounter(entry.target.querySelector('h4'), parseInt(entry.target.querySelector('h4').textContent));
                    }
                }
            });
        }, options);

        this.animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

    animateCounter(element, target) {
        if (!element) return;
        
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + (element.textContent.includes('+') ? '+' : '');
        }, 30);
    }
}

// Initialize Animation Manager
const animationManager = new AnimationManager();

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Mobile Dropdown Toggle
const navDropdown = document.querySelector('.nav-dropdown');
if (navDropdown) {
    const dropdownLink = navDropdown.querySelector('.nav-link');
    
    dropdownLink.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            navDropdown.classList.toggle('active');
        }
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Close mobile menu on scroll
window.addEventListener('scroll', () => {
    if (navMenu.classList.contains('active')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Close mobile menu when clicking outside of it
document.addEventListener('click', (e) => {
    // Check if the menu is active and the click is not on the menu or the hamburger icon
    if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Active Navigation Highlighting
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Add scroll event listener for active navigation
window.addEventListener('scroll', updateActiveNavLink);

// Call once on page load to set initial active state
document.addEventListener('DOMContentLoaded', () => {
    updateActiveNavLink();
    
    // Add loading animation to dynamic content
    addLoadingStates();
    
    // Initialize particle system
    initParticleSystem();
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Loading States for Dynamic Content
function addLoadingStates() {
    const loadingSkeleton = `
        <div class="loading-skeleton" style="height: 200px; border-radius: 10px; margin: 10px 0;"></div>
    `;
    
    // Add loading states to dynamic sections
    const teachersGrid = document.querySelector('.teachers-grid');
    const coursesGrid = document.querySelector('.courses-grid');
    const materialsGrid = document.querySelector('.materials-grid');
    const studentsGrid = document.querySelector('.students-grid');
    
    if (teachersGrid) teachersGrid.innerHTML = loadingSkeleton;
    if (coursesGrid) coursesGrid.innerHTML = loadingSkeleton;
    if (materialsGrid) materialsGrid.innerHTML = loadingSkeleton;
    if (studentsGrid) studentsGrid.innerHTML = loadingSkeleton;
}

// Particle System
function initParticleSystem() {
    const particleBackground = document.querySelector('.particle-background');
    if (!particleBackground) return;

    // Create additional particles dynamically
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 4) + 's';
        particleBackground.appendChild(particle);
    }
}

// Contact Form Handling
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        message: formData.get('message')
    };
    
    // Show loading state
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    try {
        // Send data to backend
        const response = await fetch('https://guru-academy-xi.vercel.app/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(result.message, 'success');
            contactForm.reset();
            // Add success animation
            contactForm.classList.add('form-success');
            setTimeout(() => contactForm.classList.remove('form-success'), 1000);
        } else {
            showNotification(result.message || 'Something went wrong. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Contact form error:', error);
        showNotification('Network error. Please check your connection and try again.', 'error');
    } finally {
        // Reset button state
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
});

// Enhanced Notification System with Animation
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles with enhanced animation
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease, bounceIn 0.6s ease-out 0.3s both;
        transform-origin: top right;
    `;
    
    // Add enhanced animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%) scale(0.8); opacity: 0; }
            to { transform: translateX(0) scale(1); opacity: 1; }
        }
        .notification-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        }
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        .notification-close:hover {
            opacity: 0.8;
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Navbar Background Change on Scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(26, 35, 126, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#1a237e';
        navbar.style.backdropFilter = 'none';
    }
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            
            // Add animation classes
            if (entry.target.classList.contains('teacher-card')) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out';
            }
            if (entry.target.classList.contains('course-card')) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out';
            }
            if (entry.target.classList.contains('achievement')) {
                entry.target.style.animation = 'bounce 2s ease-in-out infinite';
            }
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.teacher-card, .course-card, .achievement');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Add staggered animation for achievements
    const achievements = document.querySelectorAll('.achievement');
    achievements.forEach((achievement, index) => {
        achievement.style.animationDelay = `${index * 0.2}s`;
    });
    
    // Add floating animation to hero elements
    const heroElements = document.querySelectorAll('.hero-card, .founder-card img');
    heroElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.5}s`;
    });
    
    // Add pulse animation to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.05)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
        });
    });
    
    // Add rotating animation to icons on hover
    const icons = document.querySelectorAll('.achievement i, .teacher-avatar i, .course-image i');
    icons.forEach(icon => {
        icon.addEventListener('mouseenter', () => {
            icon.style.transform = 'rotate(360deg)';
            icon.style.transition = 'transform 0.6s ease';
        });
        icon.addEventListener('mouseleave', () => {
            icon.style.transform = 'rotate(0deg)';
        });
    });
    
    // Add floating animation to phone mockup
    const phoneMockup = document.querySelector('.phone-mockup');
    if (phoneMockup) {
        phoneMockup.style.animation = 'float 6s ease-in-out infinite';
    }
    
    // Add animation for app screenshot
    const appScreenshot = document.querySelector('.app-screenshot');
    if (appScreenshot) {
        appScreenshot.style.transition = 'transform 0.3s ease';
        appScreenshot.addEventListener('mouseenter', () => {
            appScreenshot.style.transform = 'scale(1.05)';
        });
        appScreenshot.addEventListener('mouseleave', () => {
            appScreenshot.style.transform = 'scale(1)';
        });
    }
    
    // Add slide animation to app features
    const appFeatures = document.querySelectorAll('.app-feature');
    appFeatures.forEach((feature, index) => {
        feature.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Add bounce animation to social links
    const socialLinks = document.querySelectorAll('.social-links a');
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateY(-3px) scale(1.1)';
        });
        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add floating animation to course features
    const courseFeatures = document.querySelectorAll('.course-features span');
    courseFeatures.forEach((feature, index) => {
        feature.style.animationDelay = `${index * 0.5}s`;
    });
    
    // Add staggered animation for teacher skills
    const teacherSkills = document.querySelectorAll('.teacher-skills span');
    teacherSkills.forEach((skill, index) => {
        skill.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Add contact item animations
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');

    for (const link of navLinks) {
        // ... existing code ...
    }

    // Function to load teachers dynamically
    async function loadTeachers() {
        try {
            const response = await fetch('https://guru-academy-xi.vercel.app/api/teachers');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const teachers = await response.json();
            const teachersGrid = document.querySelector('.teachers-grid');
            
            // Clear existing teachers before adding new ones
            teachersGrid.innerHTML = ''; 
            
            teachers.forEach((teacher, index) => {
                const teacherCard = document.createElement('div');
                teacherCard.className = 'teacher-card animate-scale-in';
                teacherCard.style.animationDelay = `${index * 0.1}s`;
                
                let photoHtml = '';
                if (teacher.photo) {
                    photoHtml = `<img src="${teacher.photo}" alt="${teacher.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                } else {
                    photoHtml = `<div class="teacher-initials">${teacher.name.charAt(0)}</div>`;
                }

                teacherCard.innerHTML = `
                    <div class="teacher-avatar">
                        ${photoHtml}
                    </div>
                    <h3>${teacher.name}</h3>
                    <p class="teacher-subject">${teacher.subject || 'N/A'}</p>
                    <p class="teacher-experience">${teacher.experience || 'No experience listed'}</p>
                    <div class="teacher-skills">
                        ${(teacher.skills && teacher.skills.length > 0) ? teacher.skills.map(skill => `<span>${skill}</span>`).join('') : '<span>No skills listed</span>'}
                    </div>
                `;
                teachersGrid.appendChild(teacherCard);
                
                // Add to animation manager
                animationManager.animatedElements.push(teacherCard);
            });
        } catch (error) {
            console.error("Failed to load teachers:", error);
            // Optionally, display an error message to the user
            const teachersGrid = document.querySelector('.teachers-grid');
            teachersGrid.innerHTML = '<p>Could not load teacher information. Please try again later.</p>';
        }
    }

    // Load teachers when the page is ready
    loadTeachers();

    // Function to load materials dynamically
    async function loadMaterials() {
        try {
            const response = await fetch('https://guru-academy-xi.vercel.app/api/materials');
            const materials = await response.json();
            const materialsGrid = document.querySelector('.materials-grid');
            materialsGrid.innerHTML = '';
            
            materials.forEach((material, index) => {
                const materialCard = document.createElement('div');
                materialCard.className = 'material-card animate-scale-in';
                materialCard.style.animationDelay = `${index * 0.1}s`;

                materialCard.innerHTML = `
                    <div class="material-icon">
                        <i class="${material.icon || 'fas fa-book'}"></i>
                    </div>
                    <h3>${material.title}</h3>
                    <p>${material.description}</p>
                    <ul class="material-features">
                        ${material.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                    <div class="material-price">
                        <span class="price">₹${material.price}</span>
                    </div>
                    <button class="material-btn">Get Access</button>
                `;
                materialsGrid.appendChild(materialCard);
                
                // Add to animation manager
                animationManager.animatedElements.push(materialCard);
            });
        } catch (error) {
            console.error("Failed to load materials:", error);
            const materialsGrid = document.querySelector('.materials-grid');
            materialsGrid.innerHTML = '<p>Could not load course materials. Please try again later.</p>';
        }
    }

    // Function to load toppers dynamically
    async function loadToppers() {
        try {
            const response = await fetch('https://guru-academy-xi.vercel.app/api/toppers');
            const toppers = await response.json();
            const studentsGrid = document.querySelector('.students-grid');
            studentsGrid.innerHTML = '';
            
            toppers.forEach((topper, index) => {
                const studentCard = document.createElement('div');
                studentCard.className = 'student-card animate-scale-in';
                studentCard.style.animationDelay = `${index * 0.1}s`;

                studentCard.innerHTML = `
                    <div class="student-photo-container">
                        <img src="${topper.photo}" alt="${topper.name}" class="student-photo-img">
                        <div class="achievement-star">
                            <i class="fas fa-star"></i>
                        </div>
                    </div>
                    <div class="student-info">
                        <h4>${topper.name}</h4>
                        <p class="student-roll">Roll No: ${topper.rollNo}</p>
                        <p class="student-marks marks-${Math.floor(topper.marks)}">${topper.marks}/100</p>
                    </div>
                `;
                
                studentCard.addEventListener('click', () => {
                    showStudentDetails(topper.name, topper.rollNo, topper.marks);
                });
                
                studentsGrid.appendChild(studentCard);
                
                // Add to animation manager
                animationManager.animatedElements.push(studentCard);
            });
        } catch (error) {
            console.error("Failed to load toppers:", error);
            const studentsGrid = document.querySelector('.students-grid');
            studentsGrid.innerHTML = '<p>Could not load student information. Please try again later.</p>';
        }
    }

    // Function to load courses dynamically
    async function loadCourses() {
        try {
            const response = await fetch('https://guru-academy-xi.vercel.app/api/courses');
            const courses = await response.json();
            const coursesGrid = document.querySelector('.courses-grid');
            coursesGrid.innerHTML = '';
            
            courses.forEach((course, index) => {
                const courseCard = document.createElement('div');
                courseCard.className = 'course-card animate-scale-in';
                courseCard.style.animationDelay = `${index * 0.1}s`;

                courseCard.innerHTML = `
                    <h3>${course.title}</h3>
                    <p>${course.description}</p>
                    <ul class="course-features">
                        ${course.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                    <div class="course-price">
                        <span class="course-original-price">₹${course.originalPrice}</span>
                        <span class="price">₹${course.price}</span>
                    </div>
                    <button class="course-enroll-btn">Enroll Now</button>
                `;
                coursesGrid.appendChild(courseCard);
                
                // Add to animation manager
                animationManager.animatedElements.push(courseCard);
            });
        } catch (error) {
            console.error("Failed to load courses:", error);
            const coursesGrid = document.querySelector('.courses-grid');
            coursesGrid.innerHTML = '<p>Could not load courses. Please try again later.</p>';
        }
    }

    // Function to load courses into navbar dropdown
    async function loadDropdownCourses() {
        try {
            const response = await fetch('https://guru-academy-xi.vercel.app/api/courses');
            const courses = await response.json();
            const dropdownMenu = document.querySelector('.dropdown-menu');
            
            if (dropdownMenu) {
                dropdownMenu.innerHTML = '';
                
                // Add Course Materials as the first item
                const materialsItem = document.createElement('li');
                materialsItem.innerHTML = `
                    <a href="#course-materials" data-section="course-materials">
                        <i class="fas fa-book-open"></i>
                        Course Materials
                    </a>
                `;
                dropdownMenu.appendChild(materialsItem);
                
                // Add separator
                const separator = document.createElement('li');
                separator.innerHTML = '<hr style="margin: 0.5rem 1rem; border: 1px solid rgba(255,255,255,0.2);">';
                dropdownMenu.appendChild(separator);
                
                // Add courses
                courses.forEach(course => {
                    const courseItem = document.createElement('li');
                    courseItem.innerHTML = `
                        <a href="#courses" data-section="courses">
                            <i class="fas fa-graduation-cap"></i>
                            ${course.title}
                        </a>
                    `;
                    dropdownMenu.appendChild(courseItem);
                });
            }
        } catch (error) {
            console.error("Failed to load dropdown courses:", error);
        }
    }

    // Load dynamic data
    loadMaterials();
    loadToppers();
    loadCourses();
    loadDropdownCourses();
});

// Loading Animation
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.5s ease';
});

// Add loading styles
const loadingStyle = document.createElement('style');
loadingStyle.textContent = `
    body {
        opacity: 0;
    }
    .loading {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #1a237e;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    }
    .loading::after {
        content: '';
        width: 50px;
        height: 50px;
        border: 3px solid #ffb300;
        border-top: 3px solid transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(loadingStyle);

// Error Handling
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
    showNotification('Something went wrong. Please refresh the page.', 'error');
});

// Form Validation Enhancement
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone);
}

// Add real-time validation
document.querySelectorAll('input[type="email"]').forEach(input => {
    input.addEventListener('blur', () => {
        if (input.value && !validateEmail(input.value)) {
            input.style.borderColor = '#f44336';
            showNotification('Please enter a valid email address.', 'error');
        } else {
            input.style.borderColor = '#ddd';
        }
    });
});

document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('blur', () => {
        if (input.value && !validatePhone(input.value)) {
            input.style.borderColor = '#f44336';
            showNotification('Please enter a valid phone number.', 'error');
        } else {
            input.style.borderColor = '#ddd';
        }
    });
});

// Keyboard Navigation Support
document.addEventListener('keydown', (e) => {
    // Close modal with Escape key
    if (e.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Close mobile menu with Escape key
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Performance Optimization - Lazy Loading for Images (if any are added later)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Course Filtering Functionality
const categoryButtons = document.querySelectorAll('.category-btn');
const courseCards = document.querySelectorAll('.course-card');

categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        const selectedCategory = button.getAttribute('data-category');
        
        // Filter course cards
        courseCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            
            if (selectedCategory === 'all' || cardCategory === selectedCategory) {
                card.classList.remove('hidden');
                card.style.animation = 'fadeInUp 0.6s ease forwards';
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

// Add animation delay to course cards for staggered effect
courseCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
});

console.log('Guru Academy Website - JavaScript Loaded Successfully! 🎓');

// Apple App Store Button (Coming Soon functionality)
document.querySelectorAll('.app-btn').forEach(btn => {
    if (btn.querySelector('.fab.fa-apple')) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Coming Soon!', 'info');
        });
    }
});

// Student Cards Functionality
document.addEventListener('DOMContentLoaded', function() {
    const studentCards = document.querySelectorAll('.student-card');
    
    studentCards.forEach(card => {
        card.addEventListener('click', function() {
            const name = this.getAttribute('data-name');
            const roll = this.getAttribute('data-roll');
            const marks = this.getAttribute('data-marks');
            
            // Create and show student details modal
            showStudentDetails(name, roll, marks);
        });
        
        // Add hover effect for better UX
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Function to show student details
function showStudentDetails(name, roll, marks) {
    // Remove existing modal
    const existingModal = document.querySelector('.student-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Map student names to correct file names
    const photoMap = {
        'Sumit Kumar Bairwa': 'Sumit_Bairwa.jpg',
        'Divya Kumari Sharma': 'Divya_Saini.jpg',
        'Krishana Sharma': 'Krishna_Sharma.jpg',
        'Neetu Gurjar': 'Neetu_Gurjar.jpg',
        'Manish Jangid': 'Manish_Jangid.jpg',
        'Sachin Saini': 'Sachin_Saini.jpg',
        'Shikha Prajapat': 'Shikha_Prajapat.jpg',
        'Manish Prajapat': 'Manish_Prajapat.jpg',
        'Anjali Vaishnav': 'Anjali_Vaishnav.jpg',
        'Gajanand Chhipa': 'Gajanand_Chhipa.jpg',
        'Girija Sharma': 'Girija_Sharma.jpg',
        'Devendra Saini': 'Devendra_Saini.jpg',
        'Neha Saini': 'Neha_Saini.jpg',
        'Gajendra Pal Singh Kasana': 'Gajendra_Pal_Singh_Kasana.jpg',
        'Anjali Saini': 'Anjali_Saini.jpg'
    };
    
    // Get the correct photo filename
    const photoFilename = photoMap[name] || `${name.replace(/\s+/g, '_')}.jpg`;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'student-modal';
    modal.innerHTML = `
        <div class="student-modal-content">
            <div class="student-modal-header">
                <img src="assets/images/Logo.png" alt="Guru Academy Logo" style="height: 40px; width: 40px; vertical-align: middle; margin-right: 8px; border-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
                <h3 style="display: inline; vertical-align: middle; margin: 0; font-size: 1.3rem;">Student Achievement</h3>
                <button class="student-modal-close">&times;</button>
            </div>
            <div class="student-modal-body">
                <div class="student-modal-photo">
                    <img src="assets/images/Toppers/${photoFilename}" alt="${name}" onerror="this.src='assets/images/Logo.png'">
                </div>
                <div class="student-modal-info">
                    <h4>${name}</h4>
                    <p><strong>Roll Number:</strong> ${roll}</p>
                    <p><strong>Science Marks:</strong> <span class="marks-highlight">${marks}/100</span></p>
                    <div class="achievement-message">
                        <p>🎉 Congratulations! This student achieved excellent results in the RBSE 10th Board Examination.</p>
                        <p>Their dedication and hard work, combined with our expert guidance, led to this outstanding performance.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .student-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }
        
        .student-modal-content {
            background: white;
            border-radius: 15px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease;
        }
        
        .student-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 2px solid #ffb300;
            background: linear-gradient(135deg, #1a237e, #3949ab);
            color: white;
            border-radius: 15px 15px 0 0;
        }
        
        .student-modal-header h3 {
            margin: 0;
            font-size: 1.3rem;
        }
        
        .student-modal-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.3s;
        }
        
        .student-modal-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .student-modal-body {
            padding: 2rem;
            text-align: center;
        }
        
        .student-modal-photo {
            width: 180px;
            height: 180px;
            margin: 0 auto 1.5rem auto;
            border-radius: 50%;
            overflow: hidden;
            border: 4px solid #ffb300;
            box-shadow: 0 4px 15px rgba(255, 179, 0, 0.3);
        }
        
        .student-modal-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center 20%;
        }
        
        .student-modal-info h4 {
            color: #1a237e;
            font-size: 1.4rem;
            margin: 0 0 1rem 0;
        }
        
        .student-modal-info p {
            color: #666;
            margin: 0.5rem 0;
            font-size: 1rem;
        }
        
        .marks-highlight {
            color: #4caf50;
            font-weight: bold;
            font-size: 1.2rem;
        }
        
        .achievement-message {
            margin-top: 1.5rem;
            padding: 1rem;
            background: linear-gradient(135deg, #f8f9fa, #e3f2fd);
            border-radius: 10px;
            border-left: 4px solid #4caf50;
        }
        
        .achievement-message p {
            margin: 0.5rem 0;
            color: #555;
            font-size: 0.95rem;
            line-height: 1.5;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        @media (max-width: 768px) {
            .student-modal-content {
                width: 95%;
                margin: 1rem;
            }
            
            .student-modal-header {
                padding: 1rem;
            }
            
            .student-modal-header h3 {
                font-size: 1.1rem;
            }
            
            .student-modal-body {
                padding: 1.5rem;
            }
            
            .student-modal-photo {
                width: 150px;
                height: 150px;
            }
            
            .student-modal-info h4 {
                font-size: 1.2rem;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(modal);
    
    // Close functionality
    const closeBtn = modal.querySelector('.student-modal-close');
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    // Close when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function closeOnEscape(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', closeOnEscape);
        }
    });
}

// Course Materials Access Buttons
const materialButtons = document.querySelectorAll('.material-btn');

materialButtons.forEach(button => {
    button.addEventListener('click', () => {
        const courseId = button.getAttribute('data-course');
        const price = button.getAttribute('data-price');
        
        // Course data for app redirect
        const courseData = {
            'previous-year-questions': {
                name: 'Previous Year Questions',
                price: price,
                description: 'Get solved previous year questions for Class 10 Science board exams'
            },
            'science-pdf-notes': {
                name: 'Class-10 Science PDF Notes',
                price: price,
                description: 'Comprehensive and easy-to-understand PDF notes for Class 10 Science'
            }
        };
        
        const course = courseData[courseId];
        
        // Show notification
        showNotification(`Redirecting to app for ${course.name}...`, 'info');
        
        // Redirect to your app
        // Replace this URL with your actual app link
        const appUrl = 'https://play.google.com/store/apps/details?id=com.tdkolz.wmpxun';
        
        // Redirect to app
        setTimeout(() => {
            window.open(appUrl, '_blank');
        }, 500);
    });
});

// Pagination for Science Toppers
function paginateTable(tableId, paginationId, rowsPerPage = 7) {
    const table = document.getElementById(tableId);
    const body = table.querySelector('.toppers-table-body');
    const rows = Array.from(body.children);
    const pagination = document.getElementById(paginationId);
    let currentPage = 1;
    const totalPages = Math.ceil(rows.length / rowsPerPage);

    function renderPage(page) {
        body.innerHTML = '';
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        rows.slice(start, end).forEach(row => body.appendChild(row));
        pagination.innerHTML = '';
        if (totalPages > 1) {
            const prev = document.createElement('button');
            prev.textContent = 'Previous';
            prev.disabled = page === 1;
            prev.onclick = () => { if (currentPage > 1) { currentPage--; renderPage(currentPage); } };
            pagination.appendChild(prev);
            const pageInfo = document.createElement('span');
            pageInfo.textContent = ` Page ${page} of ${totalPages} `;
            pagination.appendChild(pageInfo);
            const next = document.createElement('button');
            next.textContent = 'Next';
            next.disabled = page === totalPages;
            next.onclick = () => { if (currentPage < totalPages) { currentPage++; renderPage(currentPage); } };
            pagination.appendChild(next);
        }
    }
    renderPage(currentPage);
}
