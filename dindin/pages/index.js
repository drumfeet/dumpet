"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DiscIcon as Discord, Twitter } from "lucide-react"
import Image from "next/image"

export default function Landing() {
  const [currentImage, setCurrentImage] = useState(0)
  const images = [
    "/dumpet1.jpg",
    "/dumpet2.jpg",
    "/dumpet3.jpg",
    "/dumpet_14.png",
    "/dumpet_15.png",
    "/dumpet_17.png",
    "/dumpet_18.png",
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FF9500] to-[#FF5C00]">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-6 flex justify-end items-center">
        {/* <h1 className="text-4xl font-bold text-white"></h1> */}
        <div className="flex gap-4">
          <Button variant="secondary" size="icon">
            <Discord className="h-5 w-5" />
          </Button>
          <Button variant="secondary" size="icon">
            <Twitter className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge className="bg-green-600 text-white hover:bg-green-700">
              Coming Soon
            </Badge>
            <h2 className="text-6xl font-bold text-white">DINDIN</h2>
            <p className="text-xl text-white/90">
              The sleepiest dinosaur on AO is about to wake up! Join our
              community and be part of this unique collection of 4,444 sleepy
              dinos.
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                Join Whitelist
              </Button>
              <Button size="lg" variant="secondary">
                Learn More
              </Button>
            </div>
          </div>

          <div className="relative h-[500px] rounded-xl overflow-hidden">
            {images.map((src, index) => (
              <Image
                key={src}
                src={src}
                alt={`DINDIN #${index + 1}`}
                fill
                className={`object-contain transition-opacity duration-1000 ${
                  currentImage === index ? "opacity-100" : "opacity-0"
                }`}
                priority={index === 0}
              />
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-24">
          <Card className="p-6 bg-white/10 backdrop-blur border-0">
            <h3 className="text-2xl font-bold text-white mb-4">
              Unique Traits
            </h3>
            <p className="text-white/80">
              Each DINDIN comes with unique accessories, colors, and sleepiness
              levels.
            </p>
          </Card>
          <Card className="p-6 bg-white/10 backdrop-blur border-0">
            <h3 className="text-2xl font-bold text-white mb-4">Community</h3>
            <p className="text-white/80">
              Join our growing community of DINDIN lovers and collectors.
            </p>
          </Card>
          <Card className="p-6 bg-white/10 backdrop-blur border-0">
            <h3 className="text-2xl font-bold text-white mb-4">Utility</h3>
            <p className="text-white/80">
              Exclusive access to future drops, merch, and community events.
            </p>
          </Card>
        </div>

        {/* Roadmap */}
        <section className="mt-24">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Roadmap
          </h2>
          <div className="space-y-8">
            {[
              {
                phase: "Phase 1",
                title: "Community Building",
                description:
                  "Launch Discord and Twitter. Build initial community.",
              },
              {
                phase: "Phase 2",
                title: "Whitelist",
                description: "Open whitelist for early supporters.",
              },
              {
                phase: "Phase 3",
                title: "Mint Event",
                description: "Public mint goes live.",
              },
              {
                phase: "Phase 4",
                title: "Expansion",
                description: "Merchandise store and community events.",
              },
            ].map((item) => (
              <Card
                key={item.phase}
                className="p-6 bg-white/10 backdrop-blur border-0"
              >
                <div className="flex items-start gap-4">
                  <Badge variant="secondary">{item.phase}</Badge>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="text-white/80">{item.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 text-center text-white/60">
        <p>© 2024 DINDIN NFT Collection. All rights reserved.</p>
      </footer>
    </div>
  )
}
