import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 md:px-6 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center" onClick={closeMenu}>
            <img 
              src="/lovable-uploads/0eda8371-7361-4abe-8b6f-877094b410d2.png" 
              alt="Ji'licious Treats Logo" 
              className="h-12 md:h-16" 
            />
            <span className="ml-2 text-bakery-brown font-['FeelingPassionate'] font-bold text-2xl md:text-3xl hidden sm:inline">
              Ji 'licious Treats
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`font-['LovelyBakery'] text-lg transition-colors duration-200 ${
                  isActive(link.path) 
                    ? 'text-bakery-brown border-b-2 border-bakery-gold' 
                    : 'text-gray-600 hover:text-bakery-brown hover:border-b-2 hover:border-bakery-light'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={`font-['LovelyBakery'] text-lg transition-colors duration-200 ${
                    location.pathname.startsWith('/order') 
                      ? 'text-bakery-brown border-b-2 border-bakery-gold' 
                      : 'text-gray-600 hover:text-bakery-brown hover:border-b-2 hover:border-bakery-light'
                  }`}
                >
                  Order <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/order">Regular Order</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/bulk-order">Bulk Order</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              asChild 
              className="bg-bakery-brown hover:bg-bakery-light text-white"
            >
              <Link to="/order">Pre-Order Now</Link>
            </Button>
          </div>

          {/* Mobile Navigation Button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-3 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block py-2 font-medium ${
                  isActive(link.path) 
                    ? 'text-bakery-brown' 
                    : 'text-gray-600 hover:text-bakery-brown'
                }`}
                onClick={closeMenu}
              >
                {link.name}
              </Link>
            ))}
            <div className="py-2">
              <div className="font-medium text-bakery-brown mb-2">Order</div>
              <div className="pl-4 space-y-2">
                <Link
                  to="/order"
                  className="block py-2 text-gray-600 hover:text-bakery-brown"
                  onClick={closeMenu}
                >
                  Regular Order
                </Link>
                <Link
                  to="/bulk-order"
                  className="block py-2 text-gray-600 hover:text-bakery-brown"
                  onClick={closeMenu}
                >
                  Bulk Order
                </Link>
              </div>
            </div>
            <Button 
              asChild 
              className="bg-bakery-brown hover:bg-bakery-light text-white w-full"
            >
              <Link to="/order" onClick={closeMenu}>Pre-Order Now</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
