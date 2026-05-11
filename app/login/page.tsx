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

      const destino = perfil?.perfil === 'camionista' ? '/camionista'
        : perfil?.perfil === 'operador' ? '/operador'
        : perfil?.perfil === 'chefe' ? '/chefe'
        : perfil?.perfil === 'gestor' ? '/admin'
        : '/'

      // Aguardar que a sessão seja guardada e redirecionar
      await new Promise(resolve => setTimeout(resolve, 500))
      window.location.href = destino
    } catch (e) {
      setErro('Erro ao fazer login.')
      setCarregando(false)
    }
  }
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🌿</div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#064e3b' }}>
            Luanda Limpa
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#6b7280' }}>
            Gestão inteligente de resíduos urbanos
          </p>
          <div style={{ width: '40px', height: '3px', background: '#059669', borderRadius: '99px', margin: '16px auto 0' }} />
        </div>

        {erro && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: '10px', padding: '12px 16px',
            color: '#dc2626', fontSize: '14px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            ❌ {erro}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="exemplo@gmail.com"
            style={{
              width: '100%', padding: '14px 16px', borderRadius: '10px',
              border: '2px solid #e5e7eb', fontSize: '15px',
              outline: 'none', boxSizing: 'border-box' as const,
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#059669'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && entrar()}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: '10px',
              border: '2px solid #e5e7eb', fontSize: '15px',
              outline: 'none', boxSizing: 'border-box' as const
            }}
            onFocus={e => e.target.style.borderColor = '#059669'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <button
          onClick={entrar}
          disabled={carregando || !email || !password}
          style={{
            width: '100%',
            background: carregando || !email || !password
              ? '#9ca3af'
              : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: 'white', border: 'none', borderRadius: '12px',
            padding: '16px', fontSize: '16px', fontWeight: '700',
            cursor: carregando || !email || !password ? 'not-allowed' : 'pointer',
            boxShadow: carregando || !email || !password ? 'none' : '0 4px 15px rgba(5,150,105,0.4)'
          }}
        >
          {carregando ? '⏳ A verificar...' : '🔐 Entrar no sistema'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f3f4f6' }}>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
            Luanda, Angola • Sistema Municipal de Gestão de Resíduos
          </p>
        </div>
      </div>
    </main>
  )
}