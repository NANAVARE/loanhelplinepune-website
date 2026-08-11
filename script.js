// ============================================================
// LoanHelpline Pune — script.js (FIXED)
// Bug fixes vs previous version:
//   1. Language switcher now targets [data-key] attributes (the actual
//      markup in index.html/about.html/etc), not getElementById() with
//      IDs that don't exist on the page.
//   2. Loan rates now render into the REAL element (#loan-rates-content),
//      not a non-existent #rates-container.
//   3. Rates are shown as a clean card grid, not a raw JSON dump.
//   4. Offer text renders into the REAL element (#offer-text).
// ============================================================

const langData = {
    en: {
        "home-nav": "Home",
        "services-nav": "Services",
        "inquiry-nav": "Enquiry",
        "english-button": "English",
        "marathi-button": "मराठी",
        "hero-heading": "Give Financial Strength to Your Dreams",
        "hero-subheading": "Best option for Home Loan, Personal Loan, and Machinery Loan.",
        "hero-whatsapp-button": "Chat on WhatsApp",
        "whatsapp-btn": "Contact on WhatsApp",
        "offer-title": "🔥 Today's Special Offer",
        "loan-rates-title": "Indicative Loan Rate Ranges",
        "loan-rates-loading": "Loading loan rates...",
        "services-title": "Our Key Services",
        "home-loan-title": "Home Loan",
        "home-loan-description": "Get a home loan at a competitive rate for your dream home.",
        "personal-loan-title": "Personal Loan",
        "personal-loan-description": "Quick personal loans for any urgent need.",
        "machinery-loan-title": "Machinery Loan",
        "machinery-loan-description": "Easy financing on machinery to grow your business.",
        "business-loan-title": "Business Loan",
        "business-loan-description": "Flexible business loans to help your business grow.",
        "property-loan-title": "Loan Against Property",
        "property-loan-description": "Get a loan against your property at a competitive rate.",
        "footer-copy": "© 2026 LoanHelpline Pune. All rights reserved.",
        "privacy-policy": "Privacy Policy",
        "terms-conditions": "Terms & Conditions",
        "about-us": "About Us",
        "contact-us": "Contact",
    },
    mr: {
        "home-nav": "मुख्यपृष्ठ",
        "services-nav": "सेवा",
        "inquiry-nav": "चौकशी",
        "english-button": "English",
        "marathi-button": "मराठी",
        "hero-heading": "तुमच्या स्वप्नांना द्या आर्थिक बळ",
        "hero-subheading": "गृहकर्ज, वैयक्तिक कर्ज आणि मशिनरी कर्जासाठी सर्वोत्तम पर्याय.",
        "hero-whatsapp-button": "WhatsApp वर चॅट करा",
        "whatsapp-btn": "WhatsApp वर संपर्क करा",
        "offer-title": "🔥 आजची विशेष ऑफर (Daily Offer)",
        "loan-rates-title": "आजचे कर्ज दर (अंदाजे)",
        "loan-rates-loading": "कर्जाचे दर लोड होत आहेत...",
        "services-title": "आमच्या प्रमुख सेवा",
        "home-loan-title": "गृहकर्ज",
        "home-loan-description": "तुमच्या स्वप्नातील घरासाठी कमी व्याजदरात गृहकर्ज मिळवा.",
        "personal-loan-title": "वैयक्तिक कर्ज",
        "personal-loan-description": "कोणत्याही तातडीच्या गरजांसाठी झटपट वैयक्तिक कर्ज.",
        "machinery-loan-title": "मशिनरी कर्ज",
        "machinery-loan-description": "व्यवसाय वाढवण्यासाठी मशिनरीवर सुलभ वित्तपुरवठा.",
        "business-loan-title": "व्यवसाय कर्ज",
        "business-loan-description": "तुमच्या व्यवसायाच्या वाढीसाठी अनुकूल व्यवसाय कर्ज.",
        "property-loan-title": "मालमत्तेवर कर्ज",
        "property-loan-description": "तुमच्या मालमत्तेवर कमी व्याजदरात कर्ज मिळवा.",
        "footer-copy": "© 2026 LoanHelpline Pune. सर्व हक्क राखीव.",
        "privacy-policy": "गोपनीयता धोरण",
        "terms-conditions": "अटी व शर्ती",
        "about-us": "आमच्याबद्दल",
        "contact-us": "संपर्क",
    }
};

