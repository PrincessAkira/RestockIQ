// React Frontend Integration Tasks for Smart Shelf System

// === Admin Pages ===
// 1. Product Registration Page
// - Form to add new products (name, stock, threshold, price)
// - Backend call: POST /api/products

// 2. Stock Management Page
// - List products with current stock
// - Editable fields for adjusting stock or thresholds
// - Backend call: PUT /api/stock/:id

// 3. Real-Time Dashboard
// - Graphs: Stock Status Overview, Sales Trends
// - Use Chart.js or Recharts
// - Data source: GET /api/analytics/summary

// 4. Audit Log Viewer
// - Display logs of system actions by users
// - Table view with filters (user, action type)
// - Backend call: GET /api/audit-logs

// === Cashier Pages ===
// 1. Simple POS UI
// - Product listing with "Add to Cart" option
// - Checkout button processes sale
// - Backend call: POST /api/sales

// 2. Real-Time Sale Handling
// - Live update stock after checkout
// - Trigger alert if stock < threshold
// - Backend: PUT /api/stock/:id, POST /api/alerts if needed

// === Shared Pages/Components ===
// 1. Alerts UI (Shared)
// - Badge on navbar or dashboard (e.g. "3 items need restocking")
// - Modal or dropdown showing products below threshold
// - Backend call: GET /api/alerts

// 2. AnalyticsPage.js (Shared)
// - Graphs: Top Turnover Products, Stock vs. Sales
// - Restock suggestions based on trend analysis
// - Backend: GET /api/analytics/trends

src/
│
├── assets/ # Static files: images, icons, logos
│ └── logo.svg
│
├── components/ # Reusable UI components
│ ├── Navbar.js
│ ├── Footer.js
│ ├── AlertsBadge.js
│ ├── ProductCard.js
│ └── Charts/ # Shared chart components
│ ├── StockOverviewChart.js
│ └── SalesTrendChart.js
│
├── context/ # Global state providers (e.g. Auth, Alerts)
│ ├── AuthContext.js
│ └── AlertContext.js
│
├── pages/
│ ├── admin/ # Pages for Admin role
│ │ ├── ProductRegistration.js
│ │ ├── StockManagement.js
│ │ ├── Dashboard.js
│ │ └── AuditLogViewer.js
│ │
│ ├── cashier/ # Pages for Cashier role
│ │ ├── POS.js
│ │ └── SaleResult.js
│ │
│ ├── shared/ # Pages used by both Admin and Cashier
│ │ ├── AlertsPage.js
│ │ └── AnalyticsPage.js
│ │
│ └── LandingPage.js # Public landing/home page
│
├── services/ # Axios service handlers for API calls
│ ├── productService.js
│ ├── stockService.js
│ ├── salesService.js
│ ├── alertsService.js
│ ├── authService.js
│ └── reportService.js
│
├── utils/ # Utility functions (formatting, etc.)
│ └── formatDate.js
│
├── App.js # Root component with routes
├── routes.js # Optional: route definitions (if separated)
├── index.js # App entry point
└── setupTests.js # Test environment setup (Jest)
