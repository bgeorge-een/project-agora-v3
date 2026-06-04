'use client'

import { useState, useEffect } from 'react'
import type { Alert } from '@/lib/types'
import { MOCK_ALERTS } from '@/lib/mock-data/scenarios'

export function useSimulation() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS)

  useEffect(() => {
    const interval = setInterval(() => {
      // Age all existing alerts so the queue feels alive
      setAlerts((prev) =>
        prev.map((a) => ({ ...a, ageSeconds: a.ageSeconds + 12 }))
      )

      // 20% chance: add a new medium alert
      if (Math.random() < 0.2) {
        const newAlert: Alert = {
          id: `alert-sim-${Date.now()}`,
          type: 'reactive',
          severity: 'medium',
          status: 'enriching',
          title: 'Propped door alert — East Exit E3',
          location: 'East Wing · Austin HQ',
          siteId: 'site-austin',
          siteName: 'Austin HQ',
          timestamp: new Date().toISOString(),
          ageSeconds: 0,
          sources: ['Door Sensor'],
          entityRefs: [],
        }
        setAlerts((prev) => [newAlert, ...prev])
        // After 5s, transition to ready with NBA
        setTimeout(() => {
          setAlerts((prev) =>
            prev.map((a) =>
              a.id === newAlert.id
                ? {
                    ...a,
                    status: 'ready' as const,
                    nba: {
                      recommendationId: `nba-sim-${Date.now()}`,
                      recommendedAction: 'Dispatch guard to East Exit E3',
                      rationale:
                        'Door sensor reports propped open for >2 minutes. No badge activity.',
                      confidence: 0.76,
                      urgency: 'medium' as const,
                      alternatives: ['Remote camera check', 'Alert shift supervisor'],
                      requiresApproval: false,
                      autoExecuteActions: ['Notify on-call guard', 'Lock Evidence'],
                      gatedActions: [],
                    },
                  }
                : a
            )
          )
        }, 5000)
      }
    }, 12000)
    return () => clearInterval(interval)
  }, [])

  return { alerts, setAlerts }
}
