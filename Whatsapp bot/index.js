/*
 * Entrypoint do bot de atendimento pelo WhatsApp.
 *
 * Este arquivo inicializa o cliente WhatsApp, prepara a conexão com o Supabase
 * e registra o manipulador de mensagens. As credenciais do Supabase são
 * lidas de variáveis de ambiente para evitar expor chaves no código-fonte.
 *
 * Para usar este bot você precisará instalar as seguintes dependências:
 *   - whatsapp-web.js
 *   - qrcode-terminal
 *   - @supabase/supabase-js
 *   - dotenv (opcional, mas recomendado para carregar variáveis de ambiente)
 *
 * Exemplo de instalação:
 *   npm install whatsapp-web.js qrcode-terminal @supabase/supabase-js dotenv
 *
 * Em seguida, crie um arquivo .env na raiz do projeto com as variáveis
 * SUPABASE_URL e SUPABASE_ANON_KEY. Você encontra esses valores no painel
 * do seu projeto Supabase em Settings → API.
 */

require('dotenv').config();

const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const { createClient } = require('@supabase/supabase-js');

// Importa e registra o manipulador de mensagens. O módulo `onMessage` deve
// exportar uma função que aceite (client, supabase) ou (client) como
// argumentos. Se a função aceitar apenas o cliente, o Supabase será
// ignorado silenciosamente. A função está localizada em `onMessage.js` na raiz
// deste projeto. Ajuste o caminho caso você organize seus arquivos em
// subpastas (por exemplo, './events/onMessage').
const registerOnMessage = require('./onMessage');

// Lê as credenciais do Supabase das variáveis de ambiente. Você pode
// substituí-las diretamente aqui, mas isso não é recomendado para
// produção. Use .env ou variáveis do sistema para configurá-las.
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://EXAMPLE.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Inicializa o cliente Supabase. Se as variáveis estiverem vazias, as
// operações no Supabase falharão, então verifique se elas estão
// configuradas corretamente antes de rodar o bot.
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Inicializa o cliente WhatsApp. O whatsapp-web.js abrirá uma sessão no
// navegador (por padrão Chromium) e exibirá um QR code no terminal. Faça
// a leitura do QR code pelo seu WhatsApp para autenticar.
const client = new Client();

// Registra o manipulador de mensagens. Se o módulo aceitar o Supabase,
// ele poderá gravar ou consultar dados no seu banco de dados. Caso
// contrário, ele simplesmente usará apenas o `client` para responder.
registerOnMessage(client, supabase);

// Exibe o QR code no terminal para login
client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

// Evento disparado quando a conexão estiver pronta
client.on('ready', () => {
  console.log('✅ WhatsApp conectado com sucesso!');
});

// Inicia o cliente WhatsApp
client.initialize();
