// api/webhook.js

export default async function handler(req, res) {
  // Garantir que aceitamos apenas requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    const payload = req.body;
    
    // Suas credenciais inseridas diretamente no código
    const TELEGRAM_BOT_TOKEN = '8601062429:AAE-WAHhN6ttL7k34BHtOKi_kzd42C8YXHk'; 
    const ADMIN_CHAT_ID = '1330663928'; 

    let mensagem = '';

    // Lógica para montar a mensagem baseada no evento
    switch (payload.event) {
      case 'payment_approved':
        mensagem = `💰 *VENDA APROVADA!*\n\n` +
                   `👤 Cliente: ${payload.customer?.first_name || 'Desconhecido'} ${payload.customer?.last_name || ''}\n` +
                   `📦 Plano: ${payload.transaction?.plan_name || 'N/A'}\n` +
                   `💳 Valor: R$ ${payload.transaction?.amount || '0,00'}\n` +
                   `🔄 Gateway: ${payload.transaction?.gateway || 'N/A'}\n` +
                   `🎯 Origem: ${payload.tracking?.utm_campaign || 'Orgânico'}`;
        break;

      case 'payment_created':
        mensagem = `⏳ *PIX GERADO (Aguardando Pagamento)*\n\n` +
                   `👤 Cliente: ${payload.customer?.first_name || 'Desconhecido'}\n` +
                   `📦 Plano: ${payload.transaction?.plan_name || 'N/A'}\n` +
                   `💳 Valor: R$ ${payload.transaction?.amount || '0,00'}`;
        break;

      case 'user_joined':
        mensagem = `👤 *NOVO LEAD NO BOT!*\n\n` +
                   `Nome: ${payload.customer?.first_name || 'Desconhecido'}\n` +
                   `Origem: ${payload.tracking?.utm_source || 'Desconhecida'} / ${payload.tracking?.utm_campaign || ''}\n` +
                   `📍 Local: ${payload.tracking?.city || 'N/A'}, ${payload.tracking?.country || 'N/A'}`;
        break;

      default:
        mensagem = `🔔 Novo evento não mapeado recebido: ${payload.event || 'Desconhecido'}`;
    }

    // Função para enviar a mensagem para o seu Telegram
    const sendToTelegram = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: mensagem,
        parse_mode: 'Markdown'
      }),
    });

    if (!sendToTelegram.ok) {
      const errorDetails = await sendToTelegram.text();
      console.error("Erro ao enviar para o Telegram:", errorDetails);
      return res.status(500).json({ error: 'Falha ao notificar o Telegram', details: errorDetails });
    }

    // Responder ao sistema da Sharkbot que deu tudo certo (Status 200)
    return res.status(200).json({ success: true, message: 'Notificação processada com sucesso!' });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}