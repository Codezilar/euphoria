"use client"

import { useState } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { 
  Paper, Box, Chip, Button, IconButton, Tooltip, Select, MenuItem, 
  FormControl, Typography, Avatar, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, Divider, List, ListItem, ListItemText, 
  ListItemAvatar, Badge, Card, CardContent, Stack, Tabs, Tab,
  alpha, useMediaQuery
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CancelIcon from '@mui/icons-material/Cancel';
import InventoryIcon from '@mui/icons-material/Inventory';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningIcon from '@mui/icons-material/Warning';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteIcon from '@mui/icons-material/Delete';

// Dark theme configuration
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#ce93d8' },
    success: { main: '#66bb6a' },
    warning: { main: '#ffa726' },
    error: { main: '#f44336' },
    info: { main: '#29b6f6' },
    background: {
      default: '#0a0f1c',
      paper: '#111827',
    },
    text: {
      primary: '#e5e7eb',
      secondary: '#9ca3af',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#111827',
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500 },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, textTransform: 'none', fontWeight: 500 },
      },
    },
  },
});

// Types and interfaces (same as before)
type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'on-hold' | 'backordered';
type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded' | 'partially-paid';
type ShippingStatus = 'unfulfilled' | 'fulfilled' | 'partial' | 'delivered' | 'returned';

interface OrderItem {
  id: number; name: string; sku: string; quantity: number; price: number; 
  subtotal: number; image: string; category: string; brand: string; 
  weight: number; dimensions: string;
}

interface ShippingInfo {
  method: string; trackingNumber: string; carrier: string; 
  estimatedDelivery: string; cost: number; status: ShippingStatus;
}

interface BillingInfo {
  name: string; email: string; phone: string; address: string; 
  city: string; state: string; zipCode: string; country: string; company?: string;
}

interface OrderNote {
  id: number; date: string; author: string; note: string; type: 'internal' | 'customer';
}

interface Order {
  id: number; orderNumber: string; customerId: number; customerName: string;
  customerEmail: string; customerPhone: string; orderDate: string; orderTime: string;
  totalAmount: number; subtotal: number; taxAmount: number; shippingAmount: number;
  discountAmount: number; currency: string; status: OrderStatus; paymentStatus: PaymentStatus;
  paymentMethod: string; transactionId: string; billingAddress: BillingInfo;
  shippingAddress: BillingInfo; items: OrderItem[]; shippingInfo: ShippingInfo;
  notes: OrderNote[]; tags: string[]; priority: 'low' | 'medium' | 'high';
  source: 'website' | 'mobile-app' | 'phone' | 'in-store'; couponCode?: string;
  thumbnail: string; createdAt: string; updatedAt: string;
}

// Status configurations (same as before)
const statusConfig = {
  pending: { label: 'Pending', color: 'warning' as const, icon: <PendingIcon />, description: 'Order received, awaiting confirmation' },
  confirmed: { label: 'Confirmed', color: 'info' as const, icon: <VerifiedIcon />, description: 'Order confirmed, processing payment' },
  processing: { label: 'Processing', color: 'info' as const, icon: <InventoryIcon />, description: 'Order is being prepared' },
  shipped: { label: 'Shipped', color: 'primary' as const, icon: <LocalShippingIcon />, description: 'Order has been shipped' },
  delivered: { label: 'Delivered', color: 'success' as const, icon: <CheckCircleIcon />, description: 'Order delivered successfully' },
  cancelled: { label: 'Cancelled', color: 'error' as const, icon: <CancelIcon />, description: 'Order was cancelled' },
  refunded: { label: 'Refunded', color: 'error' as const, icon: <WarningIcon />, description: 'Order refund processed' },
  'on-hold': { label: 'On Hold', color: 'warning' as const, icon: <PendingIcon />, description: 'Order placed on hold' },
  backordered: { label: 'Backordered', color: 'warning' as const, icon: <InventoryIcon />, description: 'Items are backordered' }
};

