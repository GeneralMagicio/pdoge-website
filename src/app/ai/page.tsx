// import ContractAnalyzer from "./components/Chatbox";
import { Suspense } from "react";
import AIPageContent from "./pageClient";

export default function AIPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#9654d2] text-white mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#9654d2]">Smart Contract Security Analyzer</h1>
            {/* <p className="text-gray-600">Powered by GPT-4o-mini AI</p> */}
          </div>
        </div>
        <Suspense>
          <AIPageContent />
        </Suspense>
      </div>
    </div>
  );
}