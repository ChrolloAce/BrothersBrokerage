# Brothers Brokerage Dashboard

A modern, responsive dashboard for managing disability services brokerage operations. This application streamlines the entire broker workflow from lead intake through billing automation.

## Features

- **Dashboard Overview**: Real-time metrics and analytics
- **Lead Management**: Automated lead intake and conversion tracking
- **Client Management**: Comprehensive client profiles and service tracking
- **Budget Management**: Start-up budgets, initial budgets, and CNBA processing
- **Document Management**: Automated document collection and organization
- **Invoice Management**: Automated billing and invoice generation
- **Modern UI**: Clean, responsive design with dark sidebar navigation

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React icons
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **Date Handling**: date-fns

## Project Structure

```
src/
├── components/
│   ├── dashboard/         # Dashboard-specific components
│   │   ├── MetricsGrid.tsx
│   │   ├── MetricCard.tsx
│   │   ├── ChartSection.tsx
│   │   └── RecentInvoices.tsx
│   └── layout/           # Layout components
│       ├── Sidebar.tsx
│       └── Header.tsx
├── layouts/
│   └── DashboardLayout.tsx
├── managers/             # Business logic managers
│   └── DashboardDataManager.ts
├── pages/                # Page components
│   ├── Dashboard.tsx
│   ├── Clients.tsx
│   ├── Leads.tsx
│   ├── Budgets.tsx
│   ├── Documents.tsx
│   ├── Invoices.tsx
│   └── Settings.tsx
├── types/                # TypeScript definitions
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Architecture Principles

Following strict coding standards for maintainability and scalability:

1. **File Length**: Max 500 lines per file
2. **OOP Design**: Class-based managers for business logic
3. **Single Responsibility**: Each component has one clear purpose
4. **Modular Structure**: Components are reusable and testable
5. **TypeScript**: Full type safety throughout the application

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Planned Integrations

- **n8n**: Workflow automation engine
- **Google Workspace**: Sheets, Calendar, Drive integration
- **Monday.com**: Project management and task tracking
- **Gmail**: Email automation
- **Custom APIs**: For external services integration

## Contributing

1. Follow the established file structure
2. Maintain TypeScript strict mode
3. Keep components under 500 lines
4. Use the manager pattern for business logic
5. Test all new features

## License

Private project for Brothers Brokerage. 