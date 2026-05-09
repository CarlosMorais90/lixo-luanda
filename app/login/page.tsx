'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'

export default function PaginaLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const entrar = async () => {
    setCarregando(true)
    setErro(null)
    try {
      const supabase = createSupabaseBrowser()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setErro('Email ou password incorrectos.')
        setCarregando(false)
        return
      }
      const { data: perfil } = await supabase
        .from('perfis')
        .select('perfil')
        .eq('id', data.user.id)
        .single()
      if (perfil?.perfil === 'camionista') window.location.replace('/camionista')
      else if (perfil?.perfil === 'operador') window.location.replace('/operador')
      else if (perfil?.perfil === 'chefe') window.location.replace('/chefe')
      else window.location.replace('/')
    } catch (e) {
      setErro('Erro ao fazer login.')
      setCarregando(false)
    }
  }
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🗺️</div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1e293b' }}>
            Recolha de Lixo — Luanda
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#64748b' }}>
            Entre na sua conta para continuar
          </p>
        </div>
        {erro && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#dc2626',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            {erro}
          </div>
        )}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block', fontSize: '14px',
            fontWeight: '500', color: '#374151', marginBottom: '6px'
          }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="exemplo@gmail.com"
            style={{
              width: '100%', padding: '12px 16px',
              borderRadius: '8px', border: '1px solid #d1d5db',
              fontSize: '15px', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block', fontSize: '14px',
            fontWeight: '500', color: '#374151', marginBottom: '6px'
          }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && entrar()}
            style={{
              width: '100%', padding: '12px 16px',
              borderRadius: '8px', border: '1px solid #d1d5db',
              fontSize: '15px', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>
        <button
          onClick={entrar}
          disabled={carregando || !email || !password}
          style={{
            width: '100%',
            background: carregando || !email || !password ? '#94a3b8' : '#1e40af',
            color: 'white', border: 'none', borderRadius: '10px',
            padding: '14px', fontSize: '16px', fontWeight: '700',
            cursor: carregando || !email || !password ? 'not-allowed' : 'pointer'
          }}
        >
          {carregando ? 'A entrar...' : 'Entrar'}
        </button>
        <p style={{
          textAlign: 'center', marginTop: '24px',
          fontSize: '12px', color: '#94a3b8'
        }}>
          Sistema de Gestão Municipal — Luanda, Angola
        </p>
      </div>
    </main>
  )
}