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

  useEffect(() => {
    const supabase = createSupabaseBrowser()

    // Verificar sessão actual
    supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
      const session = data.session
      if (session?.user) {
        setUtilizador(session.user)
        supabase
          .from('perfis')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setPerfil(data)
            setCarregando(false)
          })
      } else {
        setCarregando(false)
      }
    })

    // Ouvir mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUtilizador(session.user)
          const { data } = await supabase
            .from('perfis')
            .select('*')
            .eq('id', session.user.id)
            .single()
          if (data) setPerfil(data)
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
    const supabase = createSupabaseBrowser()
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