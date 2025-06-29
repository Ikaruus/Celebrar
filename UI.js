const UI = {
  init() {
    this.showMenu();
    this.showSection('home');
    this.updateEventsTable();
    this.updatePublicEventsTable();
    this.bindEvents();
  },

  showMenu() {
    document.getElementById('menu').classList.remove('d-none');
  },

  showSection(secaoId) {
    const secoes = ['home', 'agendamento', 'listar', 'eventosPublicos'];
    secoes.forEach(id => {
      const secao = document.getElementById(id);
      if (secao) secao.classList.add('d-none');
    });

    const secaoAtiva = document.getElementById(secaoId);
    if (secaoAtiva) secaoAtiva.classList.remove('d-none');
  },

  bindEvents() {
    document.addEventListener('click', e => {
      const sectionLink = e.target.closest('[data-section]');
      if (sectionLink) {
        this.showSection(sectionLink.dataset.section);
      }

      const logoutBtn = e.target.closest('.logout-btn');
      if (logoutBtn) {
        this.logout();
      }
    });
  },

  handleAgendar: async function (e) {
    e.preventDefault();
    const form = e.target;
    const { evento, data, hora, plataforma } = form;

    const usuario = JSON.parse(localStorage.getItem('usuarioAtual'));
    if (!usuario) return alert('Usuário não autenticado!');

    const res = await fetch('http://localhost:3000/evento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: evento.value,
        data: data.value,
        hora: hora.value,
        descricao: plataforma.value,
        id_usuario: usuario.ID_usuario
      })
    });

    if (res.ok) {
      alert('Evento agendado!');
      form.reset();
    } else {
      alert('Erro ao agendar evento.');
    }
  },

  async updateEventsTable() {
    const usuario = JSON.parse(localStorage.getItem("usuarioAtual"));
      if (!usuario) return;

      // Busca eventos criados
      const criados = await fetch(`http://localhost:3000/eventos/${usuario.ID_usuario}`).then(r => r.json());

      // Busca eventos inscritos
      console.log('Buscando eventos inscritos...');
      const inscritos = await fetch(`http://localhost:3000/meus-inscritos/${usuario.ID_usuario}`).then(r => r.json());
      console.log('Inscritos encontrados:', inscritos);


      // Mescla e evita duplicação
      const eventos = [...criados, ...inscritos.filter(ev => !criados.some(c => c.ID_evento === ev.ID_evento))];

      const tbody = document.getElementById("tabelaAgendamentos");
      tbody.innerHTML = "";

      if (eventos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">Nenhum agendamento ainda.</td></tr>`;
        return;
      }

      eventos.forEach((evento) => {
        const isCriador = evento.ID_usuario === usuario.ID_usuario;
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${evento.Nome}</td>
          <td>${evento.Data}</td>
          <td>${evento.Hora}</td>
          <td>${evento.Descricao}</td>
          <td>
            ${isCriador
              ? `<span class="badge bg-primary">Criador</span>
                <button class="btn btn-sm btn-danger" onclick="UI.excluirEvento(${evento.ID_evento})">Excluir</button>`
              : `<span class="badge bg-success">Inscrito</span>
                <button class="btn btn-sm btn-outline-danger" onclick="UI.cancelarInscricao(${evento.ID_evento})">Cancelar</button>`
            }
          </td>
        `;
        tbody.appendChild(row);
      });
  },

 async updatePublicEventsTable() {
  const usuario = JSON.parse(localStorage.getItem('usuarioAtual'));
  if (!usuario) return;

  const res = await fetch(`http://localhost:3000/eventos`);
  const eventos = await res.json();

  const tbody = document.getElementById('tabelaEventosPublicos');
  tbody.innerHTML = '';

  if (eventos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Nenhum evento público disponível.</td></tr>';
    return;
  }

  eventos.forEach((e) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${e.Nome}</td>
      <td>${e.Data}</td>
      <td>${e.Hora}</td>
      <td>${e.Descricao}</td>
      <td>${e.EmailCriador}</td>
      <td>
        <button class="btn btn-sm btn-outline-success" onclick="UI.inscreverEvento(${e.ID_evento})">Inscrever-se</button>
        <button class="btn btn-sm btn-info ms-2" onclick="UI.mostrarDetalhesEvento(${e.ID_evento})">Ver Detalhes</button>
      </td>
    `;
    tbody.appendChild(row);
  });
},

  async deleteEvent(id_evento) {
  console.log('Tentando excluir evento com ID:', id_evento);
  if (!confirm('Tem certeza que deseja excluir este evento?')) return;

  try {
    const res = await fetch(`http://localhost:3000/evento/${id_evento}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      alert('Evento excluído com sucesso!');
      this.updateEventsTable();
      this.updatePublicEventsTable();
    } else {
      const error = await res.json();
      alert('Erro ao excluir evento: ' + (error.message || 'Erro desconhecido'));
    }
  } catch (err) {
    alert('Erro na comunicação com o servidor: ' + err.message);
  }
},

  async inscreverEvento(id_evento) {
  const usuario = JSON.parse(localStorage.getItem('usuarioAtual'));
  if (!usuario) return alert('Você precisa estar logado');

  const res = await fetch('http://localhost:3000/inscricao', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_usuario: usuario.ID_usuario, id_evento })
  });

  if (res.ok) {
    alert('Inscrição confirmada!');
    this.updatePublicEventsTable();
    this.updateEventsTable();
  } else {
    const erro = await res.json();
    alert(erro.message || 'Erro ao se inscrever no evento.');
  }
},
  async mostrarDetalhesEvento(id_evento) {
    const res = await fetch(`http://localhost:3000/eventos`);
    const eventos = await res.json();
    const evento = eventos.find(ev => ev.ID_evento === id_evento);
    if (!evento) return alert("Evento não encontrado.");

    document.getElementById("detalheNome").textContent = evento.Nome;
    document.getElementById("detalheCriador").textContent = evento.EmailCriador;
    document.getElementById("detalheData").textContent = evento.Data;
    document.getElementById("detalheHora").textContent = evento.Hora;
    document.getElementById("detalheDescricao").textContent = evento.Descricao;

    document.getElementById("modalDetalhes").classList.remove("d-none");
  },

  async cancelarInscricao(id_evento) {
  const usuario = JSON.parse(localStorage.getItem("usuarioAtual"));
  if (!usuario) return;

  const res = await fetch('http://localhost:3000/cancelar-inscricao', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_usuario: usuario.ID_usuario, id_evento })
  });

  if (res.ok) {
    UI.toast("Inscrição cancelada com sucesso!", "success");
    UI.updateEventsTable();
    UI.updatePublicEventsTable();
    UI.toast("Inscrição cancelada com sucesso!", "success");
  } else {
    UI.toast("Erro ao cancelar inscrição!", "danger");
  }
  },

  fecharModalDetalhes() {
  document.getElementById("modalDetalhes").classList.add("d-none");},

  logout() {
    localStorage.removeItem('usuarioAtual');
    alert('Logout realizado com sucesso!');
    window.location.href = 'login.html';
  }
};
