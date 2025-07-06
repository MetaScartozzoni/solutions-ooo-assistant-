// Configuração do Supabase
const SUPABASE_URL = 'https://evymdirordklgqtfucdp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2eW1kaXJvcmRrbGdxdGZ1Y2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODg2MDEsImV4cCI6MjA2MzE2NDYwMX0.EVecSBaZFOoRmEMgbPEHPIwYwuLKlVWX5bjOQ7JGpmg'; // Substitua pela sua chave anônima
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementos do DOM
const authContainer = document.getElementById('authContainer');
const appContainer = document.getElementById('appContainer');
const loginForm = document.getElementById('loginForm');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const professionalSelect = document.getElementById('professionalSelect');
const viewSelect = document.getElementById('viewSelect');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const newAppointmentBtn = document.getElementById('newAppointmentBtn');
const appointmentForm = document.getElementById('appointmentForm');
const appointmentPatient = document.getElementById('appointmentPatient');
const appointmentProfessional = document.getElementById('appointmentProfessional');
const appointmentDate = document.getElementById('appointmentDate');
const appointmentStartTime = document.getElementById('appointmentStartTime');
const appointmentEndTime = document.getElementById('appointmentEndTime');
const appointmentNotes = document.getElementById('appointmentNotes');
const appointmentStatus = document.getElementById('appointmentStatus');
const appointmentStatusGroup = document.getElementById('appointmentStatusGroup');
const appointmentId = document.getElementById('appointmentId');
const appointmentModalTitle = document.getElementById('appointmentModalTitle');
const saveAppointmentBtn = document.getElementById('saveAppointmentBtn');
const deleteAppointmentBtn = document.getElementById('deleteAppointmentBtn');
const editAppointmentBtn = document.getElementById('editAppointmentBtn');
const appointmentDetails = document.getElementById('appointmentDetails');

// Variáveis globais
let calendar;
let currentProfessionalId = null;
let availableSlots = [];
let selectedAppointment = null;

// Verificar se o usuário está logado ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        showApp();
        updateUserInfo(session.user);
        await loadProfessionals();
        initializeCalendar();
    } else {
        showAuth();
    }
    
    // Verificar se há um hash na URL (indicando retorno de OAuth)
    if (window.location.hash) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            showApp();
            updateUserInfo(session.user);
            await loadProfessionals();
            initializeCalendar();
            
            // Limpar o hash da URL
            history.replaceState(null, null, ' ');
        }
    }
});

// Adicionar evento de login com email/senha
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        showApp();
        updateUserInfo(data.user);
        await loadProfessionals();
        initializeCalendar();
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        alert('Erro ao fazer login: ' + error.message);
    }
});

// Adicionar evento de login com Google
googleLoginBtn.addEventListener('click', async () => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + window.location.pathname
            }
        });
        
        if (error) throw error;
        
        // O redirecionamento será tratado pelo Supabase
    } catch (error) {
        console.error('Erro ao iniciar login com Google:', error);
        alert('Erro ao iniciar login com Google: ' + error.message);
    }
});

// Adicionar evento de logout
logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    showAuth();
});

// Função para mostrar a tela de autenticação
function showAuth() {
    authContainer.style.display = 'block';
    appContainer.style.display = 'none';
    logoutBtn.style.display = 'none';
    userInfo.style.display = 'none';
}

// Função para mostrar o aplicativo
function showApp() {
    authContainer.style.display = 'none';
    appContainer.style.display = 'block';
    logoutBtn.style.display = 'block';
    userInfo.style.display = 'flex';
}

// Função para atualizar informações do usuário
function updateUserInfo(user) {
    // Definir nome do usuário
    if (user.user_metadata && user.user_metadata.full_name) {
        userName.textContent = user.user_metadata.full_name;
    } else if (user.user_metadata && user.user_metadata.name) {
        userName.textContent = user.user_metadata.name;
    } else {
        userName.textContent = user.email;
    }
    
    // Definir avatar do usuário
    if (user.user_metadata && user.user_metadata.avatar_url) {
        userAvatar.src = user.user_metadata.avatar_url;
        userAvatar.style.display = 'block';
    } else {
        userAvatar.style.display = 'none';
    }
}

// Função para carregar profissionais
async function loadProfessionals() {
    try {
        const { data, error } = await supabase
            .from('professionals')
            .select('*')
            .order('first_name');
        
        if (error) throw error;
        
        // Limpar select atual
        professionalSelect.innerHTML = '<option value="">Selecione um profissional</option>';
        appointmentProfessional.innerHTML = '<option value="">Selecione um profissional</option>';
        
        // Adicionar profissionais ao select
        data.forEach(professional => {
            const option = document.createElement('option');
            option.value = professional.id;
            option.textContent = `${professional.first_name} ${professional.last_name} (${professional.specialty})`;
            professionalSelect.appendChild(option);
            
            const appointmentOption = option.cloneNode(true);
            appointmentProfessional.appendChild(appointmentOption);
        });
        
        // Se houver apenas um profissional, selecioná-lo automaticamente
        if (data.length === 1) {
            professionalSelect.value = data[0].id;
            currentProfessionalId = data[0].id;
        }
    } catch (error) {
        console.error('Erro ao carregar profissionais:', error);
        alert('Erro ao carregar profissionais. Verifique o console para mais detalhes.');
    }
}

