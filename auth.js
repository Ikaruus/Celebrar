const AuthService = {
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('usuarioAtual'));
  },

  login(email, senha) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => 
      u.email === email && u.senha === senha
    );
    
    if (usuario) {
      localStorage.setItem('usuarioAtual', JSON.stringify(usuario));
      return usuario;
    }
    return null; // Retorna null explicitamente se não encontrar
  },
    

  logout() {
    localStorage.removeItem('usuarioAtual');
  },

  cadastrar(nome, email, senha) {
    if (senha.length < 6) {
    throw new Error('A senha deve ter pelo menos 6 caracteres');
    }
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    if (usuarios.some(u => u.email === email)) throw new Error('Email já cadastrado');
    
    const novoUsuario = { nome, email, senha };
    localStorage.setItem('usuarios', JSON.stringify([...usuarios, novoUsuario]));
    return novoUsuario;
  }
};