import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { createPinia } from 'pinia'
import Project from '../../src/components/Project.vue'

describe('Project.vue', () => {
  it('renders Appointments component inside', () => {
    const wrapper = mount(Project, { global: { plugins: [createPinia()] } })
    // Appointment container should be in the DOM
    expect(wrapper.find('.appointments-container').exists()).toBe(true)
  })
})
