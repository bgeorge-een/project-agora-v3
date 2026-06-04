'use client'

import { useState, useEffect } from 'react'
import type { Alert, NextBestAction } from '@/lib/types'
import { MOCK_ALERTS } from '@/lib/mock-data/scenarios'

const SIM_TEMPLATES = [
  {
    title: 'Propped door alert — East Exit E3',
    location: 'East Wing · Ground Floor · Austin HQ',
    sources: ['Door Sensor'],
    type: 'reactive' as const,
  },
  {
    title: 'After-hours badge swipe — Finance Suite',
    location: 'Floor 2 · Finance Suite · Austin HQ',
    sources: ['Access Control'],
    type: 'reactive' as const,
  },
  {
    title: 'Motion detected — Parking Level 1',
    location: 'Parking Level 1 · Austin HQ',
    sources: ['Motion Sensor', 'Camera P1'],
    type: 'reactive' as const,
  },
]

async function enrichAlert(alert: Alert): Promise<NextBestAction | null> {
  try {
    const res = await fetch('/api/enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alert }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return {
      recommendationId: `nba-sim-${Date.now()}`,
      recommendedAction: data.recommendedAction ?? 'Verify and assess',
      rationale: data.rationale ?? '',
      confidence: data.confidence ?? 0.75,
      urgency: data.urgency ?? 'medium',
      responsePhase: data.responsePhase ?? 'contain',
      alternatives: data.alternatives ?? [],
      requiresApproval: false,
      autoExecuteActions: data.autoExecuteActions ?? ['Lock evidence', 'Notify supervisor'],
      gatedActions: data.gatedActions ?? [],
    }
  } catch {
    return null
  }
}

export function useSimulation() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS)

  // Age ticker — increment ageSeconds every second
  useEffect(() => {
    const ticker = setInterval(() => {
      setAlerts((prev) => prev.map((a) => ({ ...a, ageSeconds: a.ageSeconds + 1 })))
    }, 1000)
    return () => clearInterval(ticker)
  }, [])

  // New alert injector — every 20s, 30% chance
  useEffect(() => {
    const interval = setInterval(async () => {
      if (Math.random() > 0.3) return

      const template = SIM_TEMPLATES[Math.floor(Math.random() * SIM_TEMPLATES.length)]
      const newAlert: Alert = {
        id: `alert-sim-${Date.now()}`,
        type: template.type,
        severity: 'medium',
        status: 'enriching',
        title: template.title,
        location: template.location,
        siteId: 'site-austin',
        siteName: 'Austin HQ',
        timestamp: new Date().toISOString(),
        ageSeconds: 0,
        sources: template.sources,
        entityRefs: [],
      }

      // Add to queue immediately in enriching state
      setAlerts((prev) => [newAlert, ...prev])

      // Call Claude to enrich it
      const nba = await enrichAlert(newAlert)

      // Update alert with real NBA when Claude responds
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === newAlert.id
            ? {
                ...a,
                status: 'ready' as const,
                ...(nba ? { nba } : {}),
              }
            : a
        )
      )
    }, 20000)

    return () => clearInterval(interval)
  }, [])

  return { alerts, setAlerts }
}
