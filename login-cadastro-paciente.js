// Configuração do Supabase
const SUPABASE_URL = 'https://evymdirordklgqtfucdp.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANON_KEY'; // Substitua pela sua chave anônima
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementos do DOM
const authContainer = document.getElementById('authContainer');
const appContainer = document.getElementById('appContainer');
const loginForm = document.getElementById('loginForm');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const patientForm = document.getElementById('patientForm');
const patientsList = document.getElementById('patientsList');
const patientDetails = document.getElementById('patientDetails');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');

// Verificar se o usuário está logado ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        showApp();
        updateUserInfo(session.user);
        loadPatients();
    } else {
        showAuth();
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
        loadPatients();
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
                redirectTo: window.location.origin
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

// Adicionar evento de envio do formulário de pacientes
patientForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await addPatient();
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

// Função para carregar pacientes
async function loadPatients() {
    try {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Limpar lista atual
        patientsList.innerHTML = '';
        
        if (data.length === 0) {
            patientsList.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum paciente cadastrado</td></tr>';
            return;
        }
        
        // Adicionar pacientes à tabela
        data.forEach(patient => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${patient.id}</td>
                <td>${patient.first_name}</td>
                <td>${patient.last_name}</td>
                <td>${patient.email || '-'}</td>
                <td>${patient.phone || '-'}</td>
                <td>${formatDate(patient.date_of_birth)}</td>
                <td>
                    <button class="btn btn-sm btn-info view-patient" data-id="${patient.id}">Ver</button>
                    <button class="btn btn-sm btn-danger delete-patient" data-id="${patient.id}">Excluir</button>
                </td>
            `;
            patientsList.appendChild(row);
        });
        
        // Adicionar eventos aos botões
        addButtonEvents();
    } catch (error) {
        console.error('Erro ao carregar pacientes:', error);
        alert('Erro ao carregar pacientes. Verifique o console para mais detalhes.');
    }
}

// Função para adicionar paciente usando RPC
async function addPatient() {
    try {
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const dateOfBirth = document.getElementById('dateOfBirth').value;
        
        // Chamar a função RPC para criar paciente com ID personalizado
        const { data, error } = await supabase.rpc(
            'create_patient_with_custom_id',
            {
                p_first_name: firstName,
                p_last_name: lastName,
                p_email: email || null,
                p_phone: phone || null,
                p_date_of_birth: dateOfBirth || null
            }
        );
        
        if (error) throw error;
        
        alert(`Paciente cadastrado com sucesso! ID: ${data.id}`);
        patientForm.reset();
        loadPatients();
    } catch (error) {
        console.error('Erro ao adicionar paciente:', error);
        alert('Erro ao adicionar paciente. Verifique o console para mais detalhes.');
    }
}

// Função para visualizar detalhes do paciente
async function viewPatient(id) {
    try {
        // Usar a função RPC que criamos anteriormente
        const { data, error } = await supabase.rpc(
            'get_patient_safely',
            { p_id: id }
        );
        
        if (error) throw error;
        
        if (!data.found) {
            alert('Paciente não encontrado!');
            return;
        }
        
        const patient = data.patient;
        
        // Preencher modal com detalhes do paciente
        // Corrigir linha incompleta
        // Exemplo: preencher campos do modal com dados do paciente
        // document.getElementById('modalFirstName').textContent = patient.first_name;
        // document.getElementById('modalLastName').textContent = patient.last_name;
        // ... (outros campos conforme necessário)
    } catch (error) {
        console.error('Erro ao visualizar paciente:', error);
        alert('Erro ao visualizar paciente. Verifique o console para mais detalhes.');
    }
}

// Função para adicionar eventos aos botões de ação dos pacientes
function addButtonEvents() {
    // Adicionar evento de clique para visualizar paciente
    const viewButtons = document.querySelectorAll('.view-patient');
    viewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const patientId = e.currentTarget.getAttribute('data-id');
            viewPatient(patientId);
        });
    });
    
    // Adicionar evento de clique para excluir paciente
    const deleteButtons = document.querySelectorAll('.delete-patient');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const patientId = e.currentTarget.getAttribute('data-id');
            const confirmed = confirm('Tem certeza que deseja excluir este paciente?');
            if (confirmed) {
                await deletePatient(patientId);
            }
        });
    });
}

// Função para excluir paciente
async function deletePatient(id) {
    try {
        const { data, error } = await supabase
            .from('patients')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        alert('Paciente excluído com sucesso!');
        loadPatients();
    } catch (error) {
        console.error('Erro ao excluir paciente:', error);
        alert('Erro ao excluir paciente. Verifique o console para mais detalhes.');
    }
}

// Função para formatar datas
function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

// Adicionar evento de redirecionamento após login com Google
window.addEventListener('load', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        showApp();
        updateUserInfo(session.user);
        loadPatients();
    }
});