const paymentStatusConfig = {
  paid: { label: 'Paid', color: 'success' as const, icon: <CheckCircleIcon /> },
  pending: { label: 'Pending', color: 'warning' as const, icon: <PendingIcon /> },
  failed: { label: 'Failed', color: 'error' as const, icon: <CancelIcon /> },
  refunded: { label: 'Refunded', color: 'error' as const, icon: <WarningIcon /> },
  'partially-paid': { label: 'Partially Paid', color: 'info' as const, icon: <AttachMoneyIcon /> }
};

// ItemsDisplay component
const ItemsDisplay = ({ items }: { items: OrderItem[] }) => {
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const displayItems = items.slice(0, 3);
  
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Badge badgeContent={totalItems} color="primary" sx={{ '& .MuiBadge-badge': { right: -8, top: 8 } }}>
        <Box display="flex">
          {displayItems.map((item, index) => (
            <Avatar 
              key={item.id}
              src={item.image}
              sx={{ 
                width: 40, height: 40, 
                marginLeft: index === 0 ? 0 : -1.5,
                border: '2px solid #1f2937',
              }}
            />
          ))}
        </Box>
      </Badge>
      <Box>
        <Typography variant="body2" fontWeight={500}>{items.length} products</Typography>
        <Typography variant="caption" color="text.secondary">{totalItems} units</Typography>
      </Box>
    </Box>
  );
};

