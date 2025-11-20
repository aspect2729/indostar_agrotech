# Indostar Agrotech - Frontend

React TypeScript frontend for the Indostar E-commerce Application.

## Project Structure

```
frontend/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable React components
│   │   ├── common/      # Shared components
│   │   ├── consumer/    # Consumer portal components
│   │   ├── distributor/ # Distributor portal components
│   │   ├── owner/       # Owner dashboard components
│   │   └── layout/      # Layout components
│   ├── pages/           # Page-level components
│   │   ├── auth/        # Authentication pages
│   │   ├── consumer/    # Consumer portal pages
│   │   ├── distributor/ # Distributor portal pages
│   │   ├── owner/       # Owner dashboard pages
│   │   └── common/      # Shared pages
│   ├── services/        # API service layer
│   ├── contexts/        # React Context providers
│   ├── types/           # TypeScript type definitions
│   ├── styles/          # Global styles and animations
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main App component
│   └── index.tsx        # Application entry point
├── .env                 # Environment variables (not committed)
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Prerequisites

- Node.js 16+ and npm
- Backend API running on http://localhost:8000
- Google OAuth Client ID

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Available Scripts

### `npm start`

Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time.

## Technology Stack

- **React 18**: UI library
- **TypeScript**: Type-safe JavaScript
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **React Google Login**: Google OAuth integration
- **CSS3**: Styling with CSS variables and animations

## Features

### Three User Portals

1. **Consumer Portal**: Browse and purchase organic products
2. **Distributor Portal**: Place bulk orders with wholesale pricing
3. **Owner Dashboard**: Manage inventory and orders

### Key Features

- Google OAuth authentication
- Role-based access control
- Product catalog with categories
- Shopping cart functionality
- Order management
- Inventory tracking
- Responsive design
- Smooth CSS animations

## Development Guidelines

### TypeScript

- Use strict mode (enabled in tsconfig.json)
- Define types for all props, state, and API responses
- Avoid using `any` type
- Use interfaces for object shapes

### Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop types and default values

### Styling

- Use CSS variables for colors and spacing
- Follow the animation guidelines in design.md
- Respect `prefers-reduced-motion` for accessibility
- Use BEM naming convention for CSS classes

### State Management

- Use Context API for global state (auth, cart)
- Use local state for component-specific data
- Keep state as close to where it's used as possible

### API Integration

- All API calls go through service layer
- Handle loading and error states
- Use proper TypeScript types for requests/responses
- Implement retry logic for failed requests

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| REACT_APP_API_URL | Backend API URL | Yes |
| REACT_APP_GOOGLE_CLIENT_ID | Google OAuth Client ID | Yes |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code structure
2. Write TypeScript with proper types
3. Test your changes thoroughly
4. Follow the design guidelines
5. Ensure animations respect accessibility preferences

## License

Private - Indostar Agrotech Private Limited
