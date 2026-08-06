/* ==========================================================================
   Yogam World Website Core JavaScript
   ========================================================================== */

// --- Centralized Website Configuration ---
// Easily update these values to change the live registration URL, timing, dates, and contacts.
const WORKSHOP_CONFIG = {
    // Live Google Registration Form Link
    GOOGLE_FORM_URL: "https://docs.google.com/forms/d/e/1FAIpQLSem65n_cRAdejsrYFIoJuiABc7cGRs4qd6qLS7nE7E7nw5FwA/viewform",
    
    // Stripe Payment Link (Full 21-Day Workshop)
    STRIPE_PAYMENT_URL: "https://buy.stripe.com/5kQ14pgevfGXfUB3PvaEE00",
    
    // Stripe Payment Link (1-Day Single Session)
    STRIPE_SINGLE_SESSION_URL: "https://buy.stripe.com/14A9AVaUbcuL7o5gChaEE02",
    
    // Offline Payment details
    zelleEmail: "yogam.world@gmail.com",
    contactPhone: "+1 804-516-8515",
    contactPhoneRaw: "+18045168515",
    
    // Social Media Links
    instagramUrl: "https://www.instagram.com/yogam.world/",
    youtubeUrl: "https://www.youtube.com/@yogam_world",
    facebookUrl: "https://www.facebook.com/DurgaDevi.Yogam",
    whatsappUrl: "https://chat.whatsapp.com/Efxpkub1eLLBC4aKQnhTdJ?mode=gi_t",
    whatsappSocialUrl: "https://wa.me/18045168515",
    
    // General Workshop Variables
    timingText: "6:00 AM - 7:00 AM EST",
    
    // Recurring & Deadline Settings
    // Registration closes this many days before the workshop begins (default: 1 day before, e.g. Sunday)
    REGISTRATION_CLOSE_DAYS_BEFORE: 1,
    
    // Set to true to manually force close registration for all batches
    REGISTRATION_FORCE_CLOSED: false,
    
    // Optional static ISO string override to set a custom deadline (e.g. "2026-09-05T23:59:59")
    REGISTRATION_DEADLINE_OVERRIDE: null
};

// Global active workshop program state
let currentWorkshop = null;

// --- Helper Functions for Recurring Dates & Deadlines ---

/**
 * Returns the first Monday of a given year and month (0-indexed)
 */
function getFirstMonday(year, month) {
    let date = new Date(year, month, 1);
    while (date.getDay() !== 1) { // 1 = Monday
        date.setDate(date.getDate() + 1);
    }
    return date;
}

/**
 * Formats a Date object as a long readable date (e.g. "Sunday, September 6, 2026")
 */
