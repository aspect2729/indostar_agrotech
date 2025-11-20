#!/bin/bash

# Google OAuth Setup Script for Indostar E-commerce
# This script helps you set up Google OAuth credentials

echo "=========================================="
echo "Google OAuth Setup for Indostar"
echo "=========================================="
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "❌ backend/.env not found!"
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    echo "❌ frontend/.env not found!"
    exit 1
fi

echo "✓ Found .env files"
echo ""

# Check current credentials
echo "Current Configuration:"
echo "----------------------"
BACKEND_CLIENT_ID=$(grep "GOOGLE_CLIENT_ID" backend/.env | cut -d '=' -f2)
FRONTEND_CLIENT_ID=$(grep "REACT_APP_GOOGLE_CLIENT_ID" frontend/.env | cut -d '=' -f2)

echo "Backend Client ID: $BACKEND_CLIENT_ID"
echo "Frontend Client ID: $FRONTEND_CLIENT_ID"
echo ""

# Check if using placeholder values
if [[ "$BACKEND_CLIENT_ID" == *"your-google-client-id"* ]] || [[ "$BACKEND_CLIENT_ID" == *"355932236944"* ]]; then
    echo "⚠️  WARNING: You're using placeholder/example credentials!"
    echo ""
    echo "To fix Google OAuth login, you need to:"
    echo "1. Create real Google OAuth credentials"
    echo "2. Update backend/.env with your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
    echo "3. Update frontend/.env with your REACT_APP_GOOGLE_CLIENT_ID"
    echo ""
    echo "📖 See FIX_GOOGLE_OAUTH.md for detailed instructions"
    echo ""
    
    read -p "Do you want to update credentials now? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "Please enter your Google OAuth credentials:"
        echo ""
        
        read -p "Google Client ID: " NEW_CLIENT_ID
        read -p "Google Client Secret: " NEW_CLIENT_SECRET
        
        if [ -z "$NEW_CLIENT_ID" ] || [ -z "$NEW_CLIENT_SECRET" ]; then
            echo "❌ Client ID and Secret cannot be empty"
            exit 1
        fi
        
        # Update backend/.env
        sed -i.bak "s|GOOGLE_CLIENT_ID=.*|GOOGLE_CLIENT_ID=$NEW_CLIENT_ID|" backend/.env
        sed -i.bak "s|GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET=$NEW_CLIENT_SECRET|" backend/.env
        
        # Update frontend/.env
        sed -i.bak "s|REACT_APP_GOOGLE_CLIENT_ID=.*|REACT_APP_GOOGLE_CLIENT_ID=$NEW_CLIENT_ID|" frontend/.env
        
        echo ""
        echo "✓ Credentials updated successfully!"
        echo ""
        echo "Next steps:"
        echo "1. Restart your backend server"
        echo "2. Restart your frontend server"
        echo "3. Try logging in at http://localhost:3000/login"
    fi
else
    echo "✓ Using custom credentials"
    echo ""
    echo "To test your OAuth setup:"
    echo "1. Make sure backend is running: cd backend && uvicorn main:app --reload"
    echo "2. Make sure frontend is running: cd frontend && npm start"
    echo "3. Run: cd backend && python test_oauth_config.py"
fi

echo ""
echo "=========================================="
echo "Setup Complete"
echo "=========================================="
