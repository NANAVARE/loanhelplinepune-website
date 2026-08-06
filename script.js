// बहुभाषिक ट्रान्सलेशन डेटा (English & Marathi)
const langData = {
    en: {
        "nav-home": "Home",
        "nav-services": "Services",
        "nav-enquiry": "Enquiry",
        "hero-title": "Give Financial Strength to Your Dreams",
        "hero-desc": "Best option for Home Loan, Personal Loan, and Machinery Loan.",
        "whatsapp-chat-text": "Chat on WhatsApp",
        "whatsapp-contact-text": "Contact on WhatsApp"
    },
    mr: {
        "nav-home": "मुख्यपृष्ठ",
        "nav-services": "सेवा",
        "nav-enquiry": "चौकशी",
        "hero-title": "तुमच्या स्वप्नांना द्या आर्थिक बळ",
        "hero-desc": "गृहकर्ज, वैयक्तिक कर्ज आणि मशीनरी कर्जासाठी सर्वोत्तम पर्याय.",
        "whatsapp-chat-text": "WhatsApp वर चॅट करा",
        "whatsapp-contact-text": "WhatsApp वर संपर्क करा"
    }
};

function changeLanguage(lang) {
    localStorage.setItem('selectedLang', lang);
    
    const texts = langData[lang];
    for (const id in texts) {
        const el = document.getElementById(id);
        if (el) {
            el.innerText = texts[id];
        }
    }
}

// लोन रेट्स लोड करणारे फंक्शन
async function loadLoanRates() {
    try {
        const response = await fetch('content/rates.json');
        if (!response.ok) throw new Error('Failed to load rates');
        const data = await response.json();
        console.log("Loan rates loaded successfully:", data);
    } catch (error) {
        console.error("Error loading loan rates:", error);
    }
}

// पेज लोड झाल्यावर डिफॉल्ट भाषा सेट करणे
window.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('selectedLang') || 'mr';
    changeLanguage(savedLang);
    loadLoanRates();
});