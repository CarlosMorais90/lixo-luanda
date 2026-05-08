'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

interface ProtegerPaginaProps {
  children: React.ReactNode
  perfisPermitidos: ('gestor' | 'chefe' | 'camionista' | 'operador')[]
}

export default function ProtegerPagina({ children, perfisPermitidos }: ProtegerPaginaProps) {
  const { utilizador, perfil, carregando } = useAuth()
  const router = useRouter()
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!utilizador) {
        router.push('/login')
        return
      }
      setPronto(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [utilizador, carregando])

  useEffect(() => {
    if (!carregando && utilizador && perfil) {
      if (!perfisPermitidos.includes(perfil.perfil)) {
        router.push('/login')
        return
      }
      setPronto(true)
    }
  }, [carregando, utilizador, perfil])

  if (!pronto) {
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

  return <>{children}</>
}