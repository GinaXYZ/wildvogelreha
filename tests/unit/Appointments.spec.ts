import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia } from 'pinia'
import Appointments from '../../src/components/Appointments.vue'

beforeEach(() => {
  // mount will provide Pinia via global plugins; reset fetch mock per test
  (global as any).fetch = vi.fn(async () => ({ ok: true, json: async () => [] }))
})

describe('Appointments.vue basic rendering', () => {
  it('renders header and import/export buttons', () => {
    const wrapper = mount(Appointments, { global: { plugins: [createPinia()] } })
    expect(wrapper.find('.btn-import').exists()).toBe(true)
    expect(wrapper.find('.btn-export').exists()).toBe(true)
    expect(wrapper.find('.btn-add').exists()).toBe(true)
  })

  it('switches view to list when clicking Liste button', async () => {
    const wrapper = mount(Appointments, { global: { plugins: [createPinia()] } })
    const listBtn = wrapper.findAll('.view-toggle button').find(b => b.text().includes('Liste'))
    expect(listBtn).toBeTruthy()
    await listBtn!.trigger('click')
    // list-view should be present
    expect(wrapper.find('.list-view').exists()).toBe(true)
  })
})
