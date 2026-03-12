"use client"

import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"

interface SpotlightButtonProps {
  children: React.ReactNode
  href: string
}

const MotionLink = motion.create(Link)

const SpotlightButton = ({ children, href }: SpotlightButtonProps) => {
  const [isMounted, setIsMounted] = useState(false)
  const btnRef = useRef<HTMLAnchorElement>(null)
  const spanRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const { width } = target.getBoundingClientRect()
      const offset = e.offsetX
      const left = `${(offset / width) * 100}%`

      spanRef.current?.animate({ left }, { duration: 250, fill: "forwards" })
    }

    const handleMouseLeave = () => {
      spanRef.current?.animate(
        { left: "50%" },
        { duration: 100, fill: "forwards" }
      )
    }

    btnRef.current?.addEventListener("mousemove", handleMouseMove as EventListener)
    btnRef.current?.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      btnRef.current?.removeEventListener("mousemove", handleMouseMove as EventListener)
      btnRef.current?.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [isMounted])

  if (!isMounted) {
    return (
      <Link
        href={href}
        className="relative w-full max-w-xs overflow-hidden rounded-lg bg-slate-950 px-4 py-3 text-lg font-medium text-white text-center block cursor-pointer hover:no-underline"
      >
        <span className="pointer-events-none relative z-10">
          {children}
        </span>
      </Link>
    )
  }

  return (
    <MotionLink
      href={href}
      whileTap={{ scale: 0.985 }}
      ref={btnRef}
      className="relative w-full max-w-xs overflow-hidden rounded-lg bg-slate-950 px-4 py-3 text-lg font-medium text-white text-center block cursor-pointer hover:no-underline"
    >
      <span className="pointer-events-none relative z-10 mix-blend-difference">
        {children}
      </span>
      <span
        ref={spanRef}
        className="pointer-events-none absolute left-[50%] top-[50%] h-32 w-32 -translate-x-[50%] -translate-y-[50%] rounded-full bg-slate-100"
      />
    </MotionLink>
  )
}

export default SpotlightButton
