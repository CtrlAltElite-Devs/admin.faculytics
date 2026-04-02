import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Environment } from '@/types/api'

const DEFAULT_ENV: Environment = {
  id: 'local',
  label: 'Local',
  baseUrl: 'http://localhost:5200',
  color: '#22c55e',
}

interface EnvState {
  environments: Environment[]
  activeEnvId: string | null

  addEnvironment: (env: Omit<Environment, 'id'>) => string
  updateEnvironment: (id: string, patch: Partial<Omit<Environment, 'id'>>) => void
  removeEnvironment: (id: string) => void
  setActiveEnv: (id: string | null) => void
  getActiveEnv: () => Environment | undefined
}

export const useEnvStore = create<EnvState>()(
  persist(
    (set, get) => ({
      environments: [DEFAULT_ENV],
      activeEnvId: DEFAULT_ENV.id,

      addEnvironment: (env) => {
        const id = crypto.randomUUID()
        set((s) => ({
          environments: [...s.environments, { ...env, id }],
        }))
        return id
      },

      updateEnvironment: (id, patch) => {
        set((s) => ({
          environments: s.environments.map((e) =>
            e.id === id ? { ...e, ...patch } : e,
          ),
        }))
      },

      removeEnvironment: (id) => {
        set((s) => ({
          environments: s.environments.filter((e) => e.id !== id),
          activeEnvId: s.activeEnvId === id ? null : s.activeEnvId,
        }))
      },

      setActiveEnv: (id) => set({ activeEnvId: id }),

      getActiveEnv: () => {
        const { environments, activeEnvId } = get()
        return environments.find((e) => e.id === activeEnvId)
      },
    }),
    {
      name: 'faculytics-admin-envs',
    },
  ),
)
