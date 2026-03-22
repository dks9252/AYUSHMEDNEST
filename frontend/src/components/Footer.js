import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#1A2F23] text-white pt-16 pb-8" data-testid="main-footer">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>AYUSHMEDNEST</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              India's leading AYUSH healthcare marketplace. Discover authentic medicines, consult certified doctors, and embrace natural healing.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-[#D4A373] transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-[#D4A373] transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="hover:text-[#D4A373] transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="hover:text-[#D4A373] transition-colors"><Youtube className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Quick Links</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link to="/products" className="hover:text-[#D4A373] transition-colors">Browse Products</Link></li>
              <li><a href="https://consult.ayushmednest.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A373] transition-colors">Find Doctors</a></li>
              <li><a href="https://consult.ayushmednest.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A373] transition-colors">Online Consultation</a></li>
              <li><Link to="/affiliate/register" className="hover:text-[#D4A373] transition-colors">Become Affiliate</Link></li>
              <li><Link to="/vendor/register" className="hover:text-[#D4A373] transition-colors">Sell With Us</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Customer Support</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link to="/" className="hover:text-[#D4A373] transition-colors">Help Center</Link></li>
              <li><Link to="/" className="hover:text-[#D4A373] transition-colors">Track Order</Link></li>
              <li><Link to="/" className="hover:text-[#D4A373] transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/" className="hover:text-[#D4A373] transition-colors">Shipping Info</Link></li>
              <li><Link to="/" className="hover:text-[#D4A373] transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Contact Us</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start space-x-2">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>support@ayushmednest.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>+91 1800-XXX-XXXX</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>New Delhi, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-700 text-center text-sm text-slate-400">
          <p>&copy; 2026 AYUSHMEDNEST. All rights reserved. | Powered by Natural Healing</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
