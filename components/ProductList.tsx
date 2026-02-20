"use client";
import { useState, useMemo, useEffect } from 'react';
import { 
  DataGrid, 
  GridColDef,
  GridActionsCellItem,
  GridToolbar,
} from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  title: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  categories: Category[];
  stock: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProductsList() {
  const router = useRouter();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products...');
      
      // Fetch products with populated categories
      const res = await fetch('/api/products?populate=categories', { 
        cache: 'no-store' 
      });
      
      console.log('Response status:', res.status);
      
      const data = await res.json();
      console.log('API Response:', data);
      
      if (data.success && data.products) {
        console.log('Number of products:', data.products.length);
        console.log('First product sample:', data.products[0]);
        
        // Transform data to ensure proper structure
        const formattedProducts = data.products.map((product: any) => ({
          id: product.id || product._id,
          title: product.title || '',
          description: product.description || '',
          price: product.price || 0,
          images: product.images || [],
          categories: product.categories || [],
          stock: product.stock || 0,
          isActive: product.isActive !== undefined ? product.isActive : true,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }));
        
        console.log('Formatted products:', formattedProducts);
        setRows(formattedProducts);
      } else {
        console.error('API error:', data.message);
        setRows([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete product');
      }

      if (data.success) {
        // Update local state
        setRows(prev => prev.filter(row => row.id !== id));
        
        // Remove from selected rows if it was selected
        setSelectedRows(prev => prev.filter(rowId => rowId !== id));
        
        alert('Product deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete product');
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert(error.message || 'Failed to delete product');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      alert('Please select items to delete');
      return;
    }
    
    if (!window.confirm(`Delete ${selectedRows.length} selected products?`)) {
      return;
    }

    try {
      const deletePromises = selectedRows.map(async (id) => {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });
        return { id, response };
      });

      const results = await Promise.allSettled(deletePromises);
      
      let successCount = 0;
      let errorCount = 0;

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const { id, response } = result.value;
          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Failed to delete product ${id}`);
          }
        } else {
          errorCount++;
          console.error(`Failed to delete product ${selectedRows[index]}`);
        }
      });

      // Refresh the list
      await fetchProducts();
      
      // Clear selection
      setSelectedRows([]);
      
      if (errorCount > 0) {
        alert(`${successCount} products deleted successfully, ${errorCount} failed.`);
      } else {
        alert(`${successCount} products deleted successfully!`);
      }
    } catch (error: any) {
      console.error('Error during bulk delete:', error);
      alert('Error during bulk delete operation');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update product status');
      }

      if (data.success) {
        // Update local state
        setRows(prev => prev.map(row => 
          row.id === id ? { ...row, isActive: !currentStatus } : row
        ));
        alert(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      } else {
        alert(data.message || 'Failed to update product status');
      }
    } catch (error: any) {
      console.error('Error updating product status:', error);
      alert(error.message || 'Failed to update product status');
    }
  };

  const columns = useMemo<GridColDef[]>(() => [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 250,
      renderCell: (params) => (
        <Box sx={{ 
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          color: 'grey.600',
          wordBreak: 'break-all'
        }}>
          {params.value}
        </Box>
      ),
    },
    { 
      field: 'title', 
      headerName: 'Title', 
      width: 200,
      renderCell: (params) => (
        <Box sx={{ 
          fontWeight: 'medium',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'thumbnail',
      headerName: 'Thumbnail',
      width: 100,
      sortable: false,
      renderCell: (params) => {
        const images = params.row.images || [];
        const firstImage = images[0];
        
        if (!firstImage) {
          return (
            <Box
              sx={{
                width: 50,
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.100',
                borderRadius: 1,
                color: 'grey.600',
                fontSize: '0.75rem',
              }}
            >
              No Image
            </Box>
          );
        }
        
        return (
          <Box
            component="img"
            src={firstImage}
            alt="Thumbnail"
            sx={{
              width: 50,
              height: 50,
              objectFit: 'cover',
              borderRadius: 1,
            }}
          />
        );
      },
    },
    { 
      field: 'price', 
      headerName: 'Price', 
      width: 100,
      type: 'number',
      renderCell: (params) => (
        <Box sx={{ fontWeight: 'bold' }}>
          ${params.value?.toFixed(2) || '0.00'}
        </Box>
      ),
    },
    { 
      field: 'stock', 
      headerName: 'Stock', 
      width: 80,
      type: 'number',
      renderCell: (params) => (
        <Box sx={{ 
          color: params.value > 0 ? 'success.main' : 'error.main',
          fontWeight: params.value > 0 ? 'normal' : 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%'
        }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'categories',
      headerName: 'Categories',
      width: 200, // Increased width for better display
      renderCell: (params) => {
        const categories = params.row.categories || [];
        
        if (categories.length === 0) {
          return (
            <Box sx={{ 
              fontSize: '0.75rem', 
              color: 'grey.500', 
              fontStyle: 'italic',
              width: '100%',
              textAlign: 'center'
            }}>
              No categories
            </Box>
          );
        }
        
        return (
          <Box sx={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
            width: '100%',
            maxHeight: '60px',
            overflowY: 'auto',
            padding: '2px',
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '2px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '2px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            }
          }}>
            {categories.map((cat: Category, index: number) => (
              <Box 
                key={cat.id || index}
                sx={{ 
                  fontSize: '0.7rem',
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  px: 0.75,
                  py: 0.125,
                  borderRadius: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1.2,
                  cursor: 'default',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    transform: 'scale(1.02)',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }
                }}
                title={cat.title}
              >
                {cat.title}
              </Box>
            ))}
          </Box>
        );
      },
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
            py: 0.5,
            borderRadius: 10,
            bgcolor: params.value ? 'success.light' : 'error.light',
            color: params.value ? 'success.dark' : 'error.dark',
            fontSize: '0.75rem',
            fontWeight: 500,
            cursor: 'pointer',
            width: '100%',
            '&:hover': {
              opacity: 0.8,
              transform: 'scale(1.05)',
              transition: 'all 0.2s ease',
            },
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleToggleStatus(params.row.id, params.value);
          }}
        >
          {params.value ? 'Active' : 'Inactive'}
        </Box>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      cellClassName: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={
            <Tooltip title="Edit" arrow>
              <Box sx={{ 
                color: 'primary.main',
                '&:hover': { color: 'primary.dark' }
              }}>
                <FaRegEdit />
              </Box>
            </Tooltip>
          }
          label="Edit"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/edit_post/${params.id}`);
          }}
          showInMenu={false}
        />,
        <GridActionsCellItem
          key="delete"
          icon={
            <Tooltip title="Delete" arrow>
              <Box sx={{ 
                color: 'error.main',
                '&:hover': { color: 'error.dark' }
              }}>
                <RiDeleteBin5Fill />
              </Box>
            </Tooltip>
          }
          label="Delete"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(params.id as string);
          }}
          showInMenu={false}
        />,
      ],
    },
  ], []);

  return (
    <Paper sx={{ 
      height: "100vh", 
      width: '100%', 
      p: 3,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ mb: 3, flexShrink: 0 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Product Management
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Manage your products
          {selectedRows.length > 0 && (
            <Box component="span" sx={{ ml: 2, fontWeight: 'bold' }}>
              ({selectedRows.length} selected)
            </Box>
          )}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            variant="contained"
            onClick={() => router.push('/product_upload')}
            size="small"
            startIcon={<span>+</span>}
          >
            Add New Product
          </Button>
          
          {selectedRows.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<RiDeleteBin5Fill />}
              onClick={handleBulkDelete}
              size="small"
            >
              Delete Selected ({selectedRows.length})
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ 
        height: 'calc(100vh - 200px)', 
        flexGrow: 1,
        minHeight: 0 // Important for flex child scrolling
      }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              sx: {
                p: 1,
                borderBottom: 1,
                borderColor: 'divider'
              }
            },
          }}
          sx={{ 
            border: 0,
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              '&:focus': {
                outline: 'none',
              },
              '&:focus-within': {
                outline: 'none',
              },
            },
            '& .MuiDataGrid-columnHeader': {
              '&:focus': {
                outline: 'none',
              },
              '&:focus-within': {
                outline: 'none',
              },
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            },
            // Fix for category cell
            '& .MuiDataGrid-cell[data-field="categories"]': {
              alignItems: 'flex-start',
              paddingTop: '4px',
              paddingBottom: '4px',
            },
            // Fix for action buttons alignment
            '& .MuiDataGrid-cell[data-field="actions"]': {
              justifyContent: 'center',
            },
          }}
        />
      </Box>
    </Paper>
  );
}