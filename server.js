// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Conexão com o banco de dados
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'celebrardb'
});

// Rota de login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  db.query(
    'SELECT * FROM Usuario WHERE Email = ? AND Senha = ?',
    [email, senha],
    (err, results) => {
      if (err) return res.status(500).send(err);
      if (results.length > 0) return res.json(results[0]);
      res.status(401).json({ message: 'Credenciais inválidas' });
    }
  );
});

// Rota de cadastro
app.post('/cadastro', (req, res) => {
  const { nome, email, senha } = req.body;
  db.query(
    'INSERT INTO Usuario (Nome, Email, Senha) VALUES (?, ?, ?)',
    [nome, email, senha],
    (err) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Usuário cadastrado com sucesso' });
    }
  );
});

// Rota para salvar eventos
app.post('/evento', (req, res) => {
  const { nome, data, hora, descricao, id_usuario } = req.body;
  db.query(
    'INSERT INTO Evento (Nome, Data, Hora, Descricao, ID_usuario) VALUES (?, ?, ?, ?, ?)',
    [nome, data, hora, descricao, id_usuario],
    (err) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Evento criado com sucesso', id: result.insertId });
    }
  );
});

// Cancelar inscrição em evento
app.post('/cancelar-inscricao', (req, res) => {
  const { id_usuario, id_evento } = req.body;
  db.query(
    'DELETE FROM Inscricao WHERE ID_usuario = ? AND ID_evento = ?',
    [id_usuario, id_evento],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Inscrição cancelada com sucesso' });
    }
  );
});


app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});

// Listar eventos por usuário
app.get('/eventos/:id_usuario', (req, res) => {
  const { id_usuario } = req.params;
  db.query(
    'SELECT * FROM Evento WHERE ID_usuario = ?',
    [id_usuario],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
});

// Listar eventos que o usuário está inscrito
app.get('/meus-inscritos/:id_usuario', (req, res) => {
  const { id_usuario } = req.params;
  db.query(
    `SELECT Evento.*, Usuario.Email AS EmailCriador
     FROM Evento
     JOIN Usuario ON Evento.ID_usuario = Usuario.ID_usuario
     JOIN Inscricao ON Evento.ID_evento = Inscricao.ID_evento
     WHERE Inscricao.ID_usuario = ?`,
    [id_usuario],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
});

// Listar todos os eventos públicos (todos os eventos existentes)
app.get('/eventos', (req, res) => {
  db.query(
    `SELECT Evento.*, Usuario.Email AS EmailCriador 
     FROM Evento
     JOIN Usuario ON Evento.ID_usuario = Usuario.ID_usuario`,
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
});

// Rota para deletar evento
app.delete('/evento/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM Evento WHERE ID_evento = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    res.json({ message: 'Evento excluído com sucesso' });
  });
});

app.post('/inscricao', (req, res) => {
  const { id_usuario, id_evento } = req.body;

  db.query(
    'INSERT INTO Inscricao (ID_usuario, ID_evento) VALUES (?, ?)',
    [id_usuario, id_evento],
    (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Usuário já inscrito nesse evento.' });
        }
        return res.status(500).send(err);
      }
      res.json({ message: 'Inscrição realizada com sucesso' });
    }
  );
});

app.get('/inscricoes/:id_usuario', (req, res) => {
  const { id_usuario } = req.params;
  db.query(
    'SELECT ID_evento FROM Inscricao WHERE ID_usuario = ?',
    [id_usuario],
    (err, results) => {
      if (err) return res.status(500).send(err);
      const inscritos = results.map(r => r.ID_evento);
      res.json(inscritos);
    }
  );
});
