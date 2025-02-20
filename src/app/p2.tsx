// pages/index.tsx
import Image from 'next/image';
import Link from 'next/link';

export default function Page2() {
  return (
    <div className="bg-gray-600 mx-auto px-4 py-8">
      {/* Main Content Section */}
      <div className="flex flex-col lg:flex-row items-start gap-8 mb-16">
        {/* Left Content */}
        <div className="lg:w-1/2">
          <h1 className="text-4xl font-bold mb-4">
            What is Dogecoin?
          </h1>
          <h2 className="text-xl mb-6">
            An open-source peer-to-peer digital currency, favoured by{' '}
            <span className="text-orange-500">Shiba Inus worldwide</span>.
          </h2>
          <p className="text-gray-600 mb-4">
            Dogecoin is a crypto movement that teaches the value of community, fun,
            and memes. Using blockchain technology, Dogecoin enables instant
            peer-to-peer transactions anywhere in the world. Read the{' '}
            <Link href="#" className="text-blue-500 hover:underline">
              Dogecoin Manifesto
            </Link>
            .{' '}
            <Link href="#" className="text-blue-500 hover:underline">
              Learn more
            </Link>
          </p>
        </div>

        {/* Right Image */}
        <div className="lg:w-1/2 relative">
          <Image
            src="/doge-police.png" // You'll need to add this image to your public folder
            alt="Doge with speech bubbles"
            width={500}
            height={500}
            className="w-full"
          />
        </div>
      </div>

      {/* Getting Started Section */}
      <div>
        <h2 className="text-3xl font-bold mb-12">Getting started</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="space-y-4">
            <div className="bg-yellow-100 text-yellow-800 w-12 h-12 flex items-center justify-center font-bold rounded">
              01
            </div>
            <h3 className="text-xl font-bold">choose your wallet</h3>
            <p className="text-gray-600">
              You&apos;ll need a wallet to store and manage your Dogecoin.
            </p>
            <button className="text-blue-500 hover:underline">
              Learn more.
            </button>
          </div>

          {/* Step 2 */}
          <div className="space-y-4">
            <div className="bg-yellow-100 text-yellow-800 w-12 h-12 flex items-center justify-center font-bold rounded">
              02
            </div>
            <h3 className="text-xl font-bold">configure your wallet</h3>
            <p className="text-gray-600">
              Follow our step-by-step guide to set up your wallet correctly.
            </p>
            <button className="text-blue-500 hover:underline">
              guide.
            </button>
          </div>

          {/* Step 3 */}
          <div className="space-y-4">
            <div className="bg-yellow-100 text-yellow-800 w-12 h-12 flex items-center justify-center font-bold rounded">
              03
            </div>
            <h3 className="text-xl font-bold">get some dogecoin</h3>
            <p className="text-gray-600">
              Buy, trade, or earn Dogecoin through various methods.
            </p>
            <button className="text-blue-500 hover:underline">
              Learn more.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}