import assert from 'node:assert/strict'
import test from 'node:test'
import { formatStraightLineDistance, straightLineDistanceKm } from '../src/features/discovery/distance.ts'

const manila = { lat: 14.5995, lng: 120.9842 }

test('straight-line distance is zero at the search center', () => {
  assert.equal(straightLineDistanceKm(manila, manila), 0)
  assert.equal(formatStraightLineDistance(0), 'Under 0.1 km straight-line distance')
})

test('distance from Manila to a Quezon City center is plausible', () => {
  const distance = straightLineDistanceKm(manila, { lat: 14.676, lng: 121.0437 })
  assert.ok(distance !== null && distance > 10 && distance < 12)
  assert.match(formatStraightLineDistance(distance), /^\d+\.\d km straight-line distance$/)
})

test('missing or invalid coordinates are unavailable', () => {
  assert.equal(straightLineDistanceKm(manila, null), null)
  assert.equal(straightLineDistanceKm(manila, { lat: Number.NaN, lng: 121 }), null)
  assert.equal(straightLineDistanceKm(manila, { lat: 95, lng: 121 }), null)
  assert.equal(formatStraightLineDistance(null), 'Straight-line distance unavailable')
})
