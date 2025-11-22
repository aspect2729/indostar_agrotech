#!/usr/bin/env python3
"""
Script to help check Render logs for the backend error
"""

print("""
🔍 CHECK RENDER LOGS FOR BACKEND ERROR

The backend is returning 500 Internal Server Error on OTP verify endpoint.

STEPS TO CHECK LOGS:

1. Go to: https://dashboard.render.com/
2. Click on: indostar-agrotech-1
3. Click: "Logs" in the left sidebar
4. Look for recent errors around the time you tried to login

WHAT TO LOOK FOR:

Common issues:
- Database connection errors
- Missing environment variables
- Python import errors
- OTP service errors

WHILE YOU'RE THERE - FIX CORS:

Since you're already on Render:
1. Click "Environment" tab
2. Update CORS_ORIGINS to include:
   https://indostar-709gufjpc-adviks-projects-996cbcc2.vercel.app
3. Save changes

This will fix both issues at once!
""")
