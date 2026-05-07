'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

interface ProtegerPaginaProps {
  children: React.ReactNode
  perfisPermitidos: ('gestor' | 'chefe' | 'camionista' | 'operador')[]
}

export default function ProtegerPagina({
  children,
  perfisPermitidos
}: ProtegerPaginaProps) {
  const { utilizador, perfil, carregando } = useAuth()
  const router = useRouter()
  const [verificado, setVerificado] = useState(false)

  useEffect(() => {
    if (carregando) return

    const timer = setTimeout(() => {
      if (!utilizador) {
        router.push('/login')
        return
      }
      if (perfil && !perfisPermitidos.includes(perfil.perfil)) {
        router.push('/login')
        return
      }
      setVerificado(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [utilizador, perfil, carregando])

  if (carregando || !verificado) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#64748b' }}>A verificar autenticação...</p>
        </div>
      </div>
    )
  }

  if (!utilizador || !perfil) {
    router.push('/login')
    return null
  }

  if (!perfisPermitidos.includes(perfil.perfil)) {
    router.push('/login')
    return null
  }

  return <>{children}</>
}