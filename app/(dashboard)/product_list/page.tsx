
import ProductList from '@/components/ProductList'
import React from 'react'

const page = () => {
  return (
    <div className="category_post">
      <div className="upload_container">
        <h1 className="upload_title">Product List</h1>
        <ProductList />
      </div>
    </div>
  )
}

export default page