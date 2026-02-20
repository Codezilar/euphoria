"use client"

import React from 'react'
import Image from 'next/image'
import { FaXTwitter } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { FaDiscord } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer>
        <div className="footer-container">
            <div className="uppper-footer">
                <div className="upper-footer-content">
                    <div className="footer-top">
                        <Image src={'/logo.png'} height={50} width={50} alt="logo" />
                        <span className='theme-gradient'>Euphoria BLISS</span>
                    </div>
                    <p>
                        To empower and enhance your intimate 
                        well-being by providing access to premium, 
                        safe products, delivered with uncompromising 
                        discretion and supported by trustworthy information.
                    </p>
                </div>
                <div className="upper-footer-content">
                    <div className="footer-top">
                        <h4>Learn</h4>
                    </div>
                    <p>Blog</p>
                    <p>Pricing</p>
                    <p>About Us</p>
                </div>
                <div className="upper-footer-content">
                    <div className="footer-top">
                        <h4>Get started</h4>
                    </div>
                    <p>Create an account</p>
                    <p>Log In</p>
                    <p>Become a partner</p>
                    <p>Build your enterprise</p>
                </div>
                <div className="upper-footer-content">
                    <div className="footer-top">
                        <h4>Resources</h4>
                    </div>
                    <p>About</p>
                    <p>Careers</p>
                    <p>Contact support</p>
                    <p>Cookie perfomances</p>
                </div>
            </div>
            <div className="lower-footer">
                <ul>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Cookie Policy</a>
                    <a href="#">Terms & Condition</a>
                </ul>

                <div className="footer-socials">
                    <FaXTwitter />
                    <FaInstagram />
                    <FaFacebook />
                    <FaDiscord />
                </div>
            </div>
        </div>
    </footer>
  )
}

export default Footer