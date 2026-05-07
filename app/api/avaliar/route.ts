import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import groq from '@/lib/groq'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { rota_id, contentores_recolhidos, tempo_real_minutos } = body

    if (!rota_id || !contentores_recolhidos || !tempo_real_minutos) {
      return NextResponse.json(
        { sucesso: false, erro: 'rota_id, contentores_recolhidos e tempo_real_minutos são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar a rota original
    const { data: rota, error: rotaError } = await supabase
      .from('rotas')
      .select('*')
      .eq('id', rota_id)
      .single()

    if (rotaError) throw rotaError

    // Groq avalia o desempenho
    const resposta = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `És um sistema de avaliação de desempenho de camionistas de recolha de lixo em Luanda, Angola. Responde SEMPRE apenas com JSON válido, sem texto adicional.`
        },
        {
          role: 'user',
          content: `Avalia o desempenho deste camionista:
          Distância estimada: ${rota.distancia_total} km
          Contentores recolhidos: ${contentores_recolhidos}
          Tempo real gasto: ${tempo_real_minutos} minutos
          
          Responde APENAS com este JSON:
          {
            "pontuacao": número entre 0 e 100,
            "contentores_recolhidos": ${contentores_recolhidos},
            "contentores_total": ${contentores_recolhidos},
            "tempo_real_minutos": ${tempo_real_minutos},
            "eficiencia_percentagem": número entre 0 e 100,
            "pontos_fortes": "o que o camionista fez bem",
            "pontos_melhoria": "o que pode melhorar",
            "mensagem_chefe": "resumo executivo para o chefe"
          }`
        }
      ],
      max_tokens: 500
    })

    // Extrair JSON da resposta
    const textoResposta = resposta.choices[0].message.content || ''
    const jsonMatch = textoResposta.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Resposta inválida do Groq')
    const avaliacao = JSON.parse(jsonMatch[0])

    // Actualizar a rota com a avaliação
    const { error: updateError } = await supabase
      .from('rotas')
      .update({
        estado: 'concluida',
        avaliacao_groq: avaliacao,
        concluida_em: new Date().toISOString()
      })
      .eq('id', rota_id)

    if (updateError) throw updateError

    return NextResponse.json({
      sucesso: true,
      avaliacao,
      mensagem: 'Relatório enviado com sucesso'
    })
  } catch (error) {
    return NextResponse.json(
      { sucesso: false, erro: 'Erro ao avaliar desempenho', detalhe: String(error) },
      { status: 500 }
    )
  }
}