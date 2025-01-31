import Image from "next/image"
import { Link } from "arnext"
import { Twitter, Send } from "lucide-react"
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

const DiscordIcon = ({ strokeColor = "#000000", size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    color={strokeColor}
    fill="none"
  >
    <path
      d="M15.5008 17.75L16.7942 19.5205C16.9156 19.7127 17.1489 19.7985 17.3619 19.7224C18.1657 19.4353 20.158 18.6572 21.7984 17.4725C21.9263 17.3801 22.0002 17.2261 21.9992 17.0673C21.9992 8.25 19.5008 5.75 19.5008 5.75C19.5008 5.75 17.5008 4.60213 15.3547 4.25602C15.1436 4.22196 14.9368 4.33509 14.8429 4.52891L14.3979 5.44677C14.3979 5.44677 13.2853 5.21397 12 5.21397C10.7147 5.21397 9.6021 5.44677 9.6021 5.44677L9.15711 4.52891C9.06314 4.33509 8.85644 4.22196 8.64529 4.25602C6.50079 4.60187 4.50079 5.75 4.50079 5.75C4.50079 5.75 2.0008 8.25 2.0008 17.0673C1.9998 17.2261 2.07365 17.3801 2.20159 17.4725C3.84196 18.6572 5.8343 19.4353 6.63806 19.7224C6.85105 19.7985 7.08437 19.7127 7.20582 19.5205L8.50079 17.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.5008 16.75C17.5008 16.75 15.2057 18.25 12.0008 18.25C8.79587 18.25 6.50079 16.75 6.50079 16.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.2508 12.25C17.2508 13.3546 16.4673 14.25 15.5008 14.25C14.5343 14.25 13.7508 13.3546 13.7508 12.25C13.7508 11.1454 14.5343 10.25 15.5008 10.25C16.4673 10.25 17.2508 11.1454 17.2508 12.25Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M10.2508 12.25C10.2508 13.3546 9.46729 14.25 8.50079 14.25C7.5343 14.25 6.75079 13.3546 6.75079 12.25C6.75079 11.1454 7.5343 10.25 8.50079 10.25C9.46729 10.25 10.2508 11.1454 10.2508 12.25Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
)

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
                <Send size={28} />
                <span className="sr-only">Telegram</span>
              </Link>
              <Link
                href="https://discord.gg/bWU5e3cVuW"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#FFD700] transition-transform duration-300 hover:scale-110"
              >
                <DiscordIcon strokeColor="#ffffff" size={28} />
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
                    href="https://bazar.arweave.net/#/collection/Qs-thSShHa6eyDrQu7Ly_f0dgoAp3mY2y-0ZbxOEWKU/"
                    className="flex-1 min-w-[200px] px-8 py-4 bg-[#FFD700] hover:bg-[#FFA500] text-white font-extrabold rounded-full text-xl transition-all duration-300 transform hover:scale-105 hover:rotate-3 shadow-lg text-center"
                  >
                    Buy on Bazar
                  </Link>
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://dumpet.fun"
                    className="flex-1 min-w-[200px] px-8 py-4 bg-[#00CED1] hover:bg-[#20B2AA] text-white font-extrabold rounded-full text-xl transition-all duration-300 transform hover:scale-105 hover:rotate-3 shadow-lg text-center"
                  >
                    Duel on DUMPET
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
