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
import Link from 'next/link';

interface Category {
  id: string;
  title: string;
  description: string;
  img?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function CategoriesList() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [rows, setRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setRows(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete category');
      }

      if (data.success) {
        // Update local state
        setRows(prev => prev.filter(row => row.id !== id));
        
        // Remove from selected rows if it was selected
        setSelectedRows(prev => prev.filter(rowId => rowId !== id));
        
        alert('Category deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete category');
      }
    } catch (error: any) {
      console.error('Error deleting category:', error);
      alert(error.message || 'Failed to delete category');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      alert('Please select items to delete');
      return;
    }
    
    if (!window.confirm(`Delete ${selectedRows.length} selected items?`)) {
      return;
    }

    try {
      // You can either delete one by one or implement a bulk delete endpoint
      // For now, we'll delete sequentially
      const deletePromises = selectedRows.map(async (id) => {
        const response = await fetch(`/api/categories/${id}`, {
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
            console.error(`Failed to delete category ${id}`);
          }
        } else {
          errorCount++;
          console.error(`Failed to delete category ${selectedRows[index]}`);
        }
      });

      // Refresh the list
      await fetchCategories();
      
      // Clear selection
      setSelectedRows([]);
      
      if (errorCount > 0) {
        alert(`${successCount} categories deleted successfully, ${errorCount} failed.`);
      } else {
        alert(`${successCount} categories deleted successfully!`);
      }
    } catch (error: any) {
      console.error('Error during bulk delete:', error);
      alert('Error during bulk delete operation');
    }
  };

  const columns = useMemo<GridColDef[]>(() => [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 250,
    },
    { 
      field: 'title', 
      headerName: 'Title', 
      width: 250,
      editable: true,
    },
    { 
      field: 'description', 
      headerName: 'Description', 
      width: 400,
      editable: true,
    },
    {
      field: 'img',
      headerName: 'Thumbnail',
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const value = params.value;
        if (!value) {
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
            src={value}
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
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <Link href={'/edit_category/' + params.id} key="edit-link" style={{ textDecoration: 'none' }}>
          <GridActionsCellItem
            icon={
              <Tooltip title="Edit">
                <FaRegEdit />
              </Tooltip>
            }
            label="Edit"
            onClick={(e) => {
              e.stopPropagation(); // Prevent row selection
              // The Link component will handle navigation
            }}
          />
        </Link>,
        <GridActionsCellItem
          key="delete"
          icon={
            <Tooltip title="Delete">
              <RiDeleteBin5Fill style={{ color: '#d32f2f' }} />
            </Tooltip>
          }
          label="Delete"
          onClick={(e) => {
            e.stopPropagation(); // Prevent row selection
            handleDeleteClick(params.id as string);
          }}
        />,
      ],
    },
  ], []);

  const processRowUpdate = async (newRow: any) => {
    try {
      // Send update to API
      const response = await fetch(`/api/categories/${newRow.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newRow.title,
          description: newRow.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update category');
      }

      // Update local state
      setRows(prev => prev.map(row => row.id === newRow.id ? newRow : row));
      return newRow;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error; // This will trigger onProcessRowUpdateError
    }
  };

  return (
    <Paper sx={{ height: "100vh", width: '100%', p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Category Management
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Manage your categories
          {selectedRows.length > 0 && (
            <Box component="span" sx={{ ml: 2, fontWeight: 'bold' }}>
              ({selectedRows.length} selected)
            </Box>
          )}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            variant="contained"
            onClick={() => window.location.href = '/category_post'}
            size="small"
          >
            Add New Category
          </Button>
          
          {selectedRows.length > 0 && (
            <>
              <Button
                variant="outlined"
                color="error"
                startIcon={<RiDeleteBin5Fill />}
                onClick={handleBulkDelete}
                size="small"
              >
                Delete Selected ({selectedRows.length})
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Box sx={{ height: 'calc(100vh - 200px)' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          disableRowSelectionOnClick
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={(error) => {
            console.error('Row update error:', error);
            alert('Failed to update category. Please try again.');
          }}
          slots={{
            toolbar: GridToolbar,
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
          sx={{ 
            border: 0,
            '& .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },
          }}
        />
      </Box>
    </Paper>
  );
}