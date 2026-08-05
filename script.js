const translations = {
    en: {
        // Header
        'home-nav': 'Home',
        'services-nav': 'Services',
        'inquiry-nav': 'Inquiry',
        'english-button': 'English',
        'marathi-button': 'मराठी',
        
        // Hero Section
        'hero-heading': 'Empower Your Dreams with Financial Strength',
        'hero-subheading': 'Best options for Home Loan, Personal Loan, and Machinery Loan.',
        'hero-whatsapp-button': 'Chat on WhatsApp',

        // Offer Section
        'offer-title': '🔥 Today\'s Special Offer (Daily Offer)',
        'offer-loading': 'Loading offer information...', 
        'offer-no-offer': 'No new offer available at the moment.',

        // Services Section
        'services-title': 'Our Key Services',
        'home-loan-title': 'Home Loan',
        'home-loan-description': 'Get home loans at low interest rates for your dream home.',
        'personal-loan-title': 'Personal Loan',
        'personal-loan-description': 'Quick personal loans for any urgent needs.',
        'machinery-loan-title': 'Machinery Loan',
        'machinery-loan-description': 'Easy financing for machinery to grow your business.',
        'business-loan-title': 'Business Loan',
        'business-loan-description': 'Favorable business loans for the growth of your business.',
        'property-loan-title': 'Loan Against Property',
        'property-loan-description': 'Get loans at low interest rates against your property.',

        // Footer
        'footer-copy': '&copy; 2026 LoanHelpline Pune. All Rights Reserved.',
        'privacy-policy': 'Privacy Policy',
        'terms-conditions': 'Terms & Conditions',
        'about-us': 'About Us',
        'contact-us': 'Contact',

        //WhatsApp button
        'whatsapp-btn': 'WhatsApp Us'
    },
    mr: {
        // Header
        'home-nav': 'मुख्यपृष्ठ',
        'services-nav': 'सेवा',
        'inquiry-nav': 'चौकशी',
        'english-button': 'English',
        'marathi-button': 'मराठी',

        // Hero Section
        'hero-heading': 'तुमच्या स्वप्नांना द्या आर्थिक बळ',
        'hero-subheading': 'गृहकर्ज, वैयक्तिक कर्ज आणि मशिनरी कर्जासाठी सर्वोत्तम पर्याय.',
        'hero-whatsapp-button': 'WhatsApp वर चॅट करा',

        // Offer Section
        'offer-title': '🔥 आजची विशेष ऑफर (Daily Offer)',
        'offer-loading': 'माहिती लोड होत आहे...', 
        'offer-no-offer': 'सध्या कोणतीही नवीन ऑफर उपलब्ध नाही.',

        // Services Section
        'services-title': 'आमच्या प्रमुख सेवा',
        'home-loan-title': 'गृहकर्ज',
        'home-loan-description': 'तुमच्या स्वप्नातील घरासाठी कमी व्याजदरात गृहकर्ज मिळवा.',
        'personal-loan-title': 'वैयक्तिक कर्ज',
        'personal-loan-description': 'कोणत्याही तातडीच्या गरजांसाठी झटपट वैयक्तिक कर्ज.',
        'machinery-loan-title': 'मशिनरी कर्ज',
        'machinery-loan-description': 'व्यवसाय वाढवण्यासाठी मशिनरीवर सुलभ वित्तपुरवठा.',
        'business-loan-title': 'व्यवसाय कर्ज',
        'business-loan-description': 'तुमच्या व्यवसायाच्या वाढीसाठी अनुकूल व्यवसाय कर्ज.',
        'property-loan-title': 'मालमत्तेवर कर्ज',
        'property-loan-description': 'तुमच्या मालमत्तेवर कमी व्याजदरात कर्ज मिळवा.',

        // Footer
        'footer-copy': '&copy; 2026 LoanHelpline Pune. सर्व हक्क राखीव.',
        'privacy-policy': 'गोपनीयता धोरण',
        'terms-conditions': 'अटी व शर्ती',
        'about-us': 'आमच्याबद्दल',
        'contact-us': 'संपर्क',

        //WhatsApp button
        'whatsapp-btn': 'WhatsApp वर संपर्क करा'
    }
};

function setLanguage(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        if (translations[lang][key]) {
            element.innerHTML = translations[lang][key];
        }
    });
}

// Event listeners for language buttons
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.lang-button').forEach(button => {
        button.addEventListener('click', () => {
            setLanguage(button.getAttribute('data-lang'));
        });
    });

    // Set initial language based on the HTML lang attribute or default to Marathi
    const initialLang = document.documentElement.lang || 'mr';
    setLanguage(initialLang);

    // Existing offer fetch logic
    fetch("content/offer.json")
        .then(response => response.json())
        .then(data => {
            const offerTextElement = document.getElementById("offer-text");
            if (offerTextElement) {
                offerTextElement.innerHTML = `<strong>${data.title}</strong><br>${data.description}`;
            }
        })
        .catch(error => {
            console.error("Offer load error:", error);
            const offerTextElement = document.getElementById("offer-text");
            if (offerTextElement) {
                offerTextElement.innerHTML = translations[document.documentElement.lang]['offer-no-offer'];
            }
        });
});
