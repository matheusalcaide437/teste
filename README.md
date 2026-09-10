# Controle Financeiro Pessoal + iPhone Shortcuts

Sistema de controle financeiro pessoal que registra lançamentos via **iPhone Shortcuts** direto em uma planilha **Google Sheets** — sem abrir nenhum app, em menos de 15 segundos.

## Como funciona

```
iPhone Shortcut (7 passos)
        │
        │  POST /exec  {tipo, categoria, valor, descricao, forma_pagamento, token}
        ▼
Google Apps Script (Web App)
        │
        │  appendRow()
        ▼
Google Sheets (planilha)
  ├── Lançamentos  ← dados brutos
  ├── Resumo       ← saldo e totais por categoria (fórmulas automáticas)
  └── Config       ← lista de categorias e formas de pagamento
```

## Campos por lançamento

| Campo | Valores possíveis |
|-------|------------------|
| Tipo | Receita / Despesa |
| Categoria | Alimentação / Transporte / Lazer / Saúde / Casa / Outros |
| Descrição | Texto livre (opcional) |
| Valor | Número decimal (R$) |
| Forma de pagamento | Pix / Débito / Crédito / Dinheiro |

## Estrutura do repositório

```
apps-script/
  Code.gs           → Web App que recebe POST e grava na planilha
  appsscript.json   → Manifest (habilita acesso como Web App público)
shortcut/
  estrutura.json    → Documentação dos passos do iPhone Shortcut
docs/
  setup.md                      → Como configurar Google Sheets e fazer deploy do script
  shortcut-guide.md             → Como criar o Shortcut no iPhone passo a passo
  replicar-para-outra-pessoa.md → Como criar uma cópia independente para outra pessoa
```

## Início rápido

1. **Configure a planilha** — siga [docs/setup.md](docs/setup.md)
2. **Crie o Shortcut** — siga [docs/shortcut-guide.md](docs/shortcut-guide.md)
3. **Adicione o Shortcut à tela inicial** do iPhone
4. Pronto — toque no ícone, preencha 4 campos, lançamento salvo

## Replicar para outra pessoa

Para montar uma cópia independente (planilha, token, categorias e Shortcut próprios) para um familiar, siga [docs/replicar-para-outra-pessoa.md](docs/replicar-para-outra-pessoa.md).

## Segurança

O endpoint é protegido por um **token** (string definida em `Code.gs` e replicada no Shortcut). Sem o token correto, a requisição é rejeitada com erro 401. Para maior segurança, use uma string longa e aleatória como token.

## Personalização

- Adicionar categorias: edite `CONFIG.categorias` no `Code.gs` e refaça o deploy.
- Criar atalhos rápidos (ex: "☕ Café"): duplique o Shortcut e pré-defina tipo e categoria.
- O Shortcut referenciado em `shortcut/estrutura.json` documenta cada passo para facilitar a criação manual no app Atalhos do iPhone.
