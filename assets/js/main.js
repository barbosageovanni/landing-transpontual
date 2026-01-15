// main.js - script for Transpontual Express landing page

// Helper to get UTM parameters from the URL
const params = new URLSearchParams(window.location.search);

// Multi‑step form navigation
const steps = Array.from(document.querySelectorAll('.step'));
let currentStep = 0;
const stepNowEl = document.getElementById('stepNow');
const progressBar = document.getElementById('progressBar');

function showStep(i) {
  steps.forEach((s, idx) => s.classList.toggle('hidden', idx !== i));
  currentStep = i;
  if (stepNowEl) stepNowEl.textContent = (i + 1);
  if (progressBar) progressBar.style.width = ((i + 1) * 33) + '%';
}

// Validação de campos
function validateStep(stepNumber) {
  const step = steps[stepNumber];
  const inputs = step.querySelectorAll('input[required], select[required]');
  let isValid = true;

  inputs.forEach(input => {
    // Remove estilo de erro anterior
    input.style.borderColor = '';

    if (!input.value.trim()) {
      input.style.borderColor = '#ff4444';
      isValid = false;

      // Adiciona shake animation
      input.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(0)' }
      ], {
        duration: 400,
        easing: 'ease-in-out'
      });
    }
  });

  if (!isValid) {
    // Feedback visual
    const firstInvalid = step.querySelector('input[required]:not([value]), select[required]:not([value])');
    if (firstInvalid) {
      firstInvalid.focus();
    }
  }

  return isValid;
}

// Event listeners para next/back buttons com validação
document.getElementById('next1')?.addEventListener('click', e => {
  e.preventDefault();
  if (validateStep(0)) {
    showStep(1);
  }
});
document.getElementById('back2')?.addEventListener('click', e => {
  e.preventDefault();
  showStep(0);
});
document.getElementById('next2')?.addEventListener('click', e => {
  e.preventDefault();
  if (validateStep(1)) {
    showStep(2);
  }
});
document.getElementById('back3')?.addEventListener('click', e => {
  e.preventDefault();
  showStep(1);
});

// Build payload from form fields
function buildLeadPayload() {
  const get = id => (document.getElementById(id)?.value || '').trim();
  return {
    necessidade: get('necessidade'),
    origem: get('origem'),
    destino: get('destino'),
    tipo_carga: get('tipoCarga'),
    data_coleta: get('dataColeta'),
    peso: get('peso'),
    observacoes: get('observacoes'),
    nome: get('nome'),
    empresa: get('empresa'),
    email: get('email'),
    telefone: get('fone'),
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_term: params.get('utm_term') || '',
    utm_content: params.get('utm_content') || '',
    created_at: new Date().toISOString()
  };
}

// Build WhatsApp message text
function buildWhatsAppText(payload) {
  const lines = [
    '🚚 *TRANSPONTUAL EXPRESS*',
    '━━━━━━━━━━━━━━━━━━━━',
    '*Nova Solicitação de Cotação*',
    '',
    '📋 *DETALHES DA OPERAÇÃO*',
    `• Necessidade: ${payload.necessidade || 'Não informado'}`,
    `• Origem: ${payload.origem || 'Não informado'}`,
    `• Destino: ${payload.destino || 'Não informado'}`,
    '',
    '📦 *INFORMAÇÕES DA CARGA*',
    `• Tipo: ${payload.tipo_carga || 'Não informado'}`,
    `• Data prevista: ${payload.data_coleta || 'Não informado'}`,
    `• Peso: ${payload.peso || 'Não informado'}`,
    `• Observações: ${payload.observacoes || 'Nenhuma'}`,
    '',
    '👤 *DADOS DE CONTATO*',
    `• Nome: ${payload.nome}`,
    `• Empresa: ${payload.empresa}`,
    `• E-mail: ${payload.email}`,
    `• Telefone: ${payload.telefone}`,
    '',
    '━━━━━━━━━━━━━━━━━━━━',
    '⏱️ _Aguardando resposta em até 15 minutos_'
  ];

  // Remove UTM se estiver vazio
  if (payload.utm_source || payload.utm_medium || payload.utm_campaign) {
    lines.push('', `📊 UTM: ${payload.utm_source}/${payload.utm_medium}/${payload.utm_campaign}`);
  }

  return lines.join('%0A');
}

// WhatsApp number (include country and area code)
const waNumber = '5521964019743';

function openWhatsApp(payload) {
  const text = buildWhatsAppText(payload);
  const url = `https://wa.me/${waNumber}?text=${text}`;
  window.open(url, '_blank');
}

// Supabase configuration
const SUPABASE_URL = 'https://pzeftulbtkebcfzjihvc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6ZWZ0dWxidGtlYmNmemppaHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjM2NzYsImV4cCI6MjA3NTEzOTY3Nn0.kI2He98_sdPL2nr7cP--myyP98-E6KppT1n0vwOI9kM';

