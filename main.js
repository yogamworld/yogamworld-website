/* ==========================================================================
   Yogam World Website Core JavaScript
   ========================================================================== */

// --- Centralized Website Configuration ---
// Easily update these values to change the live registration URL, timing, dates, and contacts.
const WORKSHOP_CONFIG = {
    // Live Google Registration Form Link
    GOOGLE_FORM_URL: "https://forms.gle/77dP3BJdCtccigUu5",
    
    // Stripe Payment Link
    STRIPE_PAYMENT_URL: "https://buy.stripe.com/5kQ14pgevfGXfUB3PvaEE00",
    
    // Offline Payment details
    zelleEmail: "yogam.world@gmail.com",
    contactPhone: "+1 804-516-8515",
    contactPhoneRaw: "+18045168515",
    
    // Social Media Links
    instagramUrl: "https://instagram.com/yogamworld",
    youtubeUrl: "https://youtube.com/c/yogamworld",
    facebookUrl: "https://facebook.com/yogamworld",
    whatsappUrl: "https://wa.me/18045168515?text=I%20am%20interested%20in%20the%2021-Day%20Yoga%20Workshop", // URL encoded message
    
    // General Workshop Variables
    timingText: "6:00 AM - 7:00 AM EST",
    startDateText: "July 11, 2026",
    startDateVal: "2026-07-11" // Format: YYYY-MM-DD (This controls the calendar highlighted range)
};

document.addEventListener("DOMContentLoaded", () => {
    
    // Initialize all custom variables
    initConfiguration();
    
    // Initialize payment toggle logic
    initPayments();
    
    // Navigation Interactivity
    initNavigation();
    
    // FAQ Accordion
    initAccordion();
    
    // Testimonial Carousel Slider
    initTestimonialSlider();
    
    // Interactive 21-Day Calendar
    initCalendar();
    
    // Scroll-triggered Fade/Slide Animations
    initScrollAnimations();
});

/**
 * Injects the configuration variables into their respective places in the HTML
 */