// Status modification cell
const StatusModificationCell = ({ params }: { params: GridRenderCellParams }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(params.row.status);
  const config = statusConfig[currentStatus];

  const handleStatusChange = (newStatus: OrderStatus) => {
    setCurrentStatus(newStatus);
    setIsEditing(true);
  };

  return (
    <>
      <Box display="flex" alignItems="center" gap={0.5}>
        <Tooltip title={config.description}>
          <Chip
            label={config.label}
            color={config.color}
            size="small"
            icon={config.icon}
            onClick={() => setIsEditing(true)}
            sx={{ cursor: 'pointer', '& .MuiChip-icon': { fontSize: 16 } }}
          />
        </Tooltip>
        <IconButton size="small" onClick={() => setIsEditing(true)}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Box>

      <Dialog open={isEditing} onClose={() => setIsEditing(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {Object.entries(statusConfig).map(([key, config]) => (
              <Button
                key={key}
                variant={currentStatus === key ? 'contained' : 'outlined'}
                color={config.color}
                startIcon={config.icon}
                onClick={() => handleStatusChange(key as OrderStatus)}
                fullWidth
                sx={{ justifyContent: 'flex-start' }}
              >
                {config.label}
              </Button>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Columns definition
const columns: GridColDef[] = [
  { 
    field: 'orderNumber', 
    headerName: 'Order', 
    width: 120,
    renderCell: (params) => (
      <Box>
        <Typography variant="body2" fontWeight="bold" color="primary">#{params.value}</Typography>
        <Typography variant="caption" color="text.secondary">{params.row.source}</Typography>
      </Box>
    )
  },
  { 
    field: 'customerName', 
    headerName: 'Customer', 
    width: 200,
    renderCell: (params) => (
      <Box display="flex" alignItems="center" gap={1}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>{params.value?.charAt(0)}</Avatar>
        <Box>
          <Typography variant="body2">{params.value}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row.customerEmail}</Typography>
        </Box>
      </Box>
    )
  },
  { 
    field: 'orderDate', 
    headerName: 'Date', 
    width: 120,
    renderCell: (params) => (
      <Box>
        <Typography variant="body2">{new Date(params.value).toLocaleDateString()}</Typography>
        <Typography variant="caption" color="text.secondary">{params.row.orderTime}</Typography>
      </Box>
    )
  },
  {
    field: 'totalAmount',
    headerName: 'Total',
    width: 100,
    renderCell: (params) => (
      <Typography variant="body2" fontWeight="bold" color="primary">
        ${params.value?.toFixed(2)}
      </Typography>
    ),
  },
  {
    field: 'items',
    headerName: 'Items',
    width: 150,
    renderCell: (params) => <ItemsDisplay items={params.value || []} />,
  },
  {
    field: 'paymentStatus',
    headerName: 'Payment',
    width: 110,
    renderCell: (params) => {
      const config = paymentStatusConfig[params.value as PaymentStatus] || paymentStatusConfig.pending;
      return <Chip label={config.label} color={config.color} size="small" icon={config.icon} />;
    },
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 150,
    renderCell: (params) => <StatusModificationCell params={params} />,
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 100,
    renderCell: (params) => (
      <Box>
        <Tooltip title="View Details">
          <IconButton size="small" color="primary">
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Message">
          <IconButton size="small" color="primary">
            <EmailIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  },
];

// Sample data (same as before)
const initialRows: Order[] = [{
  id: 1,
  orderNumber: 'ORD-2024-001',
  customerId: 1001,
  customerName: 'John Smith',
  customerEmail: 'john@example.com',
  customerPhone: '+1 (555) 123-4567',
  orderDate: '2024-01-15',
  orderTime: '10:30 AM',
  totalAmount: 299.99,
  subtotal: 250.00,
  taxAmount: 20.00,
  shippingAmount: 29.99,
  discountAmount: 0,
  currency: 'USD',
  status: 'pending',
  paymentStatus: 'paid',
  paymentMethod: 'Credit Card',
  transactionId: 'TXN-001234567890',
  billingAddress: {} as BillingInfo,
  shippingAddress: {} as BillingInfo,
  items: [
    { id: 1, name: 'Wireless Headphones', sku: 'WH-1000XM4', quantity: 1, price: 199.99, subtotal: 199.99, image: '', category: 'Electronics', brand: 'Sony', weight: 0.5, dimensions: '8x7x3' },
    { id: 2, name: 'USB-C Cable', sku: 'USB-C-3FT', quantity: 2, price: 25.00, subtotal: 50.00, image: '', category: 'Accessories', brand: 'Anker', weight: 0.1, dimensions: '3ft' }
  ],
  shippingInfo: {} as ShippingInfo,
  notes: [],
  tags: [],
  priority: 'medium',
  source: 'website',
  thumbnail: '',
  createdAt: '',
  updatedAt: ''
}];

export default function Order() {
  const [rows] = useState<Order[]>(initialRows);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [tabValue, setTabValue] = useState(0);
  const isMobile = useMediaQuery('(max-width:600px)');

  const filteredRows = rows.filter(row => 
    row.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
        <Paper sx={{ p: 3, height: 'calc(100vh - 48px)' }}>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Orders Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and track all customer orders
            </Typography>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
              <Tab label="All Orders" />
              <Tab label="Pending" />
              <Tab label="Processing" />
              <Tab label="Shipped" />
            </Tabs>
          </Box>

          {/* Toolbar */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search orders..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                sx={{ width: isMobile ? '100%' : 250 }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} displayEmpty>
                  <MenuItem value="all">All Status</MenuItem>
                  {Object.entries(statusConfig).map(([key, { label }]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button startIcon={<FilterListIcon />} variant="outlined" size="small">Filters</Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button startIcon={<RefreshIcon />} variant="outlined" size="small">Refresh</Button>
              <Button startIcon={<DownloadIcon />} variant="contained" size="small">Export</Button>
            </Box>
          </Box>

          {/* Data Grid */}
          <Box sx={{ height: 'calc(100% - 200px)' }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 25]}
              checkboxSelection
              disableRowSelectionOnClick
              getRowHeight={() => 'auto'}
              sx={{
                '& .MuiDataGrid-cell': { 
                  py: 2,
                  borderBottom: '1px solid #1f2937',
                },
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: '#1f2937',
                  minHeight: '56px !important',
                },
              }}
            />
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredRows.length} of {rows.length} orders
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button startIcon={<PrintIcon />} size="small">Print</Button>
              <Button startIcon={<ArchiveIcon />} size="small">Archive</Button>
              <Button startIcon={<DeleteIcon />} color="error" size="small">Delete</Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}