// Função para carregar pacientes
async function loadPatients() {
    try {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .order('first_name');
        
        if (error) throw error;
        
        // Limpar select atual
        appointmentPatient.innerHTML = '<option value="">Selecione um paciente</option>';
        
        // Adicionar pacientes ao select
        data.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.first_name} ${patient.last_name}`;
            appointmentPatient.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar pacientes:', error);
        alert('Erro ao carregar pacientes. Verifique o console para mais detalhes.');
    }
}

// Função para inicializar o calendário
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        locale: 'pt-br',
        timeZone: 'local',
        selectable: true,
        selectMirror: true,
        navLinks: true,
        dayMaxEvents: true,
        slotMinTime: '08:00:00',
        slotMaxTime: '20:00:00',
        slotDuration: '00:30:00',
        allDaySlot: false,
        businessHours: {
            daysOfWeek: [1, 2, 3, 4, 5], // Segunda a sexta
            startTime: '08:00',
            endTime: '18:00',
        },
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        },
        select: handleDateSelect,
        eventClick: handleEventClick,
        events: fetchEvents
    });
    
    calendar.render();
    
    // Adicionar eventos aos filtros
    viewSelect.addEventListener('change', () => {
        calendar.changeView(viewSelect.value);
    });
    
    applyFiltersBtn.addEventListener('click', () => {
        currentProfessionalId = professionalSelect.value;
        calendar.refetchEvents();
    });
    
    // Adicionar evento ao botão de novo agendamento
    newAppointmentBtn.addEventListener('click', () => {
        resetAppointmentForm();
        const appointmentModal = new bootstrap.Modal(document.getElementById('appointmentModal'));
        appointmentModal.show();
    });
    
    // Adicionar evento ao botão de salvar agendamento
    saveAppointmentBtn.addEventListener('click', saveAppointment);
    
    // Adicionar evento ao botão de excluir agendamento
    deleteAppointmentBtn.addEventListener('click', deleteAppointment);
    
    // Adicionar evento ao botão de editar agendamento
    editAppointmentBtn.addEventListener('click', () => {
        const viewModal = bootstrap.Modal.getInstance(document.getElementById('viewAppointmentModal'));
        viewModal.hide();
        
        resetAppointmentForm();
        fillAppointmentForm(selectedAppointment);
        
        const editModal = new bootstrap.Modal(document.getElementById('appointmentModal'));
        editModal.show();
    });
    
    // Adicionar evento de mudança de profissional no formulário
    appointmentProfessional.addEventListener('change', () => {
        if (appointmentDate.value) {
            loadAvailableSlots();
        }
    });
    
    // Adicionar evento de mudança de data no formulário
    appointmentDate.addEventListener('change', () => {
        if (appointmentProfessional.value) {
            loadAvailableSlots();
        }
    });
    
    // Carregar pacientes
    loadPatients();
}

// Função para buscar eventos do calendário
async function fetchEvents(info, successCallback, failureCallback) {
    try {
        if (!currentProfessionalId) {
            successCallback([]);
            return;
        }
        
        // Construir array de status a serem incluídos
        const statusFilters = [];
        if (document.getElementById('showScheduled').checked) statusFilters.push('scheduled');
        if (document.getElementById('showCompleted').checked) statusFilters.push('completed');
        if (document.getElementById('showCancelled').checked) statusFilters.push('cancelled');
        if (document.getElementById('showNoShow').checked) statusFilters.push('no_show');
        
        // Buscar agendamentos
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                id,
                patient_id,
                professional_id,
                appointment_date,
                start_time,
                end_time,
                status,
                notes,
                patients (
                    first_name,
                    last_name
                )
            `)
            .eq('professional_id', currentProfessionalId)
            .gte('appointment_date', info.start.toISOString().split('T')[0])
            .lte('appointment_date', info.end.toISOString().split('T')[0])
            .in('status', statusFilters);
        
        if (error) throw error;
        
        // Converter para o formato do FullCalendar
        const events = data.map(appointment => {
            return {
                id: appointment.id,
                title: `${appointment.patients ? appointment.patients.first_name + ' ' + appointment.patients.last_name : 'Paciente'} - ${appointment.status}`,
                start: `${appointment.appointment_date}T${appointment.start_time}`,
                end: `${appointment.appointment_date}T${appointment.end_time}`,
                status: appointment.status,
                notes: appointment.notes
            };
        });
        successCallback(events);
    } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        failureCallback(error);
    }
}
