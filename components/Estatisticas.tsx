'use client'

import { Contentor } from '@/lib/types'

interface EstatisticasProps {
  contentores: Contentor[]
}

export default function Estatisticas({ contentores }: EstatisticasProps) {
  const total = contentores.length
  const cheios = contentores.filter(c => c.estado === 'cheio').length
  const quaseCheios = contentores.filter(c => c.estado === 'quase_cheio').length
  const vazios = contentores.filter(c => c.estado === 'vazio').length
  const criticos = cheios + quaseCheios

  const cartoes = [
    {
      titulo: 'Total de Contentores',
      valor: total,
      cor: '#3b82f6',
      fundo: '#eff6ff',
      icone: '🗑️'
    },
    {
      titulo: 'Contentores Cheios',
      valor: cheios,
      cor: '#ef4444',
      fundo: '#fef2f2',
      icone: '🔴'
    },
    {
      titulo: 'Quase Cheios',
      valor: quaseCheios,
      cor: '#f97316',
      fundo: '#fff7ed',
      icone: '🟠'
    },
    {
      titulo: 'Contentores Vazios',
      valor: vazios,
      cor: '#22c55e',
      fundo: '#f0fdf4',
      icone: '🟢'
    },
    {
      titulo: 'Contentores Críticos',
      valor: criticos,
      cor: '#dc2626',
      fundo: '#fef2f2',
      icone: '⚠️'
    }
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      {cartoes.map((cartao) => (
        <div
          key={cartao.titulo}
          style={{
            background: cartao.fundo,
            border: `1px solid ${cartao.cor}30`,
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>
            {cartao.icone}
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: '700',
            color: cartao.cor,
            lineHeight: 1
          }}>
            {cartao.valor}
          </div>
          <div style={{
            fontSize: '13px',
            color: '#64748b',
            marginTop: '6px'
          }}>
            {cartao.titulo}
          </div>
        </div>
      ))}
    </div>
  )
}