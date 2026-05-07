'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PaginaRegisto() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [perfil, setPerfil] = useState<'gestor' | 'chefe' | 'camionista' | 'operador'>('camionista')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)
  const supabase = createSupabaseBrowser()
  const router = useRouter()

  const registar = async () => {
    setCarregando(true)
    setErro(null)

    try {
      // Criar o utilizador no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        setErro('Erro ao criar conta: ' + error.message)
        return
      }

      if (!data.user) {
        setErro('Erro ao criar utilizador.')
        return
      }

      // Criar o perfil na tabela perfis
      const { error: perfilError } = await supabase
        .from('perfis')
        .insert([{
          id: data.user.id,
          email,
          nome,
          perfil
        }])

      if (perfilError) {
        setErro('Erro ao criar perfil: ' + perfilError.message)
        return
      }

      setSucesso(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch (e) {
      setErro('Erro inesperado. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  const coresPerfil = {
    gestor: '#1e40af',
    chefe: '#1e293b',
    camionista: '#15803d',
    operador: '#d97706'
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
        {/* Título */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>👤</div>
          <h1 style={{
            margin: 0, fontSize: '22px',
            fontWeight: '700', color: '#1e293b'
          }}>
            Criar nova conta
          </h1>
          <p style={{
            margin: '8px 0 0', fontSize: '14px',
            color: '#64748b'
          }}>
            Preencha os dados do novo utilizador
          </p>
        </div>

        {/* Sucesso */}
        {sucesso && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#15803d',
            fontSize: '14px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            ✅ Conta criada com sucesso! A redirecionar...
          </div>
        )}

        {/* Erro */}
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
            ❌ {erro}
          </div>
        )}

        {/* Nome */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block', fontSize: '14px',
            fontWeight: '500', color: '#374151', marginBottom: '6px'
          }}>
            Nome completo
          </label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Ex: João Manuel"
            style={{
              width: '100%', padding: '12px 16px',
              borderRadius: '8px', border: '1px solid #d1d5db',
              fontSize: '15px', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Email */}
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

        {/* Password */}
        <div style={{ marginBottom: '16px' }}>
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
            placeholder="Mínimo 6 caracteres"
            style={{
              width: '100%', padding: '12px 16px',
              borderRadius: '8px', border: '1px solid #d1d5db',
              fontSize: '15px', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Tipo de perfil */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block', fontSize: '14px',
            fontWeight: '500', color: '#374151', marginBottom: '10px'
          }}>
            Tipo de perfil
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px'
          }}>
            {[
              { valor: 'gestor', icone: '🏛️', label: 'Gestor' },
              { valor: 'chefe', icone: '👔', label: 'Chefe' },
              { valor: 'camionista', icone: '🚛', label: 'Camionista' },
              { valor: 'operador', icone: '📷', label: 'Operador' }
            ].map(op => (
              <button
                key={op.valor}
                onClick={() => setPerfil(op.valor as any)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: perfil === op.valor
                    ? `2px solid ${coresPerfil[op.valor as keyof typeof coresPerfil]}`
                    : '2px solid #e2e8f0',
                  background: perfil === op.valor ? '#f8fafc' : 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: perfil === op.valor ? '600' : '400',
                  color: perfil === op.valor
                    ? coresPerfil[op.valor as keyof typeof coresPerfil]
                    : '#64748b'
                }}
              >
                {op.icone} {op.label}
              </button>
            ))}
          </div>
        </div>

        {/* Botão registar */}
        <button
          onClick={registar}
          disabled={carregando || !nome || !email || !password}
          style={{
            width: '100%',
            background: carregando || !nome || !email || !password
              ? '#94a3b8' : '#1e40af',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '14px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: carregando || !nome || !email || !password
              ? 'not-allowed' : 'pointer',
            marginBottom: '12px'
          }}
        >
          {carregando ? '⏳ A criar conta...' : '✅ Criar conta'}
        </button>

        <button
          onClick={() => router.push('/login')}
          style={{
            width: '100%',
            background: 'transparent',
            color: '#64748b',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          ← Voltar ao login
        </button>
      </div>
    </main>
  )
}