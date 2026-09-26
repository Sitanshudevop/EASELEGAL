from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class GuardrailsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Perform request validation here if necessary
        
        # Process the request
        response = await call_next(request)
        
        # Append safety headers as part of the guardrails
        response.headers["X-Guardrails-Checked"] = "true"
        response.headers["X-Safety-Disclaimer"] = "Not professional legal advice."
        
        return response
