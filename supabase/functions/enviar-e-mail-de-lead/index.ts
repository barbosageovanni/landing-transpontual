import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const body = await req.json()
    console.log('Payload recebido:', JSON.stringify(body))

    // O payload pode vir como { record: {...} } ou diretamente
    const lead = body.record || body

    // Validação básica
    if (!lead.nome) {
      throw new Error('Lead inválido: nome não encontrado')
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #003d7a; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; color: #003d7a; margin-bottom: 10px; border-bottom: 2px solid #003d7a; padding-bottom: 5px; }
          .field { margin: 8px 0; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; }
          .urgent { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚚 TRANSPONTUAL EXPRESS</h1>
            <p>Nova Solicitação de Cotação</p>
          </div>
          <div class="content">
            <div class="urgent">
              ⏱️ <strong>Atenção:</strong> Lead recebido em ${lead.created_at ? new Date(lead.created_at).toLocaleString('pt-BR') : 'agora'}
              <br>Prazo de resposta: <strong>15 minutos</strong>
            </div>
            <div class="section">
              <div class="section-title">📋 DETALHES DA OPERAÇÃO</div>
              <div class="field"><span class="label">Necessidade:</span> <span class="value">${lead.necessidade || 'Não informado'}</span></div>
              <div class="field"><span class="label">Origem:</span> <span class="value">${lead.origem || 'Não informado'}</span></div>
              <div class="field"><span class="label">Destino:</span> <span class="value">${lead.destino || 'Não informado'}</span></div>
            </div>
            <div class="section">
              <div class="section-title">📦 INFORMAÇÕES DA CARGA</div>
              <div class="field"><span class="label">Tipo:</span> <span class="value">${lead.tipo_carga || 'Não informado'}</span></div>
              <div class="field"><span class="label">Data prevista:</span> <span class="value">${lead.data_coleta || 'Não informado'}</span></div>
              <div class="field"><span class="label">Peso:</span> <span class="value">${lead.peso || 'Não informado'}</span></div>
              <div class="field"><span class="label">Observações:</span> <span class="value">${lead.observacoes || 'Nenhuma'}</span></div>
            </div>
            <div class="section">
              <div class="section-title">👤 DADOS DE CONTATO</div>
              <div class="field"><span class="label">Nome:</span> <span class="value">${lead.nome}</span></div>
              <div class="field"><span class="label">Empresa:</span> <span class="value">${lead.empresa}</span></div>
              <div class="field"><span class="label">E-mail:</span> <span class="value"><a href="mailto:${lead.email}">${lead.email}</a></span></div>
              <div class="field"><span class="label">Telefone:</span> <span class="value"><a href="tel:${lead.telefone}">${lead.telefone}</a></span></div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    console.log('Enviando email via Resend...')

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Transpontual <onboarding@resend.dev>',
        to: ['geovannibarbosa@gmail.com'],
        subject: `🚨 Novo Lead: ${lead.nome} - ${lead.empresa}`,
        html: emailHtml,
        reply_to: lead.email
      })
    })

    const data = await res.json()
    console.log('Resposta do Resend:', JSON.stringify(data))

    if (!res.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(data)}`)
    }

    return new Response(
      JSON.stringify({ success: true, emailId: data.id }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro completo:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