function initConfiguration() {
    // 1. Inject Registration Links to all buttons with class "btn-register-link"
    const registerLinks = document.querySelectorAll(".btn-register-link");
    registerLinks.forEach(link => {
        if (WORKSHOP_CONFIG.GOOGLE_FORM_URL) {
            link.setAttribute("href", WORKSHOP_CONFIG.GOOGLE_FORM_URL);
        } else {
            // Safe fallback if URL is empty
            link.setAttribute("href", "#");
            link.addEventListener("click", (e) => {
                e.preventDefault();
                alert("Registration Form URL is coming soon. Please check back later!");
            });
        }
    });

    // 1b. Inject Stripe Links to all buttons with class "btn-stripe-link"
    const stripeLinks = document.querySelectorAll(".btn-stripe-link");
    stripeLinks.forEach(link => {
        if (WORKSHOP_CONFIG.STRIPE_PAYMENT_URL) {
            link.setAttribute("href", WORKSHOP_CONFIG.STRIPE_PAYMENT_URL);
        } else {
            link.setAttribute("href", "#");
        }
    });

    // 1c. Inject Contact phone links and text
    const phoneLinks = document.querySelectorAll(".config-text-phone");
    phoneLinks.forEach(link => {
        link.textContent = WORKSHOP_CONFIG.contactPhone;
        if (link.tagName === "A") {
            link.setAttribute("href", `tel:${WORKSHOP_CONFIG.contactPhoneRaw}`);
        }
    });

    // Handle scroll trigger for CTA Register links that scroll down to registration card section
    const ctaTriggers = document.querySelectorAll(".cta-register-trigger");
    ctaTriggers.forEach(btn => {
        btn.addEventListener("click", (e) => {
            // Check if iframe registration is active or if we're scrolling to the section
            const regSection = document.getElementById("register");
            if (regSection) {
                e.preventDefault();
                const targetOffset = regSection.offsetTop - 80; // offset header
                window.scrollTo({
                    top: targetOffset,
                    behavior: "smooth"
                });
            }
        });
    });

    // 2. Set timing string
    const timingElements = document.querySelectorAll(".config-text-timing");
    timingElements.forEach(el => {
        el.textContent = WORKSHOP_CONFIG.timingText;
    });

    // 3. Inject social URLs
    const igLink = document.getElementById("social-instagram");
    if (igLink) igLink.setAttribute("href", WORKSHOP_CONFIG.instagramUrl);
    
    const ytLink = document.getElementById("social-youtube");
    if (ytLink) ytLink.setAttribute("href", WORKSHOP_CONFIG.youtubeUrl);
    
    const fbLink = document.getElementById("social-facebook");
    if (fbLink) fbLink.setAttribute("href", WORKSHOP_CONFIG.facebookUrl);
    
    const waLink = document.getElementById("social-whatsapp");
    if (waLink) waLink.setAttribute("href", WORKSHOP_CONFIG.whatsappUrl);

    // 4. Update Copyright Year to current year dynamically
    const yearSpan = document.getElementById("copyright-year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 5. Iframe Embedding Option Handler
    // If the user chooses to embed the form directly (Google Form iframe container is uncommented)
    const googleFormIframe = document.getElementById("google-form-iframe");
    const iframeContainer = document.getElementById("iframe-reg-container");
    if (googleFormIframe && iframeContainer) {
        googleFormIframe.src = WORKSHOP_CONFIG.GOOGLE_FORM_URL;
        iframeContainer.style.display = "block";
    }
}

/**
 * Handles toggling and height animation of the Zelle/Offline payment drawer
 */
function initPayments() {
    const toggleOfflineBtn = document.getElementById("toggle-offline-btn");
    const offlineDrawer = document.getElementById("offline-payment-drawer");
    
    if (toggleOfflineBtn && offlineDrawer) {
        toggleOfflineBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const isOpen = offlineDrawer.classList.contains("open");
            
            if (isOpen) {
                offlineDrawer.style.maxHeight = "0px";
                offlineDrawer.classList.remove("open");
                toggleOfflineBtn.classList.remove("active");
                // Restore icon to down arrow
                const icon = toggleOfflineBtn.querySelector("i");
                if (icon) {
                    icon.className = "fa-solid fa-chevron-down";
                }
            } else {
                offlineDrawer.style.maxHeight = offlineDrawer.scrollHeight + 40 + "px"; // add padding buffer
                offlineDrawer.classList.add("open");
                toggleOfflineBtn.classList.add("active");
                // Change icon to up arrow
                const icon = toggleOfflineBtn.querySelector("i");
                if (icon) {
                    icon.className = "fa-solid fa-chevron-up";
                }
                // Scroll down slightly to display the drawer
                setTimeout(() => {
                    offlineDrawer.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }, 150);
            }
        });
    }
}

/**
 * Handles navigation bar scroll effects, mobile hamburger toggles, and section active highlights
 */
