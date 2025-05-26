const EventService = {
  getAll() {
    return JSON.parse(localStorage.getItem('agendamentos')) || [];
  },

  add(evento) {
    const eventos = this.getAll();
    eventos.push(evento);
    localStorage.setItem('agendamentos', JSON.stringify(eventos));
  },

  delete(index) {
    const eventos = this.getAll();
    eventos.splice(index, 1);
    localStorage.setItem('agendamentos', JSON.stringify(eventos));
  },

  saveAll(eventos) {
  localStorage.setItem('agendamentos', JSON.stringify(eventos));
  }
};
