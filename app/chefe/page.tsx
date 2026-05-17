'use client'

import VerificarAuth from '@/components/VerificarAuth'
import MudarPassword from '@/components/MudarPassword'
import ProtegerComLogin from '@/components/ProtegerComLogin'
import { notificarAvaliacaoPronta } from '@/lib/notificacoes'
import { useEffect, useState } from 'react'

interface Avaliacao {
  pontuacao: number
  contentores_recolhidos: number
  contentores_total: number
  tempo_real_minutos: number
  eficiencia_percentagem: number
  pontos_fortes: string
  pontos_melhoria: string
  mensagem_chefe: string
}

interface Rota {
  id: string
  estado: string
  distancia_total: number
  avaliacao_groq: Avaliacao | null
  criado_em: string
  concluida_em: string | null
  rota_optimizada: any
}

export default function PaginaChefe() {
  const [rotas, setRotas] = useState<Rota[]>([])
  const [carregando, setCarregando] = useState(true)
  const [avaliando, setAvaliando] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const buscarRotas = async () => {
    try {
      const resposta = await fetch('/api/rotas')
      const dados = await resposta.json()
      if (dados.sucesso) {
        setRotas(dados.dados)
      }
    } catch (e) {
      setErro('Erro ao carregar relatórios')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    buscarRotas()
    const intervalo = setInterval(buscarRotas, 30000)
    return () => clearInterval(intervalo)
  }, [])

  const avaliarRota = async (rota_id: string, contentores_total: number) => {
    setAvaliando(rota_id)
    try {
      const resposta = await fetch('/api/avaliar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rota_id,
          contentores_recolhidos: contentores_total,
          tempo_real_minutos: Math.floor(Math.random() * 30) + 15
        })
      })
      const dados = await resposta.json()
      if (dados.sucesso) {
        await buscarRotas()

        // Notificar o chefe por email
        await notificarAvaliacaoPronta(
          'carlosmorais939605674@gmail.com',
          dados.avaliacao?.pontuacao || 0,
          dados.avaliacao?.eficiencia_percentagem || 0
        )
      }
    } catch (e) {
      alert('Erro ao avaliar rota')
    } finally {
      setAvaliando(null)
    }
  }

  const corPontuacao = (p: number) => {
    if (p >= 80) return '#15803d'
    if (p >= 60) return '#d97706'
    return '#dc2626'
  }

  const fundoPontuacao = (p: number) => {
    if (p >= 80) return '#f0fdf4'
    if (p >= 60) return '#fffbeb'
    return '#fef2f2'
  }

  const totalRotas = rotas.length
  const rotasAvaliadas = rotas.filter(r => r.avaliacao_groq).length
  const mediaPontuacao = rotasAvaliadas > 0
    ? Math.round(rotas.filter(r => r.avaliacao_groq)
        .reduce((acc, r) => acc + (r.avaliacao_groq?.pontuacao || 0), 0) / rotasAvaliadas)
    : 0

  return (
    <VerificarAuth perfisPermitidos={['chefe']}>
    <main style={{
      minHeight: '100vh',
      background: '#f1f5f9',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Cabeçalho */}
      <nav style={{ background: '#0f172a', padding: '10px 32px', display: 'flex', gap: '12px' }}>
        <a href="/" style={{ color: 'white', textDecoration: 'none', padding: '6px 14px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '13px' }}>📊 Dashboard</a>
        <a href="/operador" style={{ color: 'white', textDecoration: 'none', padding: '6px 14px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '13px' }}>📷 Operador</a>
        <a href="/camionista" style={{ color: 'white', textDecoration: 'none', padding: '6px 14px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '13px' }}>🚛 Camionista</a>
        <a href="/chefe" style={{ color: 'white', textDecoration: 'none', padding: '6px 14px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '13px' }}>📋 Chefe</a>
      </nav>
      <header style={{
        background: '#1e293b',
        color: 'white',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
            📊 Relatórios — Chefe de Operações
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.7 }}>
            Luanda Limpa — Gestão Municipal— Luanda
          </p>
        </div>
        <button
          onClick={buscarRotas}
          style={{
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >

          🔄 Actualizar
        </button>
        <MudarPassword />
      </header>
      <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>

        {/* Cartões de resumo */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'white', borderRadius: '12px',
            padding: '20px', textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#1e40af' }}>
              {totalRotas}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Rotas totais
            </div>
          </div>
          <div style={{
            background: 'white', borderRadius: '12px',
            padding: '20px', textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#15803d' }}>
              {rotasAvaliadas}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Rotas avaliadas
            </div>
          </div>
          <div style={{
            background: 'white', borderRadius: '12px',
            padding: '20px', textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              fontSize: '32px', fontWeight: '700',
              color: corPontuacao(mediaPontuacao)
            }}>
              {mediaPontuacao > 0 ? `${mediaPontuacao}%` : '—'}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Média de desempenho
            </div>
          </div>
        </div>

        {/* Erro */}
        {erro && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: '8px', padding: '16px',
            color: '#dc2626', marginBottom: '24px'
          }}>
            ❌ {erro}
          </div>
        )}

        {/* A carregar */}
        {carregando && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            ⏳ A carregar relatórios...
          </div>
        )}

        {/* Lista de rotas */}
        {!carregando && rotas.length === 0 && (
          <div style={{
            background: 'white', borderRadius: '12px',
            padding: '40px', textAlign: 'center',
            color: '#64748b', boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <p>Nenhuma rota registada ainda.</p>
            <p style={{ fontSize: '13px' }}>
              As rotas aparecem aqui após o camionista iniciar a recolha.
            </p>
          </div>
        )}

        {rotas.map((rota) => {
          const avaliacao = rota.avaliacao_groq
          const totalParagens = rota.rota_optimizada?.rota_optimizada?.length || 0

          return (
            <div
              key={rota.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
              }}
            >
              {/* Cabeçalho da rota */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '15px' }}>
                    🚛 Rota de {new Date(rota.criado_em).toLocaleDateString('pt-PT')}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                    {new Date(rota.criado_em).toLocaleTimeString('pt-PT')} •
                    {rota.distancia_total ? ` ${rota.distancia_total} km` : ''} •
                    {totalParagens} paragens
                  </div>
                </div>
                <span style={{
                  background: rota.estado === 'concluida' ? '#f0fdf4' :
                    rota.estado === 'em_curso' ? '#eff6ff' : '#fef9c3',
                  color: rota.estado === 'concluida' ? '#15803d' :
                    rota.estado === 'em_curso' ? '#1e40af' : '#854d0e',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {rota.estado === 'concluida' ? '✅ Concluída' :
                    rota.estado === 'em_curso' ? '🔄 Em curso' : '⏳ Pendente'}
                </span>
              </div>

              {/* Avaliação existente */}
              {avaliacao && (
                <div style={{
                  background: fundoPontuacao(avaliacao.pontuacao),
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '16px'
                }}>
                  {/* Pontuação */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '64px', height: '64px',
                      borderRadius: '50%',
                      background: corPontuacao(avaliacao.pontuacao),
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>
                      {avaliacao.pontuacao}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '16px' }}>
                        Pontuação de desempenho
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                        {avaliacao.contentores_recolhidos}/{avaliacao.contentores_total} contentores •
                        {avaliacao.eficiencia_percentagem}% eficiência
                      </div>
                    </div>
                  </div>

                  {/* Mensagem ao chefe */}
                  <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '12px',
                    fontSize: '14px',
                    color: '#1e293b',
                    borderLeft: '3px solid #3b82f6'
                  }}>
                    📋 <strong>Resumo:</strong> {avaliacao.mensagem_chefe}
                  </div>

                  {/* Pontos fortes e melhoria */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                  }}>
                    <div style={{
                      background: '#f0fdf4',
                      borderRadius: '8px',
                      padding: '12px'
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#15803d', marginBottom: '4px' }}>
                        ✅ Pontos fortes
                      </div>
                      <div style={{ fontSize: '13px', color: '#374151' }}>
                        {avaliacao.pontos_fortes}
                      </div>
                    </div>
                    <div style={{
                      background: '#fff7ed',
                      borderRadius: '8px',
                      padding: '12px'
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#d97706', marginBottom: '4px' }}>
                        📈 A melhorar
                      </div>
                      <div style={{ fontSize: '13px', color: '#374151' }}>
                        {avaliacao.pontos_melhoria}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botão avaliar */}
              {!avaliacao && (
                <button
                  onClick={() => avaliarRota(rota.id, totalParagens || 4)}
                  disabled={avaliando === rota.id}
                  style={{
                    background: avaliando === rota.id ? '#94a3b8' : '#1e293b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    cursor: avaliando === rota.id ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    width: '100%'
                  }}
                >
                  {avaliando === rota.id
                    ? '⏳ O Groq está a avaliar...'
                    : '🧠 Avaliar com Groq'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </main>
    </VerificarAuth>
  )
}