function initNavigation() {
    const header = document.getElementById("site-header");
    const mobileToggle = document.getElementById("mobile-toggle");
    const navMenu = document.getElementById("nav-menu");
    const navLinks = document.querySelectorAll(".nav-link:not(.btn)");

    // 1. Sticky Navigation on Scroll
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
        
        highlightActiveSection();
    });

    // Initial check on load
    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    }

    // 2. Mobile Menu Toggle Action
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener("click", () => {
            mobileToggle.classList.toggle("active");
            navMenu.classList.toggle("active");
            
            // Toggle body scroll locking when mobile menu is open
            if (navMenu.classList.contains("active")) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "";
            }
        });
    }

    // Close menu when clicking navigation links (essential for single page landing)
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (navMenu.classList.contains("active")) {
                mobileToggle.classList.remove("active");
                navMenu.classList.remove("active");
                document.body.style.overflow = "";
            }
        });
    });

    // Close menu when clicking outside the panel
    document.addEventListener("click", (e) => {
        if (navMenu.classList.contains("active") && 
            !navMenu.contains(e.target) && 
            !mobileToggle.contains(e.target)) {
            mobileToggle.classList.remove("active");
            navMenu.classList.remove("active");
            document.body.style.overflow = "";
        }
    });

    // 3. Update active nav-link highlighting based on current view position
    function highlightActiveSection() {
        const sections = document.querySelectorAll("section[id]");
        let currentSectionId = "";

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120; // Accounts for header height + buffer
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            const href = link.getAttribute("href");
            if (href === `#${currentSectionId}` || (href === "#" && !currentSectionId)) {
                // If it's the home link or matches section ID, mark active
                if (currentSectionId) {
                    link.classList.add("active");
                } else if (href === "#") {
                    link.classList.add("active");
                }
            }
        });
    }
}

/**
 * Handles accordion expansion and collapse styling for FAQ sections
 */
function initAccordion() {
    const accordionHeaders = document.querySelectorAll(".accordion-header");

    accordionHeaders.forEach(header => {
        header.addEventListener("click", () => {
            const parentItem = header.parentElement;
            const content = header.nextElementSibling;
            
            // Check if item is already active
            const isActive = parentItem.classList.contains("active");
            
            // Close all open items
            document.querySelectorAll(".accordion-item").forEach(item => {
                item.classList.remove("active");
                item.querySelector(".accordion-content").style.maxHeight = null;
            });
            
            // If the clicked item was not active, open it
            if (!isActive) {
                parentItem.classList.add("active");
                // Smoothly set height to scrollHeight (content natural height)
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
}

/**
 * Controls the testimonial slides, controls indicators, and auto-rotations
 */
function initTestimonialSlider() {
    const slider = document.getElementById("testimonial-slider");
    if (!slider) return;
    
    const slides = slider.querySelectorAll(".testimonial-slide");
    const dotsContainer = document.getElementById("slider-dots");
    const prevBtn = document.getElementById("prev-slide");
    const nextBtn = document.getElementById("next-slide");
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    let autoPlayTimer = null;
    const autoPlayInterval = 6000; // 6 seconds auto-rotate

    if (totalSlides <= 1) {
        if (prevBtn) prevBtn.style.display = "none";
        if (nextBtn) nextBtn.style.display = "none";
        return;
    }

    // 1. Show Slide Function
    function showSlide(index) {
        // Handle wrapping around bounds
        if (index >= totalSlides) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = totalSlides - 1;
        } else {
            currentSlide = index;
        }

        // Toggle slides active classes
        slides.forEach((slide, i) => {
            if (i === currentSlide) {
                slide.classList.add("active");
            } else {
                slide.classList.remove("active");
            }
        });

        // Toggle dots active classes
        const dots = dotsContainer.querySelectorAll(".dot");
        dots.forEach((dot, i) => {
            if (i === currentSlide) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });
    }

    // 2. Click Events for Controls
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            showSlide(currentSlide + 1);
            resetAutoPlay();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            showSlide(currentSlide - 1);
            resetAutoPlay();
        });
    }

    // Dot indicators click logic
    const dots = dotsContainer.querySelectorAll(".dot");
    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            showSlide(index);
            resetAutoPlay();
        });
    });

    // 3. Auto-Play functionality
    function startAutoPlay() {
        autoPlayTimer = setInterval(() => {
            showSlide(currentSlide + 1);
        }, autoPlayInterval);
    }

    function stopAutoPlay() {
        if (autoPlayTimer) {
            clearInterval(autoPlayTimer);
            autoPlayTimer = null;
        }
    }

    function resetAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }

    // Pause slider on mouse hover, resume on leave
    const container = slider.parentElement;
    container.addEventListener("mouseenter", stopAutoPlay);
    container.addEventListener("mouseleave", startAutoPlay);

    // Initial setup
    startAutoPlay();
}

