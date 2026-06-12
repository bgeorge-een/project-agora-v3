'use client'
import { useState } from 'react'
import type { CameraFrameHighlightType, CameraFrameStatus, SceneType } from '@/lib/types'

const SCENE_STYLES: Record<SceneType, { bg: string; border: string; label: string }> = {
  parking:    { bg: 'from-blue-950 to-slate-900',  border: 'border-blue-900',  label: 'PARKING' },
  lobby:      { bg: 'from-teal-950 to-slate-900',  border: 'border-teal-900',  label: 'LOBBY' },
  hallway:    { bg: 'from-slate-900 to-gray-950',  border: 'border-slate-700', label: 'CORRIDOR' },
  elevator:   { bg: 'from-zinc-900 to-slate-950',  border: 'border-zinc-700',  label: 'ELEVATOR' },
  exterior:   { bg: 'from-green-950 to-slate-900', border: 'border-green-900', label: 'EXTERIOR' },
  restricted: { bg: 'from-red-950 to-slate-900',   border: 'border-red-800',   label: 'RESTRICTED' },
}

interface Props {
  channel: string
  sceneType: SceneType
  location: string
  timestamp: string
  onClick?: () => void
  className?: string
  label?: string
  highlightType?: CameraFrameHighlightType
  isKeyFrame?: boolean
  status?: CameraFrameStatus
}

export function CameraStill({
  channel,
  sceneType,
  location,
  timestamp,
  onClick,
  className = '',
  label,
  highlightType,
  isKeyFrame = false,
  status = 'preview_only',
}: Props) {
  const [hovered, setHovered] = useState(false)
  const scene = SCENE_STYLES[sceneType]
  const degraded = status === 'degraded' || status === 'unavailable'

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`relative overflow-hidden rounded border text-left ${scene.border} ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      } ${isKeyFrame ? 'ring-2 ring-[#FBBF24]' : ''} ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
      aria-label={`Open camera preview from ${channel} at ${timestamp}`}
    >
      {/* Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${scene.bg}`} />

      {/* Scanlines */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
      }} />
      {degraded && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, rgba(252,165,165,0.3), rgba(252,165,165,0.3) 1px, transparent 1px, transparent 7px)',
          }}
        />
      )}

      {/* Scene shape suggestion */}
      {sceneType === 'restricted' && (
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-12 h-12 border-2 border-red-400 rounded-full" />
          <div className="absolute w-8 h-0.5 bg-red-400 rotate-45" />
        </div>
      )}
      {sceneType === 'parking' && (
        <div className="absolute bottom-4 left-2 right-2 h-px bg-yellow-400 opacity-20" />
      )}

      {/* Operator-oriented highlight overlays */}
      {highlightType === 'vehicle' && (
        <div className="absolute bottom-6 left-4 h-5 w-12 rounded border-2 border-[#60A5FA]/80 bg-[#60A5FA]/10" />
      )}
      {(highlightType === 'approach' || highlightType === 'movement' || highlightType === 'departure') && (
        <div className="absolute inset-x-5 bottom-7 h-px border-t-2 border-dashed border-[#38BDF8]/80" />
      )}
      {(highlightType === 'access_attempt' || highlightType === 'door_forcing') && (
        <div className="absolute right-5 top-8 h-14 w-6 rounded-sm border-2 border-[#F97316]/90 bg-[#F97316]/10" />
      )}
      {highlightType === 'tailgate' && (
        <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 gap-1">
          <span className="h-5 w-3 rounded-full border-2 border-[#FBBF24]/90" />
          <span className="h-5 w-3 rounded-full border-2 border-[#FBBF24]/90" />
        </div>
      )}
      {(highlightType === 'loitering' || highlightType === 'survey') && (
        <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-[#FBBF24]/90" />
      )}
      {isKeyFrame && (
        <span className="absolute left-1.5 top-7 z-10 rounded bg-[#FBBF24] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-black">
          Key
        </span>
      )}

      {/* HUD top bar */}
      <div className="relative z-10 flex items-center justify-between px-1.5 py-1 bg-black/40">
        <span className="text-[9px] font-mono text-red-400 flex items-center gap-1">
          <span
            className="material-symbols-outlined animate-pulse"
            style={{ fontSize: '10px', lineHeight: 1, fontVariationSettings: "'FILL' 1" }}
          >
            fiber_manual_record
          </span>
          REC
        </span>
        <span className="text-[9px] font-mono text-gray-400">{channel}</span>
      </div>

      {/* Main space */}
      <div className="relative z-10 h-16 flex items-center justify-center">
        {hovered && (
          <div className="bg-black/60 rounded-full w-8 h-8 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-white"
              style={{ fontSize: '18px', lineHeight: 1, fontVariationSettings: "'FILL' 1" }}
            >
              play_arrow
            </span>
          </div>
        )}
        {sceneType === 'restricted' && !hovered && (
          <span className="text-red-400 text-xs font-bold tracking-widest opacity-40">{scene.label}</span>
        )}
        {label && !hovered && sceneType !== 'restricted' && (
          <span className="max-w-[80%] rounded bg-black/45 px-2 py-1 text-center text-[10px] font-bold uppercase tracking-wide text-white/70">
            {label}
          </span>
        )}
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 flex items-end justify-between px-1.5 py-1 bg-gradient-to-t from-black/70 to-transparent">
        <span className="text-[9px] text-gray-300 truncate max-w-[70%]">{location}</span>
        <span className="text-[9px] font-mono text-gray-400">{timestamp}</span>
      </div>
    </div>
  )
}
