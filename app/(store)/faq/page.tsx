"use client"
import React, { useState } from 'react'
import { FaPlus } from "react-icons/fa";

const page = () => {
  const [openItems, setOpenItems] = useState<number | null>(null);
  
  const faqToggle = (index: number) => {
    setOpenItems(openItems === index ? null : index);
  }

  const faqs = [
    {
      question: "What payment methods do you accept?",
      answer: "We accept various payment methods including credit cards, PayPal, and other popular online payment options."
    }
  ];

  return (
    <div className='flex items-center justify-center w-full mt-32'>
      <div className="w-full p-4 max-w-225">
        <div className="theme-gradient text-center bg-black">
          Frequently Asked Questions
        </div>
        <div className="text-center mt-4 text-gray-400">
          Here are some of our FAQs. If you have any other questions you'd like answered please feel free to email us.
        </div>
        <div className="mt-8 relative w-full">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg mb-4 z-10 cursor-pointer w-full absolute" onClick={() => faqToggle(index)}>
              <span className='flex items-center justify-between' >
                <h3 className="text-lg font-semibold">{faq.question}</h3>
                <button className={`text-2xl transform transition-transform duration-300 ${openItems === index ? 'rotate-45' : ''}`}>
                  <FaPlus />
                </button>
              </span>
              <p className={`text-gray-400 mt-2 ${openItems === index ? "block" : "hidden"}`}>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default page