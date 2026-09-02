# EliteCapilar.com.br

Loja responsiva de próteses capilares com dois fluxos comerciais independentes: **venda direta com 10% de desconto no Pix** e **catálogo com links comissionados `meli.la` para compra direta no Mercado Livre**.

## Fluxos comerciais

| Fluxo | Quem recebe o pagamento | Responsável por entrega e pós-venda | Uso de link afiliado |
|---|---|---|---|
| Venda direta Pix | EliteCapilar.com.br, via Mercado Pago | EliteCapilar.com.br | Não |
| Catálogo Mercado Livre | Mercado Livre/vendedor do anúncio | Vendedor do Mercado Livre | Link `meli.la` consciente e visível |

O checkout próprio registra pedido, cliente, endereço, consentimentos e identificador do pagamento. O webhook consulta o pagamento diretamente na API do Mercado Pago, atualiza o status no banco e notifica o proprietário quando o Pix é aprovado. O painel protegido `/admin/pedidos` permite registrar a referência da compra feita no fornecedor, código de rastreamento e andamento da entrega.

## Ativação segura da venda direta

Por padrão, a cobrança própria permanece bloqueada. Ela somente é liberada quando todas as variáveis abaixo estão configuradas no ambiente do servidor.

| Variável | Finalidade |
|---|---|
| `MERCADOPAGO_ACCESS_TOKEN` | Criar o pagamento Pix e consultar notificações |
| `PUBLIC_SITE_URL` | Gerar a URL HTTPS pública do webhook |
| `DIRECT_SALES_ENABLED=true` | Autorizar explicitamente o checkout próprio |
| `SELLER_LEGAL_NAME` | Razão social ou nome completo do vendedor |
| `SELLER_TAX_ID` | CPF ou CNPJ exibido antes do pagamento |
| `SELLER_SUPPORT_EMAIL` | Canal para atendimento, troca e arrependimento |
| `DIRECT_SALES_SHIPPING_ESTIMATE` | Prazo estimado exibido ao consumidor |

Não coloque valores secretos em arquivos `.env` versionados. Configure-os no ambiente seguro da hospedagem.

## Desenvolvimento

```bash
pnpm install
pnpm check
pnpm test
pnpm build
pnpm dev
```

A tabela `orders` contém os dados mínimos necessários ao pedido e fulfillment. As alterações SQL correspondentes estão na pasta `drizzle/`. Antes de aplicar uma migração em outro ambiente, confirme se as tabelas já existem e faça backup.

## Conformidade

Os Termos de Venda e a Política de Privacidade estão disponíveis em `/termos-de-venda.html` e `/politica-de-privacidade.html`. Eles são minutas operacionais e devem ser revisados com os dados jurídicos e fiscais reais antes da ativação comercial.
