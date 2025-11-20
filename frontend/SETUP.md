# Frontend Setup Guide

This guide will help you set up the Indostar E-commerce frontend application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- **Git** (for version control)

## Installation Steps

### 1. Install Dependencies

Navigate to the frontend directory and install all required packages:

```bash
cd frontend
npm install
```

This will install:
- React 18.2.0
- TypeScript 4.9.5
- React Router DOM 6.20.0
- Axios 1.6.0
- React Google Login 5.2.2
- Testing libraries
- And other dependencies

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit the `.env` file and add your configuration:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
```

**Important:** 
- The `REACT_APP_API_URL` should point to your backend API
- You need to obtain a Google OAuth Client ID from the [Google Cloud Console](https://console.cloud.google.com/)

### 3. Google OAuth Setup

To get your Google Client ID:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain (when deploying)
6. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (for development)
   - Your production callback URL (when deploying)
7. Copy the Client ID and paste it in your `.env` file

### 4. Verify Setup

Check that all files are in place:

```bash
# Check if node_modules was created
ls node_modules

# Verify TypeScript configuration
cat tsconfig.json

# Check environment variables
cat .env
```

### 5. Start Development Server

Run the development server:

```bash
npm start
```

The application should open automatically in your browser at `http://localhost:3000`.

If it doesn't open automatically, navigate to [http://localhost:3000](http://localhost:3000) manually.

## Project Structure Overview

```
frontend/
├── public/              # Static assets
│   ├── index.html       # HTML template
│   ├── manifest.json    # PWA manifest
│   └── robots.txt       # SEO robots file
├── src/
│   ├── components/      # Reusable components
│   │   ├── common/      # Shared components (buttons, inputs, etc.)
│   │   ├── consumer/    # Consumer portal components
│   │   ├── distributor/ # Distributor portal components
│   │   ├── owner/       # Owner dashboard components
│   │   └── layout/      # Layout components (header, footer, nav)
│   ├── pages/           # Page components (routes)
│   │   ├── auth/        # Login, callback pages
│   │   ├── consumer/    # Consumer portal pages
│   │   ├── distributor/ # Distributor portal pages
│   │   ├── owner/       # Owner dashboard pages
│   │   └── common/      # Shared pages (404, unauthorized)
│   ├── services/        # API service layer
│   ├── contexts/        # React Context providers
│   ├── types/           # TypeScript type definitions
│   ├── styles/          # Global styles and animations
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main app component
│   └── index.tsx        # Entry point
├── .env                 # Environment variables (not in git)
├── .env.example         # Environment template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md            # Project documentation
```

## Available Scripts

### Development

```bash
npm start
```
Runs the app in development mode with hot reloading.

### Testing

```bash
npm test
```
Launches the test runner in interactive watch mode.

### Production Build

```bash
npm run build
```
Creates an optimized production build in the `build/` folder.

### Type Checking

```bash
npx tsc --noEmit
```
Runs TypeScript compiler to check for type errors without emitting files.

## TypeScript Configuration

The project uses **strict mode** TypeScript with the following enabled:

- `strict: true` - Enables all strict type checking options
- `noUnusedLocals: true` - Report errors on unused local variables
- `noUnusedParameters: true` - Report errors on unused parameters
- `noImplicitReturns: true` - Report error when not all code paths return a value
- `strictNullChecks: true` - Enable strict null checks
- `strictFunctionTypes: true` - Enable strict checking of function types
- `strictBindCallApply: true` - Enable strict bind/call/apply methods
- `strictPropertyInitialization: true` - Ensure class properties are initialized
- `noImplicitThis: true` - Raise error on 'this' expressions with implied 'any' type
- `alwaysStrict: true` - Parse in strict mode and emit "use strict"

## Troubleshooting

### Port 3000 Already in Use

If port 3000 is already in use, you can:

1. Kill the process using port 3000
2. Or set a different port:
   ```bash
   PORT=3001 npm start
   ```

### Module Not Found Errors

If you see module not found errors:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

If you see TypeScript compilation errors:

```bash
# Check TypeScript version
npx tsc --version

# Run type checking
npx tsc --noEmit
```

### Environment Variables Not Loading

Make sure:
1. Your `.env` file is in the `frontend/` directory
2. All environment variables start with `REACT_APP_`
3. You restart the development server after changing `.env`

## Next Steps

After setup is complete:

1. Verify the backend API is running at `http://localhost:8000`
2. Test the Google OAuth configuration
3. Start implementing components according to the task list
4. Follow the design guidelines in `design.md`

## Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Router Documentation](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/docs/intro)

## Support

For issues or questions, refer to:
- Project README.md
- Design document (.kiro/specs/indostar-ecommerce-app/design.md)
- Requirements document (.kiro/specs/indostar-ecommerce-app/requirements.md)
