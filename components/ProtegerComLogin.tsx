'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface ProtegerComLoginProps {
  children: React.ReactNode
  perfisPermitidos: string[]
  caminhoLogin: string
}

export default function ProtegerComLogin({
  children,
  perfisPermitidos,
  caminhoLogin
}: ProtegerComLoginProps) {
  const [verificado, setVerificado] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const verificarAuth = async () => {
      try {
        const supabase = createSupabaseBrowser()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push(caminhoLogin)
          return
        }

        const { data: perfil } = await supabase
          .from('perfis')
          .select('perfil')
          .eq('id', session.user.id)
          .single()

        if (!perfil || !perfisPermitidos.includes(perfil.perfil)) {
          router.push('/')
          return
        }

        setVerificado(true)
      } catch (erro) {
        router.push(caminhoLogin)
      } finally {
        setCarregando(false)
      }
    }

    verificarAuth()
  }, [caminhoLogin, perfisPermitidos, router])

  if (carregando) {
    return (
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f1f5f9',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#64748b' }}>A verificar acesso...</p>
        </div>
      </main>
    )
  }

  if (!verificado) {
    return null
  }

  return <>{children}</>
}
