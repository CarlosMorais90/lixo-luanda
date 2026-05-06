import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import groq from '@/lib/groq'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { contentor_id, foto_url } = body

    if (!contentor_id || !foto_url) {
      return NextResponse.json(
        { sucesso: false, erro: 'contentor_id e foto_url são obrigatórios' },
        { status: 400 }
      )
    }

    // Groq analisa a imagem do contentor
    const resposta = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: foto_url }
            },
            {
              type: 'text',
              text: `Analisa esta imagem de um contentor de lixo em Luanda, Angola.
              Responde APENAS com um JSON neste formato exacto:
              {
                "estado": "cheio" | "quase_cheio" | "vazio",
                "percentagem": número entre 0 e 100,
                "observacao": "breve descrição do estado do contentor"
              }`
            }
          ]
        }
      ],
      max_tokens: 200
    })

    // Extrair o JSON da resposta do Groq
    const textoResposta = resposta.choices[0].message.content || ''
    const jsonMatch = textoResposta.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Resposta inválida do Groq')
    const analise = JSON.parse(jsonMatch[0])

    // Actualizar o estado do contentor na base de dados
    const { error } = await supabase
      .from('contentores')
      .update({
        estado: analise.estado,
        ultima_foto_url: foto_url,
        ultima_atualizacao: new Date().toISOString()
      })
      .eq('id', contentor_id)

    if (error) throw error

    return NextResponse.json({ sucesso: true, analise })
  } catch (error) {
    return NextResponse.json(
      { sucesso: false, erro: 'Erro ao analisar imagem' },
      { status: 500 }
    )
  }
}