import Link from "next/link"
import { Instrument_Serif } from "next/font/google"

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
})

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className={`${instrumentSerif.className} text-white text-xl font-normal`}>
            DC
          </Link>

          <div className="flex items-center space-x-6">
            <Link href="/" className="text-white/70 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/feed" className="text-white/70 hover:text-white transition-colors">
              Feed
            </Link>
            <Link href="/login" className="text-white/70 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/signup" className="text-white/70 hover:text-white transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}