// Web3Forms configuration (backup para envio de e-mail)
const WEB3FORMS_KEY = '23e10449-f8ff-4166-92e8-8cc645bf4a9b';
const EMAIL_DESTINO = 'financeiro@transpontualexpress.com.br';

// Enviar lead por e-mail (fallback)
async function sendLeadByEmail(payload) {
  try {
    console.log('📧 Enviando lead por e-mail...');

    const emailBody = `
🚚 NOVA SOLICITAÇÃO - TRANSPONTUAL EXPRESS

📋 DETALHES DA OPERAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━
• Necessidade: ${payload.necessidade}
• Origem: ${payload.origem}
• Destino: ${payload.destino}

📦 INFORMAÇÕES DA CARGA
━━━━━━━━━━━━━━━━━━━━━━━━━━
• Tipo: ${payload.tipo_carga}
• Data prevista: ${payload.data_coleta}
• Peso: ${payload.peso}
• Observações: ${payload.observacoes}

👤 DADOS DE CONTATO
━━━━━━━━━━━━━━━━━━━━━━━━━━
• Nome: ${payload.nome}
• Empresa: ${payload.empresa}
• E-mail: ${payload.email}
• Telefone: ${payload.telefone}

📊 ORIGEM DO LEAD
━━━━━━━━━━━━━━━━━━━━━━━━━━
• UTM Source: ${payload.utm_source || 'N/A'}
• UTM Medium: ${payload.utm_medium || 'N/A'}
• UTM Campaign: ${payload.utm_campaign || 'N/A'}
• Data/Hora: ${new Date(payload.created_at).toLocaleString('pt-BR')}
`;

    const formData = new FormData();
    formData.append('access_key', WEB3FORMS_KEY);
    formData.append('subject', `🚚 Nova Solicitação - ${payload.nome} (${payload.empresa})`);
    formData.append('from_name', 'Landing Page Transpontual');
    formData.append('email', payload.email);
    formData.append('name', payload.nome);
    formData.append('message', emailBody);
    formData.append('to', EMAIL_DESTINO);

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ E-mail enviado com sucesso:', result);
      return true;
    } else {
      console.error('❌ Erro ao enviar e-mail:', result);
      return false;
    }
  } catch (err) {
    console.error('❌ Erro no envio de e-mail:', err);
    return false;
  }
}

// Salvar lead no Supabase
async function saveLead(payload) {
  try {
    console.log('💾 Tentando salvar no Supabase:', payload);

    const response = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro Supabase:', response.status, errorText);
      console.log('📧 Tentando enviar por e-mail como fallback...');

      // Tenta enviar por e-mail como backup
      const emailSent = await sendLeadByEmail(payload);

      if (emailSent) {
        console.log('✅ Lead enviado por e-mail com sucesso!');
        return { success: true, method: 'email' };
      }

      return { success: false, error: errorText };
    }

    const data = await response.json();
    console.log('✅ Lead salvo no Supabase:', data);
    return { success: true, method: 'supabase', data };
  } catch (err) {
    console.error('❌ Erro na requisição Supabase:', err);

    // Tenta enviar por e-mail como backup
    console.log('📧 Tentando enviar por e-mail...');
    const emailSent = await sendLeadByEmail(payload);

    if (emailSent) {
      return { success: true, method: 'email' };
    }

    return { success: false, error: err.message };
  }
}

// Event handlers for submission
document.getElementById('enviarLead')?.addEventListener('click', async e => {
  e.preventDefault();

  // Validar passo 3
  if (!validateStep(2)) {
    return;
  }

  const lgpd = document.getElementById('lgpd');
  if (lgpd && !lgpd.checked) {
    alert('Por favor, autorize o contato conforme LGPD.');
    lgpd.focus();
    return;
  }

  const payload = buildLeadPayload();

  // Desabilita o botão para evitar duplo envio
  e.target.disabled = true;
  e.target.textContent = 'Enviando...';

  // Save to Supabase (com fallback para e-mail)
  const result = await saveLead(payload);

  console.log('🔍 Resultado do saveLead:', result);
  console.log('🔍 result.success:', result.success);
  console.log('🔍 Tipo:', typeof result.success);

  // Reabilita o botão
  e.target.disabled = false;
  e.target.textContent = 'Enviar';

  if (result.success) {
    console.log('✅ Sucesso! Mostrando modal...');
    track('submit_form_' + result.method);

    // Mostrar modal de sucesso
    const modalShown = showSuccessModal();
    console.log('Modal exibido?', modalShown);

    // Reset form após 1 segundo
    setTimeout(() => {
      document.querySelectorAll('.leadbox input, .leadbox select').forEach(input => {
        if (input.type !== 'checkbox') input.value = '';
        else input.checked = false;
      });
      showStep(0);
    }, 1000);
  } else {
    console.error('❌ Erro completo:', result.error);
    alert('❌ Falha ao enviar.\n\nPor favor, tente pelo WhatsApp ou entre em contato pelo telefone.');
  }
});

