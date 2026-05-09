'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createSupabaseBrowser } from './supabase'

interface Perfil {
  id: string
  email: string
  nome: string
  perfil: 'gestor' | 'chefe' | 'camionista' | 'operador'
  activo: boolean
}

interface AuthContextType {
  utilizador: any
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
  const [utilizador, setUtilizador] = useState<any>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const supabase = createSupabaseBrowser()

    supabase.auth.getSession().then((response: any) => {
      const session = response?.data?.session
      if (session?.user) {
        setUtilizador(session.user)
        supabase
          .from('perfis')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then((perfilResponse: any) => {
            if (perfilResponse?.data) setPerfil(perfilResponse.data)
            setCarregando(false)
          })
      } else {
        setCarregando(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (session?.user) {
          setUtilizador(session.user)
          const perfilResponse: any = await supabase
            .from('perfis')
            .select('*')
            .eq('id', session.user.id)
            .single()
          if (perfilResponse?.data) setPerfil(perfilResponse.data)
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