import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import groq from '@/lib/groq'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { contentor_id, foto_base64, foto_url } = body

    if (!foto_base64 && !foto_url) {
      return NextResponse.json(
        { sucesso: false, erro: 'foto e obrigatorio' },
        { status: 400 }
      )
    }

    let imagemContent: any

    if (foto_base64) {
      const matches = foto_base64.match(/^data:([^;]+);base64,(.+)$/)
      if (!matches) throw new Error('Formato de imagem invalido')
      imagemContent = {
        type: 'image_url',
        image_url: { url: `data:${matches[1]};base64,${matches[2]}` }
      }
    } else {
      imagemContent = {
        type: 'image_url',
        image_url: { url: foto_url }
      }
    }

    const resposta = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            imagemContent,
            {
              type: 'text',
              text: 'Analisa esta imagem de um contentor de lixo. Responde APENAS com JSON: {"estado": "cheio" ou "quase_cheio" ou "vazio", "percentagem": numero 0-100, "observacao": "descricao breve"}'
            }
          ]
        }
      ],
      max_tokens: 200
    })

    const texto = resposta.choices[0].message.content || ''
    const match = texto.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Resposta invalida do Groq')
    const analise = JSON.parse(match[0])

    if (contentor_id) {
      await supabase
        .from('contentores')
        .update({ estado: analise.estado, ultima_atualizacao: new Date().toISOString() })
        .eq('id', contentor_id)
    }

    return NextResponse.json({ sucesso: true, analise })
  } catch (error: any) {
    return NextResponse.json(
      { sucesso: false, erro: 'Erro ao analisar imagem', detalhe: error?.message || String(error) },
      { status: 500 }
    )
  }
}