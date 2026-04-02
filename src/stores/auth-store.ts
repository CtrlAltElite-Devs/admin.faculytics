import { create } from 'zustand'
import type { MeResponse } from '@/types/api'

export interface Session {
  token: string
  refreshToken: string
  user: MeResponse
}

interface AuthState {
  /** Keyed by environment ID — in-memory only, cleared on page refresh */
  sessions: Record<string, Session>

  setSession: (envId: string, session: Session) => void
  clearSession: (envId: string) => void
  getSession: (envId: string) => Session | undefined
  getToken: (envId: string) => string | undefined
  isAuthenticated: (envId: string) => boolean
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  sessions: {},

  setSession: (envId, session) =>
    set((s) => ({
      sessions: { ...s.sessions, [envId]: session },
    })),

  clearSession: (envId) =>
    set((s) => {
      const { [envId]: _, ...rest } = s.sessions
      return { sessions: rest }
    }),

  getSession: (envId) => get().sessions[envId],

  getToken: (envId) => get().sessions[envId]?.token,

  isAuthenticated: (envId) => !!get().sessions[envId]?.token,
}))
