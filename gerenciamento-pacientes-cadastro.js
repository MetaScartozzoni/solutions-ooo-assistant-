// Inicializar o cliente Supabase
const SUPABASE_URL = "https://evymdirordklgqtfucdp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2eW1kaXJvcmRrbGdxdGZ1Y2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODg2MDEsImV4cCI6MjA2MzE2NDYwMX0.EVecSBaZFOoRmEMgbPEHPIwYwuLKlVWX5bjOQ7JGpmg"; // Substitua pela sua chave anônima
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementos do DOM
const patientForm = document.getElementById("patientForm");
const patientsList = document.getElementById("patientsList");
const patientDetails = document.getElementById("patientDetails");

// Carregar pacientes ao iniciar a página
document.addEventListener("DOMContentLoaded", loadPatients);

// Adicionar evento de envio do formulário
patientForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  await addPatient();
});

// Função para carregar pacientes
async function loadPatients() {
  try {
    const { data, error } = await supabase
      .from("patients_with_custom_id")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Limpar lista atual
    patientsList.innerHTML = "";

    // Adicionar pacientes à tabela
    data.forEach((patient) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${patient.id}</td>
                <td>${patient.first_name}</td>
                <td>${patient.last_name}</td>
                <td>${patient.email || "-"}</td>
                <td>${patient.phone || "-"}</td>
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
    console.error("Erro ao carregar pacientes:", error);
    alert(
      "Erro ao carregar pacientes. Verifique o console para mais detalhes."
    );
  }
}

// Função para adicionar paciente usando RPC
async function addPatient() {
  try {
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const dateOfBirth = document.getElementById("dateOfBirth").value;

    // Chamar a função RPC para criar paciente com ID personalizado
    const { data, error } = await supabase.rpc(
      "create_patient_with_custom_id",
      {
        p_first_name: firstName,
        p_last_name: lastName,
        p_email: email || null,
        p_phone: phone || null,
        p_date_of_birth: dateOfBirth || null,
      }
    );

    if (error) throw error;

    alert(`Paciente cadastrado com sucesso! ID: ${data.id}`);
    patientForm.reset();
    loadPatients();
  } catch (error) {
    console.error("Erro ao adicionar paciente:", error);
    alert(
      "Erro ao adicionar paciente. Verifique o console para mais detalhes."
    );
  }
}

// Função para visualizar detalhes do paciente
async function viewPatient(id) {
  try {
    // Usar a função RPC que criamos anteriormente
    const { data, error } = await supabase.rpc("get_patient_safely", {
      p_id: id,
    });

    if (error) throw error;

    if (!data.found) {
      alert("Paciente não encontrado!");
      return;
    }

    const patient = data.patient;

    // Preencher modal com detalhes do paciente
    patientDetails.innerHTML = `
            <p><strong>ID:</strong> ${patient.id}</p>
            <p><strong>Nome:</strong> ${patient.first_name} ${patient.last_name}</p>
            <p><strong>Email:</strong> ${patient.email || "Não informado"}</p>
            <p><strong>Telefone:</strong> ${patient.phone || "Não informado"}</p>
            <p><strong>Data de Nascimento:</strong> ${formatDate(patient.date_of_birth)}</p>
            <p><strong>Cadastrado em:</strong> ${formatDateTime(patient.created_at)}</p>
            <p><strong>Última atualização:</strong> ${formatDateTime(patient.updated_at)}</p>
        `;

    // Abrir modal
    const patientModal = new bootstrap.Modal(
      document.getElementById("patientModal")
    );
    patientModal.show();
  } catch (error) {
    console.error("Erro ao carregar detalhes do paciente:", error);
    alert(
      "Erro ao carregar detalhes do paciente. Verifique o console para mais detalhes."
    );
  }
}

// Função para excluir paciente
async function deletePatient(id) {
  if (!confirm(`Tem certeza que deseja excluir o paciente com ID ${id}?`)) {
    return;
  }

  try {
    const { error } = await supabase
      .from("patients_with_custom_id")
      .delete()
      .eq("id", id);

    if (error) throw error;

    alert("Paciente excluído com sucesso!");
    loadPatients();
  } catch (error) {
    console.error("Erro ao excluir paciente:", error);
    alert("Erro ao excluir paciente. Verifique o console para mais detalhes.");
  }
}

// Adicionar eventos aos botões de visualizar e excluir
function addButtonEvents() {
  // Botões de visualizar
  document.querySelectorAll(".view-patient").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-id");
      viewPatient(id);
    });
  });

  // Botões de excluir
  document.querySelectorAll(".delete-patient").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-id");
      deletePatient(id);
    });
  });
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

// Elementos de autenticação
const authContainer = document.getElementById("authContainer");
const appContainer = document.getElementById("appContainer");
const loginForm = document.getElementById("loginForm");

// Verificar se o usuário está logado ao carregar a página
document.addEventListener("DOMContentLoaded", async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    showApp();
    loadPatients();
  } else {
    showAuth();
  }
});

// Adicionar evento de login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    showApp();
    loadPatients();
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    alert("Erro ao fazer login: " + error.message);
  }
});

// Função para mostrar a tela de autenticação
function showAuth() {
  authContainer.style.display = "block";
  appContainer.style.display = "none";
}

// Função para mostrar o aplicativo
function showApp() {
  authContainer.style.display = "none";
  appContainer.style.display = "block";
}

// Adicionar função de logout
function logout() {
  supabase.auth.signOut().then(() => {
    showAuth();
  });
}


