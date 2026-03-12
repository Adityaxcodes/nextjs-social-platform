import { GradientBackground } from "@/components/gradient-background"
import { Instrument_Serif } from "next/font/google"
import SpotlightButton from "@/components/spotlight-button"

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
})

export default function Page() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <GradientBackground />
      <div className="absolute inset-0 -z-10 bg-black/20" />

      <section className="w-full px-6 py-12 text-center">
        <h1
          className={`${instrumentSerif.className} text-white text-center text-balance font-normal tracking-tight text-7xl lg:text-8xl mb-8`}
        >
          Ideas are everywhere. Building is rare.
        </h1>
        <p className={`${instrumentSerif.className} text-white/70 text-center text-balance font-normal tracking-tight text-xl lg:text-2xl mb-12 max-w-4xl mx-auto`}>
          Follow startups, builders, and teams sharing their real journey — wins, failures, and everything in between.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <SpotlightButton href="/login">Login</SpotlightButton>
          <SpotlightButton href="/signup">Sign Up</SpotlightButton>
        </div>
      </section>
    </div>
  )
}