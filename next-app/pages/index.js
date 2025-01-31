import Image from "next/image"
import { Link } from "arnext"
import { Twitter, Send, Trophy, Users, Clock, VoteIcon } from "lucide-react"
import Head from "next/head"
import DiscordIcon from "@/components/icons/DiscordIcon"

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
                  className="flex-1 min-w-[200px] flex items-center justify-center rounded-full bg-blue-500 px-6 py-3 text-lg font-medium text-white shadow-lg transition-all hover:bg-blue-600 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  href="https://x.com/dumpetdotfun"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="mr-2 h-5 w-5" />
                  Follow Our Footprints
                </Link>
                <Link
                  className="flex-1 min-w-[200px] flex items-center justify-center rounded-full bg-green-500 px-6 py-3 text-lg font-medium text-white shadow-lg transition-all hover:bg-green-600 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                  href="https://t.me/dumpetdotfun"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DiscordIcon strokeColor="#ffffff" size={24} />
                  <span className="ml-2">Roar on Discord</span>
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
