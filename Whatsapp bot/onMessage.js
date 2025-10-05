const { responderMenu, respostas } = require('../services/menuService');
const delay = require('../utils/delay');

module.exports = (client) => {
  client.on('message', async msg => {
    if (!msg.from.endsWith('@c.us')) return;

    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const nome = contact.pushname || 'visitante';
    const texto = msg.body.trim().toLowerCase();

    if (['menu', 'oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite'].some(v => texto.includes(v))) {
      await responderMenu(client, msg, chat, nome);
    } else if (respostas[texto]) {
      await respostas[texto](client, msg, chat);
    }
  });
};
