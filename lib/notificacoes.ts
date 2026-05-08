import emailjs from '@emailjs/browser'

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!

interface DadosNotificacao {
  email_destinatario: string
  nome_destinatario: string
  assunto: string
  mensagem: string
  contentor?: string
  estado?: string
  local?: string
}

export async function enviarNotificacao(dados: DadosNotificacao) {
  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_email: dados.email_destinatario,
        nome_destinatario: dados.nome_destinatario,
        assunto: dados.assunto,
        mensagem: dados.mensagem,
        contentor: dados.contentor || '—',
        estado: dados.estado || '—',
        local: dados.local || 'Luanda, Angola',
        data_hora: new Date().toLocaleString('pt-PT')
      },
      PUBLIC_KEY
    )
    console.log('Email enviado com sucesso')
    return true
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return false
  }
}

// Notificação: contentor cheio detectado
export async function notificarContentorCheio(
  emailGestor: string,
  nomeContentor: string,
  estado: string
) {
  return enviarNotificacao({
    email_destinatario: emailGestor,
    nome_destinatario: 'Gestor Municipal',
    assunto: `Contentor crítico detectado — ${nomeContentor}`,
    mensagem: `Foi detectado um contentor em estado crítico que necessita de recolha urgente. Por favor verifique o mapa e calcule a rota optimizada.`,
    contentor: nomeContentor,
    estado: estado === 'cheio' ? '🔴 Cheio' : '🟠 Quase cheio',
    local: 'Luanda, Angola'
  })
}

// Notificação: rota calculada para o camionista
export async function notificarRotaCamionista(
  emailCamionista: string,
  nomeCamionista: string,
  totalParagens: number,
  distancia: number
) {
  return enviarNotificacao({
    email_destinatario: emailCamionista,
    nome_destinatario: nomeCamionista,
    assunto: 'Nova rota de recolha atribuída',
    mensagem: `Foi calculada uma nova rota de recolha para si com ${totalParagens} paragens e ${distancia} km de distância total. Aceda à aplicação para ver os detalhes da rota.`,
    contentor: `${totalParagens} contentores críticos`,
    estado: '🚛 Rota pronta para iniciar',
    local: 'Luanda, Angola'
  })
}

// Notificação: rota concluída
export async function notificarRotaConcluida(
  emailChefe: string,
  totalRecolhidos: number,
  totalParagens: number
) {
  return enviarNotificacao({
    email_destinatario: emailChefe,
    nome_destinatario: 'Chefe de Operações',
    assunto: 'Rota de recolha concluída',
    mensagem: `O camionista concluiu a rota de recolha. Foram recolhidos ${totalRecolhidos} de ${totalParagens} contentores. Aceda ao painel do chefe para ver a avaliação completa.`,
    contentor: `${totalRecolhidos}/${totalParagens} contentores recolhidos`,
    estado: '✅ Rota concluída',
    local: 'Luanda, Angola'
  })
}

// Notificação: relatório de avaliação pronto
export async function notificarAvaliacaoPronta(
  emailChefe: string,
  pontuacao: number,
  eficiencia: number
) {
  return enviarNotificacao({
    email_destinatario: emailChefe,
    nome_destinatario: 'Chefe de Operações',
    assunto: 'Relatório de avaliação disponível',
    mensagem: `O Groq gerou um novo relatório de avaliação do camionista. Pontuação: ${pontuacao}/100 — Eficiência: ${eficiencia}%. Aceda ao painel do chefe para ver os detalhes completos.`,
    contentor: `Pontuação: ${pontuacao}/100`,
    estado: `📊 Eficiência: ${eficiencia}%`,
    local: 'Luanda, Angola'
  })
}