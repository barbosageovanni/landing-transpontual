const delay = require('../utils/delay');

const siteLink = 'https://geovanibarbosa.com.br';

async function responderMenu(client, msg, chat, name) {
  await delay(3000);
  await chat.sendStateTyping();
  await delay(3000);
  await client.sendMessage(msg.from, `Olá, ${name.split(" ")[0]}! Sou o assistente virtual da G. Barbosa Agência de Marketing. Como posso ajudá-lo hoje? Digite uma das opções abaixo:\n\n1 - Como funciona\n2 - Valores dos planos\n3 - Benefícios\n4 - Como aderir\n5 - Outras perguntas`);
}

const respostas = {
  '1': async (client, msg, chat) => {
    await delay(3000);
    await chat.sendStateTyping();
    await client.sendMessage(msg.from, `Nosso serviço oferece...\n\nInclui acesso a cursos gratuitos.`);
    await delay(3000);
    await chat.sendStateTyping();
    await client.sendMessage(msg.from, `COMO FUNCIONA?\n1º Passo: Cadastro e escolha do plano\n2º Passo: Pagamento e acesso imediato\n3º Passo: Suporte sempre que precisar`);
    await delay(3000);
    await chat.sendStateTyping();
    await client.sendMessage(msg.from, `Link para cadastro: ${siteLink}`);
  },
  '2': async (client, msg, chat) => {
    await delay(3000);
    await chat.sendStateTyping();
    await client.sendMessage(msg.from, `*Plano básico:* R$XX\n*Plano Família:* R$39,90\n*TOP Individual:* R$42,50\n*TOP Família:* R$79,90`);
    await delay(3000);
    await chat.sendStateTyping();
    await client.sendMessage(msg.from, `Link para cadastro: ${siteLink}`);
  },
  '3': async (client, msg, chat) => {
    await delay(3000);
    await chat.sendStateTyping();
    await client.sendMessage(msg.from, `Sorteios anuais em prêmios\nAtendimento médico 24h`);
    await delay(3000);
    await chat.sendStateTyping();
    await client.sendMessage(msg.from, `Link para cadastro: ${siteLink}`);
  },
  '4': async (client, msg, chat) => {
    await delay(3000);
    await chat.sendStateTyping();
    await client.sendMessage(msg.from, `Você pode aderir pelo site ou WhatsApp. Após a adesão, acesso imediato.`);
    await delay(3000);
    await chat.sendStateTyping();
    await client.sendMessage(msg.from, `Link: ${siteLink}`);
  },
  '5': async (client, msg, chat) => {
    await delay(3000);
    await chat.sendStateTyping();
    await client.sendMessage(msg.from, `Dúvidas adicionais? Fale conosco pelo WhatsApp ou visite: ${siteLink}`);
  },
};

module.exports = { responderMenu, respostas };
