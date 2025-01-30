import Image from "next/image"
import { Link } from "arnext"
import { Twitter, Send, Trophy, Users, Clock, VoteIcon } from "lucide-react"
import Head from "next/head"

const DiscordIcon = ({ strokeColor = "#ffffff", size = 24 }) => (
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
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M17.5008 16.75C17.5008 16.75 15.2057 18.25 12.0008 18.25C8.79587 18.25 6.50079 16.75 6.50079 16.75"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M17.2508 12.25C17.2508 13.3546 16.4673 14.25 15.5008 14.25C14.5343 14.25 13.7508 13.3546 13.7508 12.25C13.7508 11.1454 14.5343 10.25 15.5008 10.25C16.4673 10.25 17.2508 11.1454 17.2508 12.25Z"
      stroke="currentColor"
      stroke-width="1.5"
    />
    <path
      d="M10.2508 12.25C10.2508 13.3546 9.46729 14.25 8.50079 14.25C7.5343 14.25 6.75079 13.3546 6.75079 12.25C6.75079 11.1454 7.5343 10.25 8.50079 10.25C9.46729 10.25 10.2508 11.1454 10.2508 12.25Z"
      stroke="currentColor"
      stroke-width="1.5"
    />
  </svg>
)

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>dumpet.fun</title>
        <meta name="description" content="Popularity contest duel platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href=".././favicon.ico" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="dumpet.fun" />
        <meta
          name="twitter:description"
          content="Popularity contest duel platform"
        />
        <meta
          name="twitter:image"
          content="https://arweave.net/QifSiTK9jez7w1km9r9QM7BdNM_ddhyjK0g-gD2hKn0"
        />

        {/* Open Graph / Facebook Meta Tags */}
        <meta property="og:url" content="https://dumpet.fun" />
        <meta property="og:title" content="dumpet.fun" />
        <meta
          name="og:description"
          content="Popularity contest duel platform"
        />
        <meta
          name="og:image"
          content="https://arweave.net/QifSiTK9jez7w1km9r9QM7BdNM_ddhyjK0g-gD2hKn0"
        />
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-green-400 to-blue-500 text-white overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <Image
            src="/dumpet3.jpg?height=200&width=200"
            width={200}
            height={200}
            alt="Dinosaur footprint"
            className="absolute top-10 left-10 opacity-20 transform rotate-45"
          />
          <Image
            src="/dumpet3.jpg?height=150&width=150"
            width={150}
            height={150}
            alt="Speech bubble"
            className="absolute top-1/4 right-10 opacity-20 animate-bounce"
          />
          <Image
            src="/dumpet3.jpg?height=180&width=180"
            width={180}
            height={180}
            alt="Dinosaur egg"
            className="absolute bottom-10 left-20 opacity-20 animate-pulse"
          />
        </div>

        <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 relative">
              <Image
                src="/dumpet3.jpg?height=400&width=400"
                width={400}
                height={400}
                alt="DINDIN the Dinosaur"
                className="mx-auto animate-wiggle rounded-3xl"
              />
              <h1 className="text-6xl font-extrabold tracking-tight mt-4 mb-2 text-yellow-300 drop-shadow-lg animate-pop-in">
                Welcome to DUMPET
              </h1>
              <p className="text-3xl font-bold mb-6 text-pink-200 drop-shadow-md animate-slide-up">
                The Jurassic Gossip Arena!
              </p>
              <p className="text-xl mb-8 text-white drop-shadow-sm animate-fade-in">
                Spread rumors, spark outrage, and become the apex predator of
                popularity!
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-12 justify-center items-center w-full">
              <Link
                href="https://dindin.dumpet.fun"
                rel="noopener noreferrer"
                className="font-medium w-full md:flex-1 flex items-center justify-center text-lg py-2 px-8 bg-yellow-400 hover:bg-yellow-500 text-black transform hover:scale-110 transition-all duration-300 rounded-full shadow-lg hover:rotate-3"
              >
                <span className="mr-4 text-2xl">🦖</span>
                DINDIN
              </Link>
              <Link
                href="/duel"
                className="font-medium w-full md:flex-1 flex items-center justify-center text-lg py-2 px-8 bg-purple-500 hover:bg-purple-600 text-white transform hover:scale-110 transition-all duration-300 rounded-full shadow-lg hover:rotate-3"
              >
                <span className="mr-4 text-2xl">🥊</span>
                Duel on DUMPET
              </Link>
            </div>

            <div className="bg-white text-black p-6 rounded-lg shadow-lg mb-12 transform -rotate-1 hover:rotate-0 transition-transform">
              <h2 className="text-2xl font-bold mb-4 text-purple-600">
                How to Play
              </h2>
              <ol className="list-none text-left space-y-4">
                <li className="flex items-center">
                  <Trophy className="mr-2 text-yellow-500" />
                  <span>
                    Select an active market or create your own prehistoric
                    playground.
                  </span>
                </li>
                <li className="flex items-center">
                  <Users className="mr-2 text-green-500" />
                  <span>Deposit dino-tokens to join the rumble.</span>
                </li>
                <li className="flex items-center">
                  <VoteIcon className="mr-2 text-blue-500" />
                  <span>Vote for your favorite dino or support your pack.</span>
                </li>
                <li className="flex items-center">
                  <Clock className="mr-2 text-red-500" />
                  <span>
                    Wait for the meteor (8 mins to 8 days) to hit and end the
                    market.
                  </span>
                </li>
                <li className="flex items-center">
                  <Trophy className="mr-2 text-purple-500" />
                  <span>
                    The mightiest roar wins! Losers&apos; tokens become the
                    victory feast.
                  </span>
                </li>
              </ol>
            </div>

            <div className="space-y-8 animate-float">
              <h2 className="text-3xl font-bold text-yellow-300">
                Join the Dino-mite Community!
              </h2>
              <p className="text-xl text-white">
                Connect with fellow time-traveling gossipers. Get the juiciest
                Jurassic juice!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  className="flex items-center justify-center rounded-full bg-blue-500 px-6 py-3 text-lg font-medium text-white shadow-lg transition-all hover:bg-blue-600 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  href="https://x.com/dumpetdotfun"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="mr-2 h-5 w-5" />
                  Follow Our Footprints
                </Link>
                <Link
                  className="flex items-center justify-center rounded-full bg-green-500 px-6 py-3 text-lg font-medium text-white shadow-lg transition-all hover:bg-green-600 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                  href="https://t.me/dumpetdotfun"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DiscordIcon /> <div className="ml-2">Roar on Discord</div>
                </Link>
              </div>
            </div>
          </div>
        </main>

        <footer className="relative z-10 w-full py-6 px-4 bg-purple-800 bg-opacity-80 text-white text-center">
          <p className="text-sm">
            © DUMPET. All rights reserved. No dinosaurs were harmed in the
            making of this gossip.
          </p>
        </footer>
      </div>
    </>
  )
}
