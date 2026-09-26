import time
import random
import json

def _delay():
    time.sleep(random.uniform(1.5, 2.5))

def get_demo_analysis(persona):
    _delay()
    is_tenant = (persona or "").lower() == "tenant"
    
    return json.dumps({
        "doc_type": "Residential Lease Agreement",
        "summary": "This document is a Residential Lease Agreement. It contains several non-standard clauses that significantly alter the typical balance of rights between landlord and tenant, heavily favoring the landlord in terms of access and repair costs, but surprisingly favoring the tenant regarding subletting.",
        "clauses": [
            {
                "text": "The Landlord may enter the Premises at any time without prior notice to the Tenant.",
                "type": "Right of Entry",
                "risk_level": "HIGH" if is_tenant else "INFO",
                "explanation": "Allows unannounced, unrestricted entry by the landlord at any time." if is_tenant else "Grants maximum flexibility for property inspections and maintenance.",
                "source_span": "enter the Premises at any time without prior notice",
                "deviation_note": "Standard agreements typically require 24-48 hours written notice except in emergencies.",
                "negotiation_tip": "Request 24 hours written notice for non-emergency entry." if is_tenant else "Maintain as is for maximum access."
            },
            {
                "text": "Tenant shall be responsible for all maintenance and repairs, including structural repairs to the roof and foundation.",
                "type": "Maintenance Obligation",
                "risk_level": "HIGH" if is_tenant else "LOW",
                "explanation": "Shifts all major structural repair costs directly to the tenant.",
                "source_span": "including structural repairs to the roof and foundation",
                "deviation_note": "Structural repairs are almost universally the landlord's responsibility in residential leases.",
                "negotiation_tip": "Exclude structural and major system repairs from tenant duties." if is_tenant else "Good protection against major property repair costs."
            },
            {
                "text": "A late fee of $100 per day will be charged for any rent received after the 3rd of the month.",
                "type": "Late Fee",
                "risk_level": "HIGH" if is_tenant else "LOW",
                "explanation": "Extremely punitive daily late fee structure that accumulates rapidly.",
                "source_span": "$100 per day will be charged",
                "deviation_note": "Typically, late fees are a flat percentage (e.g., 5%) or a much lower daily rate.",
                "negotiation_tip": "Cap the maximum late fee or negotiate a grace period to the 5th." if is_tenant else "Serves as a strong deterrent for late payments."
            },
            {
                "text": "Tenant may sublease the Premises without the Landlord's prior written consent.",
                "type": "Subletting",
                "risk_level": "LOW" if is_tenant else "HIGH",
                "explanation": "Allows tenant to sublet freely without oversight." if is_tenant else "Removes landlord's ability to vet new occupants and run background checks.",
                "source_span": "without the Landlord's prior written consent",
                "deviation_note": "Usually, landlords require prior written consent and background checks for sublessees.",
                "negotiation_tip": "Advantageous for tenant flexibility." if is_tenant else "Require written consent and screening for any subtenants."
            },
            {
                "text": "Either party may terminate this agreement with 15 days written notice.",
                "type": "Termination",
                "risk_level": "MEDIUM",
                "explanation": "Creates instability with a very short termination window for both parties.",
                "source_span": "terminate this agreement with 15 days written notice",
                "deviation_note": "30 to 60 days is standard for lease termination.",
                "negotiation_tip": "Increase notice period to 30 or 60 days for better security."
            }
        ],
        "jargon_glossary": [
            {
                "term": "Sublease",
                "definition": "A lease of a property by a tenant to a subtenant."
            },
            {
                "term": "Structural repairs",
                "definition": "Repairs to the foundational or weight-bearing elements of a building (e.g., roof, foundation, load-bearing walls)."
            }
        ]
    })

def get_demo_chat(question):
    _delay()
    q = question.lower()
    
    if "late" in q or "rent" in q:
        return json.dumps({
            "answer": "If you pay rent after the 3rd of the month, a severe late fee of $100 per day will be charged.",
            "confidence_score": "HIGH",
            "citations": ["A late fee of $100 per day will be charged for any rent received after the 3rd of the month."]
        })
    elif "enter" in q or "notice" in q:
        return json.dumps({
            "answer": "The landlord can enter the premises at any time without giving you any prior notice.",
            "confidence_score": "HIGH",
            "citations": ["The Landlord may enter the Premises at any time without prior notice to the Tenant."]
        })
    elif "sublet" in q or "sublease" in q:
        return json.dumps({
            "answer": "Yes, you may sublease the property without needing the landlord's prior written consent, which is highly unusual.",
            "confidence_score": "HIGH",
            "citations": ["Tenant may sublease the Premises without the Landlord's prior written consent."]
        })
    elif "repairs" in q or "roof" in q:
        return json.dumps({
            "answer": "You (the tenant) are responsible for all maintenance and repairs, which explicitly includes major structural repairs like the roof and foundation.",
            "confidence_score": "HIGH",
            "citations": ["Tenant shall be responsible for all maintenance and repairs, including structural repairs to the roof and foundation."]
        })
    else:
        return json.dumps({
            "answer": "Based on the lease agreement provided, there are strict rules governing termination, rent, and maintenance. However, the document does not explicitly detail this specific scenario.",
            "confidence_score": "LOW",
            "citations": []
        })

def get_demo_timeline():
    _delay()
    return json.dumps({
        "events": [
            {
                "date_description": "3rd of every month",
                "event_name": "Rent Deadline",
                "obligation": "Rent must be received to avoid a $100/day late fee."
            },
            {
                "date_description": "15 days before termination",
                "event_name": "Termination Notice",
                "obligation": "Provide written notice if choosing to terminate the lease early."
            }
        ]
    })

def get_demo_diff():
    _delay()
    return json.dumps({
        "changes": [
            {
                "type": "MODIFICATION",
                "old_text": "terminate this agreement with 15 days written notice",
                "new_text": "terminate this agreement with 30 days written notice",
                "explanation": "The required notice period for termination was increased from 15 days to a more standard 30 days, giving both parties more time to prepare."
            },
            {
                "type": "DELETION",
                "old_text": "including structural repairs to the roof and foundation",
                "new_text": "",
                "explanation": "The tenant is no longer explicitly responsible for structural repairs to the roof and foundation."
            },
            {
                "type": "INSERTION",
                "old_text": "",
                "new_text": "except in the case of emergency where no notice is required.",
                "explanation": "Clarifies that the landlord's right of entry without notice is restricted to emergencies only."
            }
        ]
    })

def get_demo_scenario(scenario):
    _delay()
    return "Illustrative scenario, not legal advice.\n\nIf you sublet the apartment, you can do so freely without landlord approval based on this contract. However, because you are also strictly liable for structural repairs and unannounced entry, any damage caused by your subtenant could result in massive personal liability for you, and the landlord could discover it at any time due to the lack of entry notice requirements."
