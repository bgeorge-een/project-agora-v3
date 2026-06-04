'use client'
import { useEffect, useRef, useState } from 'react'
import type { SceneType } from '@/lib/types'

interface Props {
  channel: string
  sceneType: SceneType
  location: string
  timestamp: string
  detail: string
  onClose: () => void
}

const SCENE_BG: Record<SceneType, string> = {
  parking: 'from-blue-950 to-slate-900',
  lobby: 'from-teal-950 to-slate-900',
  hallway: 'from-slate-900 to-gray-950',
  elevator: 'from-zinc-900 to-slate-950',
  exterior: 'from-green-950 to-slate-900',
  restricted: 'from-red-950 to-slate-900',
}

export function CameraClipModal({ channel, sceneType, location, timestamp, detail, onClose }: Props) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { setPlaying(false); return 100 }
          return p + (100 / (30 * 16.67))
        })
      }, 60)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [playing])

  const elapsed = Math.floor((progress / 100) * 30)
  const elapsedStr = `0:${elapsed.toString().padStart(2, '0')}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-950 rounded-xl overflow-hidden w-[600px] shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Video area */}
        <div className={`relative h-72 bg-gradient-to-br ${SCENE_BG[sceneType]}`}>
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)'
          }} />
          {/* HUD */}
          <div className="absolute top-2 left-3 right-3 flex justify-between">
            <span className="text-[10px] font-mono text-red-400 flex items-center gap-1">
              <span className={playing ? 'animate-pulse' : ''}>●</span> {playing ? 'REC' : 'PAUSED'}
            </span>
            <span className="text-[10px] font-mono text-gray-400">{channel} · {timestamp}</span>
          </div>
          {/* Play button */}
          <button
            className="absolute inset-0 flex items-center justify-center"
            onClick={() => { setPlaying(p => !p); if (progress >= 100) setProgress(0) }}
          >
            <div className="bg-black/50 rounded-full w-14 h-14 flex items-center justify-center hover:bg-black/70 transition-colors">
              <span className="text-white text-2xl ml-1">{playing ? '⏸' : '▶'}</span>
            </div>
          </button>
          {/* Location overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <p className="text-white text-xs font-medium">{location}</p>
          </div>
        </div>
        {/* Controls */}
        <div className="px-4 py-3 bg-gray-900">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-mono text-gray-400 w-8">{elapsedStr}</span>
            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden cursor-pointer">
              <div className="h-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs font-mono text-gray-400 w-8">0:30</span>
          </div>
        </div>
        {/* Metadata */}
        <div className="px-4 py-3 border-t border-gray-800">
          <p className="text-sm text-gray-300">{detail}</p>
        </div>
        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-800 flex justify-end">
          <button className="text-sm text-gray-400 hover:text-white transition-colors" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
