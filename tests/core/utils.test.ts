import { describe, it, expect } from 'vitest'
import { sortBy, toggleListItem } from '../../src/core/utils.js'

describe('sortBy', () => {
  it('sorts an array by a string getter ascending', () => {
    const input = [{ name: 'Zebra' }, { name: 'Apple' }, { name: 'Mango' }]
    const result = sortBy(input, (x) => x.name.toLowerCase())
    expect(result.map((x) => x.name)).toEqual(['Apple', 'Mango', 'Zebra'])
  })

  it('sorts an array by a number getter ascending', () => {
    const input = [{ n: 3 }, { n: 1 }, { n: 2 }]
    const result = sortBy(input, (x) => x.n)
    expect(result.map((x) => x.n)).toEqual([1, 2, 3])
  })

  it('does not mutate the original array', () => {
    const input = [{ n: 2 }, { n: 1 }]
    sortBy(input, (x) => x.n)
    expect(input[0].n).toBe(2)
  })

  it('returns empty array unchanged', () => {
    expect(sortBy([], (x: string) => x)).toEqual([])
  })
})

describe('toggleListItem', () => {
  it('adds item when not present', () => {
    expect(toggleListItem(['a', 'b'], 'c')).toEqual(['a', 'b', 'c'])
  })

  it('removes item when present', () => {
    expect(toggleListItem(['a', 'b', 'c'], 'b')).toEqual(['a', 'c'])
  })

  it('does not mutate the original array', () => {
    const input = ['a', 'b']
    toggleListItem(input, 'a')
    expect(input).toEqual(['a', 'b'])
  })

  it('returns empty array when removing last item', () => {
    expect(toggleListItem(['a'], 'a')).toEqual([])
  })
})
