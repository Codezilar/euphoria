import CategoriesList from '@/components/CategoriesList'
import React from 'react'

const CategoryPage = () => {
  return (
    <div className="category_post">
      <div className="upload_container">
        <h1 className="upload_title">Categories Management</h1>
        <CategoriesList />
      </div>
    </div>
  )
}

export default CategoryPage