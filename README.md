# NorthStar Finance - Retirement Corpus Calculator

A comprehensive retirement planning calculator for Indian couples, supporting Traditional, FIRE, Barista FIRE, Coast FIRE, and Fat FIRE modes.

## Features

- **5 Planning Modes**: Traditional Retirement, FIRE, Barista FIRE, Coast FIRE, Fat FIRE
- **Custom Goals**: Track child education, marriage, vacations, and custom expenses
- **Asset Tracking**: EPF, PPF, NPS, Mutual Funds, Stocks, FDs, Gold, Real Estate
- **Income Streams**: Part-time income, pension, rental income
- **Gap Analysis**: See how much you need to save monthly
- **Sensitivity Analysis**: Test different return and inflation scenarios
- **INR Formatting**: Lakh/Crore notation with proper Indian number formatting

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **Charts**: Recharts
- **Backend**: Supabase (PostgreSQL + Auth)
- **Hosting**: Netlify

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd retirement-calculator
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Project Settings > API
   - Copy the Project URL and anon key

4. Configure environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

5. Set up the database:
   - Go to Supabase SQL Editor
   - Run the SQL in `supabase/migrations/001_initial_schema.sql`

6. Enable Email auth:
   - Go to Authentication > Providers
   - Enable Email provider

7. Start the development server:
```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Deploying to Netlify

### Option 1: Netlify CLI

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login and deploy:
```bash
netlify login
netlify init
netlify deploy --prod
```

### Option 2: Git Integration

1. Push your code to GitHub/GitLab
2. Connect the repository in Netlify
3. Add environment variables in Site Settings > Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

## Project Structure

```
retirement-calculator/
├── src/
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   ├── layout/       # Header, Sidebar, Footer
│   │   ├── forms/        # Profile, Assets, Expenses forms
│   │   ├── results/      # Charts, Summary cards
│   │   └── wizard/       # Multi-step wizard
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Auth.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Calculator.jsx
│   │   └── Results.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useCalculations.js
│   │   └── usePlans.js
│   ├── lib/
│   │   ├── supabase.js
│   │   ├── calculations.js
│   │   └── formatters.js
│   ├── store/
│   │   └── planStore.js
│   └── App.jsx
├── supabase/
│   └── migrations/
└── public/
```

## Calculations

The calculator implements all formulas from the PRD:

- **FV/PV Calculations**: Standard future/present value formulas
- **Traditional Corpus**: Annuity-based calculation with real returns
- **FIRE Corpus**: FI Number = Annual Expenses / SWR
- **Coast FIRE**: Coast Number = Target Corpus / (1 + return)^years
- **Barista FIRE**: Two-phase cashflow model
- **Gap Analysis**: Required SIP to close shortfall

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use for personal or commercial projects.
