"use client"
import { useRouter } from 'next/navigation';
import React, { useState, useRef, ChangeEvent } from 'react'

const CategoryUploadPage = () => {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Simplified state - only title and description
  const [category, setCategory] = useState({
    title: '',
    description: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCategory((prevCategory) => ({
      ...prevCategory,
      [name]: value
    }))
  }

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!category.title.trim() || !category.description.trim()) {
      setError('Title and description are required');
      setIsSubmitting(false);
      return;
    }

    if (!imageFile) {
      setError('Please select an image');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', category.title.trim());
      formData.append('description', category.description.trim());
      formData.append('image', imageFile);

      const response = await fetch('/api/category_post', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to create category: ${response.status}`);
      }

      setSuccessMessage('Category created successfully!');
      setIsSuccess(true);
      
      // Reset form
      setCategory({ title: '', description: '' });
      setPreviewImage(null);
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setTimeout(() => {        
        router.push('/category_list');
      }, 2000);

    } catch (error: any) {
      console.error('Error creating category:', error);
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Invalid file type. Please upload an image (JPEG, PNG, GIF, SVG, WEBP)');
        return;
      }

      setImageFile(file)
      setError(null); // Clear any previous errors
      
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
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      setImageFile(file)
      setError(null);
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    if (!isSubmitting) {
      fileInputRef.current?.click()
    }
  }

  const removeImage = () => {
    if (!isSubmitting) {
      setPreviewImage(null)
      setImageFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="category_post">
      <div className="upload_container">
        <h1 className="upload_title">Upload New Category</h1>
        
        {/* Success Message */}
        {successMessage && (
          <div className="alert alert-success">
            <span>✓</span> {successMessage}
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            <span>!</span> {error}
          </div>
        )}

        <form className="upload_form" onSubmit={createCategory}>
          {/* Title Input */}
          <div className="form_group">
            <label htmlFor="title" className="form_label">
              Category Title *
            </label>
            <input
              type="text"
              id="title"
              className="form_input"
              placeholder="Enter category title"
              name='title'
              onChange={handleInputChange}
              value={category.title}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Description Input */}
          <div className="form_group">
            <label htmlFor="description" className="form_label">
              Description *
            </label>
            <textarea
              id="description"
              className="form_textarea"
              placeholder="Enter category description"
              rows={4}
              name='description'
              onChange={handleInputChange}
              value={category.description}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Image Upload */}
          <div className="form_group">
            <label htmlFor="image" className="form_label">
              Category Image *
            </label>
            <div 
              className={`image_upload_container ${isSubmitting ? 'disabled' : ''}`}
              onDragOver={handleDragOver}
              onDrop={isSubmitting ? undefined : handleDrop}
              onClick={isSubmitting ? undefined : triggerFileInput}
              style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            >
              <input
                type="file"
                id="image"
                ref={fileInputRef}
                className="image_input"
                accept="image/*"
                onChange={handleImageChange}
                required={!previewImage}
                disabled={isSubmitting}
              />
              
              {previewImage ? (
                <div className="image_preview_wrapper">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="image_preview"
                  />
                  {!isSubmitting && (
                    <div className="image_preview_overlay">
                      <button 
                        type="button" 
                        className="change_image_btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          triggerFileInput()
                        }}
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
                      >
                        Remove
                      </button>
                    </div>
                  )}
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
                      {isSubmitting ? 'Uploading...' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="upload_sub_text">
                      SVG, PNG, JPG, GIF or WEBP (MAX. 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="form_actions">
            <button 
              type="submit" 
              className="submit_btn" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Uploading...
                </>
              ) : 'Upload Category'}
            </button>
            
            <button 
              type="button" 
              className="cancel_btn"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CategoryUploadPage