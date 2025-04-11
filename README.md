# Bill Split App

A modern, user-friendly application for splitting bills among friends. Perfect for managing shared expenses in restaurants, trips, or any group activities.

## Features

- 📝 Create and manage multiple bills
- 👥 Add people and assign items to them
- 💰 Support for different currencies (USD, EUR, GBP)
- 🧮 Handle special items like tax and tip (percentage or fixed amount)
- 📊 Generate detailed bill summaries
- 📱 Responsive design with dark/light mode support
- 📋 Easy sharing of bill summaries

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your computer. Download and install it from https://nodejs.org/ (choose the LTS version).

### Running the Application

1. Open your terminal (Command Prompt or PowerShell on Windows, Terminal on Mac)

2. Navigate to the project folder:
   ```bash
   cd path/to/bill-split-app
   ```

3. Install the required dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your web browser and go to:
   ```
   http://localhost:5173
   ```

The application will automatically reload if you make any changes to the code.

## Using the App

1. First-time setup: Enter your name and preferred currency
2. Create a new bill by clicking the + button
3. Add people to the bill
4. Add items and assign them to people
5. Add special items like tax or tip if needed
6. View the bill summary to see how much each person owes

## Settings

- Access settings by clicking the gear icon
- Change your name, currency, or theme (light/dark)
- Reset all data if you want to start fresh

## Development

This application is built with:
- React + Vite
- Tailwind CSS for styling
- React Router for navigation
- Local Storage for data persistence

## Technical Overview

### Platform & Build Tools
- **Framework**: React 18
- **Build Tool**: Vite
- **Development Server**: Vite Dev Server with HMR (Hot Module Replacement)

### UI/UX
- **Styling**: Tailwind CSS for utility-first styling
- **Components**: Custom React components with responsive design
- **Icons**: Heroicons for consistent iconography
- **Theming**: Dark/Light mode with system preference detection
- **Animations**: Framer Motion for smooth transitions

### State Management
- **Local State**: React useState hooks
- **Global State**: React Context API
  - UserContext for app-wide user preferences
  - BillsContext for bill management
  - CurrentBillContext for active bill state

### Routing & Navigation
- **Router**: React Router v6
- **Navigation**: Programmatic navigation with useNavigate
- **Route Protection**: Conditional rendering based on user setup

### Data Persistence
- **Storage**: Browser's Local Storage
- **Data Structure**: JSON-based storage for:
  - User preferences
  - Bills and their details
  - People and items within bills

### Features Implementation
- **Bill Management**: CRUD operations for bills, items, and people
- **Calculations**: Real-time updates for bill totals and splits
- **Currency**: Multi-currency support with formatting
- **Sharing**: Clipboard API for sharing bill summaries
