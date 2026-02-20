import Image from 'next/image'
import React from 'react'

const Hero = () => {
  return (
    <div className='hero'>
      <div className="hero_container">
        <Image src={"/logo.png"} height={100} width={100} alt='logo' />
        <span className='theme-gradient'>
          Euphoria BLISS
        </span>
        <h1>
          Discover Your BLISS Discreetly!
        </h1>
        <p>
          To empower and enhance your intimate 
          well-being by providing access to premium, 
          safe products, delivered with uncompromising 
          discretion and supported by trustworthy information.
        </p>
        <div className="user-area">
          <p>30,000+ People Choose Euphoria</p>
          <div className="avatar-container">
            <div className="avatar">
              <Image className='img' src={'/char1.jpg'} alt='k' height={60} width={60} />
            </div>
            <div className="avatar avatar1 ava-color1">
              <Image className='img' src={'/char2.jpeg'} alt='k' height={60} width={60} />
            </div>
            <div className="avatar avatar1 ava-color2">
              <Image className='img' src={'/char3.webp'} alt='k' height={60} width={60} />
            </div>
            <div className="avatar avatar1 ava-color3">
              <Image className='img' src={'/char4.jpg'} alt='k' height={90} width={90} />
            </div>
            <div className="avatar avatar1 ava-color4">
              <Image className='img' src={'/char5.jpeg'} alt='k' height={60} width={60} />
            </div>
            <div className="avatar avatar1 ava-color5">
              <Image className='img' src={'/char6.jpeg'} alt='k' height={60} width={60} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero