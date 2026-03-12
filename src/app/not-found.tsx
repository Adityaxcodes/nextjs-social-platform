import Link from "next/link"
import { Instrument_Serif } from "next/font/google"
import { GradientBackground } from "@/components/gradient-background"
import SpotlightButton from "@/components/spotlight-button"

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
})

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <GradientBackground />
      <div className="absolute inset-0 -z-10 bg-black/20" />

      <section className="w-full px-6 py-12 text-center">
        <h1
          className={`${instrumentSerif.className} text-white text-center font-normal tracking-tight text-8xl lg:text-9xl mb-4`}
        >
          404
        </h1>
        <p
          className={`${instrumentSerif.className} text-white/70 text-center font-normal tracking-tight text-2xl lg:text-3xl mb-4`}
        >
          Page not found
        </p>
        <p className="text-white/40 text-base mb-10">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <SpotlightButton href="/">Go Home</SpotlightButton>
          <SpotlightButton href="/feed">Browse Feed</SpotlightButton>
        </div>
      </section>
    </div>
  )
}