function formatDateLong(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Formats a date range beautifully (e.g. "Sept 7 – 27, 2026")
 */
function formatDateRange(start, end) {
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const startYear = start.getFullYear();
    
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const endDay = end.getDate();
    const endYear = end.getFullYear();
    
    if (startYear !== endYear) {
        return `${startMonth} ${startDay}, ${startYear} – ${endMonth} ${endDay}, ${endYear}`;
    }
    if (startMonth !== endMonth) {
        return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${startYear}`;
    }
    return `${startMonth} ${startDay} – ${endDay}, ${startYear}`;
}

/**
 * Calculates the active/upcoming workshop details based on the current date
 */
function getWorkshopDetails(now) {
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Calculate first Monday of current month
    let firstMondayCurrent = getFirstMonday(currentYear, currentMonth);
    let deadlineDays = WORKSHOP_CONFIG.REGISTRATION_CLOSE_DAYS_BEFORE || 0;
    
    let deadlineCurrent = new Date(firstMondayCurrent.getTime());
    deadlineCurrent.setDate(deadlineCurrent.getDate() - deadlineDays);
    deadlineCurrent.setHours(23, 59, 59, 999);
    
    let activeStart, activeDeadline, status = "open";
    
    // Check if we have a static deadline override
    if (WORKSHOP_CONFIG.REGISTRATION_DEADLINE_OVERRIDE) {
        let overrideDate = new Date(WORKSHOP_CONFIG.REGISTRATION_DEADLINE_OVERRIDE);
        if (!isNaN(overrideDate.getTime())) {
            if (now > overrideDate) {
                // Override has passed, roll over to the next month
                let nextMonth = currentMonth + 1;
                let nextYear = currentYear;
                if (nextMonth > 11) {
                    nextMonth = 0;
                    nextYear++;
                }
                activeStart = getFirstMonday(nextYear, nextMonth);
                activeDeadline = new Date(activeStart.getTime());
                activeDeadline.setDate(activeDeadline.getDate() - deadlineDays);
                activeDeadline.setHours(23, 59, 59, 999);
            } else {
                activeStart = firstMondayCurrent;
                activeDeadline = overrideDate;
            }
        }
    } else {
        // Standard dynamic calculation
        if (now <= deadlineCurrent) {
            // Registration for current month is open
            activeStart = firstMondayCurrent;
            activeDeadline = deadlineCurrent;
        } else {
            // Roll over to next month
            let nextMonth = currentMonth + 1;
            let nextYear = currentYear;
            if (nextMonth > 11) {
                nextMonth = 0;
                nextYear++;
            }
            activeStart = getFirstMonday(nextYear, nextMonth);
            activeDeadline = new Date(activeStart.getTime());
            activeDeadline.setDate(activeDeadline.getDate() - deadlineDays);
            activeDeadline.setHours(23, 59, 59, 999);
        }
    }
    
    // End date is 20 days after start date (21 consecutive days total)
    let activeEnd = new Date(activeStart.getTime());
    activeEnd.setDate(activeStart.getDate() + 20);
    
    return {
        startDate: activeStart,
        endDate: activeEnd,
        deadline: activeDeadline,
        status: status
    };
}

document.addEventListener("DOMContentLoaded", () => {
    // Determine active workshop details
    let now = new Date();
    currentWorkshop = getWorkshopDetails(now);
    
    // Initialize all custom variables
    initConfiguration();
    
    // Initialize simplified checkout widget logic
    initCheckoutWidget();
    
    // Navigation Interactivity
    initNavigation();
    
    // FAQ Accordion
    initAccordion();
    
    // Testimonial Carousel Slider
    initTestimonialSlider();
    
    // Interactive 21-Day Calendar
    initCalendar();
    
    // Dynamically calculate upcoming batch list
    initUpcomingBatches();
    
    // Scroll-triggered Fade/Slide Animations
    initScrollAnimations();
});

/**
 * Injects the configuration variables into their respective places in the HTML
 */
function initConfiguration() {
    // Determine status of active workshop
    const isClosed = WORKSHOP_CONFIG.REGISTRATION_FORCE_CLOSED || currentWorkshop.status === "closed";

    // 1. Inject Registration Links to all buttons with class "btn-register-link"
    const registerLinks = document.querySelectorAll(".btn-register-link");
    registerLinks.forEach(link => {
        if (isClosed) {
            link.setAttribute("href", "#");
            link.classList.add("disabled");
            link.addEventListener("click", (e) => {
                e.preventDefault();
                alert("Registration is currently closed for this workshop batch.");
            });
        } else if (WORKSHOP_CONFIG.GOOGLE_FORM_URL) {
            link.setAttribute("href", WORKSHOP_CONFIG.GOOGLE_FORM_URL);
            link.classList.remove("disabled");
        } else {
            // Safe fallback if URL is empty
            link.setAttribute("href", "#");
            link.addEventListener("click", (e) => {
                e.preventDefault();
                alert("Registration Form URL is coming soon. Please check back later!");
            });
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

    // 2b. Inject Dynamic Workshop Package Variables
    const datesRangeEl = document.getElementById("workshop-dates-range");
    if (datesRangeEl) {
        datesRangeEl.textContent = formatDateRange(currentWorkshop.startDate, currentWorkshop.endDate);
    }
    
    const statusBadgeEl = document.getElementById("workshop-status-badge");
    if (statusBadgeEl) {
        if (isClosed) {
            statusBadgeEl.textContent = "Registration Closed";
            statusBadgeEl.className = "package-status-badge status-closed";
        } else {
            statusBadgeEl.textContent = "Registration Open";
            statusBadgeEl.className = "package-status-badge status-open";
        }
    }
    
    const deadlineTextEl = document.getElementById("workshop-deadline-text");
    if (deadlineTextEl) {
        if (isClosed) {
            deadlineTextEl.textContent = "Closed for this batch";
        } else {
            deadlineTextEl.textContent = formatDateLong(currentWorkshop.deadline);
        }
    }

    // 3. Inject social URLs
    const igLink = document.getElementById("social-instagram");
    if (igLink) igLink.setAttribute("href", WORKSHOP_CONFIG.instagramUrl);
    
    const ytLink = document.getElementById("social-youtube");
    if (ytLink) ytLink.setAttribute("href", WORKSHOP_CONFIG.youtubeUrl);
    
    const fbLink = document.getElementById("social-facebook");
    if (fbLink) fbLink.setAttribute("href", WORKSHOP_CONFIG.facebookUrl);
    
    const waLink = document.getElementById("social-whatsapp");
    if (waLink) waLink.setAttribute("href", WORKSHOP_CONFIG.whatsappSocialUrl);
    
    const waJoinLink = document.getElementById("social-whatsapp-join");
    if (waJoinLink) waJoinLink.setAttribute("href", WORKSHOP_CONFIG.whatsappUrl);

    // 4. Update Copyright Year to current year dynamically
    const yearSpan = document.getElementById("copyright-year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 5. Iframe Embedding Option Handler
    const googleFormIframe = document.getElementById("google-form-iframe");
    const iframeContainer = document.getElementById("iframe-reg-container");
    if (googleFormIframe && iframeContainer) {
        if (isClosed) {
            iframeContainer.style.display = "none";
        } else {
            googleFormIframe.src = WORKSHOP_CONFIG.GOOGLE_FORM_URL;
            iframeContainer.style.display = "block";
        }
    }
}

/**
 * Handles toggling and height animation of the Zelle/Offline payment drawer
 */
/**
 * Handles the step-by-step interactive checkout widget
 */
function initCheckoutWidget() {
    const programBoxes = document.querySelectorAll(".select-program-grid .select-box");
    const paymentBoxes = document.querySelectorAll(".select-payment-grid .select-box");
    
    const viewCard = document.getElementById("view-card");
    const viewZelle = document.getElementById("view-zelle");
    
    const cardSummaryName = document.getElementById("card-summary-name");
    const cardSummaryPrice = document.getElementById("card-summary-price");
    const zelleSummaryPrice = document.getElementById("zelle-summary-price");
    
    const checkoutCardBtn = document.getElementById("checkout-card-btn");
    
    // State variables
    let selectedProduct = "program"; // "program" or "session"
    let selectedPrice = 75;
    let selectedMethod = "card"; // "card" or "zelle"
    
    function updateCheckoutView() {
        // Determine product names and prices
        const productName = selectedProduct === "program" ? "21 Days Online Program" : "Individual Yoga Session";
        
        // Update summary text
        if (cardSummaryName) cardSummaryName.textContent = productName;
        if (cardSummaryPrice) cardSummaryPrice.textContent = `$${selectedPrice}`;
        if (zelleSummaryPrice) zelleSummaryPrice.textContent = `$${selectedPrice}`;
        
        // Update Stripe Payment Link
        if (checkoutCardBtn) {
            const isClosed = WORKSHOP_CONFIG.REGISTRATION_FORCE_CLOSED || currentWorkshop.status === "closed";
            if (isClosed) {
                checkoutCardBtn.setAttribute("href", "#");
                checkoutCardBtn.classList.add("disabled");
                checkoutCardBtn.innerHTML = `Registration Closed <i class="fa-solid fa-lock"></i>`;
            } else {
                checkoutCardBtn.classList.remove("disabled");
                const stripeUrl = selectedProduct === "program" 
                    ? WORKSHOP_CONFIG.STRIPE_PAYMENT_URL 
                    : WORKSHOP_CONFIG.STRIPE_SINGLE_SESSION_URL;
                checkoutCardBtn.setAttribute("href", stripeUrl || "#");
                checkoutCardBtn.innerHTML = `Pay Securely via Card <i class="fa-solid fa-credit-card"></i>`;
            }
        }
        
        // Toggle Views in Step 3
        if (selectedMethod === "card") {
            if (viewCard) viewCard.classList.add("active");
            if (viewZelle) viewZelle.classList.remove("active");
        } else {
            if (viewCard) viewCard.classList.remove("active");
            if (viewZelle) viewZelle.classList.add("active");
        }
    }
    
    // Bind Step 1 Product Clicks
    programBoxes.forEach(box => {
        box.addEventListener("click", () => {
            programBoxes.forEach(b => b.classList.remove("active"));
            box.classList.add("active");
            
            selectedProduct = box.getAttribute("data-product");
            selectedPrice = parseInt(box.getAttribute("data-price"), 10);
            
            updateCheckoutView();
        });
    });
    
    // Bind Step 2 Payment Clicks
    paymentBoxes.forEach(box => {
        box.addEventListener("click", () => {
            paymentBoxes.forEach(b => b.classList.remove("active"));
            box.classList.add("active");
            
            selectedMethod = box.getAttribute("data-method");
            
            updateCheckoutView();
        });
    });
    
    // Run initial configuration update
    updateCheckoutView();
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

    // Generate dots dynamically to match actual slide count
    if (dotsContainer) {
        dotsContainer.innerHTML = "";
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement("span");
            dot.className = "dot" + (i === 0 ? " active" : "");
            dotsContainer.appendChild(dot);
        }
    }

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
/**
 * Initializes and handles rendering logic for the 21-Day interactive schedule calendar
 */
function initCalendar() {
    const calendarDaysGrid = document.getElementById("calendar-days-grid");
    if (!calendarDaysGrid) return;

    const monthYearTitle = document.getElementById("calendar-month-year");
    const prevMonthBtn = document.getElementById("prev-month");
    const nextMonthBtn = document.getElementById("next-month");

    // Use the dynamic workshop start date computed globally as the initial month view
    const startDate = currentWorkshop ? currentWorkshop.startDate : new Date();
    let currentViewDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    function renderCalendar() {
        calendarDaysGrid.innerHTML = "";
        
        const year = currentViewDate.getFullYear();
        const month = currentViewDate.getMonth();
        
        // Dynamically compute the first Monday of the currently viewed month
        const viewStartDate = getFirstMonday(year, month);
        const viewEndDate = new Date(viewStartDate.getTime());
        viewEndDate.setDate(viewStartDate.getDate() + 20); // 21 days total
        
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
            
            // Check if this date is the batch start date (first Monday)
            if (thisDayDate.toDateString() === viewStartDate.toDateString()) {
                dayEl.classList.add("batch-start");
            }
            
            // Check if this date falls within the 21-day workshop window
            if (thisDayDate >= viewStartDate && thisDayDate <= viewEndDate) {
                dayEl.classList.add("active-range");
            }
            
            calendarDaysGrid.appendChild(dayEl);
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

/**
 * Calculates and dynamically renders the next 3 monthly batch dates for the workshop
 */
function initUpcomingBatches() {
    const batchesGrid = document.getElementById("upcoming-batches-grid");
    if (!batchesGrid) return;
    
    batchesGrid.innerHTML = "";
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    let batchesCount = 0;
    let monthOffset = 0;
    
    while (batchesCount < 3) {
        let checkMonth = currentMonth + monthOffset;
        let checkYear = currentYear;
        if (checkMonth > 11) {
            checkYear += Math.floor(checkMonth / 12);
            checkMonth = checkMonth % 12;
        }
        
        const firstMonday = getFirstMonday(checkYear, checkMonth);
        const deadline = new Date(firstMonday.getTime());
        deadline.setDate(deadline.getDate() - (WORKSHOP_CONFIG.REGISTRATION_CLOSE_DAYS_BEFORE || 0));
        deadline.setHours(23, 59, 59, 999);
        
        const isMissed = now > deadline;
        
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const batchName = `${monthNames[checkMonth]} Batch`;
        const dateRangeStr = formatDateRange(firstMonday, new Date(firstMonday.getFullYear(), firstMonday.getMonth(), firstMonday.getDate() + 20));
        
        const card = document.createElement("div");
        card.className = `batch-card ${isMissed ? 'closed' : 'open'}`;
        card.style.cssText = `
            border: 2px solid ${isMissed ? 'var(--color-border)' : 'var(--color-sage-light)'};
            background-color: ${isMissed ? 'var(--color-white)' : 'var(--color-sage-pale)'};
            border-radius: var(--border-radius-md);
            padding: 20px;
            text-align: center;
            opacity: ${isMissed ? '0.7' : '1'};
            transition: var(--transition-smooth);
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-height: 120px;
        `;
        
        card.innerHTML = `
            <span class="batch-status-badge" style="
                position: absolute;
                top: 12px;
                right: 12px;
                font-size: 0.7rem;
                font-weight: 700;
                padding: 3px 8px;
                border-radius: 20px;
                background-color: ${isMissed ? '#e9ecef' : 'var(--color-sage)'};
                color: ${isMissed ? '#6c757d' : 'var(--color-pure-white)'};
                text-transform: uppercase;
                letter-spacing: 0.5px;
            ">${isMissed ? 'Closed' : 'Open'}</span>
            <h4 style="font-family: var(--font-primary); font-size: 1.25rem; color: var(--color-text-dark); margin: 0 0 8px 0; text-align: left;">${batchName}</h4>
            <p style="font-size: 0.95rem; font-weight: 600; color: var(--color-text-dark); margin-bottom: 6px; text-align: left;">${dateRangeStr}</p>
            <p style="font-size: 0.8rem; color: var(--color-text-muted); margin: 0 0 12px 0; text-align: left;">
                ${isMissed ? 'Registration closed for this batch' : `Register by ${formatDateLong(deadline)}`}
            </p>
            ${isMissed ? '' : `
            <a href="${WORKSHOP_CONFIG.GOOGLE_FORM_URL}" target="_blank" class="btn btn-secondary btn-small" style="margin-top: 15px; width: fit-content; align-self: flex-start; padding: 8px 20px; font-size: 0.8rem;">
                Register for this Batch <i class="fa-solid fa-external-link"></i>
            </a>
            `}
        `;
        
        batchesGrid.appendChild(card);
        
        batchesCount++;
        monthOffset++;
    }
}
