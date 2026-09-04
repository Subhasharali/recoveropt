import os
import razorpay
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

def create_test_payment_link(amount: float, reference_id: str, description: str, customer_name: str) -> dict:
    key_id = os.getenv("RAZORPAY_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET")
    
    if not key_id or not key_secret:
        raise Exception("Razorpay credentials not configured.")
        
    client = razorpay.Client(auth=(key_id, key_secret))

        
    amount_in_paise = int(amount * 100)
    
    try:
        payment_link = client.payment_link.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "accept_partial": False,
            "description": description,
            "customer": {
                "name": customer_name,
                "email": "",
                "contact": ""
            },
            "notify": {
                "sms": False,
                "email": False
            },
            "reminder_enable": False,
            "reference_id": reference_id
        })
        return payment_link
    except Exception as e:
        print(f"Razorpay API error: {e}")
        raise e