/**
 * Registers an IntersectionObserver to dynamically slide in sections on scroll
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(".scroll-animate");
    
    if ('IntersectionObserver' in window) {
        const animationObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    // Stop observing once animated
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12, // Element is 12% visible before triggering
            rootMargin: "0px 0px -40px 0px" // Slight offset for better feel
        });

        animatedElements.forEach(el => {
            animationObserver.observe(el);
        });
    } else {
        // Fallback for older browsers
        animatedElements.forEach(el => {
            el.classList.add("visible");
        });
    }
}

/**
 * Curriculum topics for the 21-day workshop calendar details
 */
const WORKSHOP_CURRICULUM = [
    { day: 1, title: "Joint Mobility (Sukshma Vyayama)", focus: "Preparing joints, neck, shoulders, and wrists." },
    { day: 2, title: "Ankle & Knee Stabilization", focus: "Building physical foundation, alignment, and balances." },
    { day: 3, title: "Spinal Warming & Back Releases", focus: "Releasing muscle tension along the dorsal line." },
    { day: 4, title: "Introduction to Breath Sync", focus: "Coordinating dynamic movement with breathing rhythms." },
    { day: 5, title: "Core & Pelvic Floor Activation", focus: "Establishing internal structural stability." },
    { day: 6, title: "Standing Postures for Stability", focus: "Tadasana, Vrikshasana, and Warrior series." },
    { day: 7, title: "Spinal Realignment & Extensions", focus: "Opening chest cavity and relieving spinal compression." },
    { day: 8, title: "Seated Twists for Detox", focus: "Gentle twists to aid digestion and stimulate abdominal organs." },
    { day: 9, title: "Chest-Openers & Shoulder Opening", focus: "Improving respiratory capacity and chest mobility." },
    { day: 10, title: "Prone Back-Strengtheners", focus: "Bhujangasana and Shalabhasana." },
    { day: 11, title: "Balance & Proprioception Postures", focus: "Refining body alignment and balance in space." },
    { day: 12, title: "Review of Physical Postures", focus: "Integration of foundational asanas into a single flow." },
    { day: 13, title: "Abdominal & Diaphragmatic Breath", focus: "Unlocking deeper lung volume and calming the nerves." },
    { day: 14, title: "Alternate Nostril Breathing", focus: "Nadi Shodhana for mental clarity and left-right brain balance." },
    { day: 15, title: "Cooling & Calming Pranayama", focus: "Sheetali, Sheetkari, and Humming Bee (Brahmari) breathing." },
    { day: 16, title: "Internal Cleanse (Kapalabhati)", focus: "Mild cleansing breath exercises for lung oxygenation." },
    { day: 17, title: "Breath & Mind Connection Flow", focus: "Syncing breath holds with slow, mindful yoga transitions." },
    { day: 18, title: "Mindfulness & Body Scan", focus: "Developing somatic sensory awareness and relaxing muscles." },
    { day: 19, title: "Yoga Nidra (Deep Relaxation)", focus: "Restorative recovery for the nervous system and deep sleep." },
    { day: 20, title: "Meditation & Visualizations", focus: "Cultivating appreciation, presence, and calm." },
    { day: 21, title: "Integration & Sustainable Routine", focus: "Creating your personalized lifelong self-practice schedule." }
];

/**
 * Initializes and handles rendering logic for the 21-Day interactive schedule calendar
 */
