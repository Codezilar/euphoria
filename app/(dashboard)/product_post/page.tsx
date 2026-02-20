"use client"
import React, { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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
  categories: string[]; // Changed from single category to array
  stock: number;
}

const ProductUploadPage = () => {
  const router = useRouter()
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: 0,
    categories: [], // Initialize as empty array
    stock: 0
  })
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [])

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
    
    if (imageFiles.length === 0) {
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
      
      // Append all image files
      imageFiles.forEach((file, index) => {
        formDataToSend.append(`images`, file)
      })

      // Send POST request to create product
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formDataToSend
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create product')
      }

      if (data.success) {
        alert('Product created successfully!')
        router.push('/product_list') // Redirect to products list
      } else {
        alert(data.message || 'Failed to create product')
      }
    } catch (error: any) {
      console.error('Error creating product:', error)
      alert(error.message || 'Failed to create product')
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
    
    // Calculate remaining slots (max 10)
    const remainingSlots = 10 - previewImages.length
    const filesToAdd = validImageFiles.slice(0, remainingSlots)
    
    if (filesToAdd.length === 0) {
      alert(`You can only upload up to 10 images. ${previewImages.length}/10 already uploaded.`)
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
    
    // Calculate remaining slots (max 10)
    const remainingSlots = 10 - previewImages.length
    const filesToAdd = validImageFiles.slice(0, remainingSlots)
    
    if (filesToAdd.length === 0) {
      if (previewImages.length >= 10) {
        alert('You can only upload up to 10 images')
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
          const updatedPreviews = [...previewImages, ...newPreviews]
          const updatedFiles = [...imageFiles, ...newFiles]
          
          setPreviewImages(updatedPreviews)
          setImageFiles(updatedFiles)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const removeImage = (index: number) => {
    const newPreviews = [...previewImages]
    const newFiles = [...imageFiles]
    
    newPreviews.splice(index, 1)
    newFiles.splice(index, 1)
    
    setPreviewImages(newPreviews)
    setImageFiles(newFiles)
  }

  const removeAllImages = () => {
    setPreviewImages([])
    setImageFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (loadingCategories) {
    return (
      <div className="category_post">
        <div className="upload_container">
          <div className="loading_container">
            <p>Loading categories...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="category_post">
      <div className="upload_container">
        <h1 className="upload_title">Upload New Product</h1>
        
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
                <span className="text-sm text-red-500 ml-2">(No categories available. Please create categories first)</span>
              )}
            </label>
            
            {loadingCategories ? (
              <div className="loading_categories">
                <p>Loading categories...</p>
              </div>
            ) : categories.length > 0 ? (
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
                <p className="text-red-500">No categories available. Please create categories first.</p>
                <button
                  type="button"
                  className="create_category_btn"
                  onClick={() => router.push('/category_post')}
                >
                  Create Category
                </button>
              </div>
            )}
          </div>

          {/* Multiple Image Upload */}
          <div className="form_group">
            <label htmlFor="images" className="form_label">
              Product Images *
              {previewImages.length > 0 && (
                <span className="image_count">
                  ({previewImages.length}/10 selected)
                </span>
              )}
            </label>
            
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
                  required={previewImages.length === 0}
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
                      You can upload up to 10 images
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
                    {imageFiles.length} image{imageFiles.length !== 1 ? 's' : ''} selected
                  </span>
                  <button 
                    type="button" 
                    className="remove_all_btn"
                    onClick={removeAllImages}
                    disabled={loading}
                  >
                    Remove All
                  </button>
                </div>
                <div className="image_info_right">
                  <span className="total_size">
                    Total: {(imageFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024)).toFixed(2)} MB
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
              {loading ? 'Uploading...' : 'Upload Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductUploadPage