'use client'

import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function Cabecalho() {
  const { perfil, logout } = useAuth()
  const router = useRouter()

  const iconePerfil = {
    gestor: '🏛️',
    chefe: '👔',
    camionista: '🚛',
    operador: '📷'
  }

  return (
    <header style={{
      background: '#1e40af',
      color: 'white',
      padding: '12px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Logo e título */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '24px' }}>🗺️</span>
        <div>
          <div style={{ fontWeight: '700', fontSize: '16px' }}>
            Luanda Limpa— Luanda
          </div>
          <div style={{ fontSize: '11px', opacity: 0.8 }}>
            Gestão inteligente de resíduos urbanos
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'rgba(255,255,255,0.15)',
            color: 'white', border: 'none',
            borderRadius: '8px', padding: '8px 14px',
            cursor: 'pointer', fontSize: '13px'
          }}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => router.push('/operador')}
          style={{
            background: 'rgba(255,255,255,0.15)',
            color: 'white', border: 'none',
            borderRadius: '8px', padding: '8px 14px',
            cursor: 'pointer', fontSize: '13px'
          }}
        >
          📷 Operador
        </button>
        <button
          onClick={() => router.push('/camionista')}
          style={{
            background: 'rgba(255,255,255,0.15)',
            color: 'white', border: 'none',
            borderRadius: '8px', padding: '8px 14px',
            cursor: 'pointer', fontSize: '13px'
          }}
        >
          🚛 Camionista
        </button>
        <button
          onClick={() => router.push('/chefe')}
          style={{
            background: 'rgba(255,255,255,0.15)',
            color: 'white', border: 'none',
            borderRadius: '8px', padding: '8px 14px',
            cursor: 'pointer', fontSize: '13px'
          }}
        >
          📋 Chefe
        </button>
      </nav>

      {/* Perfil e logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {perfil && (
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '8px', padding: '8px 14px',
            fontSize: '13px'
          }}>
            {iconePerfil[perfil.perfil]} {perfil.nome}
          </div>
        )}
        <button
          onClick={logout}
          style={{
            background: '#dc2626',
            color: 'white', border: 'none',
            borderRadius: '8px', padding: '8px 14px',
            cursor: 'pointer', fontSize: '13px',
            fontWeight: '600'
          }}
        >
          🚪 Sair
        </button>
      </div>
    </header>
  )
}