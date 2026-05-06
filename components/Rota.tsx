'use client'

import { useState } from 'react'

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

export default function Rota() {
  const [rota, setRota] = useState<DadosRota | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const calcularRota = async () => {
    setCarregando(true)
    setErro(null)
    setRota(null)

    try {
      const resposta = await fetch('/api/rota')
      const dados = await resposta.json()

      if (!dados.sucesso) {
        setErro(dados.erro || 'Erro ao calcular rota')
        return
      }

      if (dados.mensagem) {
        setErro(dados.mensagem)
        return
      }

      setRota(dados)
    } catch (e) {
      setErro('Erro de ligação ao servidor')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      marginTop: '24px'
    }}>
      {/* Cabeçalho */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>
          🚛 Rota Optimizada pelo Groq
        </h2>
        <button
          onClick={calcularRota}
          disabled={carregando}
          style={{
            background: carregando ? '#94a3b8' : '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            cursor: carregando ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          {carregando ? '⏳ A calcular...' : '🧠 Calcular Rota com IA'}
        </button>
      </div>

      {/* Erro */}
      {erro && (
        <div style={{
          background: '#fef9c3',
          border: '1px solid #fde047',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#854d0e',
          fontSize: '14px'
        }}>
          ℹ️ {erro}
        </div>
      )}

      {/* Resultado da rota */}
      {rota && (
        <>
          {/* Resumo */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              background: '#f0fdf4',
              borderRadius: '10px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>
                {rota.distancia_total_km} km
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Distância total
              </div>
            </div>
            <div style={{
              background: '#eff6ff',
              borderRadius: '10px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>
                {rota.tempo_estimado_minutos} min
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Tempo estimado
              </div>
            </div>
            <div style={{
              background: '#fef2f2',
              borderRadius: '10px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>
                {rota.rota_optimizada?.length || 0}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Paragens
              </div>
            </div>
          </div>

          {/* Observações do Groq */}
          {rota.observacoes && (
            <div style={{
              background: '#f8fafc',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              fontSize: '14px',
              color: '#475569',
              borderLeft: '3px solid #3b82f6'
            }}>
              💡 <strong>Groq diz:</strong> {rota.observacoes}
            </div>
          )}

          {/* Lista de paragens */}
          <div>
            {rota.rota_optimizada?.map((paragem, index) => (
              <div
                key={paragem.contentor_id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '14px 0',
                  borderBottom: index < rota.rota_optimizada.length - 1
                    ? '1px solid #f1f5f9' : 'none'
                }}
              >
                {/* Número da ordem */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#1e40af',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '16px',
                  flexShrink: 0
                }}>
                  {paragem.ordem}
                </div>

                {/* Detalhes */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: '600',
                    color: '#1e293b',
                    fontSize: '15px'
                  }}>
                    {paragem.nome}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#64748b',
                    marginTop: '2px'
                  }}>
                    {paragem.motivo}
                  </div>
                </div>

                {/* Estado */}
                <span style={{
                  background: paragem.estado === 'cheio' ? '#fef2f2' : '#fff7ed',
                  color: paragem.estado === 'cheio' ? '#dc2626' : '#ea580c',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  flexShrink: 0
                }}>
                  {paragem.estado === 'cheio' ? '🔴 Cheio' : '🟠 Quase cheio'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Estado inicial */}
      {!rota && !carregando && !erro && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#94a3b8',
          fontSize: '14px'
        }}>
          Clique em "Calcular Rota com IA" para o Groq optimizar a rota de recolha
        </div>
      )}
    </div>
  )
}