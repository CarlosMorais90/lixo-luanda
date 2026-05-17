'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'

interface VerificarAuthProps {
  children: React.ReactNode
  perfisPermitidos?: string[]
}

export default function VerificarAuth({ children, perfisPermitidos }: VerificarAuthProps) {
  const [verificado, setVerificado] = useState(false)
  const [tentativas, setTentativas] = useState(0)

  useEffect(() => {
    const verificar = async () => {
      try {
        const supabase = createSupabaseBrowser()

        // Tentar obter sessão com retry
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          // Aguardar um pouco e tentar novamente (máximo 3 tentativas)
          if (tentativas < 3) {
            setTimeout(() => setTentativas(t => t + 1), 1000)
            return
          }
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
      } catch (e) {
        if (tentativas < 3) {
          setTimeout(() => setTentativas(t => t + 1), 1000)
        } else {
          window.location.href = '/login'
        }
      }
    }

    verificar()
  }, [tentativas])

  if (!verificado) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🌿</div>
          <h2 style={{ color: 'white', margin: '0 0 8px', fontSize: '24px', fontWeight: '700' }}>
            Luanda Limpa
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', margin: '0 0 24px' }}>
            A verificar autenticação...
          </p>
          <div style={{
            width: '40px', height: '4px',
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '99px',
            margin: '0 auto',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0, left: '-100%',
              width: '100%', height: '100%',
              background: 'white',
              borderRadius: '99px',
              animation: 'slide 1.5s ease-in-out infinite'
            }} />
          </div>
          <style>{`
            @keyframes slide {
              0% { left: -100% }
              100% { left: 100% }
            }
          `}</style>
        </div>
      </div>
    )
  }

  return <>{children}</>
}