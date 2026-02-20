import Link from 'next/link';
import React from 'react'
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { TfiHandPointDown } from "react-icons/tfi";

const Contact = () => {
  return (
    <div className='contact mt-[15rem]'>
        <div className="contact-container">
            <h1 className="theme-gradient">Euphoria Support</h1>
            <form action="" method="post">
                <div className="form_wrapp">
                    <div className='label'>
                        <h1>First Name:</h1>
                        <input type="text" />
                    </div>
                    <div className='label'>
                        <h1>Last Name:</h1>
                        <input type="text" />
                    </div>
                </div>
                <div className="form_wrapp">
                    <div className='label'>
                        <h1>Email:</h1>
                        <input type="text" />
                    </div>
                    <div className='label'>
                        <h1>Subject:</h1>
                        <input type="text" />
                    </div>
                </div>
                <div className="form_wrapp">
                    <div className='label'>
                        <h1>Description:</h1>
                        <textarea name="" id=""></textarea>
                    </div>
                </div>
                <button className='auth_btn'>
                    Submit
                </button>
            </form>
            <h1 className='flex w-full justify-center'>
                Or
            </h1>
            <div className="whatsapp">
                <span>
                    <h1>WhatsApp</h1>
                    <TfiHandPointDown className='hands' />
                </span>
                <Link href={'/'}>
                    <PiWhatsappLogoDuotone className='whatsapp_icon'/>
                </Link>
            </div>
         </div>
    </div>
  )
}

export default Contact