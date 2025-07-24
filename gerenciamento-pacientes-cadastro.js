// Inicializar o cliente Supabase
const SUPABASE_URL = "https://evymdirordklgqtfucdp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2eW1kaXJvcmRrbGdxdGZ1Y2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODg2MDEsImV4cCI6MjA2MzE2NDYwMX0.EVecSBaZFOoRmEMgbPEHPIwYwuLKlVWX5bjOQ7JGpmg";

// ✅ CORREÇÃO PRINCIPAL
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementos do DOM
const authContainer = document.getElementById("authContainer");
const appContainer = document.getElementById("appContainer");
const loginForm = document.getElementById("loginForm");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const userName = document.getElementById("userName");
const userAvatar = document.getElementById("userAvatar");

// Verificar se o usuário está logado ao carregar a página
document.addEventListener("DOMContentLoaded", async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    showApp();
    updateUserInfo(session.user);
    initializeCalendar();
  } else {
    showAuth();
  }
});

// Adicionar evento de login com email/senha
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    showApp();
    updateUserInfo(data.user);
    initializeCalendar();
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    alert("Erro ao fazer login: " + error.message);
  }
});

// Adicionar evento de login com Google
googleLoginBtn.addEventListener("click", async () => {
  try {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) throw error;
  } catch (error) {
    console.error("Erro ao iniciar login com Google:", error);
    alert("Erro ao iniciar login com Google: " + error.message);
  }
});

// Adicionar evento de logout
logoutBtn.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  showAuth();
});

// Função para mostrar a tela de autenticação
function showAuth() {
  authContainer.style.display = "block";
  appContainer.style.display = "none";
  logoutBtn.style.display = "none";
  userInfo.style.display = "none";
}

// Função para mostrar o aplicativo
function showApp() {
  authContainer.style.display = "none";
  appContainer.style.display = "block";
  logoutBtn.style.display = "block";
  userInfo.style.display = "flex";
}

// Função para atualizar informações do usuário
function updateUserInfo(user) {
  if (user.user_metadata && user.user_metadata.full_name) {
    userName.textContent = user.user_metadata.full_name;
  } else if (user.user_metadata && user.user_metadata.name) {
    userName.textContent = user.user_metadata.name;
  } else {
    userName.textContent = user.email;
  }

  if (user.user_metadata && user.user_metadata.avatar_url) {
    userAvatar.src = user.user_metadata.avatar_url;
    userAvatar.style.display = "block";
  } else {
    userAvatar.style.display = "none";
  }
}

// Variáveis do calendário
let calendar;
let currentProfessional = '';

// Função para inicializar o calendário
function initializeCalendar() {
  const calendarEl = document.getElementById('calendar');
  
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'pt-br',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    buttonText: {
      today: 'Hoje',
      month: 'Mês',
      week: 'Semana',
      day: 'Dia'
    },
    height: 'auto',
    events: loadAppointments,
    eventClick: function(info) {
      showAppointmentDetails(info.event);
    },
    dateClick: function(info) {
      openNewAppointmentModal(info.date);
    }
  });

  calendar.render();
  loadProfessionals();
  loadPatients();
  setupEventListeners();
}

