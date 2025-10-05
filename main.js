// main.js - script for Transpontual Express landing page

// Helper to get UTM parameters from the URL
const params = new URLSearchParams(window.location.search);

// Populate hidden utm fields if they exist
function populateUtmFields() {
  const utmFields = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
  utmFields.forEach(k => {
    const el = document.getElementById(k);
    if (el) el.value = params.get(k) || '';
  });
}

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
const waNumber = '552291544419'; // TODO: substitua pelo seu número

function openWhatsApp(payload) {
  const text = buildWhatsAppText(payload);
  const url = `https://wa.me/${waNumber}?text=${text}`;
  window.open(url, '_blank');
}

// Supabase configuration
// TODO: substitua SUPABASE_URL e SUPABASE_ANON_KEY pelos valores do seu projeto
const SUPABASE_URL = 'https://pzeftulbtkebcfzjihvc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6ZWZ0dWxidGtlYmNmemppaHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjM2NzYsImV4cCI6MjA3NTEzOTY3Nn0.kI2He98_sdPL2nr7cP--myyP98-E6KppT1n0vwOI9kM';

async function saveLead(payload) {
  try {
    console.log('Enviando lead para Supabase:', payload);

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
      console.error('Erro ao salvar lead:', response.status, errorText);
      return false;
    }

    const data = await response.json();
    console.log('Lead salvo com sucesso:', data);
    return true;
  } catch (err) {
    console.error('Erro na requisição:', err);
    return false;
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

  // Save to Supabase
  const ok = await saveLead(payload);

  // Reabilita o botão
  e.target.disabled = false;
  e.target.textContent = 'Enviar';

  if (ok) {
    alert('✅ Recebemos sua solicitação!\n\nRetornaremos em até 15 minutos.');
    track('submit_form');
    // Reset form
    document.querySelectorAll('.leadbox input, .leadbox select').forEach(input => {
      if (input.type !== 'checkbox') input.value = '';
      else input.checked = false;
    });
    showStep(0);
  } else {
    alert('❌ Falha ao enviar.\n\nTente novamente ou envie pelo WhatsApp.');
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

// Initialise UTM fields on load
document.addEventListener('DOMContentLoaded', populateUtmFields);