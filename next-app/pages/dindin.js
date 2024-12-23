import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ExternalLink } from "lucide-react"
import TwitterIcon from "@/components/icons/TwitterIcon"
import TelegramIcon from "@/components/icons/TelegramIcon"

export default function TeaserPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF9500] to-[#FF5C00] flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl bg-gray-800/90 backdrop-blur-sm overflow-hidden">
        <div className="p-8 md:p-12 flex flex-col items-center text-center space-y-8">
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
              Meet $DINDIN
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground font-semibold italic">
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

          <Button
            variant="ghost"
            className="text-[#FF9500] hover:text-[#FF9500]/90 hover:bg-[#FF9500]/10 font-semibold text-lg"
            onClick={() => window.open("https://t.me/dumpetdotfun", "_blank")}
          >
            <TelegramIcon strokeColor="#FF9500" className="mr-2 h-6 w-6" />
            Join our Telegram community
          </Button>
        </div>
      </Card>
    </div>
  )
}
