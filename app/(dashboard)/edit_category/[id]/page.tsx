"use client"
import React, { useState, useRef, ChangeEvent, useEffect, FormEvent } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Category {
  id: string;
  title: string;
  description: string;
  image?: string;
}

const EditCategoryPage = () => {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string
  
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [existingImage, setExistingImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch category data on component mount
  useEffect(() => {
    fetchCategoryData()
  }, [categoryId])

  const fetchCategoryData = async () => {
    try {
      setInitialLoading(true)
      const res = await fetch(`/api/categories/${categoryId}`)
      if (!res.ok) throw new Error('Failed to fetch category')
      
      const data = await res.json()
      if (data.success && data.category) {
        const category = data.category
        setFormData({
          title: category.title,
          description: category.description
        })
        if (category.image) {
          setExistingImage(category.image)
          setPreviewImage(category.image)
        }
      }
    } catch (error) {
      console.error('Error fetching category:', error)
      alert('Failed to load category data')
      router.push('/category_list')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Title and description are required')
      return
    }

    // If no existing image and no new image selected
    if (!existingImage && !imageFile) {
      alert('Please select an image for the category')
      return
    }

    setLoading(true)

    try {
      // Prepare form data for upload (using FormData for Cloudinary)
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title.trim())
      formDataToSend.append('description', formData.description.trim())
      
      // Only append image if a new one was selected
      if (imageFile) {
        formDataToSend.append('image', imageFile)
      } else if (existingImage) {
        // If no new image but existing image exists, send a flag or empty file?
        // For Cloudinary, we need to handle this in the API
        // We'll send a small dummy file to indicate no new image
        const dummyBlob = new Blob([''], { type: 'text/plain' })
        formDataToSend.append('image', dummyBlob, 'keep-existing.txt')
      }

      // Send the PUT request
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        body: formDataToSend
        // Note: Don't set Content-Type header for FormData
        // Browser will set it automatically with multipart/form-data
      })

      // Parse response
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Failed to update category: ${response.status}`)
      }

      if (data.success) {
        alert('Category updated successfully!')
        router.push('/category_list')
      } else {
        alert(data.message || 'Failed to update category')
      }
    } catch (error: any) {
      console.error('Error updating category:', error)
      alert(error.message || 'Failed to update category')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const removeImage = () => {
    setPreviewImage(null)
    setImageFile(null)
    setExistingImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (initialLoading) {
    return (
      <div className="category_post">
        <div className="upload_container">
          <div className="loading_container">
            <p>Loading category data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="category_post">
      <div className="upload_container">
        <h1 className="upload_title">Edit Category</h1>
        
        <form className="upload_form" onSubmit={handleSubmit}>
          {/* Title Input */}
          <div className="form_group">
            <label htmlFor="title" className="form_label">
              Category Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form_input"
              placeholder="Enter category title"
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
              placeholder="Enter category description"
              rows={4}
              required
              disabled={loading}
            />
          </div>

          {/* Image Upload - Note: Image upload would need separate handling */}
          <div className="form_group">
            <label htmlFor="image" className="form_label">
              Category Image {existingImage ? '(Optional)' : '*'}
            </label>
            <div 
              className="image_upload_container"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <input
                type="file"
                id="image"
                ref={fileInputRef}
                className="image_input"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
              />
              
              {previewImage ? (
                <div className="image_preview_wrapper">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="image_preview"
                  />
                  <div className="image_preview_overlay">
                    <button 
                      type="button" 
                      className="change_image_btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        triggerFileInput()
                      }}
                      disabled={loading}
                    >
                      Change Image
                    </button>
                    <button 
                      type="button" 
                      className="remove_image_btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage()
                      }}
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
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
                      SVG, PNG, JPG or GIF (MAX. 5MB)
                    </p>
                    {existingImage && (
                      <p className="upload_note">
                        Note: To update image, please use a separate image update feature
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Image info */}
            {imageFile && (
              <div className="image_info">
                <span className="image_name">{imageFile.name}</span>
                <span className="image_size">
                  {(imageFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
                <p className="image_warning">Note: Image upload requires separate implementation</p>
              </div>
            )}
            
            {existingImage && !imageFile && (
              <div className="image_info">
                <span className="image_name">Current image will be preserved</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="form_actions">
            <button 
              type="button" 
              className="cancel_btn"
              onClick={() => router.push('/category_list')}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit_btn"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditCategoryPage