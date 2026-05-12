'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'

interface VerificarAuthProps {
  children: React.ReactNode
  perfisPermitidos?: string[]
}

export default function VerificarAuth({ children, perfisPermitidos }: VerificarAuthProps) {
  const [verificado, setVerificado] = useState(false)

  useEffect(() => {
    const verificar = async () => {
      const supabase = createSupabaseBrowser()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = '/login'
        return
      }

      if (perfisPermitidos && perfisPermitidos.length > 0) {
        const { data: perfil } = await supabase
          .from('perfis')
          .select('perfil')
          .eq('id', session.user.id)
          .single()

        if (!perfil || !perfisPermitidos.includes(perfil.perfil)) {
          const destino = perfil?.perfil === 'camionista' ? '/camionista'
            : perfil?.perfil === 'operador' ? '/operador'
            : perfil?.perfil === 'chefe' ? '/chefe'
            : perfil?.perfil === 'gestor' ? '/admin'
            : '/login'
          window.location.href = destino
          return
        }
      }

      setVerificado(true)
    }
    verificar()
  }, [])

  if (!verificado) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#f8fafc', fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌿</div>
          <p style={{ color: '#64748b', fontSize: '16px' }}>A verificar autenticação...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
