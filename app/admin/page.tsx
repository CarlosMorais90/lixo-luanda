'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import VerificarAuth from '@/components/VerificarAuth'

interface Funcionario {
  id: string
  nome: string
  email: string
  perfil: string
  cargo: string
  municipio: string
  telefone: string
  estado: string
  criado_em: string
}

const MUNICIPIOS_LUANDA = [
  'Belas', 'Cacuaco', 'Cazenga', 'Icolo e Bengo',
  'Kilamba Kiaxi', 'Luanda', 'Maianga', 'Quissama',
  'Rangel', 'Samba', 'Sambizanga', 'Talatona', 'Viana'
]

export default function PaginaAdmin() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [perfil, setPerfil] = useState<'chefe' | 'camionista' | 'operador'>('chefe')
  const [municipio, setMunicipio] = useState('')
  const [telefone, setTelefone] = useState('')

  const supabase = createSupabaseBrowser()

  const buscarFuncionarios = async () => {
    const { data } = await supabase
      .from('perfis')
      .select('*')
      .neq('perfil', 'gestor')
      .order('criado_em', { ascending: false })
    if (data) setFuncionarios(data)
    setCarregando(false)
  }

  useEffect(() => { buscarFuncionarios() }, [])

  const gerarPassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }

  const registarFuncionario = async () => {
    if (!nome || !email || !municipio) {
      setErro('Preencha todos os campos obrigatórios')
      return
    }

    setEnviando(true)
    setErro(null)

    try {
      const passwordTemp = gerarPassword()

      // Usar API route no servidor para criar o utilizador
      const resposta = await fetch('/api/registar-funcionario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome, email, perfil, municipio, telefone, passwordTemp
        })
      })

      const resultado = await resposta.json()
      if (!resultado.sucesso) throw new Error(resultado.erro)

      // Enviar email com credenciais
      await enviarEmailCredenciais(nome, email, passwordTemp, perfil, municipio)

      setSucesso(`Funcionário ${nome} registado com sucesso! Email enviado para ${email}`)
      setNome(''); setEmail(''); setMunicipio(''); setTelefone('')
      setMostrarForm(false)
      buscarFuncionarios()

    } catch (e: any) {
      setErro(e.message || 'Erro ao registar funcionário')
    } finally {
      setEnviando(false)
    }
  }

  const enviarEmailCredenciais = async (
    nome: string, email: string, password: string,
    perfil: string, municipio: string
  ) => {
    const emailjs = await import('@emailjs/browser')
    const perfilLabel = perfil === 'chefe' ? 'Chefe Municipal'
      : perfil === 'camionista' ? 'Camionista'
      : 'Operador de Campo'
    const linkAcesso = perfil === 'chefe' ? '/chefe'
      : perfil === 'camionista' ? '/camionista'
      : '/operador'

    await emailjs.default.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      {
        to_email: email,
        nome_destinatario: nome,
        assunto: `Bem-vindo ao Luanda Limpa — As suas credenciais de acesso`,
        mensagem: `Foi registado no sistema Luanda Limpa como ${perfilLabel} no município de ${municipio}.`,
        contentor: `Utilizador: ${email}`,
        estado: `Password temporária: ${password}`,
        local: `Aceda em: https://lixo-luanda.vercel.app${linkAcesso}`,
        data_hora: new Date().toLocaleString('pt-PT')
      },
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    )
  }
  const corPerfil = (p: string) => {
    if (p === 'chefe') return '#1e293b'
    if (p === 'camionista') return '#15803d'
    return '#d97706'
  }

  return (
    <VerificarAuth perfisPermitidos={['gestor']}>
    <main style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>
      {/* Cabeçalho */}
      <header style={{ background: '#1e293b', color: 'white', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>🌿 Luanda Limpa — Painel Admin</h1>
          <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.7 }}>Gestão de funcionários</p>
        </div>
        <nav style={{ display: 'flex', gap: '8px' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none', padding: '6px 14px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '13px' }}>📊 Dashboard</a>
          <a href="/chefe" style={{ color: 'white', textDecoration: 'none', padding: '6px 14px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '13px' }}>📋 Chefe</a>
        </nav>
      </header>

      <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>

        {sucesso && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '16px', color: '#15803d', marginBottom: '24px' }}>
            ✅ {sucesso}
          </div>
        )}

        {erro && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '16px', color: '#dc2626', marginBottom: '24px' }}>
            ❌ {erro}
          </div>
        )}

        {/* Botão registar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, color: '#1e293b' }}>👥 Funcionários registados</h2>
          <button onClick={() => setMostrarForm(!mostrarForm)} style={{ background: '#1e40af', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
            {mostrarForm ? '✕ Cancelar' : '➕ Registar funcionário'}
          </button>
        </div>

        {/* Formulário de registo */}
        {mostrarForm && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <h3 style={{ margin: '0 0 20px', color: '#1e293b' }}>Novo funcionário</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>Nome completo *</label>
                <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: João Manuel Silva" style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '2px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', background: '#f8fafc', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#1e40af'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '2px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', background: '#f8fafc', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#1e40af'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>Função *</label>
                <select value={perfil} onChange={e => setPerfil(e.target.value as any)} style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '2px solid #cbd5e1', fontSize: '14px', background: '#f8fafc', boxSizing: 'border-box', cursor: 'pointer', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#1e40af'} onBlur={e => e.target.style.borderColor = '#cbd5e1'}>
                  <option value="chefe">👔 Chefe Municipal</option>
                  <option value="camionista">🚛 Camionista</option>
                  <option value="operador">📷 Operador de Campo</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>Município *</label>
                <select value={municipio} onChange={e => setMunicipio(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '2px solid #cbd5e1', fontSize: '14px', background: '#f8fafc', boxSizing: 'border-box', cursor: 'pointer', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#1e40af'} onBlur={e => e.target.style.borderColor = '#cbd5e1'}>
                  <option value="">-- Seleccione o município --</option>
                  {MUNICIPIOS_LUANDA.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>Telefone</label>
                <input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="Ex: +244 923 000 000" style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '2px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', background: '#f8fafc', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#1e40af'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
              </div>
            </div>
            <div style={{ marginTop: '20px', padding: '12px 16px', background: '#eff6ff', borderRadius: '8px', fontSize: '13px', color: '#1e40af' }}>
              📧 Um email será enviado automaticamente ao funcionário com as credenciais de acesso e o link do seu painel.
            </div>
            <button onClick={registarFuncionario} disabled={enviando} style={{ marginTop: '16px', background: enviando ? '#94a3b8' : '#15803d', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 28px', cursor: enviando ? 'not-allowed' : 'pointer', fontSize: '15px', fontWeight: '600' }}>
              {enviando ? '⏳ A registar...' : '✅ Registar e enviar email'}
            </button>
          </div>
        )}

        {/* Lista de funcionários */}
        {carregando ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>⏳ A carregar...</div>
        ) : funcionarios.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#64748b', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
            <p>Nenhum funcionário registado ainda.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {funcionarios.map(f => (
              <div key={f.id} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: corPerfil(f.perfil), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                  {f.perfil === 'chefe' ? '👔' : f.perfil === 'camionista' ? '🚛' : '📷'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '15px' }}>{f.nome}</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>{f.email} · {f.municipio}</div>
                </div>
                <span style={{ background: corPerfil(f.perfil) + '20', color: corPerfil(f.perfil), padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                  {f.cargo || f.perfil}
                </span>
                <span style={{ background: f.estado === 'activo' ? '#f0fdf4' : '#fef2f2', color: f.estado === 'activo' ? '#15803d' : '#dc2626', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
                  {f.estado}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
    </VerificarAuth>
  )
}