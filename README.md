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

Acesse `http://localhost:5173`.

## Build

```bash
npm run build
```

Gera os arquivos estáticos em `dist/`.

> **Atenção:** o Vite embute as variáveis de ambiente no momento do build. Configure o `.env` com a URL correta da API **antes** de rodar o build — trocar depois não tem efeito.

## Deploy (EC2)

1. Configure o `.env` apontando para a URL do back-end no EC2:
   ```
   VITE_API_URL=https://api.seudominio.com
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

4. O back-end precisa ter `CORS_ORIGIN` configurado com a URL do front (`https://seudominio.com`).

## Modo embed

Adicione `?embed=1` na URL para ocultar o header e footer — usado quando a página é incorporada dentro do site da Voltera (que já possui seu próprio layout).

```
https://seudominio.com/?embed=1
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste conforme o ambiente:

```bash
cp .env.example .env
```

| Variável | Descrição | Padrão |
|---|---|---|
| `VITE_API_URL` | URL base da API de cálculo | `http://localhost:3001` |

## Atualizar distribuidoras

Os nomes e IDs das distribuidoras ficam em `public/distribuidoras.json`. O back-end sobrescreve esse arquivo periodicamente a partir do banco de dados — **não edite manualmente em produção**.

Para adicionar ou corrigir uma distribuidora em desenvolvimento, edite diretamente o JSON:

```json
{ "id": 38, "nome": "Nova Distribuidora", "uf": "XX" }
```

## Atualizar a bandeira tarifária

Edite o arquivo `src/bandeiraVigente.ts` e adicione o mês vigente no objeto `HISTORICO`:

```ts
const HISTORICO: Record<string, Bandeira> = {
  '2026-04': 'Verde',
  '2026-05': 'Verde', // ← adicionar aqui todo mês
};
```

Fonte oficial: [ANEEL — Bandeiras Tarifárias](https://www.aneel.gov.br/bandeiras-tarifarias)
