import React from "react"

export const LoadingWave = ({
  message = "Loading...",
  logoSrc = "/assets/DENR-Logo.svg"
}: {
  message?: string
  logoSrc?: string
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        <img
          src={logoSrc}
          alt="Loading Logo"
          className="h-14 w-14 animate-pulse"
        />
        <span className="text-sm text-primary font-semibold tracking-wide">
          {message}
        </span>
      </div>
    </div>
  )
}
