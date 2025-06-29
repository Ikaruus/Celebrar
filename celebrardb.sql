CREATE DATABASE celebrardb;
USE celebrardb;
CREATE TABLE Usuario (
  ID_usuario INT PRIMARY KEY AUTO_INCREMENT,
  Nome VARCHAR(100) NOT NULL,
  Senha VARCHAR(100) NOT NULL,
  Email VARCHAR(100) NOT NULL
);

CREATE TABLE Evento (
  ID_evento INT PRIMARY KEY AUTO_INCREMENT,
  Nome VARCHAR(100) NOT NULL,
  Data DATE NOT NULL,
  Hora TIME NOT NULL,
  Descricao TEXT NOT NULL,
  ID_usuario INT,
  FOREIGN KEY (ID_usuario) REFERENCES Usuario(ID_usuario)
);

CREATE TABLE Inscricao (
  ID_evento INT,
  ID_usuario INT,
  PRIMARY KEY (ID_evento, ID_usuario),
  FOREIGN KEY (ID_evento) REFERENCES Evento(ID_evento),
  FOREIGN KEY (ID_usuario) REFERENCES Usuario(ID_usuario)
);

DELIMITER //

CREATE FUNCTION TotalEventosCriados(idUser INT)
RETURNS INT
DETERMINISTIC
BEGIN
  DECLARE total INT;
  SELECT COUNT(*) INTO total FROM Evento WHERE ID_usuario = idUser;
  RETURN total;
END //

DELIMITER ;

CREATE VIEW vw_UsuariosSimples AS
SELECT Nome FROM Usuario;

DELIMITER //

CREATE PROCEDURE InserirUsuarioSimples (
  IN p_Nome VARCHAR(100),
  IN p_Senha VARCHAR(100),
  IN p_Email VARCHAR(100)
)
BEGIN
  INSERT INTO Usuario (Nome, Senha, Email)
  VALUES (p_Nome, p_Senha, p_Email);
END //

DELIMITER ;

select*from Evento

SELECT * FROM Usuario

SELECT * FROM Inscricao;
