
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="w-full h-3 bg-bakery-brown" />
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      {/* Back to top button */}
      <a 
        href="#" 
        className="fixed bottom-8 right-8 bg-bakery-brown/90 hover:bg-bakery-light text-white p-3 rounded-full shadow-lg transition-colors duration-300"
        aria-label="Back to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </a>
    </div>
  );
};

export default Layout;
