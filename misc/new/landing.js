"use client";

import { Plus, Swords, Clock, Trophy, Flame, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  const featuredDuel = {
    title: "ao or ar",
    player1: "ao",
    player2: "ar",
    expiresOn: "Thu, Nov 28, 2024, 17:53",
    stake: "1000",
    views: "2.4k"
  };

  const duels = [
    {
      title: "DEGEN TO LEGEND",
      player1: "Degen",
      player2: "Legend",
      expiresOn: "Tue, Jan 07, 2025, 18:08",
      stake: "500",
      views: "1.2k"
    },
    {
      title: "2025 AGENT",
      player1: "BLUE PILL",
      player2: "RED PILL",
      expiresOn: "Sat, Jan 04, 2025, 18:17",
      stake: "2000",
      views: "3.1k"
    },
    {
      title: "Dumb battle",
      player1: "Wowo",
      player2: "Wiwi",
      expiresOn: "Sun, Dec 29, 2024, 09:49",
      stake: "100",
      views: "856"
    },
    {
      title: "Hooman",
      player1: "Human",
      player2: "AI",
      expiresOn: "Sun, Dec 29, 2024, 09:42",
      stake: "5000",
      views: "10.5k"
    }
  ];

  return (
    <main className="min-h-screen bg-[#1a1a2e]">
      {/* Hero Section with Create Button */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#1a1a2e] to-[#1a1a2e]/80 border-b border-white/10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1533134486753-c833f0ed4866?q=80&w=3270&auto=format&fit=crop')] opacity-5 bg-cover bg-center" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
              Epic Duels Await
            </h1>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Create or join high-stakes battles. Prove your worth and claim victory.
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium px-8 py-6 rounded-xl shadow-lg hover:shadow-violet-500/25 transition-all duration-300"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create New Duel
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Duel */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Flame className="mr-2 h-5 w-5 text-orange-500" />
            Featured Duel
          </h2>
          <Link href="#" className="block">
            <Card className="relative bg-gradient-to-br from-[#2a2a4e] to-[#1f1f3d] border-0 p-6 group hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-violet-400 transition-colors">
                    {featuredDuel.title}
                  </h3>
                  <div className="flex items-center gap-8 mb-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span className="text-yellow-500 font-semibold">${featuredDuel.stake}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Shield className="h-5 w-5" />
                      <span>{featuredDuel.views} watching</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 sm:gap-12">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white mb-1">{featuredDuel.player1}</div>
                    <div className="text-sm text-gray-400">Challenger</div>
                  </div>
                  <div className="relative">
                    <Swords className="h-8 w-8 text-violet-500 rotate-90 group-hover:rotate-45 transition-transform duration-500" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white mb-1">{featuredDuel.player2}</div>
                    <div className="text-sm text-gray-400">Defender</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Expires: {featuredDuel.expiresOn}
                </div>
                <Button variant="ghost" className="text-violet-400 hover:text-violet-300 hover:bg-violet-400/10">
                  View Details →
                </Button>
              </div>
            </Card>
          </Link>
        </div>

        {/* Active Duels Grid */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Swords className="mr-2 h-5 w-5 text-violet-500" />
            Active Duels
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {duels.map((duel, index) => (
              <Link href="#" key={index} className="block group">
                <Card className="bg-[#2a2a4e] border-0 p-5 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-violet-400 transition-colors">
                        {duel.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="text-yellow-500">${duel.stake}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Shield className="h-4 w-4" />
                          <span>{duel.views}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">{duel.player1}</div>
                        <div className="text-xs text-gray-400">vs</div>
                        <div className="text-sm font-medium text-white">{duel.player2}</div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-violet-400 hover:text-violet-300 hover:bg-violet-400/10">
                        →
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
