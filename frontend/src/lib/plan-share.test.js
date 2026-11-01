import { describe, expect, it } from 'vitest'
import { EXDB } from './exercises.js'
import { buildPlanBundle, parsePlan, planPrintHTML } from './plan-share.js'

const lift = EXDB.find(ex => ex.bp !== 'cardio')
const state = {
  unit: 'kg',
  week: { 1: 'r1' },
  customEx: [],
  routines: [{
    id: 'r1', name: 'Full body', emoji: 'dumbbell',
    ex: [{ id: lift.id, sets: 3, reps: 8, weight: 40 }]
  }]
}

describe('GYMAX plan sharing', () => {
  it('writes a GYMAX marker while preserving openGym import compatibility', () => {
    const bundle = buildPlanBundle(state, 'My plan')

    expect(bundle.gymax_plan).toBe(1)
    expect(bundle.opengym_plan).toBe(1)
    expect(parsePlan(bundle).routineCount).toBe(1)
  })

  it('keeps accepting a legacy openGym plan file', () => {
    const legacy = {
      opengym_plan: 1,
      name: 'Legacy plan',
      week: { 1: 'r1' },
      customEx: [],
      routines: [{ id: 'r1', name: 'Legacy', ex: [{ id: lift.id, sets: 3, reps: 10 }] }]
    }

    expect(parsePlan(legacy).name).toBe('Legacy plan')
  })

  it('rejects an unknown plan format version', () => {
    expect(() => parsePlan({ gymax_plan: 2, routines: [] })).toThrow()
  })

  it('prints the branded name without an upstream domain', () => {
    const html = planPrintHTML(state, 'Ilyass')

    expect(html).toContain('>GYMAX<')
    expect(html).toContain('Made with GYMAX')
    expect(html).not.toContain('opengym.duarte-santos.ch')
  })
})
