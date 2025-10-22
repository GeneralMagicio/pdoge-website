"use client"

// components/Header.tsx
import Image from 'next/image';
// import Link from 'next/link';
import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [query, setQuery] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = query.trim();
    if (!value) return;
    router.push(`/ai?q=${encodeURIComponent(value)}`);
  };

  return (
    <header className="flex items-center relative bg-black h-[75px]">
      <div className="absolute left-4 w-[25%] items-center justify-between">
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
          <a target='_blank' href='/ai'>
            <button className='ml-8 bg-primary p-2 text-white rounded-md font-bold hover:bg-purple-600'> AI Model </button>
          </a>
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

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Global Search */}
      <div className="w-full">
        <form onSubmit={onSubmit} className="relative max-w-xl mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Paste in a token address or any link"
            aria-label="Enter token address or link"
            className="w-full rounded-lg border border-gray-700 bg-black text-white placeholder-gray-400 pr-28 pl-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 bg-[#9654d2] hover:bg-[#8548c8] text-white font-semibold px-5 rounded-md transition-colors"
          >
            Scan
          </button>
        </form>
      </div>
    </header>
  );
};

export default Header;