function initCalendar() {
    const calendarDaysGrid = document.getElementById("calendar-days-grid");
    if (!calendarDaysGrid) return;

    const monthYearTitle = document.getElementById("calendar-month-year");
    const prevMonthBtn = document.getElementById("prev-month");
    const nextMonthBtn = document.getElementById("next-month");
    
    const detailsPlaceholder = document.getElementById("details-placeholder");
    const detailsActiveContent = document.getElementById("details-active-content");
    const detailsDayNum = document.getElementById("details-day-number");
    const detailsDayTitle = document.getElementById("details-day-title");
    const detailsDayFocus = document.getElementById("details-day-focus");

    // Set calendar date context based on WORKSHOP_CONFIG.startDateVal
    const startDate = new Date(WORKSHOP_CONFIG.startDateVal + "T00:00:00");
    let currentViewDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    // Calculate workshop dates range
    const endDate = new Date(startDate.getTime());
    endDate.setDate(startDate.getDate() + 20); // 21 days total (Start + 20)

    function renderCalendar() {
        calendarDaysGrid.innerHTML = "";
        
        const year = currentViewDate.getFullYear();
        const month = currentViewDate.getMonth();
        
        // Month name & Year title
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        monthYearTitle.textContent = `${monthNames[month]} ${year}`;
        
        // First day of current view month (0 = Sun, 1 = Mon...)
        const firstDayIndex = new Date(year, month, 1).getDay();
        
        // Total days in current view month
        const totalDays = new Date(year, month + 1, 0).getDate();
        
        // Render empty day spaces before the first day of the month
        for (let i = 0; i < firstDayIndex; i++) {
            const emptyDay = document.createElement("div");
            emptyDay.className = "day empty";
            calendarDaysGrid.appendChild(emptyDay);
        }
        
        const today = new Date();
        
        // Render actual days of the month
        for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
            const dayEl = document.createElement("div");
            dayEl.className = "day";
            dayEl.textContent = dayNum;
            
            const thisDayDate = new Date(year, month, dayNum);
            
            // Check if this date matches today's date
            if (thisDayDate.toDateString() === today.toDateString()) {
                dayEl.classList.add("today");
            }
            
            // Check if this date falls within the 21-day workshop window
            if (thisDayDate >= startDate && thisDayDate <= endDate) {
                dayEl.classList.add("active-range");
                
                // Calculate which day of the workshop this is (1-indexed)
                const diffTime = Math.abs(thisDayDate - startDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Add 1 since start date is Day 1
                dayEl.setAttribute("data-workshop-day", diffDays);
                
                // Add click behavior to show corresponding details
                dayEl.addEventListener("click", () => {
                    // Highlight selected day
                    document.querySelectorAll(".calendar-days .day").forEach(el => {
                        el.classList.remove("selected");
                    });
                    dayEl.classList.add("selected");
                    
                    // Populate details panel
                    const curriculumIndex = diffDays - 1;
                    if (curriculumIndex >= 0 && curriculumIndex < WORKSHOP_CURRICULUM.length) {
                        const dayInfo = WORKSHOP_CURRICULUM[curriculumIndex];
                        detailsPlaceholder.style.display = "none";
                        detailsActiveContent.style.display = "flex";
                        
                        detailsDayNum.textContent = dayInfo.day;
                        detailsDayTitle.textContent = dayInfo.title;
                        detailsDayFocus.textContent = dayInfo.focus;
                    }
                });
            }
            
            calendarDaysGrid.appendChild(dayEl);
        }

        // Programmatically select Day 1 immediately if we are viewing the start date month
        if (month === startDate.getMonth() && year === startDate.getFullYear()) {
            const firstDayEl = calendarDaysGrid.querySelector('[data-workshop-day="1"]');
            if (firstDayEl) {
                firstDayEl.click();
            }
        } else {
            // Re-show placeholder if viewing another month without selected days
            detailsPlaceholder.style.display = "block";
            detailsActiveContent.style.display = "none";
        }
    }

    // Prev/Next month button triggers
    prevMonthBtn.addEventListener("click", () => {
        currentViewDate.setMonth(currentViewDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener("click", () => {
        currentViewDate.setMonth(currentViewDate.getMonth() + 1);
        renderCalendar();
    });

    // Render initially
    renderCalendar();
}