// Função para carregar agendamentos
async function loadAppointments() {
  try {
    let query = supabaseClient
      .from('appointments')
      .select(`
        *,
        patients(first_name, last_name),
        professionals(name)
      `);

    if (currentProfessional) {
      query = query.eq('professional_id', currentProfessional);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(appointment => ({
      id: appointment.id,
      title: `${appointment.patients.first_name} ${appointment.patients.last_name}`,
      start: `${appointment.date}T${appointment.start_time}`,
      end: `${appointment.date}T${appointment.end_time}`,
      backgroundColor: getStatusColor(appointment.status),
      extendedProps: {
        patient: appointment.patients,
        professional: appointment.professionals,
        status: appointment.status,
        notes: appointment.notes
      }
    }));
  } catch (error) {
    console.error('Erro ao carregar agendamentos:', error);
    return [];
  }
}

// Função para carregar profissionais
async function loadProfessionals() {
  try {
    const { data, error } = await supabaseClient
      .from('professionals')
      .select('*')
      .order('name');

    if (error) throw error;

    const professionalSelect = document.getElementById('professionalSelect');
    const appointmentProfessional = document.getElementById('appointmentProfessional');
    
    // Limpar opções existentes
    professionalSelect.innerHTML = '<option value="">Todos os profissionais</option>';
    appointmentProfessional.innerHTML = '<option value="">Selecione um profissional</option>';

    data.forEach(professional => {
      const option1 = document.createElement('option');
      option1.value = professional.id;
      option1.textContent = professional.name;
      professionalSelect.appendChild(option1);

      const option2 = document.createElement('option');
      option2.value = professional.id;
      option2.textContent = professional.name;
      appointmentProfessional.appendChild(option2);
    });
  } catch (error) {
    console.error('Erro ao carregar profissionais:', error);
  }
}

// Função para carregar pacientes
async function loadPatients() {
  try {
    const { data, error } = await supabaseClient
      .from('patients')
      .select('*')
      .order('first_name');

    if (error) throw error;

    const appointmentPatient = document.getElementById('appointmentPatient');
    appointmentPatient.innerHTML = '<option value="">Selecione um paciente</option>';

    data.forEach(patient => {
      const option = document.createElement('option');
      option.value = patient.id;
      option.textContent = `${patient.first_name} ${patient.last_name}`;
      appointmentPatient.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar pacientes:', error);
  }
}

// Função para configurar event listeners
function setupEventListeners() {
  // Filtro de profissional
  document.getElementById('professionalSelect').addEventListener('change', (e) => {
    currentProfessional = e.target.value;
    calendar.refetchEvents();
  });

  // Filtro de visualização
  document.getElementById('viewSelect').addEventListener('change', (e) => {
    calendar.changeView(e.target.value);
  });

  // Botão aplicar filtros
  document.getElementById('applyFiltersBtn').addEventListener('click', () => {
    calendar.refetchEvents();
  });

  // Botão novo agendamento
  document.getElementById('newAppointmentBtn').addEventListener('click', () => {
    openNewAppointmentModal();
  });

  // Botão salvar agendamento
  document.getElementById('saveAppointmentBtn').addEventListener('click', saveAppointment);

  // Botão excluir agendamento
  document.getElementById('deleteAppointmentBtn').addEventListener('click', deleteAppointment);
}

// Função para obter cor do status
function getStatusColor(status) {
  const colors = {
    'scheduled': '#4caf50',
    'completed': '#2196f3',
    'cancelled': '#f44336',
    'no_show': '#ff9800'
  };
  return colors[status] || '#4caf50';
}

// Função para abrir modal de novo agendamento
function openNewAppointmentModal(date = null) {
  document.getElementById('appointmentModalTitle').textContent = 'Novo Agendamento';
  document.getElementById('appointmentForm').reset();
  document.getElementById('appointmentId').value = '';
  document.getElementById('appointmentStatusGroup').style.display = 'none';
  document.getElementById('deleteAppointmentBtn').style.display = 'none';

  if (date) {
    document.getElementById('appointmentDate').value = date.toISOString().split('T')[0];
  }

  generateTimeOptions();
  
  const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
  modal.show();
}

// Função para gerar opções de horário
function generateTimeOptions() {
  const startTimeSelect = document.getElementById('appointmentStartTime');
  const endTimeSelect = document.getElementById('appointmentEndTime');
  
  startTimeSelect.innerHTML = '<option value="">Selecione</option>';
  endTimeSelect.innerHTML = '<option value="">Selecione</option>';

  for (let hour = 8; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      const option1 = document.createElement('option');
      option1.value = timeString;
      option1.textContent = timeString;
      startTimeSelect.appendChild(option1);

      const option2 = document.createElement('option');
      option2.value = timeString;
      option2.textContent = timeString;
      endTimeSelect.appendChild(option2);
    }
  }
}

// Função para salvar agendamento
async function saveAppointment() {
  try {
    const appointmentData = {
      patient_id: document.getElementById('appointmentPatient').value,
      professional_id: document.getElementById('appointmentProfessional').value,
      date: document.getElementById('appointmentDate').value,
      start_time: document.getElementById('appointmentStartTime').value,
      end_time: document.getElementById('appointmentEndTime').value,
      notes: document.getElementById('appointmentNotes').value,
      status: document.getElementById('appointmentStatus').value || 'scheduled'
    };

    const appointmentId = document.getElementById('appointmentId').value;

    let result;
    if (appointmentId) {
      // Atualizar agendamento existente
      result = await supabaseClient
        .from('appointments')
        .update(appointmentData)
        .eq('id', appointmentId);
    } else {
      // Criar novo agendamento
      result = await supabaseClient
        .from('appointments')
        .insert([appointmentData]);
    }

    if (result.error) throw result.error;

    alert('Agendamento salvo com sucesso!');
    calendar.refetchEvents();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('appointmentModal'));
    modal.hide();
  } catch (error) {
    console.error('Erro ao salvar agendamento:', error);
    alert('Erro ao salvar agendamento: ' + error.message);
  }
}

// Função para excluir agendamento
async function deleteAppointment() {
  const appointmentId = document.getElementById('appointmentId').value;
  
  if (!appointmentId) return;

  if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

  try {
    const { error } = await supabaseClient
      .from('appointments')
      .delete()
      .eq('id', appointmentId);

    if (error) throw error;

    alert('Agendamento excluído com sucesso!');
    calendar.refetchEvents();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('appointmentModal'));
    modal.hide();
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    alert('Erro ao excluir agendamento: ' + error.message);
  }
}