document.getElementById('enviarWhats')?.addEventListener('click', e => {
  e.preventDefault();
  const payload = buildLeadPayload();
  openWhatsApp(payload);
  track('submit_whatsapp');
});

// WhatsApp CTA buttons
document.getElementById('cta-whatsapp-top')?.addEventListener('click', e => {
  e.preventDefault();
  const payload = buildLeadPayload();
  openWhatsApp(payload);
  track('cta_whatsapp_top');
});
document.getElementById('cta-whatsapp-bottom')?.addEventListener('click', e => {
  e.preventDefault();
  const payload = buildLeadPayload();
  openWhatsApp(payload);
  track('cta_whatsapp_bottom');
});
document.getElementById('cta-whatsapp-sticky')?.addEventListener('click', e => {
  e.preventDefault();
  const payload = buildLeadPayload();
  openWhatsApp(payload);
  track('cta_whatsapp_sticky');
});
document.getElementById('wa-fab')?.addEventListener('click', e => {
  e.preventDefault();
  const payload = buildLeadPayload();
  openWhatsApp(payload);
  track('cta_whatsapp_fab');
});

// Simple event tracking hook; push to dataLayer if available
function track(action) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: action });
  } catch (e) {
    // no-op
  }
}

// Debug function - test Supabase connection
window.testSupabase = async function() {
  console.log('🔍 Testando conexão com Supabase...');
  console.log('🌐 URL:', SUPABASE_URL);
  console.log('🔑 API Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');

  const testPayload = {
    necessidade: 'Teste',
    origem: 'Teste',
    destino: 'Teste',
    tipo_carga: 'Teste',
    data_coleta: '2025-10-05',
    peso: '100kg',
    observacoes: 'Teste de conexão',
    nome: 'Teste',
    empresa: 'Teste',
    email: 'teste@teste.com',
    telefone: '22999999999',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_term: '',
    utm_content: '',
    created_at: new Date().toISOString()
  };

  console.log('📤 Payload:', testPayload);
  console.log('📤 JSON:', JSON.stringify(testPayload, null, 2));

  try {
    const url = `${SUPABASE_URL}/rest/v1/leads`;
    console.log('📍 Endpoint:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📥 Status:', response.status);
    console.log('📥 Status Text:', response.statusText);
    console.log('📥 Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📥 Response Body:', responseText);

    if (response.ok) {
      console.log('✅ SUCESSO! Lead inserido no Supabase!');
      try {
        const data = JSON.parse(responseText);
        console.log('📊 Dados salvos:', data);
        return data;
      } catch (e) {
        return responseText;
      }
    } else {
      console.error('❌ ERRO AO SALVAR:');
      console.error('   Status:', response.status);
      console.error('   Mensagem:', responseText);

      // Diagnóstico
      if (response.status === 400) {
        console.error('   💡 Problema: Campo inválido ou faltando');
      } else if (response.status === 401 || response.status === 403) {
        console.error('   💡 Problema: RLS ou autenticação');
        console.error('   💡 Solução: Execute no SQL Editor:');
        console.error('      ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;');
      } else if (response.status === 404) {
        console.error('   💡 Problema: Tabela não encontrada');
      }

      return null;
    }
  } catch (err) {
    console.error('❌ Erro na requisição:', err);
    console.error('   Tipo:', err.name);
    console.error('   Mensagem:', err.message);
    return null;
  }
};

console.log('💡 Execute testSupabase() no console para testar a conexão');
console.log('💡 Execute testModal() no console para testar o modal');

// Modal de sucesso
function showSuccessModal() {
  console.log('🎯 Tentando mostrar modal...');
  const modal = document.getElementById('successModal');
  console.log('Modal encontrado:', modal);

  if (modal) {
    console.log('Adicionando classe "show"...');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    console.log('Modal classes:', modal.classList.toString());
    console.log('Modal display:', window.getComputedStyle(modal).display);
    return true;
  } else {
    console.error('❌ Modal não encontrado no DOM!');
    return false;
  }
}

function hideSuccessModal() {
  console.log('Fechando modal...');
  const modal = document.getElementById('successModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// Fechar modal ao clicar no botão
document.getElementById('closeModal')?.addEventListener('click', hideSuccessModal);

// Fechar modal ao clicar fora
document.getElementById('successModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'successModal') {
    hideSuccessModal();
  }
});

// Função de teste do modal
window.testModal = function() {
  console.log('🧪 Testando modal...');
  showSuccessModal();
};
