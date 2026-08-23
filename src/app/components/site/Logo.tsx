import { Link } from "react-router-dom";

export function ARKMark({ className = "", size = 40 }: { className?: string; size?: number }) {
  return (
    <img
      src="/brand/ark-mark-web.png"
      alt="ARK circuit elephant logo"
      width={size}
      height={size}
      className={`object-contain select-none ${className}`}
      draggable={false}
    />
  );
}

export function Brand({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="ARK home">
      <ARKMark size={compact ? 36 : 44} className="transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105 drop-shadow-[0_4px_10px_rgba(13,31,51,.25)]" />
      <span className="flex flex-col leading-none">
        <span className={`font-display text-xl font-black tracking-tight ${light ? "text-white" : "text-primary"}`}>ARK</span>
        <span className={`text-[10px] font-mono uppercase tracking-[0.18em] mt-1 ${light ? "text-glow/80" : "text-accent"}`}>
          AI Readiness for Kids
        </span>
      </span>
    </Link>
  );
}
