'use client'

import { useEffect } from 'react'
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

  useEffect(() => {
    if (!carregando) {
      if (!utilizador) {
        router.push('/login')
        return
      }
      if (perfil && !perfisPermitidos.includes(perfil.perfil)) {
        router.push('/login')
      }
    }
  }, [utilizador, perfil, carregando])

  if (carregando) {
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

  if (!utilizador || !perfil) return null

  if (!perfisPermitidos.includes(perfil.perfil)) return null

  return <>{children}</>
}