import Header from "./header"
// import Page2 from "./p2"
import Image from 'next/image'


const Landing = () => {


  return (
    <div className="relative">
      <div className="sticky top-0 z-[8]">
        <Header/>
      </div>
      <div className="flex flex-col justify-center items-center relative w-full h-[95vh]">
        <div className="w-[26vw] h-[26vw] mt-[-25vh] relative z-[4]">
          <Image layout="fill"  src={"/pdogecoin_money.png"} alt="pdoge"/>
        </div>
        <p className="text-white text-4xl my-8 font-[800] z-[4]"> The DOGE Police </p>
        <div className="flex gap-4 mt-2">
          <button className="bg-primary text-white font-bold w-36 h-8 rounded-md z-[4] hover:bg-purple-700"> 
            <a href="/pdoge-memepaper.pdf" target="_blank">
              Memepaper
            </a>  
          </button>
          <button className="bg-primary text-white font-bold w-36 h-8 rounded-md z-[4] hover:bg-purple-700"> 
            <a href="https://app.uniswap.org/explore/tokens/polygon/0x8de88458e33e28bce366298a6f4f39fe16e72aa5" target="_blank">
              Buy
            </a>  
          </button>
          <button className="bg-primary text-white font-bold w-36 h-8 rounded-md z-[4] hover:bg-purple-700"> 
            <a href="https://x.com/PolygonDoge" target="_blank">
              X (Twitter) 
            </a>  
          </button>
        </div>
        <video
          className="absolute top-0 left-0 w-full h-full object-cover z-[2]"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/polydoge.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

      </div>

      {/* <Page2/>

      <div className="h-[800px] w-full bg-red-200"/> */}
    </div>
  )
}

export default Landing