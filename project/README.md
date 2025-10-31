# PharmIntel - AI-Powered Pharmaceutical Inventory Management System

A comprehensive, production-ready web application for managing pharmaceutical inventory with advanced AI-powered features, real-time analytics, and intelligent forecasting.

## Features

### Core Features

#### 1. Multi-Role Authentication & Access Control
- **Admin/Pharma Manager**: Full system access, user management, global analytics
- **Pharmacist/Store Staff**: Inventory operations, stock management, local alerts
- **Hospital/Distributor**: Order tracking, stock visibility, distribution management
- **Auditor/Regulator**: Read-only access to audit trails and compliance reports
- Secure email/password authentication with role-based dashboards
- Session management and user activity logging

#### 2. Real-Time Inventory Management
- **Batch Tracking**: Monitor medicine batches from receipt to dispensing
- **Stock Level Management**: Real-time quantity tracking by batch, location, and category
- **Expiry Date Management**: Automatic tracking and alerts for approaching expiry dates
- **Multi-Location Support**: Manage inventory across multiple pharmacy/hospital locations
- **Transaction Logging**: Immutable audit trail of all stock movements

#### 3. Intelligent Dashboard
- **Real-Time Statistics**:
  - Total medicines in inventory
  - Low stock item count
  - Expiry warnings
  - Active alerts
- **Visual Analytics**:
  - 7-day demand forecast chart
  - Stock distribution by category (pie chart)
  - Trend analysis
- **Recent Alerts**: Quick access to critical inventory issues

#### 4. AI-Powered Demand Forecasting
- **Predictive Analytics**: Uses historical consumption data to predict future demand
- **Seasonal Pattern Recognition**: Identifies weekly and seasonal trends
- **Trend Analysis**: Detects increasing/decreasing demand patterns
- **Day-of-Week Adjustment**: Accounts for weekday vs. weekend consumption differences
- **Confidence Scoring**: Provides confidence metrics for each prediction
- **7-Day Forecasts**: Daily predictions with accuracy indicators

#### 5. AI-Generated Insights & Recommendations
- **Restocking Alerts**: Automatic recommendations when stock falls below minimum levels
- **Expiry Risk Alerts**: Early warnings for medicines approaching expiration
- **Cost Optimization**: Suggestions for inventory cost reduction
- **Supplier Performance Scoring**: AI-based supplier rating system
- **Anomaly Detection**: Identifies unusual usage patterns or inventory discrepancies
- **Priority-Based Recommendations**: High, medium, low priority insights

#### 6. Purchase Order Management
- **Order Lifecycle Tracking**: Pending → Confirmed → Shipped → Delivered
- **Supplier Management**: Maintain supplier database with performance history
- **Order Status History**: Immutable log of all order status changes
- **Expected vs. Actual Delivery Tracking**: Monitor supplier performance
- **Order Statistics**: Real-time order summary by status

#### 7. Audit & Compliance
- **Complete Activity Logging**: Every action is logged with timestamp and user
- **Immutable Audit Trail**: Cannot be modified once created
- **Role-Based Access Logs**: Track who accessed what data
- **Transaction History**: Full inventory movement history
- **Compliance Reports**: Generate audit-ready compliance documentation

#### 8. Alert & Notification System
- **Real-Time Alerts**: Immediate notifications for critical inventory issues
- **Alert Types**:
  - Low stock warnings
  - Expiry alerts (30/60/90 days)
  - Expired product alerts
  - Order status updates
- **Alert Management**: Mark alerts as resolved, track resolution history
- **User Notifications**: In-app notification center with read/unread status

## Technology Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization and charts
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **Date-FNS** - Date utilities

### Backend & Database
- **Supabase** - PostgreSQL database + authentication + real-time features
- **PostgreSQL** - Relational database
- **Row Level Security (RLS)** - Fine-grained access control
- **Automated Migrations** - Schema version control

### AI/ML Components
- **Time Series Analysis**: Exponential moving average (EMA) for demand forecasting
- **Seasonality Detection**: Weekly pattern recognition
- **Trend Analysis**: Linear trend calculation
- **Anomaly Detection**: Statistical variance analysis
- **Confidence Scoring**: Prediction uncertainty quantification

## Database Schema

### Core Tables

#### User Management
- `user_roles` - Role definitions (admin, pharmacist, hospital, auditor)
- `user_profiles` - User information with role assignment

#### Inventory
- `medicines` - Medicine master catalog with pricing and reorder points
- `medicine_categories` - Drug classifications
- `inventory_batches` - Individual batch tracking with expiry dates
- `inventory_transactions` - Immutable stock movement log
- `stock_alerts` - Active and resolved inventory alerts

#### Procurement
- `suppliers` - Supplier database with performance metrics
- `purchase_orders` - Order management
- `purchase_order_items` - Line items in orders
- `order_status_history` - Order lifecycle tracking
- `medicine_supplier_mapping` - Medicine-supplier relationships

