"use client"

// components/Header.tsx
import Image from 'next/image';
// import Link from 'next/link';
import { FC } from 'react';

// interface NavItemProps {
//   href: string;
//   text: string;
// }

// const NavItem: FC<NavItemProps> = ({ href, text }) => (
//   <Link 
//     href={href} 
//     className="px-4 py-2 text-white hover:text-yellow-400 transition-colors duration-200"
//   >
//     {text}
//   </Link>
// );

const Header: FC = () => {
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="bg-black py-4 px-6 flex items-center justify-between">
      {/* Logo Section */}
      <div className="flex items-center">
        <div className="relative w-10 h-10 mr-2">
          <Image
            src="/icon.png"
            alt="Polydoge Logo"
            fill
            className="rounded-full"
          />
        </div>
        <span className="text-white font-bold text-xl">PolyDoge</span>
      </div>

      {/* Navigation Menu */}
      <nav className="hidden md:flex items-center space-x-2">
        {/* <NavItem href="/" text="So Home" />
        <NavItem href="/about" text="What is Dogecoin?" />
        <NavItem href="/wallets" text="Much Wallets" />
        <NavItem href="/community" text="Very Community" /> */}
        
        {/* Dogepedia Dropdown */}
        {/* <div className="relative">
          <button
            className="px-4 py-2 text-white hover:text-yellow-400 transition-colors duration-200"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            So Dogepedia
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full left-0 bg-black border border-gray-700 rounded-md py-2 min-w-[200px]">
              <Link 
                href="/guides" 
                className="block px-4 py-2 text-white hover:text-yellow-400 transition-colors duration-200"
              >
                Much Guides
              </Link>
              <Link 
                href="/resources" 
                className="block px-4 py-2 text-white hover:text-yellow-400 transition-colors duration-200"
              >
                Very Resources
              </Link>
            </div>
          )}
        </div> */}
      </nav>

      {/* Right Side Icons */}
      {/* <div className="flex items-center space-x-4">
        <button className="text-white hover:text-yellow-400 transition-colors duration-200">
          <FaTshirt size={24} />
        </button>
        <button className="text-white hover:text-yellow-400 transition-colors duration-200">
          <IoMdMoon size={24} />
        </button>
        <div className="flex items-center space-x-2">
          <GB className="w-6 h-4" />
          <span className="text-white">EN</span>
        </div>
      </div> */}

      {/* Mobile Menu Button */}
      <button className="md:hidden text-white">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </header>
  );
};

export default Header;