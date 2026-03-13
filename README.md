Sistema de Controle de Gastos Residenciais
O sistema permite gerenciar os gastos e receitas de uma residência, garantindo que as regras de negócio sejam aplicadas tanto no Backend quanto refletidas no Frontend.

Tecnologias Utilizadas
Backend: .NET 10 com ASP.NET Core Web API.

Banco de Dados: SQLite (para facilidade de portabilidade do teste).

ORM: Entity Framework Core.

Frontend: React com TypeScript e Axios.

Documentação: Swagger (OpenAPI).

Regras de Negócio Implementadas
Identificadores Únicos: Todas as entidades possuem IDs gerados automaticamente pelo banco de dados.

Validação de Idade: Menores de 18 anos são impedidos de registrar "Receitas", sendo permitidas apenas "Despesas".

Integridade de Dados: Ao excluir uma pessoa, o sistema realiza uma exclusão em cascata, removendo automaticamente todas as transações vinculadas a ela.

Consistência de Categorias: As transações são validadas para garantir que o tipo (Receita/Despesa) seja compatível com a finalidade da categoria selecionada.

Limites de Texto: Nomes e descrições possuem limites de caracteres conforme solicitado (200 para nomes, 400 para descrições).

Como Rodar o Projeto
1. Backend (C#)
Abra a solução no Visual Studio.

Certifique-se de que as dependências do NuGet foram restauradas.

O banco de dados financas.db será criado automaticamente ao rodar o projeto (via EnsureCreated).

Pressione F5 para iniciar. O Swagger abrirá em: http://localhost:5062/swagger.

2. Frontend (React)
Navegue até a pasta financas-web.

Instale as dependências:

Bash
npm install
Inicie a aplicação:

Bash
npm start
O site abrirá em: http://localhost:3000.

Nota: Certifique-se de que o Backend esteja rodando para que o Frontend consiga consumir os dados.

Considerações Finais
O código foi estruturado de forma limpa e comentada, facilitando a manutenção e o entendimento do fluxo de dados entre as camadas da aplicação.
