import { vi } from 'vitest'

// Basic global fetch mock
global.fetch = vi.fn(async () => ({ ok: true, json: async () => [] })) as any;

// Provide small window properties used by component
Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
