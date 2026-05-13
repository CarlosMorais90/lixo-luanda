'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PaginaLoginCamionista() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const router = useRouter()

  const entrar = async () => {
    if (!email || !password) {
      setErro('Preencha todos os campos')
      return
    }

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

      if (!perfil || !['camionista', 'gestor'].includes(perfil.perfil)) {
        setErro('Sem permissão para aceder a este painel.')
        await supabase.auth.signOut()
        setCarregando(false)
        return
      }

      await new Promise(resolve => setTimeout(resolve, 500))
      router.push('/camionista')
    } catch (e) {
      setErro('Erro ao fazer login.')
      setCarregando(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') entrar()
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #15803d 0%, #166534 50%, #15803d 100%)',
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
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🚛</div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#15803d' }}>
            Painel do Camionista
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#6b7280' }}>
            Gestão de rotas de recolha
          </p>
          <div style={{ width: '40px', height: '3px', background: '#15803d', borderRadius: '99px', margin: '16px auto 0' }} />
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
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#15803d', marginBottom: '8px' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="seu.email@exemplo.com"
            style={{
              width: '100%', padding: '14px 16px', borderRadius: '10px',
              border: '2px solid #e5e7eb', fontSize: '15px',
              outline: 'none', boxSizing: 'border-box' as const,
              background: '#f9fafb',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#15803d'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#15803d', marginBottom: '8px' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="••••••••"
            style={{
              width: '100%', padding: '14px 16px', borderRadius: '10px',
              border: '2px solid #e5e7eb', fontSize: '15px',
              outline: 'none', boxSizing: 'border-box' as const,
              background: '#f9fafb',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#15803d'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <button
          onClick={entrar}
          disabled={carregando}
          style={{
            width: '100%', padding: '14px 20px',
            background: carregando ? '#9ca3af' : '#15803d',
            color: 'white', border: 'none', borderRadius: '10px',
            fontSize: '15px', fontWeight: '700',
            cursor: carregando ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {carregando ? '⏳ A entrar...' : '🔓 Entrar'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#6b7280', fontSize: '14px' }}>
          <a href="/" style={{ color: '#15803d', textDecoration: 'none', fontWeight: '600' }}>
            ← Voltar ao Dashboard
          </a>
        </p>
      </div>
    </main>
  )
}
