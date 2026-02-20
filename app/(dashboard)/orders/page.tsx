import Order from '@/components/Order'
import React from 'react'

const page = () => {
  return (
    
    <div className="category_post">
      <div className="upload_container">
        <h1 className="upload_title">Orders</h1>
        <Order />
      </div>
    </div>
  )
}

export default page