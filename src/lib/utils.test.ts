import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('utils', () => {
  describe('cn', () => {
    it('classNameを結合できる', () => {
      expect(cn('a', 'b')).toBe('a b')
    })

    it('条件付きクラスを処理できる', () => {
      const shouldInclude = false
      expect(cn('a', shouldInclude && 'b', 'c')).toBe('a c')
    })

    it('重複を除去できる', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4')
    })
  })
})