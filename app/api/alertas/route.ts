import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tipo, contentor, estado, percentagem, mensagem } = body

    // Buscar email do chefe
    const { data: chefes } = await supabase
      .from('perfis')
      .select('email, nome')
      .eq('perfil', 'chefe')
      .limit(1)

    const emailChefe = chefes?.[0]?.email || 'carlosmorais939605674@gmail.com'
    const nomeChefe = chefes?.[0]?.nome || 'Chefe de Operações'

    // Enviar notificação por email via EmailJS
    const emailjs = await import('@emailjs/browser')
    await emailjs.default.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      {
        to_email: emailChefe,
        nome_destinatario: nomeChefe,
        assunto: `⚠️ ALERTA: Incumprimento detectado — ${contentor}`,
        mensagem: mensagem,
        contentor: contentor,
        estado: `${estado} (${percentagem}% de capacidade)`,
        local: 'Luanda, Angola',
        data_hora: new Date().toLocaleString('pt-PT')
      },
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    )

    return NextResponse.json({ sucesso: true, mensagem: 'Alerta enviado ao chefe' })
  } catch (error: any) {
    return NextResponse.json(
      { sucesso: false, erro: 'Erro ao enviar alerta', detalhe: error?.message },
      { status: 500 }
    )
  }
}