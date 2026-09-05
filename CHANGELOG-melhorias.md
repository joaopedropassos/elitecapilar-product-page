# CHANGELOG — melhorias UX TOCA DO MACHO

Data: 2026-09-05 (PT)

## Arquivos alterados
- `extracted/client/src/pages/Home.tsx`
- `extracted/client/src/index.css`
- `extracted/client/public/beleza-mais-vendidos.html`

## Prioridades

### 1) Atrito afiliado (cards)
- CTA secundário passou de “Parcelar via Mercado Pago” para **“Ver no Mercado Livre”**.
- Nota curta sob o link: link afiliado e possível landing no vendedor/perfil antes do produto.
- URLs `meli.la` existentes preservadas; `rel` inclui `sponsored`.

### 2) Hero CTA
- Botão primário **“Ver ofertas com 10% no Pix”** com âncora `#ofertas`.
- Disclosure de uma linha sob o slogan sobre as duas formas de compra.
- Estilos `.mascot-cta` / `.mascot-disclosure` em `index.css`.

### 3) Transparência de caminhos de compra
- Faixa amarela: “Links afiliados · compra no Mercado Livre ou Pix na loja”.
- Subtítulo da seção de ofertas esclarece Pix 10% (checkout direto na loja, quando disponível) vs. parcelar/ML no Mercado Livre.

### 4) Controles do topo
- **Categorias** abre dropdown (Todos + categorias; Roupas → Roupas Masculinas).
- **Marca** e **Filtros (3)** removidos como botões falsos (Marca ficou texto desabilitado “Em breve”).
- Pills convertidas em badges informativos estáticos (sem pointer).

### 5) Confiança + footer + nav
- Footer com links para privacidade, termos e catálogo ampliado + disclosure afiliado.
- `id="categorias"` na faixa de categorias; `id="ofertas"` na grade.
- Bottom nav aponta para `#ofertas` / `#categorias`.
- Sort: relevância (padrão) vs. preço ascendente.
- Em `beleza-mais-vendidos.html`: gift card PS Store rotulado como **Digital**; CTA/nota afiliada alinhados.

## Preservado
- Modal Pix, hooks tRPC (`createCatalogOrderPix`, `directSalesStatus`, `shipping.quote`) e comportamento de segurança/consentimentos intactos.
