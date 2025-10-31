# PharmIntel Setup Guide

## Quick Start

### 1. Installation
```bash
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 2. Create Your Account

#### Option A: Create New Account
1. Click "Register" on the login page
2. Fill in your details:
   - Full Name: Your name
   - Email: your-email@example.com
   - Role: Select one (Admin, Pharmacist, Hospital, or Auditor)
   - Organization: Your pharmacy/hospital name
   - Password: Set a secure password
3. Click "Register"
4. You'll be redirected to login
5. Log in with your new credentials

#### Option B: Use Demo Account
Demo credentials are displayed on the login page:
- **Email**: admin@pharmintel.com
- **Password**: demo123456

### 3. First Login

When you first log in, the system automatically:
- Initializes sample medicines from the database
- Creates sample inventory batches
- Generates sample demand history
- Creates sample demand forecasts

This allows you to immediately explore all features.

## Understanding the System

### Role Permissions

#### Admin / Pharma Manager
- Full system access
- Create and manage users
- View all inventory and orders
- Generate compliance reports
- Access to analytics dashboard
- Can modify all settings

#### Pharmacist / Store Staff
- Manage local inventory
- Process stock movements
- View local alerts
- Limited to organization's data
- Can view orders but cannot create

#### Hospital / Distributor
- View inventory availability
- Place and track orders
- View stock forecasts
- Limited to assigned locations
- Cannot modify inventory directly

#### Auditor / Regulator
- View-only access to everything
- Access complete audit logs
- Generate compliance reports
- Cannot modify any data

## Features Overview

### Dashboard
The main overview page showing:
- **Real-time Statistics**: Total medicines, low stock items, expiry warnings, active alerts
- **Demand Forecast**: 7-day prediction chart with confidence scores
- **Stock Distribution**: Pie chart showing medicine distribution by category
- **Recent Alerts**: Latest system alerts and recommendations

### Inventory Management
Complete inventory control:
- **Add New Batch**: Register new medicine batches
- **Search & Filter**: Find medicines by name, category, or expiry date
- **Batch Details**: View batch number, quantity, expiry date, location, status
- **Stock Status**: Visual indicators for active, expiring soon, and expired items
- **Edit & Delete**: Manage batch information

### Orders Management
Track supplier orders:
- **Create Order**: Generate purchase orders from suppliers
- **Order Tracking**: Monitor order status from pending to delivery
- **Supplier Info**: View supplier details and performance metrics
- **Order Statistics**: Summary of orders by status
- **Filter & Search**: Find orders by number or supplier

### AI Analytics
Advanced insights and predictions:
- **Demand Forecasting**: AI-generated 7-day demand predictions
- **Confidence Scores**: See prediction accuracy metrics
- **AI Insights**: Get recommendations for:
  - When to reorder medicines
  - Which batches are at risk of expiry
  - Cost optimization opportunities
  - Supplier performance issues
- **Priority-Based Actions**: Sort recommendations by urgency

## Working with Sample Data

### Sample Medicines
The system comes with 10 pre-loaded medicines:
1. **Amoxicillin 500mg** - Antibiotic
2. **Paracetamol 500mg** - Painkiller
3. **Vitamin C 1000mg** - Vitamin
4. **Ibuprofen 400mg** - Anti-inflammatory
5. **Metformin 500mg** - Diabetes medication
... and 5 more

### Sample Batches
Each user automatically gets sample batches for various medicines with:
- Random quantities (100-500 units)
- Realistic expiry dates (6 months from now)
- Various storage locations (Shelf A1, B2, etc.)
- Recent receipt dates

### Sample Demand History
30 days of historical data is created for:
- Realistic consumption patterns
- Varying daily quantities
- Weekday vs. weekend differences
- Weekly seasonal trends

This data feeds into the AI forecasting models.

## Using AI Features

### 1. Demand Forecasting

**How to use:**
1. Go to Analytics page
2. Select a medicine from the dropdown
3. View the 7-day forecast chart

**Interpreting the Chart:**
- **Blue Area**: Predicted demand quantities
- **Green Line**: Confidence percentage (higher = more accurate)
- Predictions account for:
  - Historical consumption patterns
  - Day-of-week effects (higher on weekdays)
  - Seasonal trends
  - Overall trending

**Example:**
If Paracetamol shows high demand on weekdays but low on weekends, the AI learns this and predicts accordingly.

### 2. AI Insights

**Restocking Alerts:**
- Shows which medicines need reordering
- Recommends order quantity based on forecast
- Considers minimum stock levels
- Priority: HIGH if stock is very low

**Expiry Risk Alerts:**
- Identifies medicines expiring within 30 days
- Suggests immediate use to prevent wastage
- Priority: HIGH if expiring within 7 days, MEDIUM otherwise

**Cost Optimization:**
- Identifies slow-moving items
- Suggests transfer between locations if available
- Helps reduce carrying costs

**How to Act:**
1. Click on any recommendation
2. Read the description and recommendation
3. Click "Act on This" to implement
4. Click "Dismiss" to mark as reviewed

### 3. Anomaly Detection

The system automatically flags:
- Unusual usage patterns (e.g., sudden spike in consumption)
- Stock discrepancies (e.g., recorded quantity doesn't match physical)
- Rapid depletion without explanation
- Seasonal anomalies

These appear in the Analytics page with severity levels:
- **Critical**: Immediate investigation needed
- **High**: Needs attention within 24 hours
- **Medium**: Schedule for routine check
- **Low**: Monitor and note for reporting

## Sample Workflows

### Workflow 1: Inventory Replenishment

1. **Check Dashboard**
   - See low stock alerts in the Recent Alerts section
   - Note the specific medicine names and quantities

2. **Go to Analytics**
   - View AI recommendations for restocking
   - See 7-day demand forecast
   - Review suggested reorder quantities

3. **Create Purchase Order**
   - Navigate to Orders page
   - Click "Create Order"
   - Select the low-stock supplier
   - Set expected delivery date (usually 7 days out)
   - Submit order

4. **Track Order**
   - Monitor order status: Pending → Confirmed → Shipped → Delivered
   - View expected vs. actual delivery dates
   - Check supplier performance metrics

5. **Receive and Update**
   - When order arrives, go to Inventory page
   - Add new batch for received medicines
   - System automatically updates stock levels
   - Alerts clear once stock is above minimum

### Workflow 2: Managing Expiring Stock

1. **Identify Risk**
   - Dashboard shows "Expiry Warnings" count
   - Analytics shows specific medicines expiring soon
   - System suggests redistribution if applicable

2. **Prioritize Usage**
   - Use FIFO (First-In-First-Out) principle
   - Prioritize batches expiring soon
   - Update quantity manually as stock is used

3. **Disposal**
   - If stock cannot be used before expiry
   - Record as disposal in system
   - This generates compliance documentation

### Workflow 3: Order Fulfillment (for Hospitals/Distributors)

1. **View Available Stock**
   - Check Inventory page for available medicines
   - See batch details and expiry dates
   - Note quantities in stock

2. **Place Order**
   - Go to Orders page
   - Click "Create Order"
   - Select items and quantities needed
   - Set delivery preference

3. **Track Shipment**
   - Monitor order status in real-time
   - See expected delivery date
   - Get notifications when order ships

## Tips & Tricks

### For Pharmacists
- Use the Dashboard daily to check for alerts
- Review expiry dates regularly (focus on items expiring within 30 days)
- Use demand forecasts to anticipate high-demand periods
- Maintain accurate stock quantities for better AI predictions

### For Hospital/Distributor Managers
- Set up regular orders based on demand forecasts
- Compare multiple suppliers using performance scores
- Use analytics to optimize inventory across multiple locations
- Track delivery performance to identify unreliable suppliers

### For Administrators
- Monitor user activity through audit logs
- Generate compliance reports regularly
- Review AI insights for system-wide trends
- Use supplier performance data for contract negotiations

### General Tips
- Keep medicine names consistent for better forecasting
- Update stock quantities daily for accurate forecasts
- Review and act on AI insights weekly
- Export reports for external audits
- Use filters to focus on specific categories or locations

## Troubleshooting

### Issue: "No data showing in Dashboard"
**Solution:**
- You need to add inventory batches first
- Go to Inventory page
- Click "Add New Batch"
- Fill in details and save
- Return to Dashboard to see updated statistics

### Issue: "Forecasts are inaccurate"
**Solution:**
- Forecasts improve with more historical data
- Ensure you're tracking consumption accurately
- Check that demand history is populated
- Wait a few days for the system to learn patterns
- Low-stock medicines may have limited forecast data

### Issue: "Cannot create orders"
**Solution:**
- Check your role - only admins and pharmacists can create orders
- Ensure suppliers are set up in the system
- Verify you have permission to access the supplier

### Issue: "Alerts not appearing"
**Solution:**
- Alerts generate based on batch data
- Add inventory batches to see alerts
- Check alert thresholds match your needs
- Refresh the page to see latest alerts
- Check that alert type is enabled in your preferences

## Advanced Configuration

### Adjusting Minimum Stock Levels
1. Go to Inventory page
2. Click on a medicine to edit
3. Adjust the "Minimum Stock Level"
4. System will auto-generate low-stock alerts

### Configuring Expiry Alerts
- 90 days before: Info level alert
- 60 days before: Warning level alert
- 30 days before: Critical level alert
- After expiry: Critical (expired) alert

### Setting Reorder Quantities
1. Edit medicine details
2. Set "Reorder Quantity"
3. This is suggested amount when stock is low
4. Based on demand forecast and safety margin

## Data Backup & Security

### Your Data is Secure
- All data encrypted in transit (HTTPS)
- Encrypted at rest in Supabase
- Row-level security ensures data isolation
- Regular automated backups
- Audit logs track all changes

### Exporting Data
- Generate PDF reports from Analytics
- Export inventory lists to CSV
- Download audit logs for compliance
- Share reports with stakeholders

## Next Steps

1. **Explore the Dashboard**: Familiarize yourself with the interface
2. **Add Some Batches**: Create sample batches to see alerts
3. **Check Analytics**: View demand forecasts and AI insights
4. **Create an Order**: Practice the order workflow
5. **Review Reports**: Generate compliance reports

For more information, see the main [README.md](README.md)

---

**Need Help?**
- Check the main README for feature documentation
- Review database schema in the migrations
- Explore the codebase in the `src/` directory
- Each component includes TypeScript types for reference

Happy inventory management!
