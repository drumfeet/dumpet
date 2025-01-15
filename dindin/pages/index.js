import Image from "next/image"
import { Link } from "arnext"
import { Twitter, MessageSquareMore } from "lucide-react"
import { useState, useEffect } from "react"
import Head from "next/head"

// const nftImages = Array.from(
//   { length: 18 },
//   (_, i) => `/placeholder.svg?height=200&width=200`
// )
const nftImages = [
  "/dumpet1.jpg?height=200&width=200",
  "/dumpet2.jpg?height=200&width=200",
  "/dumpet3.jpg?height=200&width=200",
  "/dumpet4.jpg?height=200&width=200",
  "/dumpet5.png?height=200&width=200",
  "/dumpet6.png?height=200&width=200",
  "/dumpet7.png?height=200&width=200",
  "/dumpet8.png?height=200&width=200",
  "/dumpet9.jpg?height=200&width=200",
  "/dumpet10.png?height=200&width=200",
  "/dumpet11.png?height=200&width=200",
  "/dumpet12.png?height=200&width=200",
  "/dumpet13.jpg?height=200&width=200",
  "/dumpet14.png?height=200&width=200",
  "/dumpet15.png?height=200&width=200",
  "/dumpet16.png?height=200&width=200",
  "/dumpet17.png?height=200&width=200",
  "/dumpet18.png?height=200&width=200",
]
export default function TeaserPage() {
  const [hoveredNft, setHoveredNft] = useState(null)

  const [isFloating, setIsFloating] = useState(false)

  useEffect(() => {
    const floatInterval = setInterval(() => {
      setIsFloating((prev) => !prev)
    }, 2000)

    return () => clearInterval(floatInterval)
  }, [])

  return (
    <>
      <Head>
        <title>DINDIN</title>
        <meta name="description" content="The DUMPET Dinosaur NFT Collection" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="./favicon.ico" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DINDIN" />
        <meta
          name="twitter:description"
          content="The DUMPET Dinosaur NFT Collection"
        />
        <meta
          name="twitter:image"
          content="https://arweave.net/EPhdFc3HwFgZ0MO49g5Mb1yUHMU4ZDeuVPpgtNYAw7I"
        />

        {/* Open Graph / Facebook Meta Tags */}
        <meta property="og:url" content="https://dindin.dumpet.fun" />
        <meta property="og:title" content="DINDIN" />
        <meta
          name="og:description"
          content="The DUMPET Dinosaur NFT Collection"
        />
        <meta
          name="og:image"
          content="https://arweave.net/EPhdFc3HwFgZ0MO49g5Mb1yUHMU4ZDeuVPpgtNYAw7I"
        />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-[#FFD700] via-[#FF69B4] to-[#00CED1] flex flex-col justify-between overflow-hidden">
        <header className="w-full bg-[#FF1493]/80 backdrop-blur-sm p-4 shadow-lg">
          <nav className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-4xl font-extrabold text-white">DINDIN</h1>
            <div className="flex space-x-6">
              <Link
                href="https://x.com/dumpetdotfun"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#FFD700] transition-transform duration-300 hover:scale-110"
              >
                <Twitter size={28} />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="https://t.me/dumpetdotfun"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#FFD700] transition-transform duration-300 hover:scale-110"
              >
                <MessageSquareMore size={28} />
                <span className="sr-only">Telegram</span>
              </Link>
            </div>
          </nav>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center p-8 space-y-12 relative">
          {/* <div className="absolute inset-0 bg-[url('/dumpet4.jpg?height=20&width=20')] opacity-10 animate-spin-slow"></div> */}

          <div className="w-full max-w-6xl bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-300">
            <div className="md:flex items-center">
              <div className="md:w-1/2 p-8 flex items-center justify-center">
                <div
                  className={`relative w-80 h-80 ${
                    isFloating ? "animate-float" : "animate-float-reverse"
                  }`}
                >
                  <Image
                    src="/dumpet3.jpg?height=400&width=400"
                    alt="$DINDIN - The DUMPET Dinosaur"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
              </div>
              <div className="md:w-1/2 p-8 flex flex-col justify-center space-y-6">
                <div>
                  <h2 className="text-5xl font-extrabold text-[#FF1493] mb-4 animate-bounce-slow">
                    DINDIN
                  </h2>
                  <p className="text-2xl text-[#00CED1] font-bold italic animate-pulse">
                    Meet the sleepiest dinosaur—here to bring some chill vibes
                    to DUMPET, powered by AO!
                  </p>
                </div>
                <p className="text-xl text-[#FF69B4] font-semibold">
                  Join our community and be part of this unique collection of
                  4,444 sleepy dinos.
                </p>
                <div className="flex flex-wrap gap-6">
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://bazar.arweave.dev/#/profile/cqzGhzTgsCq33HP89gdONqdji7dgWuB2AiZzf0vku2Y/assets/"
                  >
                    <button className="px-8 py-4 bg-[#FFD700] hover:bg-[#FFA500] text-white font-extrabold rounded-full text-xl transition-all duration-300 transform hover:scale-105 hover:rotate-3 shadow-lg">
                      Coming Soon
                    </button>
                  </Link>
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://dumpet.fun"
                  >
                    <button className="px-8 py-4 bg-[#00CED1] hover:bg-[#20B2AA] text-white font-extrabold rounded-full text-xl transition-all duration-300 transform hover:scale-105 hover:rotate-3 shadow-lg">
                      Try DUMPET
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-6xl">
            <h2 className="text-4xl font-extrabold text-white mb-8 text-center animate-pulse">
              NFT Collection Preview
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {nftImages.map((src, index) => (
                <div
                  key={index}
                  className="aspect-square relative overflow-hidden rounded-2xl cursor-pointer group transform transition-transform duration-300 hover:scale-105 hover:rotate-3"
                  onMouseEnter={() => setHoveredNft(index)}
                  onMouseLeave={() => setHoveredNft(null)}
                >
                  <Image
                    src={src}
                    alt={`DINDIN NFT ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FF1493] opacity-0 group-hover:opacity-100 flex items-end justify-center p-4 transition-opacity duration-300">
                    <p className="text-white font-extrabold text-2xl">
                      #{index + 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="w-full bg-[#FF1493]/80 backdrop-blur-sm p-6 text-center">
          <p className="text-lg text-white">
            Art by{" "}
            <a
              href="https://x.com/Mellowkyokai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FFD700] transition-colors duration-300 underline"
            >
              @Mellowkyokai
            </a>
          </p>
        </footer>
      </div>
    </>
  )
}
