# Calculadora de Economia — Voltera

Landing page com simulador de economia no mercado livre de energia. Será incorporada ao site [voltera.com.br](https://voltera.com.br) em **Conteúdo → Cálculo de Economia**.

## Tecnologias

- React 18 + TypeScript
- Vite
- CSS puro (sem framework)

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`. O back-end precisa estar rodando em `http://localhost:8000` (ver [backend-baixa-tensao](../backend-baixa-tensao/README.md)).

## Build

```bash
npm run build
```

Gera os arquivos estáticos em `dist/`.

> **Atenção:** o Vite embute as variáveis de ambiente no momento do build. Configure o `.env` com a URL correta da API **antes** de rodar o build — trocar depois não tem efeito.

## Deploy (EC2)

1. Configure o `.env` apontando para a URL do back-end no EC2:
   ```
   VITE_API_URL=https://api.seudominio.com/api
   ```

2. Gere o build:
   ```bash
   npm install
   npm run build
   ```

3. Copie a pasta `dist/` para o servidor e sirva com nginx. Exemplo mínimo de config:
   ```nginx
   server {
       listen 80;
       server_name seudominio.com;
       root /var/www/lp-baixa-tensao/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

4. O back-end precisa ter `CORS_ALLOWED_ORIGINS` configurado com a URL do front (`https://seudominio.com`).

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste conforme o ambiente:

```bash
cp .env.example .env
```

| Variável | Descrição | Padrão |
|---|---|---|
| `VITE_API_URL` | URL base da API de cálculo | `http://localhost:8000/api` |

## Modo embed

Adicione `?embed=1` na URL para ocultar o header e footer — usado quando a página é incorporada dentro do site da Voltera (que já possui seu próprio layout).

```
https://seudominio.com/?embed=1
```

## Distribuidoras

A lista de distribuidoras é carregada dinamicamente do endpoint `GET /api/distribuidoras` do back-end, agrupada por UF. Não há arquivo estático de distribuidoras no front — qualquer alteração no banco reflete automaticamente após o `cache_updater` rodar no back-end.

## Bandeira tarifária

A bandeira vigente é pré-selecionada automaticamente a partir do endpoint `GET /api/bandeira-vigente`, que lê a tabela `tariff_flags` do banco da Voltera.

O arquivo `src/bandeiraVigente.ts` serve apenas como fallback local (enquanto a requisição carrega ou se o back-end estiver indisponível) — não precisa ser atualizado manualmente.
