'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createSupabaseBrowser } from './supabase'

interface Perfil {
  id: string
  email: string
  nome: string
  perfil: 'gestor' | 'chefe' | 'camionista' | 'operador'
  activo: boolean
}

interface AuthContextType {
  utilizador: User | null
  perfil: Perfil | null
  carregando: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  utilizador: null,
  perfil: null,
  carregando: true,
  logout: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [utilizador, setUtilizador] = useState<User | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [carregando, setCarregando] = useState(true)
  const supabase = createSupabaseBrowser()

  const buscarPerfil = async (userId: string) => {
    const { data } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setPerfil(data)
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUtilizador(session.user)
          await buscarPerfil(session.user.id)
        } else {
          setUtilizador(null)
          setPerfil(null)
        }
        setCarregando(false)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ utilizador, perfil, carregando, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)