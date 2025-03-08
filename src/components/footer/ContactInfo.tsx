
import React from 'react';
import { Mail } from "lucide-react";

const ContactInfo = () => {
  return (
    <div className="flex items-center gap-2 text-gray-400 my-2">
      <Mail className="h-4 w-4" />
      <span>Contact Us: </span>
      <a 
        href="mailto:contact@lewte.com" 
        className="hover:text-white transition-colors"
      >
        contact@lewte.com
      </a>
    </div>
  );
};

export default ContactInfo;
