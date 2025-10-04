// Capture UTM parameters from URL and store them (optional use)
const urlParams = new URLSearchParams(window.location.search);
const utm = {
  source: urlParams.get('utm_source') || '',
  medium: urlParams.get('utm_medium') || '',
  campaign: urlParams.get('utm_campaign') || '',
  term: urlParams.get('utm_term') || '',
  content: urlParams.get('utm_content') || ''
};

// Multi-step form controls
const steps = Array.from(document.querySelectorAll('.step'));
const stepNowEl = document.getElementById('stepNow');
const progressBar = document.getElementById('progressBar');
let currentStep = 0;

function showStep(index) {
  steps.forEach((step, i) => {
    step.classList.toggle('hidden', i !== index);
  });
  currentStep = index;
  if (stepNowEl) stepNowEl.textContent = (index + 1);
  if (progressBar) progressBar.style.width = ((index + 1) * 33) + '%';
}

// Bind navigation buttons
const next1 = document.getElementById('next1');
const next2 = document.getElementById('next2');
const back2 = document.getElementById('back2');
const back3 = document.getElementById('back3');

if (next1) next1.addEventListener('click', (e) => { e.preventDefault(); showStep(1); });
if (next2) next2.addEventListener('click', (e) => { e.preventDefault(); showStep(2); });
if (back2) back2.addEventListener('click', (e) => { e.preventDefault(); showStep(0); });
if (back3) back3.addEventListener('click', (e) => { e.preventDefault(); showStep(1); });

// Build payload and WhatsApp message lines
function buildLeadMessage() {
  const getVal = (id) => {
    const el = document.getElementById(id);
    return el ? (el.value || '').trim() : '';
  };
  const payload = {
    necessidade: getVal('necessidade'),
    origem: getVal('origem'),
    destino: getVal('destino'),
    tipoCarga: getVal('tipoCarga'),
    dataColeta: getVal('dataColeta'),
    peso: getVal('peso'),
    observacoes: getVal('observacoes'),
    nome: getVal('nome'),
    empresa: getVal('empresa'),
    email: getVal('email'),
    fone: getVal('fone'),
    utm_source: utm.source,
    utm_medium: utm.medium,
    utm_campaign: utm.campaign,
    utm_term: utm.term,
    utm_content: utm.content
  };
  const lines = [
    '🚚 *Cotação Transpontual*',
    `Necessidade: ${payload.necessidade}`,
    `Origem: ${payload.origem} | Destino: ${payload.destino}`,
    `Carga: ${payload.tipoCarga} | Data: ${payload.dataColeta} | Peso: ${payload.peso}`,
    `Obs.: ${payload.observacoes}`,
    `Contato: ${payload.nome} | ${payload.empresa}`,
    `E-mail: ${payload.email} | Fone: ${payload.fone}`,
    `UTM: ${payload.utm_source}/${payload.utm_medium}/${payload.utm_campaign}`
  ].join('%0A');
  return { payload, lines };
}

// Replace with your WhatsApp number (DDI + DDD + número)
const waNumber = '5522981544419'; // TODO: definir número real

function openWhatsApp() {
  const { lines } = buildLeadMessage();
  const url = `https://wa.me/${waNumber}?text=${lines}`;
  window.open(url, '_blank');
}

// Attach WhatsApp to CTA buttons
['cta-whatsapp-top','cta-whatsapp-bottom','cta-whatsapp-sticky','wa-fab'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openWhatsApp();
      track(`click_${id}`);
    });
  }
});

// Submit lead via API or fallback to WhatsApp
const enviarLeadBtn = document.getElementById('enviarLead');
const enviarWhatsBtn = document.getElementById('enviarWhats');

if (enviarLeadBtn) {
  enviarLeadBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const lgpd = document.getElementById('lgpd');
    if (lgpd && !lgpd.checked) {
      alert('Autorize o contato conforme LGPD.');
      return;
    }
    const { payload } = buildLeadMessage();
    try {
      // TODO: enviar payload para backend (supabase, serverless, etc.)
      // Exemplo: await fetch('/api/leads', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      alert('Recebemos sua solicitação. Retornaremos em até 15 min.');
      track('submit_form');
    } catch (err) {
      console.error(err);
      alert('Falha ao enviar. Tente pelo WhatsApp.');
    }
  });
}

if (enviarWhatsBtn) {
  enviarWhatsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openWhatsApp();
    track('submit_whatsapp');
  });
}

// Analytics tracking stub (Google Tag Manager / Meta Pixel)
function track(action) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: action });
  } catch (e) {
    // ignore
  }
}