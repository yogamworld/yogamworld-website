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
    WEB3FORMS_ACCESS_KEY: "6fc4441e-1f94-4b0b-bdb0-2d275ad1f8e4",
    
    // General Workshop Variables
    timingText: "5:30 AM - 6:30 AM EST (4:30 AM - 5:30 AM CST)",
    CLASS_TIMINGS: [
        "5:30 AM - 6:30 AM EST / 4:30 AM - 5:30 AM CST"
    ],
    
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
window.selectedDate = null;
window.selectedTimeSlot = "";

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
function initCheckoutWidget() {
    const programBoxes = document.querySelectorAll(".select-program-grid .select-box");
    const paymentBoxes = document.querySelectorAll(".select-payment-grid .select-box");
    
    const viewCard = document.getElementById("view-card");
    const viewZelle = document.getElementById("view-zelle");
    
    const cardSummaryName = document.getElementById("card-summary-name");
    const cardSummaryPrice = document.getElementById("card-summary-price");
    const zelleSummaryPrice = document.getElementById("zelle-summary-price");
    
    const checkoutCardBtn = document.getElementById("checkout-card-btn");
    
    // Custom date & timing elements
    const checkoutDetailsGroup = document.getElementById("checkout-details-group");
    const selectedDateText = document.getElementById("checkout-selected-date-text");
    const selectedDateBadge = document.getElementById("checkout-selected-date-badge");
    const timingSelectWrapper = document.getElementById("checkout-timing-select-wrapper");
    const zelleMemoText = document.getElementById("zelle-memo-text");
    
    // Calendar container inside Step 1
    const calendarContainer = document.getElementById("checkout-calendar-container");
    
    // Wizard Inputs, Buttons, and Steps
    const step2 = document.getElementById("checkout-step-2");
    const step3 = document.getElementById("checkout-step-3");
    const step4 = document.getElementById("checkout-step-4");
    
    const fullnameInput = document.getElementById("wizard-fullname");
    const emailInput = document.getElementById("wizard-email");
    const phoneInput = document.getElementById("wizard-phone");
    
    const nextBtn1 = document.getElementById("wizard-next-1");
    const nextBtn2 = document.getElementById("wizard-next-2");
    const nextBtn3 = document.getElementById("wizard-next-3");
    const nextBtn3Zelle = document.getElementById("wizard-next-3-zelle");
    
    // State variables
    let selectedProduct = "program"; // "program" or "session"
    let selectedPrice = 75;
    let selectedMethod = "card"; // "card" or "zelle"
    let emailSubmitted = false; // Prevents duplicate email notifications
    
    // Initialize default timing
    if (!window.selectedTimeSlot && WORKSHOP_CONFIG.CLASS_TIMINGS.length > 0) {
        window.selectedTimeSlot = WORKSHOP_CONFIG.CLASS_TIMINGS[0];
    }
    
    // Helper to format date
    function formatDateFriendly(date) {
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    
    // Function to calculate absolute scroll offset from the top of the body
    function getAbsoluteOffset(element) {
        if (!element) return 0;
        return element.getBoundingClientRect().top + window.scrollY - 100;
    }
    
    function lockDownstreamSteps(fromStep) {
        if (fromStep <= 1) {
            if (step2) step2.classList.add("disabled-step");
            if (nextBtn2) {
                nextBtn2.disabled = true;
                nextBtn2.classList.add("btn-secondary");
                nextBtn2.classList.remove("btn-primary");
            }
            if (fullnameInput) fullnameInput.value = "";
            if (emailInput) emailInput.value = "";
            if (phoneInput) phoneInput.value = "";
            emailSubmitted = false;
        }
        if (fromStep <= 2) {
            if (step3) step3.classList.add("disabled-step");
        }
        if (fromStep <= 3) {
            if (step4) step4.classList.add("disabled-step");
        }
    }
    
    function updateContactValidation() {
        const nameVal = fullnameInput ? fullnameInput.value.trim() : "";
        const emailVal = emailInput ? emailInput.value.trim() : "";
        const phoneVal = phoneInput ? phoneInput.value.trim() : "";
        
        // Enable Next button if all fields are filled
        if (nameVal && emailVal && phoneVal) {
            if (nextBtn2) {
                nextBtn2.disabled = false;
                nextBtn2.classList.remove("btn-secondary");
                nextBtn2.classList.add("btn-primary");
            }
        } else {
            if (nextBtn2) {
                nextBtn2.disabled = true;
                nextBtn2.classList.add("btn-secondary");
                nextBtn2.classList.remove("btn-primary");
            }
        }
    }
    
    // Send email notification to business email via Web3Forms
    async function sendWeb3FormsSubmission(paymentMethod) {
        if (emailSubmitted) return; // Skip if already submitted for this booking
        
        const accessKey = WORKSHOP_CONFIG.WEB3FORMS_ACCESS_KEY;
        if (!accessKey || accessKey.includes("YOUR_WEB3FORMS_ACCESS_KEY")) {
            console.warn("Web3Forms Access Key is not configured. Email notification skipped.");
            return;
        }
        
        const nameVal = (fullnameInput ? fullnameInput.value.trim() : "") || "N/A";
        const emailVal = (emailInput ? emailInput.value.trim() : "") || "N/A";
        const phoneVal = (phoneInput ? phoneInput.value.trim() : "") || "N/A";
        
        let planDetails = "";
        if (selectedProduct === "program") {
            const startStr = currentWorkshop ? currentWorkshop.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";
            planDetails = `21-day Online Workshop (starts ${startStr})`;
        } else {
            const dateShort = window.selectedDate ? window.selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "N/A";
            planDetails = `Individual Session on ${dateShort}`;
        }
        
        const timingVal = window.selectedTimeSlot || "N/A";
        const subjectText = `New Booking: ${nameVal} - ${planDetails}`;
        
        const formData = {
            access_key: accessKey,
            subject: subjectText,
            from_name: "Yogam World Website",
            "Full Name": nameVal,
            "Email Address": emailVal,
            "Phone / WhatsApp Number": phoneVal,
            "Plan Selected": planDetails,
            "Timing Slot": timingVal,
            "Payment Method Choice": paymentMethod.toUpperCase(),
            "Amount": `$${selectedPrice}`,
            "Date of Booking": new Date().toLocaleString("en-US", { timeZone: "America/New_York" }) + " EST"
        };
        
        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if (result.success) {
                console.log("Booking email successfully sent via Web3Forms.");
                emailSubmitted = true;
            } else {
                console.error("Web3Forms Submission failed:", result);
            }
        } catch (err) {
            console.error("Error submitting Web3Forms:", err);
        }
    }
    
    // Bind change listeners to input fields
    if (fullnameInput) fullnameInput.addEventListener("input", updateContactValidation);
    if (emailInput) emailInput.addEventListener("input", updateContactValidation);
    if (phoneInput) phoneInput.addEventListener("input", updateContactValidation);
    
    function renderTimingSelector() {
        if (!timingSelectWrapper) return;
        timingSelectWrapper.innerHTML = "";
        
        if (WORKSHOP_CONFIG.CLASS_TIMINGS.length > 1) {
            const selectEl = document.createElement("select");
            selectEl.id = "checkout-timing-select";
            
            WORKSHOP_CONFIG.CLASS_TIMINGS.forEach(time => {
                const opt = document.createElement("option");
                opt.value = time;
                opt.textContent = time;
                if (time === window.selectedTimeSlot) {
                    opt.selected = true;
                }
                selectEl.appendChild(opt);
            });
            
            selectEl.addEventListener("change", (e) => {
                window.selectedTimeSlot = e.target.value;
                updateCheckoutView();
            });
            
            timingSelectWrapper.appendChild(selectEl);
        } else if (WORKSHOP_CONFIG.CLASS_TIMINGS.length === 1) {
            const spanEl = document.createElement("span");
            spanEl.style.cssText = "font-weight: 600; color: var(--color-sage-dark); font-size: 0.95rem; display: inline-flex; align-items: center; gap: 8px;";
            spanEl.innerHTML = `<i class="fa-regular fa-clock"></i> ${WORKSHOP_CONFIG.CLASS_TIMINGS[0]}`;
            window.selectedTimeSlot = WORKSHOP_CONFIG.CLASS_TIMINGS[0];
            timingSelectWrapper.appendChild(spanEl);
        } else {
            timingSelectWrapper.innerHTML = `<span style="color: var(--color-text-muted); font-size: 0.9rem;">No timings configured</span>`;
        }
    }
    
    
    
    function updateCheckoutView() {
        const isClosed = WORKSHOP_CONFIG.REGISTRATION_FORCE_CLOSED || currentWorkshop.status === "closed";
        
        // Handle calendar view display based on selected plan
        if (selectedProduct === "program") {
            if (calendarContainer) calendarContainer.style.display = "none";
        } else {
            if (calendarContainer) calendarContainer.style.display = "block";
        }
        
        // Determine product names and prices
        let productName = "";
        let isDateRequiredAndMissing = false;
        
        if (selectedProduct === "program") {
            const startStr = currentWorkshop ? currentWorkshop.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";
            productName = `21-day Online Workshop (starts ${startStr})`;
            
            if (selectedDateText) {
                selectedDateText.textContent = `Full 21-Day Batch (starts ${currentWorkshop ? formatDateFriendly(currentWorkshop.startDate) : ''})`;
            }
            if (selectedDateBadge) {
                selectedDateBadge.style.backgroundColor = "var(--color-sage-light)";
                selectedDateBadge.style.color = "var(--color-sage-dark)";
                selectedDateBadge.style.borderColor = "rgba(91, 117, 98, 0.15)";
            }
        } else {
            // Drop-in single session
            productName = "Individual Yoga Session";
            
            if (window.selectedDate) {
                productName += ` (${window.selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
                if (selectedDateText) {
                    selectedDateText.textContent = formatDateFriendly(window.selectedDate);
                }
                if (selectedDateBadge) {
                    selectedDateBadge.style.backgroundColor = "var(--color-sage-light)";
                    selectedDateBadge.style.color = "var(--color-sage-dark)";
                    selectedDateBadge.style.borderColor = "rgba(91, 117, 98, 0.15)";
                }
            } else {
                isDateRequiredAndMissing = true;
                if (selectedDateText) {
                    selectedDateText.textContent = "Please select a date from the calendar above";
                }
                if (selectedDateBadge) {
                    selectedDateBadge.style.backgroundColor = "var(--color-earth-light)";
                    selectedDateBadge.style.color = "var(--color-earth-dark)";
                    selectedDateBadge.style.borderColor = "rgba(170, 113, 88, 0.2)";
                }
            }
        }
        
        // Update state of Step 1 Next Button
        if (nextBtn1) {
            if (isDateRequiredAndMissing) {
                nextBtn1.disabled = true;
                nextBtn1.style.opacity = "0.6";
                nextBtn1.innerHTML = `Select a Date Above <i class="fa-solid fa-calendar"></i>`;
            } else {
                nextBtn1.disabled = false;
                nextBtn1.style.opacity = "1";
                nextBtn1.innerHTML = `Next: Complete Contact Details <i class="fa-solid fa-arrow-right"></i>`;
            }
        }
        
        // Render timing dropdown/text
        renderTimingSelector();
        
        // Update summary text
        if (cardSummaryName) cardSummaryName.textContent = productName;
        if (cardSummaryPrice) cardSummaryPrice.textContent = `$${selectedPrice}`;
        if (zelleSummaryPrice) zelleSummaryPrice.textContent = `$${selectedPrice}`;
        
        // Update Step 2 Summary Badge
        const step2SummaryText = document.getElementById("wizard-selected-summary-text");
        if (step2SummaryText) {
            step2SummaryText.textContent = `Selected: ${productName} @ ${window.selectedTimeSlot}`;
        }
        
        // Update Zelle Memo
        if (zelleMemoText) {
            if (selectedProduct === "program") {
                const monthName = currentWorkshop ? currentWorkshop.startDate.toLocaleDateString("en-US", { month: "short" }) : "";
                zelleMemoText.textContent = `Workshop - ${monthName} Batch`;
            } else if (window.selectedDate) {
                const dateShort = window.selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                zelleMemoText.textContent = `Yoga Drop-in - ${dateShort}`;
            } else {
                zelleMemoText.textContent = "Select a date first";
            }
        }
        
        // Update Stripe Payment Link & state of CTA Button
        if (checkoutCardBtn) {
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
            
            // Clear date selection if moving back to program
            if (selectedProduct === "program") {
                window.selectedDate = null;
                if (window.renderCalendar) window.renderCalendar();
            }
            
            lockDownstreamSteps(1);
            updateCheckoutView();
        });
    });
    
    // Bind Step 3 Payment Clicks
    paymentBoxes.forEach(box => {
        box.addEventListener("click", () => {
            paymentBoxes.forEach(b => b.classList.remove("active"));
            box.classList.add("active");
            
            selectedMethod = box.getAttribute("data-method");
            
            lockDownstreamSteps(3);
            updateCheckoutView();
        });
    });
    
    // Global calendar select date integration
    window.selectSessionDate = function(date) {
        window.selectedDate = date;
        
        // Re-render calendar to highlight new selection
        if (window.renderCalendar) {
            window.renderCalendar();
        }
        
        // Trigger click on the single session select box if it's not active
        const sessionBox = document.querySelector('.select-program-grid .select-box[data-product="session"]');
        if (sessionBox && !sessionBox.classList.contains("active")) {
            programBoxes.forEach(b => b.classList.remove("active"));
            sessionBox.classList.add("active");
            selectedProduct = "session";
            selectedPrice = 15;
        }
        
        lockDownstreamSteps(1);
        updateCheckoutView();
    };
    
    window.selectBatch = function(startDate, endDate, deadline) {
        // 1. Select the 21-Day Live Program option
        const programBox = document.querySelector('.select-program-grid .select-box[data-product="program"]');
        const sessionBox = document.querySelector('.select-program-grid .select-box[data-product="session"]');
        if (programBox && sessionBox) {
            sessionBox.classList.remove("active");
            programBox.classList.add("active");
            selectedProduct = "program";
            selectedPrice = parseInt(programBox.getAttribute("data-price"), 10) || 75;
        }
        
        // 2. Set the currentWorkshop variable to the custom batch dates
        currentWorkshop = {
            startDate: startDate,
            endDate: endDate,
            deadline: deadline,
            status: "open"
        };
        
        // 3. Reset session date selection
        window.selectedDate = null;
        if (window.renderCalendar) window.renderCalendar();
        
        // 4. Update the view
        lockDownstreamSteps(1);
        updateCheckoutView();
        
        // 5. Scroll down to Step 1 of the Booking Wizard
        const step1 = document.getElementById("checkout-step-1");
        if (step1) {
            const targetOffset = getAbsoluteOffset(step1);
            window.scrollTo({
                top: targetOffset,
                behavior: "smooth"
            });
        }
    };
    
    // Bind Wizard Navigation Buttons
    if (nextBtn1) {
        nextBtn1.addEventListener("click", () => {
            if (step2) {
                step2.classList.remove("disabled-step");
                const targetOffset = getAbsoluteOffset(step2);
                window.scrollTo({ top: targetOffset, behavior: "smooth" });
            }
        });
    }
    
    if (nextBtn2) {
        nextBtn2.addEventListener("click", () => {
            if (step3) {
                step3.classList.remove("disabled-step");
                const targetOffset = getAbsoluteOffset(step3);
                window.scrollTo({ top: targetOffset, behavior: "smooth" });
            }
        });
    }
    
    if (checkoutCardBtn) {
        checkoutCardBtn.addEventListener("click", () => {
            sendWeb3FormsSubmission("card");
            if (step4) {
                step4.classList.remove("disabled-step");
            }
        });
    }
    
    if (nextBtn3) {
        nextBtn3.addEventListener("click", () => {
            sendWeb3FormsSubmission("card");
            if (step4) {
                step4.classList.remove("disabled-step");
                const targetOffset = getAbsoluteOffset(step4);
                window.scrollTo({ top: targetOffset, behavior: "smooth" });
            }
        });
    }
    
    if (nextBtn3Zelle) {
        nextBtn3Zelle.addEventListener("click", () => {
            sendWeb3FormsSubmission("zelle");
            if (step4) {
                step4.classList.remove("disabled-step");
                const targetOffset = getAbsoluteOffset(step4);
                window.scrollTo({ top: targetOffset, behavior: "smooth" });
            }
        });
    }
    
    
    
    // Check if redirecting back from a successful Stripe payment
    function checkStripePaymentSuccess() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("payment") === "success") {
            const modal = document.getElementById("stripe-success-modal");
            const closeBtn = document.getElementById("close-success-modal");
            const closeActionBtn = document.getElementById("btn-success-modal-close-action");
            
            if (modal) {
                // Show modal
                modal.style.display = "flex";
                // Trigger reflow for fade-in transition
                setTimeout(() => {
                    modal.style.opacity = "1";
                    const modalContent = modal.querySelector("div");
                    if (modalContent) modalContent.style.transform = "scale(1)";
                }, 50);
                
                // Helper to close modal
                const closeModal = () => {
                    modal.style.opacity = "0";
                    const modalContent = modal.querySelector("div");
                    if (modalContent) modalContent.style.transform = "scale(0.9)";
                    setTimeout(() => {
                        modal.style.display = "none";
                        // Clean up URL parameters so modal doesn't pop up again on refresh
                        const newUrl = window.location.pathname;
                        window.history.replaceState({}, document.title, newUrl);
                    }, 400);
                };
                
                if (closeBtn) closeBtn.addEventListener("click", closeModal);
                if (closeActionBtn) closeActionBtn.addEventListener("click", closeModal);
                
                // Close on click outside modal content
                modal.addEventListener("click", (e) => {
                    if (e.target === modal) closeModal();
                });
            }
        }
    }
    
    // Run initial configuration update
    updateCheckoutView();
    checkStripePaymentSuccess();
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
                
                // Add selected class if this day matches the selected date
                if (window.selectedDate && thisDayDate.toDateString() === window.selectedDate.toDateString()) {
                    dayEl.classList.add("selected");
                }
                
                dayEl.addEventListener("click", () => {
                    if (window.selectSessionDate) {
                        window.selectSessionDate(thisDayDate);
                    }
                });
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

    // Expose renderCalendar globally so it can be re-rendered when selectedDate changes
    window.renderCalendar = renderCalendar;

    // Render initially
    renderCalendar();
}

/**
 * Calculates and dynamically renders the next 4 monthly batch dates for the workshop
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
    
    while (batchesCount < 4) {
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
            border: 1px solid ${isMissed ? 'var(--color-border)' : 'var(--color-sage-light)'};
            background-color: ${isMissed ? 'var(--color-white)' : 'var(--color-sage-pale)'};
            border-radius: var(--border-radius-sm);
            padding: 15px 20px;
            opacity: ${isMissed ? '0.75' : '1'};
            transition: var(--transition-smooth);
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: center;
            ${isMissed ? '' : 'cursor: pointer;'}
        `;
        
        card.innerHTML = `
            <span class="batch-status-badge" style="
                position: absolute;
                top: 15px;
                right: 20px;
                font-size: 0.65rem;
                font-weight: 700;
                padding: 2px 8px;
                border-radius: 12px;
                background-color: ${isMissed ? '#e9ecef' : 'var(--color-sage)'};
                color: ${isMissed ? '#6c757d' : 'var(--color-pure-white)'};
                text-transform: uppercase;
                letter-spacing: 0.5px;
            ">${isMissed ? 'Closed' : 'Open'}</span>
            <h4 style="font-family: var(--font-primary); font-size: 1.15rem; color: var(--color-text-dark); margin: 0 0 4px 0; text-align: left;">${batchName}</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
                <span style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-dark);">${dateRangeStr}</span>
                ${isMissed ? '' : `<span style="font-size: 0.75rem; color: var(--color-text-muted);">• Register by ${formatDateLong(deadline)}</span>`}
            </div>
        `;
        
        if (!isMissed) {
            // Hover animations
            card.addEventListener("mouseenter", () => {
                card.style.borderColor = "var(--color-sage)";
                card.style.boxShadow = "var(--shadow-soft)";
                card.style.transform = "translateY(-1px)";
            });
            card.addEventListener("mouseleave", () => {
                card.style.borderColor = "var(--color-sage-light)";
                card.style.boxShadow = "none";
                card.style.transform = "none";
            });
            
            // Selection trigger on click
            card.addEventListener("click", () => {
                const batchEndDate = new Date(firstMonday.getFullYear(), firstMonday.getMonth(), firstMonday.getDate() + 20);
                if (window.selectBatch) {
                    window.selectBatch(firstMonday, batchEndDate, deadline);
                }
            });
        }
        
        batchesGrid.appendChild(card);
        
        batchesCount++;
        monthOffset++;
    }
}

// Global Zelle Copy Helper Function
window.copyZelleText = function(elementId, buttonEl) {
    const textEl = document.getElementById(elementId);
    if (!textEl) return;
    const text = textEl.textContent.trim();
    
    navigator.clipboard.writeText(text).then(() => {
        const icon = buttonEl.querySelector('i');
        if (icon) {
            icon.className = "fa-solid fa-check";
            icon.style.color = "var(--color-sage)";
            buttonEl.style.borderColor = "var(--color-sage)";
            buttonEl.style.backgroundColor = "var(--color-sage-pale)";
            
            setTimeout(() => {
                icon.className = "fa-solid fa-copy";
                icon.style.color = "";
                buttonEl.style.borderColor = "";
                buttonEl.style.backgroundColor = "";
            }, 2000);
        }
    }).catch(err => {
        console.error("Failed to copy text: ", err);
    });
};
