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

  handleAgendar(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const evento = formData.get('evento');
    const data = formData.get('data');
    const hora = formData.get('hora');
    const plataforma = formData.get('plataforma');

    const usuario = JSON.parse(localStorage.getItem('usuarioAtual'));

    if (!usuario) {
      alert('Você precisa estar logado para agendar!');
      return;
    }

    const novoEvento = {
      evento,
      data,
      hora,
      plataforma,
      emailCriador: usuario.email
    };

    EventService.add(novoEvento);
    alert('Evento agendado com sucesso!');

    event.target.reset();
    this.showSection('listar');
    this.updateEventsTable();
    this.updatePublicEventsTable();
  },

  updateEventsTable() {
    const eventos = EventService.getAll();
    const tbody = document.getElementById('tabelaAgendamentos');
    tbody.innerHTML = '';

    const usuario = JSON.parse(localStorage.getItem('usuarioAtual'));

    const meusEventos = eventos.filter(e => 
      e.emailCriador === usuario.email || 
      (e.inscritos && e.inscritos.includes(usuario.email))
    );

    if (meusEventos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhum agendamento ainda.</td></tr>';
      return;
    }

    meusEventos.forEach((e, index) => {
      const isCriador = e.emailCriador === usuario.email;
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${e.evento}</td>
        <td>${e.data}</td>
        <td>${e.hora}</td>
        <td>${e.plataforma}</td>
        <td>
          ${isCriador ? 
            `<button class="btn btn-sm btn-outline-danger" onclick="UI.deleteEvent(${index})">Excluir</button>` : 
            '<span class="badge bg-secondary">Inscrito</span>'
          }
        </td>
      `;
      tbody.appendChild(row);
    });
  },

  updatePublicEventsTable() {
    const eventos = EventService.getAll();
    const tbody = document.getElementById('tabelaEventosPublicos');
    tbody.innerHTML = '';

    const usuario = JSON.parse(localStorage.getItem('usuarioAtual'));

    if (eventos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Nenhum evento público disponível.</td></tr>';
      return;
    }

    eventos.forEach((e, index) => {
      const isInscrito = e.inscritos && e.inscritos.includes(usuario.email);
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${e.evento}</td>
        <td>${e.data}</td>
        <td>${e.hora}</td>
        <td>${e.plataforma}</td>
        <td>${e.emailCriador}</td>
        <td>
          ${isInscrito ? 
            '<span class="badge bg-success">Inscrito</span>' : 
            `<button class="btn btn-sm btn-outline-success" onclick="UI.inscreverEvento(${index})">Inscrever-se</button>`
          }
        </td>
      `;
      tbody.appendChild(row);
    });
  },

  deleteEvent(index) {
    EventService.delete(index);
    alert('Evento excluído com sucesso!');
    this.updateEventsTable();
    this.updatePublicEventsTable();
  },

  inscreverEvento(index) {
    const eventos = EventService.getAll();
    const evento = eventos[index];

    const usuario = JSON.parse(localStorage.getItem('usuarioAtual'));
    if (!usuario) {
      alert('Você precisa estar logado para se inscrever!');
      return;
    }

    if (!evento.inscritos) {
      evento.inscritos = [];
    }

    // Evita inscrição duplicada
    if (evento.inscritos.includes(usuario.email)) {
      alert('Você já está inscrito neste evento!');
      return;
    }

    evento.inscritos.push(usuario.email);

    // Salva atualização
    EventService.saveAll(eventos);

    alert(`Inscrição confirmada para o evento: ${evento.evento}`);
    this.updatePublicEventsTable();
    this.updateEventsTable();
  },

  logout() {
    localStorage.removeItem('usuarioAtual');
    alert('Logout realizado com sucesso!');
    window.location.href = 'login.html';
  }
};
