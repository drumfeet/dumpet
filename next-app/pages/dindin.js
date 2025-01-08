import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Twitter, ExternalLink, Send } from "lucide-react"
import TwitterIcon from "@/components/icons/TwitterIcon"
import TelegramIcon from "@/components/icons/TelegramIcon"
import { Link } from "arnext"

export default function TeaserPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF9500] to-[#FF5C00] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-gray-800/90 backdrop-blur-sm overflow-hidden rounded-lg shadow-xl">
        <div className="p-8 md:p-12 flex flex-col items-center text-center space-y-4">
          <div className="relative w-72 h-72 md:w-96 md:h-96 animate-bounce-slow animate-pulse-glow">
            <Image
              src="/dumpet3.jpg"
              alt="$DINDIN - The DUMPET Dinosaur"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#FF9500] drop-shadow-md">
              DINDIN
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 font-semibold italic">
              The sleepiest dinosaur is coming to DUMPET soon...
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Button
              size="lg"
              className="flex-1 bg-[#FF9500] hover:bg-[#FF9500]/90 text-white font-bold py-3 text-lg"
              onClick={() =>
                window.open("https://x.com/dumpetdotfun", "_blank")
              }
            >
              <TwitterIcon strokeColor="#ffffff" className="mr-2 h-6 w-6" />
              Follow
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="flex-1 border-[#FF9500] text-[#FF9500] hover:bg-[#FF9500]/10 font-bold py-3 text-lg"
              onClick={() => window.open("https://dumpet.fun", "_blank")}
            >
              <ExternalLink className="mr-2 h-6 w-6" />
              Try DUMPET
            </Button>
          </div>

          <Link
            target="_blank"
            rel="noopener noreferrer"
            href="https://t.me/dumpetdotfun"
          >
            <Button
              variant="ghost"
              className="text-[#FF9500] hover:text-[#FF9500]/90 hover:bg-[#FF9500]/10 font-semibold text-lg"
            >
              <TelegramIcon strokeColor="#FF9500" className="mr-2 h-6 w-6" />
              Join our Telegram community
            </Button>
          </Link>

          <p className="text-sm text-gray-400">
            Art by{" "}
            <a
              href="https://x.com/Mellowkyokai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF9500] transition-colors"
            >
              @Mellowkyokai
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
