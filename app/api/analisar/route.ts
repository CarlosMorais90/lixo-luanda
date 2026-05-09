import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import groq from '@/lib/groq'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { contentor_id, foto_base64, foto_url } = body

    if (!foto_base64 && !foto_url) {
      return NextResponse.json(
        { sucesso: false, erro: 'contentor_id e foto são obrigatórios' },
        { status: 400 }
      )
    }

    // Preparar a imagem para o Groq
    let imagemContent: any

    if (foto_base64) {
      // Extrair o tipo e os dados base64
      const matches = foto_base64.match(/^data:([^;]+);base64,(.+)$/)
      if (!matches) throw new Error('Formato de imagem inválido')
      const mediaType = matches[1]
      const base64Data = matches[2]

      imagemContent = {
        type: 'image_url',
        image_url: {
          url: `data:${mediaType};base64,${base64Data}`
        }
      }
    } else {
      imagemContent = {
        type: 'image_url',
        image_url: { url: foto_url }
      }
    }

    // Groq analisa a imagem
    const resposta = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            imagemContent,
            {
              type: 'text',
              text: `Analisa esta imagem de um contentor de lixo em Luanda, Angola.
              Responde APENAS com um JSON neste formato exacto:
              {
                "estado": "cheio" ou "quase_cheio" ou "vazio",
                "percentagem": número entre 0 e 100,
                "observacao": "breve descrição do estado do contentor"
              }`
            }
          ]
        }
      ],
      max_tokens: 200
    })

    const textoResposta = resposta.choices[0].message.content || ''
    const jsonMatch = textoResposta.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Resposta inválida do Groq')
    const analise = JSON.parse(jsonMatch[0])

    // Actualizar o estado do contentor
    const { error } = await supabase
      .from('contentores')
      .update({
        estado: analise.estado,
        ultima_atualizacao: new Date().toISOString()
      })
      .eq('id', contentor_id)

    if (error) throw error

    return NextResponse.json({ sucesso: true, analise })
  } catch (error) {
    return NextResponse.json(
      { sucesso: false, erro: 'Erro ao analisar imagem', detalhe: String(error) },
      { status: 500 }
    )
  }
}