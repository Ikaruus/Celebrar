const UI = {
  sections: ['home', 'cadastro', 'login', 'agendamento', 'listar', 'eventosPublicos'],

  init() {
    this.bindEvents();
    this.toggleMenu(AuthService.getCurrentUser());
    this.showSection(AuthService.getCurrentUser() ? 'home' : 'login');
  },

    bindEvents() {
        document.addEventListener('click', e => {
            const sectionLink = e.target.closest('[data-section]');
            if (sectionLink) {
                e.preventDefault();
                this.showSection(sectionLink.dataset.section);
                document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.toggle('active', link === sectionLink);
                });
            }
            if (e.target.matches('.logout-btn')) {
                AuthService.logout();
                this.toggleMenu(false);
                this.showSection('login');
            }
        });

        document.getElementById('formCadastro')?.addEventListener('submit', (e) => this.handleCadastro(e));
        document.getElementById('formLogin')?.addEventListener('submit', (e) => this.handleLogin(e));
    },


    toggleMenu(isLoggedIn) {
        const menu = document.getElementById('menu');
            if (isLoggedIn) {
            menu.classList.remove('d-none');
            menu.classList.add('navbar-expand-lg', 'navbar-light', 'bg-light');
            } else {
            menu.classList.add('d-none');
            }
    },

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            const usuario = await AuthService.login(
                formData.get('email'),
                formData.get('senha')
            );
            if (usuario) {
                this.toggleMenu(true);
                this.showSection('home');
                this.showToast('Login realizado com sucesso!');
            } else {
                 throw new Error('Credenciais inválidas');
                }
        } catch (error) {
            alert(error.message);
        }
    },

    showToast(message, type = 'success') {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        },

  showSection(sectionId) {
    if (!this.sections.includes(sectionId)) {
        console.error(`Seção ${sectionId} não encontrada`);
        return;
    }
    this.sections.forEach(id => 
      document.getElementById(id).classList.toggle('d-none', id !== sectionId)
    );
    
    if (sectionId === 'listar') this.updateEventsTable();
  },


  editEvent(index) {
    const eventos = EventService.getAll();
    const evento = eventos[index];
    // Preencher modal de edição
    this.showModal(evento, index);
  },

  deleteEvent(index) {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      const eventos = EventService.getAll();
      eventos.splice(index, 1);
      EventService.save(eventos);
      this.updateEventsTable();
    }
  },

  updateEventsTable() {
    const eventos = EventService.getAll();
    const tbody = document.getElementById('tabelaAgendamentos');
    tbody.innerHTML = '';

    if (eventos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhum agendamento ainda.</td></tr>';
      return;
    }

    eventos.forEach((evento, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${evento.evento}</td>
        <td>${evento.data}</td>
        <td>${evento.hora}</td>
        <td>${evento.plataforma}</td>
        <td>
          <button class="btn btn-sm btn-outline-warning me-2" onclick="UI.editEvent(${index})">Editar</button>
          <button class="btn btn-sm btn-outline-danger" onclick="UI.deleteEvent(${index})">Excluir</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  },
}
// Inicialização
document.addEventListener('DOMContentLoaded', () => UI.init());