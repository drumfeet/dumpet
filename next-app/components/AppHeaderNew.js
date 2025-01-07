import { useState } from "react"
import { Link } from "arnext"
import { Button } from "@/components/ui/button"
import { Star, Send, Twitter, PanelsTopLeftIcon, X } from "lucide-react"

export default function AppHeader() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen)
  }

  return (
    <header className="border-b border-border/40 bg-background">
      <div className="flex h-16 items-center justify-between w-full px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="text-xl font-semibold text-purple-400">
          dumpet
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
            >
              <Star className="mr-2 h-4 w-4" />
              Create
            </Button>
            <Button
              variant="outline"
              className="text-muted-foreground hover:text-foreground"
            >
              Connect
            </Button>
          </div>

          {/* Hamburger Icon */}
          <button
            onClick={toggleDrawer}
            className="text-purple-400 hover:text-purple-600 transition-colors"
            aria-label="Open menu"
          >
            <PanelsTopLeftIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex justify-end transform transition-transform"
          onClick={toggleDrawer}
        >
          <div
            className="w-64 bg-background p-6 shadow-lg transform transition-transform translate-x-0"
            onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
          >
            {/* Close Button */}
            <button
              onClick={toggleDrawer}
              className="text-purple-400 hover:text-purple-600 transition-colors mb-4"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation */}
            <nav className="flex flex-col gap-4">
              <Link
                href="/faq"
                onClick={toggleDrawer} // Close drawer on navigation
                className="text-sm text-muted-foreground hover:text-purple-400 transition-colors"
              >
                FAQ
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={toggleDrawer} // Close drawer on navigation
                className="text-sm text-muted-foreground hover:text-purple-400 transition-colors flex items-center gap-1"
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </Link>
              <Link
                href="https://telegram.org"
                target="_blank"
                rel="noopener noreferrer"
                onClick={toggleDrawer} // Close drawer on navigation
                className="text-sm text-muted-foreground hover:text-purple-400 transition-colors flex items-center gap-1"
              >
                <Send className="h-4 w-4" />
                Telegram
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
