Below is an example of an ultra‐detailed README for your Singapore Tax Calculator project. You can use this as a starting point and modify it as needed:

---

# SG Calculator

**Singapore Tax Calculator** is a web application that computes Singaporean income tax, CPF contributions, tax reliefs, deductions, and take-home pay based on user inputs. Built with React and Vite, the application offers a modern, responsive interface using Material UI and Tailwind CSS, while leveraging TypeScript for type safety and ESLint for code quality.

---

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [File Overview](#file-overview)
  - [Main Application Files](#main-application-files)
  - [Calculation Modules](#calculation-modules)
  - [Utility Files](#utility-files)
  - [View Components](#view-components)
- [Installation & Setup](#installation--setup)
- [Development & Build Instructions](#development--build-instructions)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Comprehensive Tax Calculations:** Computes income tax based on salary, bonus, additional income sources (pension, trade, rental, royalties), and equity grants (RSU and ESOP).
- **CPF Contributions:** Calculates both employee and employer CPF contributions according to multiple tables (e.g., Table 1–5) based on age and monthly salary.
- **Tax Reliefs & Deductions:** Incorporates various reliefs such as earned income relief, NSman relief, spouse and parent relief, and deductions including charitable contributions and employment expenses.
- **Real-time Feedback:** Uses React hooks and useEffect to recalculate results automatically as users modify their inputs.
- **Interactive UI:** Offers popovers with contextual information, collapsible sections for detailed inputs, and interactive charts (e.g., take-home pie charts, income sources breakdown).
- **Responsive Design:** The layout adapts for mobile and desktop using Material UI components and responsive breakpoints.

---

## Technologies Used

- **Framework & Bundler:** [Vite](https://vitejs.dev/)
- **Library:** [React](https://reactjs.org/)
- **Language:** TypeScript
- **UI Framework:** [Material UI](https://mui.com/) & [Tailwind CSS](https://tailwindcss.com/)
- **Charting:** [Chart.js](https://www.chartjs.org/) with [react-chartjs-2](https://github.com/reactchartjs/react-chartjs-2)
- **Linting & Formatting:** ESLint, Prettier
- **Deployment:** [gh-pages](https://www.npmjs.com/package/gh-pages)

---

## Project Structure

The project follows a modular structure with separate folders for components, types, and utility functions. A simplified view of the directory structure is as follows:

```
sg-calculator/
├── public/                  # Static assets and index.html
├── src/
│   ├── components/          # React components (e.g., main calculator, charts, input forms)
│   │   ├── SingaporeTaxCalculator.tsx         # Main calculation component
│   │   ├── SingaporeTaxCalculatorView.tsx     # UI view component for user inputs and results
│   │   ├── TakeHomePieChart.tsx                 # Pie chart component (inferred from code)
│   │   └── IncomeSourcesPieChart.tsx            # Chart for income sources breakdown
│   ├── types/               # Type definitions for tax data and component props
│   │   └── tax.ts           # Contains interfaces such as TaxDeductions, TaxReliefResult, etc.
│   ├── utils/               # Utility functions and constants
│   │   ├── constants.ts     # Common constants and configuration (e.g., POPOVER_MAX_WIDTH)
│   │   ├── TaxReliefCalculator.ts       # Module to compute various tax reliefs
│   │   ├── TaxDeductionCalculator.ts    # Module to compute tax deductions
│   │   ├── TaxLogic.ts      # Core tax calculation logic based on chargeable income
│   │   ├── AwRates.ts       # Computes AW (Additional Wage) rates for bonus calculations
│   │   ├── cpfAllocation.ts # Computes CPF allocation split into Ordinary, Special, and Medisave accounts
│   │   └── CpfUtils.ts      # Helper functions for CPF calculations
│   └── tables/              # Modules to compute monthly CPF contributions for different tables
│       ├── Table1.ts
│       ├── Table2.ts
│       ├── Table3.ts
│       ├── Table4.ts
│       └── Table5.ts
├── package.json             # Project configuration, dependencies, and scripts
├── tsconfig.json            # TypeScript configuration
├── .eslintrc.js             # ESLint configuration
└── README.md                # This file
```

*Note:* Some files (e.g., `TaxDeductionCalculator.ts`, `TaxReliefCalculator.ts`, `AwRates.ts`, `cpfAllocation.ts`, `CpfUtils.ts`, `TaxLogic.ts`) were not attached due to size limits. Their functionality has been inferred from the code in the main components.

---

## File Overview

### Main Application Files

- **`SingaporeTaxCalculator.tsx`**  
  This is the core component that gathers user inputs (such as monthly salary, annual bonus, equity vesting cycles, additional income sources) and computes:
  - Base income and additional incomes
  - CPF contributions (both employee and employer) using different CPF tables (Table 1–5)
  - Bonus CPF contributions based on AW rates (via the `AwRates.ts` module)
  - Equity gains from RSU and ESOP vesting cycles  
  It uses several utility functions and modules to compute tax reliefs, deductions, and final take-home pay.

- **`SingaporeTaxCalculatorView.tsx`**  
  This file is responsible for rendering the user interface. It includes:
  - Input forms for salary, bonus, age, residency status, and various income sources
  - Popover components that provide contextual help for each input field
  - Sections for equity grants (RSU and ESOP) where users can dynamically add or remove vesting cycles
  - Collapsible panels for tax reliefs and deductions  
  It also integrates chart components (such as TakeHomePieChart and IncomeSourcesPieChart) to visually display the results.

### Calculation Modules

- **`TaxLogic.ts`**  
  Contains the core logic for calculating taxable income and the final tax payable after applying all reliefs and deductions. It likely implements Singapore’s progressive tax rates.

- **`TaxReliefCalculator.ts`**  
  Computes various tax reliefs (earned income relief, CPF relief, NSman relief, spouse relief, etc.) based on user inputs such as age, CPF contributions, and other parameters.

- **`TaxDeductionCalculator.ts`**  
  Calculates allowable tax deductions, including deductions for charitable contributions, rental expenses, and employment expenses.

### Utility Files

- **`AwRates.ts`**  
  Computes the Additional Wage (AW) rates used for calculating bonus CPF contributions. The function `getAwRates` determines the percentage rates based on the user's age and monthly salary.

- **`cpfAllocation.ts`**  
  Determines the allocation of total CPF contributions into various accounts (Ordinary, Special, Retirement, Medisave) based on the user's age and total CPF amounts.

- **`CpfUtils.ts`**  
  Contains helper functions to support CPF-related computations. These might include functions to format CPF values, determine age groups, or perform common rounding operations.

- **`constants.ts`**  
  Houses application-wide constants such as popover maximum width, default age values, and possibly other configuration parameters used across the project.

### Table Modules

- **`Table1.ts` to `Table5.ts`**  
  Each of these files computes the monthly CPF contributions (both employee and employer portions) based on specific tables. These tables adjust rates based on the residency status, age brackets, and salary levels.

---

## Installation & Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yogeshps/yogeshps.github.io.git
   cd sg-calculator
   ```

2. **Install Dependencies:**

   Ensure you have [Node.js](https://nodejs.org/) installed. Then run:

   ```bash
   npm install
   ```

3. **Configuration:**

   - The project uses Vite for development. The configuration is managed in `vite.config.ts` (if present) along with the standard `package.json` scripts.
   - Review `tsconfig.json` for TypeScript settings.
   - Check `.eslintrc.js` for linting rules.

---

## Development & Build Instructions

- **Start Development Server:**

  To run the development server with hot reloading:

  ```bash
  npm run dev
  ```

  The application will be accessible at `http://localhost:3000` (or the port specified by Vite).

- **Build for Production:**

  The build process compiles TypeScript and bundles the app using Vite:

  ```bash
  npm run build
  ```

  This command first runs TypeScript checks (`tsc -b --noEmit`) and then builds the production bundle.

- **Preview Production Build:**

  After building, you can preview the production version locally:

  ```bash
  npm run preview
  ```

- **Linting:**

  To run ESLint on the project:

  ```bash
  npm run lint
  ```

---

## Deployment

This project is configured for deployment on GitHub Pages. The relevant scripts in `package.json` are:

- **Pre-deploy:**  
  Builds the project before deploying.

  ```bash
  npm run predeploy
  ```

- **Deploy:**  
  Deploys the contents of the `dist` folder to GitHub Pages.

  ```bash
  npm run deploy
  ```

Ensure that the repository URL in `package.json` is correctly set to your GitHub repository.

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with clear messages.
4. Push your branch and open a pull request with a detailed description of your changes.

Please ensure that your code follows the project's ESLint and TypeScript guidelines.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---