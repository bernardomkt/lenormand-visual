# Lenormand Visual

Landing page em português, inglês e italiano. Site: https://lenormand-visual.vercel.app/

## Desenvolvimento

Node.js 20 ou superior. Instalar dependências com `npm install`. Executar `npm run dev`; verificar TypeScript com `npm run check`; gerar a versão final com `npm run build`. A pasta publicada é `dist`. O ficheiro `vercel.json` configura Vite, a pasta de saída e as rotas /pt, /en e /it.

## Oferta

- Essencial: €3,90, manual em três idiomas, 49 páginas por idioma.
- Premium: €4,99, cinco guias em três idiomas, 100 páginas por idioma.
- Upgrade antes do checkout: +€0,50, total Premium €4,40, uma única compra.

Checkouts reais em `src/checkouts.json`, gerados pela Hotmart. Não guardar credenciais, tokens ou os PDFs pagos neste repositório público. As páginas de exemplo do manual são prévias reais do conteúdo entregue; os mockups são ilustrações da apresentação digital. A versão comercial remove o contador estático, âncoras e depoimentos não verificados da referência visual.

## Tracking

`src/tracking.json` contém apenas o identificador público do pixel. Vazio significa tracking desativado. O componente `Consent` carrega o pixel apenas após consentimento explícito de marketing, permite recusar e rever a escolha. Envia PageView e ViewContent; o clique de saída usa CheckoutClick. A Hotmart gere os eventos do checkout e da compra. Não disparar Purchase no clique ou na simples visita. Não incluir tokens de API de Conversões no frontend.

## Estrutura

`src/`: aplicação, textos, consentimento e configuração de links. `public/`: imagens localizadas. `dist/`: resultado gerado, ignorado no Git. PDFs e fontes editoriais são entregues separadamente ao proprietário.
