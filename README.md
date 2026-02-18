# TaskFlow - Gerenciador de Tarefas

![Java](https://img.shields.io/badge/Java-17-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.1-brightgreen)
![Thymeleaf](https://img.shields.io/badge/Frontend-Vanilla%20JS-yellow)

TaskFlow é uma aplicação full-stack para gerenciamento de tarefas, desenvolvida com **Java Spring Boot** no backend e **HTML/CSS/JavaScript** puro no frontend. O projeto permite criar listas de tarefas, organizar tarefas por prioridade, acompanhar progresso e gerenciar o status de cada item.

## 📋 Funcionalidades

- **Gerenciamento de Listas**: Crie, edite e exclua listas de tarefas
- **Tarefas**: Adicione tarefas com título, descrição, data de vencimento e prioridade (Baixa, Média, Alta)
- **Status**: Marque tarefas como concluídas ou abertas
- **Filtros**: Visualize todas as tarefas, apenas abertas ou apenas concluídas
- **Estatísticas**: Acompanhe o progresso com contadores visuais
- **Interface Responsiva**: Design moderno e adaptável a diferentes telas

## 🛠️ Tecnologias Utilizadas

### Backend
- **Java 17**
- **Spring Boot 3.1**
- **Spring Data JPA** - Persistência de dados
- **Spring Web** - APIs RESTful
- **H2 Database** - Banco de dados em memória (desenvolvimento)
- **Maven** - Gerenciamento de dependências

### Frontend
- **HTML5** semântico
- **CSS3** com design system próprio
- **JavaScript** puro (ES6+)
- **API Fetch** para comunicação com o backend

## 📁 Estrutura do Projeto

```
src/
├── main/
│   ├── java/com/padovani/tasks/
│   │   ├── controllers/     # Controladores REST e tratamento de exceções
│   │   ├── domain/          # Entidades JPA e DTOs
│   │   ├── mappers/         # Mapeadores entre entidades e DTOs
│   │   ├── repositories/    # Interfaces para acesso a dados
│   │   └── services/        # Lógica de negócio
│   │
│   └── resources/
│       ├── static/          # Arquivos estáticos (CSS, JS)
│       │   ├── css/
│       │   │   └── style.css
│       │   └── js/
│       │       ├── api.js   # Camada de comunicação com a API
│       │       ├── index.js  # Lógica da página de listas
│       │       ├── tasks.js  # Lógica da página de tarefas
│       │       └── ui.js     # Utilitários de interface
│       │
│       ├── index.html        # Página de listas
│       ├── tasks.html        # Página de tarefas
│       └── application.properties
```

## 🚀 Endpoints da API

### Task Lists
- `GET /api/task-lists` - Lista todas as listas
- `POST /api/task-lists` - Cria uma nova lista
- `GET /api/task-lists/{id}` - Busca uma lista específica
- `PUT /api/task-lists/{id}` - Atualiza uma lista
- `DELETE /api/task-lists/{id}` - Remove uma lista

### Tasks
- `GET /task-lists/{listId}/tasks` - Lista tarefas de uma lista
- `POST /task-lists/{listId}/tasks` - Cria uma nova tarefa
- `GET /task-lists/{listId}/tasks/{taskId}` - Busca uma tarefa específica
- `PUT /task-lists/{listId}/tasks/{taskId}` - Atualiza uma tarefa
- `DELETE /task-lists/{listId}/tasks/{taskId}` - Remove uma tarefa

## 🎨 Design System

O projeto utiliza um design system próprio com as seguintes características:

- **Cores**: Tema escuro moderno com acentos em roxo (#a78bfa)
- **Componentes**: Cards, modais, botões e badges reutilizáveis
- **Feedback Visual**: Loading bars, toasts e animações sutis
- **Tipografia**: Sistema de hierarquia visual clara

## 🚦 Como Executar

### Pré-requisitos
- Java 17 ou superior
- Maven 3.6 ou superior

### Passos

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/taskflow.git
cd taskflow
```

2. Execute a aplicação
```bash
./mvnw spring-boot:run
```

3. Acesse no navegador
```
http://localhost:8080
```

## 💡 Diferenciais do Projeto

- **Clean Architecture**: Separação clara entre camadas (controllers, services, repositories)
- **DTO Pattern**: Uso de records para transferência de dados
- **Mapper Pattern**: Separação entre entidades e objetos de resposta
- **Tratamento de Erros**: GlobalExceptionHandler para respostas consistentes
- **Frontend Vanilla**: Sem frameworks pesados, JavaScript puro e performático
- **UX/UI**: Feedback visual para todas as ações do usuário

## 📊 Modelo de Dados

### TaskList
- `id`: UUID (chave primária)
- `title`: String (obrigatório)
- `description`: String
- `tasks`: Lista de Task (relação OneToMany)
- `created`: LocalDateTime
- `updated`: LocalDateTime

### Task
- `id`: UUID (chave primária)
- `title`: String (obrigatório)
- `description`: String
- `dueDate`: LocalDateTime
- `priority`: Enum (HIGH, MEDIUM, LOW)
- `status`: Enum (OPEN, COMPLETE)
- `taskList`: TaskList (relação ManyToOne)
- `created`: LocalDateTime
- `updated`: LocalDateTime

## 🎯 Próximos Passos

- [ ] Autenticação de usuários
- [ ] Compartilhamento de listas
- [ ] Temas customizáveis
- [ ] Testes unitários e de integração
- [ ] Deploy em produção

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido por [Padovani](https://github.com/seu-usuario) como parte do portfólio de desenvolvimento Java/Spring.