// Função para mostrar detalhes do agendamento
function showAppointmentDetails(event) {
  const details = `
    <p><strong>Paciente:</strong> ${event.title}</p>
    <p><strong>Profissional:</strong> ${event.extendedProps.professional.name}</p>
    <p><strong>Data:</strong> ${event.start.toLocaleDateString('pt-BR')}</p>
    <p><strong>Horário:</strong> ${event.start.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})} - ${event.end.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</p>
    <p><strong>Status:</strong> ${getStatusText(event.extendedProps.status)}</p>
    <p><strong>Observações:</strong> ${event.extendedProps.notes || 'Nenhuma'}</p>
  `;
  
  document.getElementById('appointmentDetails').innerHTML = details;
  
  // Configurar botão de editar
  document.getElementById('editAppointmentBtn').onclick = () => {
    editAppointment(event);
  };
  
  const modal = new bootstrap.Modal(document.getElementById('viewAppointmentModal'));
  modal.show();
}

// Função para editar agendamento
function editAppointment(event) {
  // Fechar modal de visualização
  const viewModal = bootstrap.Modal.getInstance(document.getElementById('viewAppointmentModal'));
  viewModal.hide();
  
  // Preencher formulário de edição
  document.getElementById('appointmentModalTitle').textContent = 'Editar Agendamento';
  document.getElementById('appointmentId').value = event.id;
  document.getElementById('appointmentPatient').value = event.extendedProps.patient.id;
  document.getElementById('appointmentProfessional').value = event.extendedProps.professional.id;
  document.getElementById('appointmentDate').value = event.start.toISOString().split('T')[0];
  document.getElementById('appointmentStartTime').value = event.start.toTimeString().slice(0, 5);
  document.getElementById('appointmentEndTime').value = event.end.toTimeString().slice(0, 5);
  document.getElementById('appointmentNotes').value = event.extendedProps.notes || '';
  document.getElementById('appointmentStatus').value = event.extendedProps.status;
  
  document.getElementById('appointmentStatusGroup').style.display = 'block';
  document.getElementById('deleteAppointmentBtn').style.display = 'inline-block';
  
  generateTimeOptions();
  
  const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
  modal.show();
}

// Função para obter texto do status
function getStatusText(status) {
  const statusTexts = {
    'scheduled': 'Agendado',
    'completed': 'Concluído',
    'cancelled': 'Cancelado',
    'no_show': 'Não compareceu'
  };
  return statusTexts[status] || status;
}

// Funções auxiliares para formatação de data
function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
}

function formatDateTime(dateTimeString) {
  if (!dateTimeString) return "-";
  const date = new Date(dateTimeString);
  return date.toLocaleString("pt-BR");
}

// Adicionar evento de redirecionamento após login com Google
window.addEventListener('load', async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    showApp();
    updateUserInfo(session.user);
    initializeCalendar();
  }
});


