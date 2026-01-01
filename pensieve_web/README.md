# Pensieve Web - React Authentication App

A modern React application with user authentication featuring a login page and registration page with profile picture upload capability.

## Features

- **Login Page**: Username and password authentication
- **Registration Page**: 
  - Name input
  - Email input
  - Password input
  - Profile picture upload with preview
- **Routing**: Navigation between login and registration pages
- **Modern UI**: Beautiful gradient design with smooth animations

## Tech Stack

- React 18
- Vite
- React Router DOM
- CSS3

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/
│   ├── Login.jsx          # Login page component
│   ├── Login.css          # Login page styles
│   ├── Register.jsx       # Registration page component
│   └── Register.css       # Registration page styles
├── App.jsx                # Main app with routing
├── App.css                # App styles
├── index.css              # Global styles
└── main.jsx               # Entry point
```

## Usage

- Navigate to `/login` for the login page
- Navigate to `/register` for the registration page
- Forms include validation and console logging for demonstration
- Profile picture uploads show a preview before submission

## Future Enhancements

- Backend integration for actual authentication
- Form validation with error messages
- Password strength indicator
- Email verification
- User dashboard after login

## License

MIT

