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

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <>
      <header className="relative flex w-full  items-center bg-black h-[75px] px-4">
        <div className="flex items-center flex-shrink-0">
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
            <button className='ml-3 hidden sm:inline-flex bg-primary px-3 py-2 text-white rounded-md font-bold hover:bg-purple-600'> AI Model </button>
          </a>
        </div>

        {/* Mobile search toggle */}
        <div className="ml-auto md:hidden">
          <button
            aria-label="Open search"
            className="ml-auto text-white p-2"
            onClick={() => setMobileSearchOpen((v) => !v)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 110-16 8 8 0 010 16z" />
            </svg>
          </button>
        </div>
        </div>

        {/* Global Search - absolutely centered on md+ */}
        <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl z-10">
          <form onSubmit={onSubmit} className="relative w-full">
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

      {/* Mobile search panel under the header */}
      <div className={`md:hidden ${mobileSearchOpen ? 'block' : 'hidden'} bg-black border-t border-gray-800 px-4 py-3`}>
        <form onSubmit={onSubmit} className="relative w-full">
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
    </>
  );
};

export default Header;