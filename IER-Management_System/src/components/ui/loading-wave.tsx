import { cn } from "@/lib/utils"

export function LoadingWave({
  className,
  logoUrl,
}: {
  className?: string
  logoUrl?: string
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      {logoUrl && <img src={logoUrl || "/placeholder.svg"} alt="Logo" className="h-12 w-12 animate-pulse" />}

      <div className="flex items-center gap-1">
        <span className="text-lg font-medium">Loading</span>
        <div className="flex h-6 items-end gap-[1px]">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className="h-1 w-1 bg-current"
              style={{
                animation: `wave 1s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
                height: `${(i % 2 === 0 ? 2 : 3) * 4}px`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
