"use client"
import React, { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Category {
  id: string;
  title: string;
  description: string;
  image?: string;
}

interface ProductFormData {
  title: string;
  description: string;
  price: number;
  categories: string[];
  stock: number;
}

const EditProductPage = () => {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: 0,
    categories: [],
    stock: 0
  })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch product data and categories on component mount
  useEffect(() => {
    fetchProductData()
    fetchCategories()
  }, [productId])

  const fetchProductData = async () => {
    try {
      setInitialLoading(true)
      const res = await fetch(`/api/products/${productId}`)
      if (!res.ok) throw new Error('Failed to fetch product')
      
      const data = await res.json()
      if (data.success && data.product) {
        const product = data.product
        setFormData({
          title: product.title || '',
          description: product.description || '',
          price: product.price || 0,
          categories: product.categories?.map((cat: any) => cat.id) || [],
          stock: product.stock || 0
        })
        
        if (product.images && product.images.length > 0) {
          setExistingImages(product.images)
          setPreviewImages(product.images)
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      alert('Failed to load product data')
      router.push('/product_list')
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      
      const data = await res.json()
      if (data.success) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      alert('Failed to load categories')
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Title and description are required')
      return
    }
    
    if (formData.categories.length === 0) {
      alert('Please select at least one category')
      return
    }
    
    if (formData.price <= 0) {
      alert('Price must be greater than 0')
      return
    }
    
    if (formData.stock < 0) {
      alert('Stock cannot be negative')
      return
    }
    
    // Check if we have any images (existing or new)
    const totalImages = existingImages.length + imageFiles.length
    if (totalImages === 0) {
      alert('Please upload at least one product image')
      return
    }

    setLoading(true)

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title.trim())
      formDataToSend.append('description', formData.description.trim())
      formDataToSend.append('price', formData.price.toString())
      formDataToSend.append('stock', formData.stock.toString())
      
      // Append categories as JSON array
      formDataToSend.append('categories', JSON.stringify(formData.categories))
      
      // Append existing images as JSON array
      formDataToSend.append('existingImages', JSON.stringify(existingImages))
      
      // Append new image files
      imageFiles.forEach((file, index) => {
        formDataToSend.append(`images`, file)
      })

      // Send PUT request to update product
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        body: formDataToSend
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update product')
      }

      if (data.success) {
        alert('Product updated successfully!')
        router.push('/product_list')
      } else {
        alert(data.message || 'Failed to update product')
      }
    } catch (error: any) {
      console.error('Error updating product:', error)
      alert(error.message || 'Failed to update product')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [id]: id === 'price' || id === 'stock' ? parseFloat(value) || 0 : value
    }))
  }

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => {
      const isSelected = prev.categories.includes(categoryId)
      
      if (isSelected) {
        // Remove category from array
        return {
          ...prev,
          categories: prev.categories.filter(id => id !== categoryId)
        }
      } else {
        // Add category to array
        return {
          ...prev,
          categories: [...prev.categories, categoryId]
        }
      }
    })
  }

  const handleSelectAllCategories = () => {
    if (categories.length === 0) return
    
    if (formData.categories.length === categories.length) {
      // If all are selected, deselect all
      setFormData(prev => ({
        ...prev,
        categories: []
      }))
    } else {
      // Select all categories
      setFormData(prev => ({
        ...prev,
        categories: categories.map(cat => cat.id)
      }))
    }
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Filter only image files
    const validImageFiles = files.filter(file => file.type.startsWith('image/'))
    
    // Calculate remaining slots (max 10 total images)
    const totalCurrentImages = existingImages.length + previewImages.filter(img => 
      !existingImages.includes(img)
    ).length
    const remainingSlots = 10 - totalCurrentImages
    const filesToAdd = validImageFiles.slice(0, remainingSlots)
    
    if (filesToAdd.length === 0) {
      alert(`You can only upload up to 10 images total. ${totalCurrentImages}/10 already uploaded.`)
      return
    }

    // Create preview URLs
    const newPreviews: string[] = []
    const newFiles: File[] = []
    
    filesToAdd.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        newFiles.push(file)
        
        // Update state after all files are processed
        if (newPreviews.length === filesToAdd.length) {
          setPreviewImages(prev => [...prev, ...newPreviews])
          setImageFiles(prev => [...prev, ...newFiles])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = Array.from(e.dataTransfer.files || [])
    const validImageFiles = files.filter(file => file.type.startsWith('image/'))
    
    // Calculate remaining slots
    const totalCurrentImages = existingImages.length + previewImages.filter(img => 
      !existingImages.includes(img)
    ).length
    const remainingSlots = 10 - totalCurrentImages
    const filesToAdd = validImageFiles.slice(0, remainingSlots)
    
    if (filesToAdd.length === 0) {
      if (totalCurrentImages >= 10) {
        alert('You can only upload up to 10 images total')
      }
      return
    }

    const newPreviews: string[] = []
    const newFiles: File[] = []
    
    filesToAdd.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        newFiles.push(file)
        
        if (newPreviews.length === filesToAdd.length) {
          setPreviewImages(prev => [...prev, ...newPreviews])
          setImageFiles(prev => [...prev, ...newFiles])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const removeImage = (index: number) => {
    const imageToRemove = previewImages[index]
    
    // Check if it's an existing image or a new one
    if (existingImages.includes(imageToRemove)) {
      // Remove from existing images
      setExistingImages(prev => prev.filter(img => img !== imageToRemove))
    } else {
      // Remove from new image files
      const fileIndex = previewImages.slice(0, index).filter(img => 
        !existingImages.includes(img)
      ).length
      const newFiles = [...imageFiles]
      newFiles.splice(fileIndex, 1)
      setImageFiles(newFiles)
    }
    
    // Remove from preview images
    const newPreviews = [...previewImages]
    newPreviews.splice(index, 1)
    setPreviewImages(newPreviews)
  }

  const removeAllNewImages = () => {
    // Keep only existing images
    setPreviewImages(existingImages)
    setImageFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (initialLoading || loadingCategories) {
    return (
      <div className="category_post">
        <div className="upload_container">
          <div className="loading_container">
            <p>Loading product data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="category_post">
      <div className="upload_container">
        <h1 className="upload_title">Edit Product</h1>
        
        <form className="upload_form" onSubmit={handleSubmit}>
          {/* Title Input */}
          <div className="form_group">
            <label htmlFor="title" className="form_label">
              Product Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form_input"
              placeholder="Enter product title"
              required
              disabled={loading}
            />
          </div>

          {/* Description Input */}
          <div className="form_group">
            <label htmlFor="description" className="form_label">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form_textarea"
              placeholder="Enter product description"
              rows={4}
              required
              disabled={loading}
            />
          </div>

          {/* Price Input */}
          <div className="form_group">
            <label htmlFor="price" className="form_label">
              Price *
            </label>
            <input
              type="number"
              id="price"
              value={formData.price}
              onChange={handleInputChange}
              className="form_input"
              placeholder="Enter product price"
              min="0.01"
              step="0.01"
              required
              disabled={loading}
            />
          </div>

          {/* Stock Input */}
          <div className="form_group">
            <label htmlFor="stock" className="form_label">
              Stock Quantity *
            </label>
            <input
              type="number"
              id="stock"
              value={formData.stock}
              onChange={handleInputChange}
              className="form_input"
              placeholder="Enter stock quantity"
              min="0"
              required
              disabled={loading}
            />
          </div>

          {/* Category Selection as Checkboxes */}
          <div className="form_group">
            <label className="form_label">
              Categories *
              {categories.length === 0 && (
                <span className="text-sm text-red-500 ml-2">(No categories available)</span>
              )}
            </label>
            
            {categories.length > 0 ? (
              <>
                <div className="category_selection_header">
                  <div className="selected_count">
                    {formData.categories.length} of {categories.length} categories selected
                  </div>
                  <button
                    type="button"
                    className="select_all_btn"
                    onClick={handleSelectAllCategories}
                    disabled={loading}
                  >
                    {formData.categories.length === categories.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="category_selection">
                  {categories.map((category) => (
                    <div key={category.id} className="category_checkbox_item">
                      <input
                        type="checkbox"
                        id={`category-${category.id}`}
                        value={category.id}
                        checked={formData.categories.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="category_checkbox_input"
                        disabled={loading}
                      />
                      <label 
                        htmlFor={`category-${category.id}`} 
                        className="category_checkbox_label"
                      >
                        <span className="category_title">{category.title}</span>
                        {category.image && (
                          <img 
                            src={category.image} 
                            alt={category.title}
                            className="category_thumbnail"
                          />
                        )}
                        <div className="checkbox_indicator">
                          <svg 
                            className="check_icon" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={3} 
                              d="M5 13l4 4L19 7" 
                            />
                          </svg>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="no_categories">
                <p className="text-red-500">No categories available.</p>
              </div>
            )}
          </div>

          {/* Multiple Image Upload */}
          <div className="form_group">
            <label htmlFor="images" className="form_label">
              Product Images *
              <span className="image_count">
                ({previewImages.length}/10 total)
              </span>
            </label>
            
            <div className="image_note">
              <p>Existing images are shown below. You can add new images or remove existing ones.</p>
            </div>
            
            {/* Image Upload Area */}
            {previewImages.length < 10 && (
              <div 
                className="image_upload_container"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={triggerFileInput}
              >
                <input
                  type="file"
                  id="images"
                  ref={fileInputRef}
                  className="image_input"
                  accept="image/*"
                  onChange={handleImageChange}
                  multiple
                  disabled={loading}
                />
                
                <div className="image_upload_placeholder">
                  <svg 
                    className="upload_icon" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                  <div className="upload_text_content">
                    <p className="upload_main_text">
                      Click to upload or drag and drop
                    </p>
                    <p className="upload_sub_text">
                      Add new images (up to 10 total)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Image Preview Grid */}
            {previewImages.length > 0 && (
              <div className="image_preview_grid">
                {previewImages.map((preview, index) => (
                  <div key={index} className="image_preview_wrapper">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      className="image_preview"
                    />
                    <div className="image_preview_overlay">
                      <button 
                        type="button" 
                        className="remove_image_btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeImage(index)
                        }}
                        disabled={loading}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="image_index">
                      {index + 1}
                    </div>
                    {existingImages.includes(preview) && (
                      <div className="existing_image_badge">
                        Existing
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Add More Button if less than 10 images */}
                {previewImages.length < 10 && (
                  <div 
                    className="add_more_container"
                    onClick={triggerFileInput}
                  >
                    <svg 
                      className="add_icon" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                      />
                    </svg>
                    <span className="add_more_text">Add More</span>
                  </div>
                )}
              </div>
            )}

            {/* Image Info */}
            {imageFiles.length > 0 && (
              <div className="image_info">
                <div className="image_info_left">
                  <span className="image_count_text">
                    {existingImages.length} existing, {imageFiles.length} new image{imageFiles.length !== 1 ? 's' : ''}
                  </span>
                  <button 
                    type="button" 
                    className="remove_all_btn"
                    onClick={removeAllNewImages}
                    disabled={loading || imageFiles.length === 0}
                  >
                    Remove New Images
                  </button>
                </div>
                <div className="image_info_right">
                  <span className="total_size">
                    New: {(imageFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="form_actions">
            <button 
              type="button" 
              className="cancel_btn"
              onClick={() => router.push('/product_list')}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit_btn"
              disabled={loading || categories.length === 0}
            >
              {loading ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProductPage