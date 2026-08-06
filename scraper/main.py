import json
from datetime import datetime

def update_loan_rates():
    # सध्या आपण यामध्ये सिस्टीमचा पाया तयार करत आहोत. 
    # पुढील टप्प्यात आपण यामध्ये बँकांच्या साईट्सवरून स्क्रॅप केलेला रिअल-टाइम डेटा स्वयंचलितपणे भरू.
    
    updated_data = {
        "last_updated": datetime.now().strftime("%Y-%m-%d"),
        "loans": {
            "home_loan": [
                { "bank": "SBI", "interest_rate": "8.50%", "processing_fee": "0.35%" },
                { "bank": "HDFC", "interest_rate": "8.70%", "processing_fee": "0.50%" },
                { "bank": "ICICI", "interest_rate": "8.75%", "processing_fee": "0.50%" }
            ],
            "personal_loan": [
                { "bank": "SBI", "interest_rate": "11.00%", "processing_fee": "1.00%" },
                { "bank": "HDFC", "interest_rate": "10.50%", "processing_fee": "0.99%" }
            ]
        }
    }

    # rates.json फाईल अपडेट करणे
    file_path = "content/rates.json"
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(updated_data, f, indent=4, ensure_ascii=False)
    
    print("Loan rates successfully updated in rates.json!")

if __name__ == "__main__":
    update_loan_rates()