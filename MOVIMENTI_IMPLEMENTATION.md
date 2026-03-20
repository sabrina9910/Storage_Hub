# Movimenti Feature Implementation Summary

## Overview
Complete implementation of the "Movimenti" section with product actions and movement tracking.

## Backend Changes

### Models Updated

1. **Product Model** (`prodotti/models.py`)
   - Added `is_quarantined` (BooleanField, default=False)
   - Added `quarantine_reason` (TextField, blank=True)

2. **StockMovement Model** (`movimenti/models.py`)
   - Added `product` ForeignKey (nullable, for direct product reference)
   - Added `user_full_name`, `user_email`, `user_role` for audit trail
   - Made `lot` nullable (for quarantine actions without specific lot)
   - Added new movement types: 'STOCK_IN', 'STOCK_OUT', 'QUARANTINED'

### API Endpoints

**Movement Actions:**
- `POST /api/movements/add/` - Add stock to product
- `POST /api/movements/remove/` - Remove stock from product (FIFO)
- `POST /api/movements/quarantine/` - Quarantine a product

**Movement Listing with Filters:**
- `GET /api/movements/?period=today` - Today's movements
- `GET /api/movements/?period=week` - This week
- `GET /api/movements/?period=month` - This month
- `GET /api/movements/?period=year` - This year
- `GET /api/movements/?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD` - Custom range
- `GET /api/movements/?type=STOCK_IN` - Filter by type
- `GET /api/movements/?user=<user_id>` - Filter by operator

**Export Endpoints:**
- `GET /api/movements/export/xlsx/?<filters>` - Export to Excel
- `GET /api/movements/export/pdf/?<filters>` - Export to PDF

### Migrations Created

1. `prodotti/migrations/0003_product_quarantine_fields.py`
   - Adds quarantine fields to Product model

2. `movimenti/migrations/0004_stockmovement_updates.py`
   - Adds product reference and user audit fields
   - Makes lot nullable
   - Updates movement type choices

## Frontend Changes

### New Page
- `/admin/movimenti` - Complete Movimenti management page

### Features Implemented

**Section 1: Product Actions Panel**
- Three action buttons: Carico (Add), Scarico (Remove), Quarantena
- Product search/selection dropdown
- Quantity input (for add/remove)
- Notes/Reason textarea
- Real-time form validation
- Success/error toast notifications

**Section 2: Movements Table**
- Displays all movements with filters
- Columns: Date/Time, Product, SKU, Action Type, Quantity, Operator, Notes
- Period filters: Today, Week, Month, Year, Custom Range
- Action type filter: All, Carico, Scarico, Quarantena
- Operator filter: Dropdown with all users
- Export buttons: XLSX and PDF (respects active filters)
- Color-coded action badges
- Responsive table design

### Navigation
- Added "Movimenti" button in sidebar (visible to all roles: magazziniere, amministratore, superuser)
- Icon: ClipboardList
- Route: `/admin/movimenti`

## Business Logic

### Add Stock (Carico)
1. Validates product and quantity
2. Gets or creates a default lot for the product
3. Increments lot quantity
4. Creates movement record with user details
5. Invalidates relevant queries

### Remove Stock (Scarico)
1. Validates product and quantity
2. Checks available stock across all active lots
3. Uses FIFO (First In, First Out) - removes from oldest lots first
4. Decrements lot quantities
5. Creates movement record with user details

### Quarantine
1. Sets product.is_quarantined = True
2. Stores quarantine reason
3. Calculates total quantity across all lots
4. Creates movement record
5. Product remains visible but marked with warning badge

## Data Audit Trail

Each movement records:
- User full name (first_name + last_name or email)
- User email
- User role
- Product reference
- Lot reference (if applicable)
- Movement type
- Quantity
- Timestamp (auto)
- Notes/Reason

## Export Functionality

Both XLSX and PDF exports:
- Respect all active filters (period, type, operator)
- Include all relevant columns
- Use proper formatting
- Download directly to browser
- Filename includes timestamp

## Installation Notes

Required Python packages (already in requirements.txt):
- openpyxl (for XLSX export)
- reportlab (for PDF export)

To apply migrations:
```bash
cd backend
python manage.py migrate prodotti
python manage.py migrate movimenti
```

## Testing Checklist

- [ ] Add stock increases product quantity
- [ ] Remove stock decreases quantity (FIFO)
- [ ] Cannot remove more than available stock
- [ ] Quarantine marks product correctly
- [ ] All filters work independently and combined
- [ ] Export buttons download files with correct data
- [ ] Sidebar link appears for all roles
- [ ] Movement table updates after actions
- [ ] User details are correctly recorded
- [ ] Toast notifications appear for all actions
