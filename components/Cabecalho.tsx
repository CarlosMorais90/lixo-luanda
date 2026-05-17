'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'

interface CabecalhoProps {
  titulo: string
  subtitulo?: string
  corFundo?: string
}

export default function Cabecalho({ titulo, subtitulo, corFundo = '#064e3b' }: CabecalhoProps) {
  const [nomePerfil, setNomePerfil] = useState('')
  const [tipoPerfil, setTipoPerfil] = useState('')

  useEffect(() => {
    const buscarPerfil = async () => {
      const supabase = createSupabaseBrowser()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase
        .from('perfis')
        .select('nome, perfil')
        .eq('id', session.user.id)
        .single()
      if (data) {
        setNomePerfil(data.nome)
        setTipoPerfil(data.perfil)
      }
    }
    buscarPerfil()
  }, [])

  const logout = async () => {
    const supabase = createSupabaseBrowser()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const iconePerfil = (p: string) => {
    if (p === 'gestor') return '🏛️'
    if (p === 'chefe') return '👔'
    if (p === 'camionista') return '🚛'
    if (p === 'operador') return '📷'
    return '👤'
  }

  return (
    <header style={{
      background: corFundo,
      color: 'white',
      padding: '0',
      boxShadow: '0 2px 20px rgba(0,0,0,0.2)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Barra superior */}
      <div style={{
        background: 'rgba(0,0,0,0.2)',
        padding: '6px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>📊 Dashboard</a>
          <a href="/admin" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>👥 Admin</a>
          <a href="/operador" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>📷 Operador</a>
          <a href="/camionista" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>🚛 Camionista</a>
          <a href="/chefe" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>📋 Chefe</a>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {nomePerfil && (
            <span style={{ color: 'rgba(255,255,255,0.9)' }}>
              {iconePerfil(tipoPerfil)} {nomePerfil}
            </span>
          )}
          <button
            onClick={logout}
            style={{
              background: 'rgba(220,38,38,0.8)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 12px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Sair
          </button>
        </div>
      </div>

      {/* Barra principal */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '44px', height: '44px',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '24px'
        }}>
          🌿
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>{titulo}</h1>
          {subtitulo && (
            <p style={{ margin: '2px 0 0', fontSize: '13px', opacity: 0.8 }}>{subtitulo}</p>
          )}
        </div>
      </div>
    </header>
  )
}