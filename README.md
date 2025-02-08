# API de Livraria - Sistema de Gerenciamento de Livros

Uma API RESTful completa para gerenciamento de livraria, desenvolvida com Node.js e MySQL.

## Tecnologias Utilizadas

- **Node.js** - Ambiente de execução JavaScript
- **Express** - Framework web
- **MySQL** - Banco de dados relacional
- **Sequelize** - ORM para Node.js
- **JWT** - JSON Web Token para autenticação
- **Bcrypt** - Criptografia de senhas
- **Cors** - Middleware para habilitar CORS
- **Dotenv** - Gerenciamento de variáveis de ambiente

## Pré-requisitos

- Node.js (versão 14 ou superior)
- MySQL (versão 5.7 ou superior)
- NPM ou Yarn

## Instalação

1. **Clone o repositório**
```bash
git clone [url-do-repositorio]
cd [nome-da-pasta]
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o arquivo .env**
```env
PORT=3000
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=bookstore
JWT_SECRET=sua_chave_secreta
```

4. **Crie o banco de dados**
```sql
CREATE DATABASE bookstore;

-- Execute os comandos SQL para criar as tabelas:
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'client') DEFAULT 'client',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre ENUM('Ficção', 'Romance', 'Fantasia', 'Ciência', 'Outros') NOT NULL,
    releaseDate DATE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    stockQuantity INT NOT NULL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    bookId INT NOT NULL,
    quantity INT NOT NULL,
    totalPrice DECIMAL(10,2) NOT NULL,
    status ENUM('pendente', 'processada', 'cancelada') DEFAULT 'pendente',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id),
    FOREIGN KEY (bookId) REFERENCES Books(id)
);

CREATE TABLE Payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchaseId INT NOT NULL,
    paymentMethod ENUM('cartao_credito', 'boleto') NOT NULL,
    status ENUM('pendente', 'pago', 'falhado') DEFAULT 'pendente',
    amount DECIMAL(10,2) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (purchaseId) REFERENCES Purchases(id)
);
```

5. **Inicie o servidor**
```bash
npm run dev
```

## Funcionalidades e Endpoints

### 1. Autenticação

#### Registrar Usuário
```http
POST /auth/register
Content-Type: application/json

{
    "name": "Nome do Usuário",
    "email": "usuario@email.com",
    "password": "senha123",
    "role": "client"  // ou "admin"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
    "email": "usuario@email.com",
    "password": "senha123"
}
```

### 2. Usuários

#### Ver Perfil
```http
GET /users/profile
Authorization: Bearer seu_token_jwt
```

#### Atualizar Usuário
```http
PUT /users/:id
Authorization: Bearer seu_token_jwt
Content-Type: application/json

{
    "name": "Novo Nome",
    "email": "novo@email.com",
    "password": "nova_senha"
}
```

#### Deletar Usuário
```http
DELETE /users/:id
Authorization: Bearer seu_token_jwt
```

### 3. Livros

#### Cadastrar Livro (Admin)
```http
POST /livros
Authorization: Bearer seu_token_jwt
Content-Type: application/json

{
    "title": "O Senhor dos Anéis",
    "author": "J.R.R. Tolkien",
    "genre": "Fantasia",
    "releaseDate": "1954-07-29",
    "price": 59.90,
    "description": "Uma história épica...",
    "stockQuantity": 10
}
```

#### Buscar Livros
```http
GET /livros  // Lista todos
GET /livros?nome=Senhor  // Busca por nome
GET /livros?genero=Fantasia  // Filtra por gênero
GET /livros?precoMin=50&precoMax=100  // Filtra por faixa de preço
```

#### Ver Detalhes do Livro
```http
GET /livros/:id
```

#### Deletar Livro (Admin)
```http
DELETE /livros/:id
Authorization: Bearer seu_token_jwt
```

### 4. Compras

#### Realizar Compra
```http
POST /compras
Authorization: Bearer seu_token_jwt
Content-Type: application/json

{
    "bookId": 1,
    "quantity": 1
}
```

#### Listar Compras
```http
GET /compras
Authorization: Bearer seu_token_jwt
```

#### Ver Detalhes da Compra
```http
GET /compras/:id
Authorization: Bearer seu_token_jwt
```

#### Deletar Compra
```http
DELETE /compras/:id
Authorization: Bearer seu_token_jwt
```

### 5. Pagamentos

#### Realizar Pagamento
```http
POST /pagamentos
Authorization: Bearer seu_token_jwt
Content-Type: application/json

{
    "purchaseId": 1,
    "paymentMethod": "cartao_credito"  // ou "boleto"
}
```

#### Listar Pagamentos
```http
GET /pagamentos
Authorization: Bearer seu_token_jwt
```

## Segurança

- Todas as senhas são criptografadas usando bcrypt
- Autenticação via JWT Token
- Validação de roles (admin/client)
- Proteção contra acesso não autorizado
- Validações de dados em todas as operações

## Regras de Negócio

1. **Usuários**
   - Podem ser admin ou client
   - Só podem deletar sua própria conta
   - Ao deletar conta, todas as compras são removidas

2. **Livros**
   - Apenas admins podem cadastrar/deletar
   - Estoque é atualizado automaticamente nas compras

3. **Compras**
   - Só podem ser deletadas se não estiverem pagas
   - Ao deletar, estoque é restaurado
   - Usuário só pode ver/deletar suas próprias compras

4. **Pagamentos**
   - Vinculados a uma compra
   - Status: pendente, pago, falhado
   - Métodos: cartão de crédito ou boleto

## Desenvolvimento

Para contribuir ou modificar o projeto:

1. Crie um fork do repositório
2. Crie uma branch para sua feature
```bash
git checkout -b feature/nova-feature
```
3. Commit suas mudanças
```bash
git commit -m 'Adicionando nova feature'
```
4. Push para a branch
```bash
git push origin feature/nova-feature
```
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT - veja o arquivo LICENSE.md para detalhes

## Melhorias Futuras

- [ ] Implementar sistema de recuperação de senha
- [ ] Adicionar upload de imagens para livros
- [ ] Implementar sistema de avaliações
- [ ] Adicionar relatórios de vendas
- [ ] Implementar sistema de descontos
- [ ] Adicionar integração com gateway de pagamento real
