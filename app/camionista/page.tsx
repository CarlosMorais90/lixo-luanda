'use client'

import ProtegerPagina from '@/components/ProtegerPagina'
import { useEffect, useState } from 'react'

interface ParagemRota {
  ordem: number
  contentor_id: string
  nome: string
  latitude: number
  longitude: number
  estado: string
  motivo: string
}

interface DadosRota {
  rota_id: string
  rota_optimizada: ParagemRota[]
  distancia_total_km: number
  tempo_estimado_minutos: number
  observacoes: string
}

export default function PaginaCamionista() {
  const [rota, setRota] = useState<DadosRota | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [recolhidas, setRecolhidas] = useState<Set<string>>(new Set())
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [rotaIniciada, setRotaIniciada] = useState(false)

  const buscarRota = async () => {
    setCarregando(true)
    setErro(null)
    try {
      const resposta = await fetch('/api/rota')
      const dados = await resposta.json()
      if (dados.sucesso && dados.rota_optimizada) {
        setRota(dados)
        setRotaIniciada(true)
      } else {
        setErro(dados.mensagem || 'Nenhuma rota disponível no momento')
      }
    } catch (e) {
      setErro('Erro de ligação ao servidor')
    } finally {
      setCarregando(false)
    }
  }

  const confirmarRecolha = async (contentor_id: string, nome: string) => {
    setConfirmando(contentor_id)
    try {
      // Registar recolha na base de dados
      const resposta = await fetch('/api/recolhas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentor_id,
          estado_antes: 'cheio',
          estado_depois: 'vazio'
        })
      })
      const dados = await resposta.json()
      if (dados.sucesso) {
        setRecolhidas(prev => new Set([...prev, contentor_id]))
      }
    } catch (e) {
      alert('Erro ao confirmar recolha')
    } finally {
      setConfirmando(null)
    }
  }

  const totalRecolhidas = recolhidas.size
  const totalParagens = rota?.rota_optimizada?.length || 0
  const percentagem = totalParagens > 0
    ? Math.round((totalRecolhidas / totalParagens) * 100)
    : 0

  return (
    <>
    <main style={{
      minHeight: '100vh',
      background: '#f1f5f9',
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '480px',
      margin: '0 auto'
    }}>
      {/* Cabeçalho */}
      <nav style={{ background: '#14532d', padding: '10px 20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <a href="/" style={{ color: 'white', textDecoration: 'none', padding: '6px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '12px' }}>📊 Dashboard</a>
        <a href="/operador" style={{ color: 'white', textDecoration: 'none', padding: '6px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '12px' }}>📷 Operador</a>
        <a href="/chefe" style={{ color: 'white', textDecoration: 'none', padding: '6px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '12px' }}>📋 Chefe</a>
      </nav>
      <header style={{
        background: '#15803d',
        color: 'white',
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
          🚛 Rota de Recolha
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.85 }}>
          Luanda Limpa — Gestão Municipal— Luanda
        </p>
      </header>

      <div style={{ padding: '20px' }}>

        {/* Botão iniciar rota */}
        {!rotaIniciada && !carregando && (
          <div style={{ textAlign: 'center', paddingTop: '40px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🗺️</div>
            <h2 style={{ color: '#1e293b', marginBottom: '8px' }}>
              Pronto para começar?
            </h2>
            <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '14px' }}>
              Clique para receber a sua rota de recolha de hoje
            </p>
            <button
              onClick={buscarRota}
              style={{
                background: '#15803d',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              🧠 Receber Rota com IA
            </button>
          </div>
        )}

        {/* A carregar */}
        {carregando && (
          <div style={{ textAlign: 'center', paddingTop: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p style={{ color: '#64748b' }}>A calcular a sua rota...</p>
          </div>
        )}

        {/* Erro */}
        {erro && (
          <div style={{
            background: '#fef9c3',
            border: '1px solid #fde047',
            borderRadius: '12px',
            padding: '16px',
            color: '#854d0e',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            ℹ️ {erro}
          </div>
        )}

        {/* Progresso */}
        {rota && (
          <>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px'
              }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>
                  Progresso da rota
                </span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#15803d' }}>
                  {totalRecolhidas}/{totalParagens} contentores
                </span>
              </div>
              <div style={{
                background: '#e2e8f0',
                borderRadius: '99px',
                height: '10px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: '#15803d',
                  height: '100%',
                  width: `${percentagem}%`,
                  borderRadius: '99px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '10px',
                fontSize: '12px',
                color: '#94a3b8'
              }}>
                <span>📏 {rota.distancia_total_km} km</span>
                <span>⏱️ ~{rota.tempo_estimado_minutos} min</span>
              </div>
            </div>

            {/* Dica do Groq */}
            {rota.observacoes && (
              <div style={{
                background: '#eff6ff',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#1e40af',
                borderLeft: '3px solid #3b82f6'
              }}>
                💡 {rota.observacoes}
              </div>
            )}

            {/* Lista de paragens */}
            <h3 style={{
              fontSize: '14px',
              color: '#64748b',
              margin: '0 0 12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Paragens
            </h3>

            {rota.rota_optimizada?.map((paragem) => {
              const recolhida = recolhidas.has(paragem.contentor_id)
              const aConfirmar = confirmando === paragem.contentor_id

              return (
                <div
                  key={paragem.contentor_id}
                  style={{
                    background: recolhida ? '#f0fdf4' : 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    border: recolhida ? '1px solid #86efac' : '1px solid transparent',
                    opacity: recolhida ? 0.8 : 1
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: recolhida ? '0' : '12px'
                  }}>
                    {/* Número */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: recolhida ? '#15803d' : '#1e40af',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '16px',
                      flexShrink: 0
                    }}>
                      {recolhida ? '✓' : paragem.ordem}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: '600',
                        color: '#1e293b',
                        fontSize: '15px',
                        textDecoration: recolhida ? 'line-through' : 'none'
                      }}>
                        {paragem.nome}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        {paragem.motivo}
                      </div>
                    </div>

                    {/* Estado */}
                    <span style={{
                      background: paragem.estado === 'cheio' ? '#fef2f2' : '#fff7ed',
                      color: paragem.estado === 'cheio' ? '#dc2626' : '#ea580c',
                      padding: '4px 8px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '500'
                    }}>
                      {paragem.estado === 'cheio' ? '🔴' : '🟠'}
                    </span>
                  </div>

                  {/* Botão confirmar */}
                  {!recolhida && (
                    <button
                      onClick={() => confirmarRecolha(paragem.contentor_id, paragem.nome)}
                      disabled={!!aConfirmar}
                      style={{
                        background: aConfirmar ? '#94a3b8' : '#15803d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px',
                        width: '100%',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: aConfirmar ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {aConfirmar ? '⏳ A confirmar...' : '✅ Confirmar Recolha'}
                    </button>
                  )}

                  {recolhida && (
                    <div style={{
                      textAlign: 'center',
                      fontSize: '13px',
                      color: '#15803d',
                      fontWeight: '600'
                    }}>
                      ✅ Recolhido com sucesso
                    </div>
                  )}
                </div>
              )
            })}

            {/* Mensagem de conclusão */}
            {totalRecolhidas === totalParagens && totalParagens > 0 && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                marginTop: '8px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
                <h3 style={{ color: '#15803d', margin: '0 0 8px' }}>
                  Rota concluída!
                </h3>
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                  Todos os contentores foram recolhidos. Excelente trabalho!
                </p>
              </div>
            )}
          </>
        )}
      </div>
   </main>
    </>
  )
}