// Loan-type display labels (used to render content/rates.json nicely)
const LOAN_TYPE_LABELS = {
    en: {
        home_loan: "Home Loan",
        personal_loan: "Personal Loan",
        business_loan: "Business Loan",
        loan_against_property: "Loan Against Property",
    },
    mr: {
        home_loan: "गृहकर्ज",
        personal_loan: "वैयक्तिक कर्ज",
        business_loan: "व्यवसाय कर्ज",
        loan_against_property: "मालमत्तेवर कर्ज",
    }
};

function currentLang() {
    return localStorage.getItem('selectedLang') || 'mr';
}

function changeLanguage(lang) {
    localStorage.setItem('selectedLang', lang);
    const texts = langData[lang] || langData.mr;

    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if (texts[key] !== undefined) {
            // Preserve any icon element inside buttons/links (e.g. <i class="fab fa-whatsapp">)
            const icon = el.querySelector('i');
            el.textContent = texts[key];
            if (icon) el.prepend(icon, ' ');
        }
    });

    // Re-render dynamic content (rates/offer) in the new language
    renderCachedRates(lang);
}

let _cachedRatesData = null;

function renderRates(ratesData, lang) {
    const container = document.getElementById('loan-rates-content');
    if (!container || !ratesData) return;

    const labels = LOAN_TYPE_LABELS[lang] || LOAN_TYPE_LABELS.mr;
    const loans = ratesData.loans || {};

    const cards = Object.entries(loans).map(([key, info]) => {
        const label = labels[key] || key;
        const range = info.range || '—';
        const fee = info.processing_fee_range || '—';
        return `
            <div class="rate-card">
                <h3>${label}</h3>
                <p class="rate-figure">${range}</p>
                <p class="rate-sub">${lang === 'mr' ? 'प्रोसेसिंग फी' : 'Processing fee'}: ${fee}</p>
            </div>
        `;
    }).join('');

    const verified = ratesData.last_verified
        ? `<p class="rates-verified">${lang === 'mr' ? 'शेवटचं पडताळलेलं' : 'Last verified'}: ${ratesData.last_verified}</p>`
        : '';

    const note = ratesData.note
        ? `<p class="rates-note">${ratesData.note}</p>`
        : '';

    container.innerHTML = `<div class="loan-rates-grid-inner">${cards}</div>${verified}${note}`;
}

function renderCachedRates(lang) {
    if (_cachedRatesData) renderRates(_cachedRatesData, lang);
}

async function loadLoanRates() {
    const lang = currentLang();

    try {
        const ratesResponse = await fetch('content/rates.json', { cache: 'no-store' });
        if (ratesResponse.ok) {
            _cachedRatesData = await ratesResponse.json();
            renderRates(_cachedRatesData, lang);
        }
    } catch (error) {
        console.error("Error loading loan rates:", error);
        const container = document.getElementById('loan-rates-content');
        if (container) {
            container.innerHTML = `<p>${lang === 'mr' ? 'दर सध्या उपलब्ध नाहीत.' : 'Rates unavailable right now.'}</p>`;
        }
    }

    try {
        const offerResponse = await fetch('content/offer.json', { cache: 'no-store' });
        if (offerResponse.ok) {
            const offerData = await offerResponse.json();
            const offerTextEl = document.getElementById('offer-text');
            if (offerTextEl) {
                const title = offerData.title ? `<strong>${offerData.title}</strong>` : '';
                const desc = offerData.description || '';
                offerTextEl.innerHTML = `${title}${desc}`;
            }
        }
    } catch (error) {
        console.error("Error loading offer:", error);
    }
}

// Wire up language buttons declared with data-lang="en" / data-lang="mr"
function wireLanguageButtons() {
    document.querySelectorAll('.lang-button, [onclick^="changeLanguage"]').forEach(btn => {
        const lang = btn.getAttribute('data-lang');
        if (lang) {
            btn.addEventListener('click', () => changeLanguage(lang));
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    wireLanguageButtons();
    changeLanguage(currentLang());
    loadLoanRates();
});
