# Revisão visual — TOCA DO MACHO

Em 1º de setembro de 2026, a identidade foi revisada em desktop (1440 × 1000) e celular compacto (360 × 800). A marca TOCA DO MACHO aparece no topo da loja principal e do catálogo independente, com paleta verde-esmeralda, preto, branco e dourado. O lema aparece como “10% de desconto no Pix”; a página esclarece que o desconto se aplica à compra direta pelo site, enquanto ofertas do Mercado Livre seguem o anúncio.

A página principal foi atualizada com navegação masculina: Barba & Cabelo, Perfumes Masculinos, Cuidados de Pele, Óleos Capilares e Ofertas com link. O catálogo independente exibe somente 11 produtos com links `meli.la` válidos, com duas abas ativas (Barba & Cabelo e Perfumes). A responsividade, hierarquia e leitura mobile foram aprovadas visualmente.

## Revisão adicional — categorias masculinas

Após a solicitação do usuário, foram removidas da home a galeria, as imagens de prótese, os cards de catálogo de próteses e a seção de fotos antes/depois. O espaço principal agora usa um visual abstrato da marca, sem fotografia de cabelo ou peruca. A navegação da home foi ampliada para Games, Roupas Masculinas, Barba & Cabelo, Perfumes Masculinos, Cuidados de Pele, Óleos Capilares e Ofertas com link.

O catálogo passou a exibir um exemplo com link afiliado por categoria disponível: Games, Roupas Masculinas, Barba & Cabelo e Perfumes. A revisão em viewport desktop confirmou a ausência de fotos de prótese na home e a presença dos quatro exemplos no catálogo.

## Revisão de assets — Games e Roupas

A vitrine foi revisada em viewport móvel de 390 × 844 e desktop de 1280 × 900. Os placeholders textuais foram substituídos por imagens de produto com fundo claro: o kit de três camisetas masculinas e o Console PlayStation 5 Slim Digital. Os quatro cards renderizam sem distorção visível; a grade mobile continua em duas colunas e a desktop em quatro. A home permanece sem imagens de perucas ou próteses.

## Checkout Pix prioritário

A hierarquia de compra foi alterada: cada card apresenta o botão verde **Pagar via Pix · 10% OFF** como ação principal, calculando 90% do preço cheio do produto. O modal solicita e-mail confirmado, dados de entrega e consentimentos antes de criar o pedido via Mercado Pago. O link do Mercado Livre permanece visível como alternativa secundária e comissionada. A rota usa um catálogo fechado no backend para impedir que o preço ou produto sejam alterados pelo navegador.

A cobertura automatizada inclui a criação do pagamento Pix por produto, QR Code e cálculo de 10% de desconto; TypeScript, 11 testes, auditoria do catálogo e build foram aprovados.

## Validação ponta a ponta — Pix por produto

A configuração comercial foi ativada e validada pelo endpoint público de status. Um smoke test real, sem pagamento efetuado, criou um Pix pendente para o produto `perfume-01`: preço cheio de R$ 89,90 e total de R$ 80,91, exatamente 10% de desconto. A resposta incluiu identificador de pagamento, número de pedido, QR Code e código Pix copia e cola. O formulário obrigatório persiste nome, e-mail confirmado, WhatsApp, CEP e endereço completo antes da geração do Pix.

O mascote foi inserido no topo da página inicial com movimento vertical discreto e desativação automática da animação para pessoas que preferem movimento reduzido.

## Frete por CEP antes do Pix

Foi adicionada uma cotação regional por CEP antes da cobrança. O checkout consulta o frete, mostra valor, região e prazo no modal e só permite gerar o Pix quando a cotação estiver disponível. O backend recalcula o frete a partir do CEP recebido, sem confiar no valor enviado pelo navegador; o total é o preço cheio com 10% de desconto mais o frete. Para o CEP 01001-000, o smoke test confirmou preço Pix de R$ 80,91, frete de R$ 19,90 e total de R$ 100,81, com QR Code e código copia e cola.

## Ajuste de chamadas para pagamento

A home passou a apresentar o CTA secundário **“Parcelar via Mercado Pago”** nos cards. O texto “alternativa comissionada” foi removido dos selos abaixo de cada produto. O bloco explicativo `Como funciona` foi retirado da área principal e o acesso ao catálogo ampliado foi movido para o final da página com fonte de 9 px. A revisão móvel em 390 × 1200 confirmou que o CTA permanece legível e o link está posicionado abaixo da grade.
