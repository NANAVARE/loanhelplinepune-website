// बहुभाषिक ट्रान्सलेशन डेटा (English & Marathi)
const langData = {
    en: {
        navHome: "Home",
        navServices: "Services",
        navEnquiry: "Enquiry",
        heroTitle: "Give Financial Strength to Your Dreams",
        heroDesc: "Best option for Home Loan, Personal Loan, and Machinery Loan.",
        whatsappChat: "Chat on WhatsApp",
        whatsappContact: "Contact on WhatsApp"
    },
    mr: {
        navHome: "मुख्यपृष्ठ",
        navServices: "सेवा",
        navEnquiry: "चौकशी",
        heroTitle: "तुमच्या स्वप्नांना द्या आर्थिक बळ",
        heroDesc: "गृहकर्ज, वैयक्तिक कर्ज आणि मशीनरी कर्जासाठी सर्वोत्तम पर्याय.",
        whatsappChat: "WhatsApp वर चॅट करा",
        whatsappContact: "WhatsApp वर संपर्क करा"
    }
};

// भाषा बदलण्याचे मुख्य फंक्शन
function changeLanguage(lang) {
    localStorage.setItem('selectedLang', lang);
    
    const elements = {
        'nav-home': langData[lang].navHome,
        'nav-services': langData[lang].navServices,
        'nav-enquiry': langData[lang].navEnquiry,
        'hero-title': langData[lang].heroTitle,
        'hero-desc': langData[lang].heroDesc,
        'whatsapp-chat-text': langData[lang].whatsappChat,
        'whatsapp-contact-text': langData[lang].whatsappContact
    };

    for (let id in elements) {
        const el = document.getElementById(id);
        if (el) {
            el.innerText = elements[id];
        }
    }
}

// content/rates.json मधून दर फेच करून वेबसाईटवर अपडेट करणारे फंक्शन
async function loadLoanRates() {
    try {
        const response = await fetch('content/rates.json');
        if (!response.ok) {
            throw new Error('Failed to load rates data');
        }
        const data = await response.json();
        console.log("Loan rates loaded successfully:", data);
        
        // जर तुमच्या HTML मध्ये दर दाखवण्यासाठी containers असतील तर येथे अपडेट करू शकता
    } catch (error) {
        console.error("Error loading loan rates:", error);
    }
}

// पेज लोड झाल्यावर डिफॉल्ट भाषा आणि लोन रेट्स लोड करणे
window.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('selectedLang') || 'mr';
    changeLanguage(savedLang);
    loadLoanRates();
});