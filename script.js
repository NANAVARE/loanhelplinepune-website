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

// लोन रेट्स आणि ऑफर्स लोड करून वेबसाईटवर दाखवणारे फंक्शन
async function loadLoanRates() {
    try {
        // १. व्याजदर लोड करणे
        const ratesResponse = await fetch('content/rates.json');
        if (ratesResponse.ok) {
            const ratesData = await ratesResponse.json();
            const ratesContainer = document.getElementById('rates-container');
            if (ratesContainer) {
                ratesContainer.innerHTML = `<pre>${JSON.stringify(ratesData, null, 2)}</pre>`;
            }
            console.log("Loan rates loaded successfully:", ratesData);
        }

        // २. आजची ऑफर लोड करणे
        const offerResponse = await fetch('content/offer.json');
        if (offerResponse.ok) {
            const offerData = await offerResponse.json();
            const offerContainer = document.getElementById('offer-container');
            if (offerContainer) {
                offerContainer.innerHTML = `<p>${offerData.message || JSON.stringify(offerData)}</p>`;
            }
            console.log("Offer loaded successfully:", offerData);
        }

    } catch (error) {
        console.error("Error loading loan rates or offers:", error);
    }
}

// पेज लोड झाल्यावर डिफॉल्ट भाषा सेट करणे आणि डेटा फेच करणे
window.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('selectedLang') || 'mr';
    changeLanguage(savedLang);
    loadLoanRates();
});