#### AI & Analytics
- `demand_history` - Historical consumption data for forecasting
- `demand_forecast` - AI-generated demand predictions
- `ai_insights` - Generated recommendations and insights
- `anomaly_records` - Detected unusual patterns

#### Security & Compliance
- `audit_logs` - Complete activity logging
- `notifications` - User notification center

### Security Features
- **Row Level Security (RLS)**: All tables protected with organization-level access control
- **Authentication**: Supabase built-in authentication with email/password
- **Authorization**: Role-based access control via RLS policies
- **Data Isolation**: Users can only access their organization's data
- **Audit Trail**: Immutable logging of all actions

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pharmintel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   The `.env` file is already configured with Supabase credentials. No additional setup needed.

4. **Run the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

## Usage Guide

### First Time Setup

1. **Register Account**
   - Click "Register" on the login page
   - Enter your details (name, email, password)
   - Select your role (Admin, Pharmacist, Hospital, or Auditor)
   - Enter your organization name

2. **Login**
   - Use your registered email and password
   - System automatically initializes sample data on first login

### Navigation

The sidebar provides access to:
- **Dashboard**: Real-time inventory overview and analytics
- **Inventory**: Manage medicine batches and stock levels
- **Orders**: Track purchase orders from suppliers
- **Analytics**: AI insights and demand forecasting

### Managing Inventory

1. **Add New Batch**
   - Navigate to Inventory page
   - Click "Add New Batch"
   - Fill in medicine details, batch number, quantity, expiry date
   - Specify storage location
   - System automatically creates alerts for low stock or approaching expiry

2. **View Alerts**
   - Alerts appear automatically when:
     - Stock falls below minimum level
     - Products expire within 30 days
     - Products have expired
   - Click on alerts in the Dashboard to view details

3. **Track Stock**
   - Real-time quantity updates
   - Batch-level tracking by expiry date
   - Location-based organization

### AI Features

1. **Demand Forecasting**
   - Select a medicine in Analytics page
   - View 7-day demand prediction chart
   - See confidence scores for each prediction
   - Use predictions for reorder planning

2. **AI Insights**
   - Automatic recommendations appear in Analytics
   - Recommendations include:
     - When to reorder specific medicines
     - Which batches are at expiry risk
     - Cost optimization opportunities
   - Mark insights as "Actioned" to track implementation

### Purchase Orders

1. **Create Order**
   - Navigate to Orders page
   - Click "Create Order"
   - Select supplier and items
   - Set expected delivery date
   - Submit order

2. **Track Orders**
   - View all orders with current status
   - Monitor expected vs. actual delivery dates
   - See supplier performance metrics
   - Filter by status or supplier

## API Endpoints (for future development)

### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Inventory
- `GET /inventory/batches` - List all batches
- `POST /inventory/batches` - Add new batch
- `PATCH /inventory/batches/:id` - Update batch
- `DELETE /inventory/batches/:id` - Remove batch

### Orders
- `GET /orders` - List orders
- `POST /orders` - Create order
- `PATCH /orders/:id` - Update order status

### Analytics
- `GET /analytics/forecast` - Get demand forecast
- `GET /analytics/insights` - Get AI insights
- `POST /analytics/insights/:id/action` - Mark insight as actioned

## Performance Optimizations

- **Code Splitting**: Dynamic imports for route-level code splitting
- **Lazy Loading**: Components loaded on demand
- **Caching**: Client-side caching of forecast data
- **Database Indexing**: Optimized queries for high-volume operations
- **RLS Policies**: Efficient permission checks at database level

## Security Best Practices

1. **Authentication**: Built-in Supabase authentication with secure session management
2. **Authorization**: Row-level security ensures users only access their data
3. **Data Encryption**: All data encrypted in transit (HTTPS) and at rest
4. **Audit Logging**: Every action logged and cannot be modified
5. **Input Validation**: All user inputs validated on client and server
6. **SQL Injection Prevention**: Parameterized queries via Supabase SDK

## Troubleshooting

### Common Issues

1. **Login fails**
   - Ensure you've registered an account first
   - Check that email and password are correct
   - Clear browser cache and cookies

2. **No data showing in Dashboard**
   - System auto-initializes sample data on first login
   - Try refreshing the page
   - Check that you have inventory items added

3. **Forecasts not updating**
   - Demand forecasting requires historical data
   - Add sample batches and they'll generate predictions
   - Forecasts update daily

## Future Enhancements

- Mobile app (React Native)
- SMS/Email notification integration
- Barcode/QR code scanning
- IoT device integration for real-time stock monitoring
- Blockchain-based supply chain transparency
- Advanced ML models for demand forecasting
- Real-time GPS tracking for shipments
- Integration with accounting systems
- Multi-language support
- Custom report builder

## Support & Contributing

For issues and feature requests, please create an issue in the repository.

## License

This project is part of a Final Year Engineering Project and is confidential.

---

**Version**: 1.0.0
**Last Updated**: November 2024
