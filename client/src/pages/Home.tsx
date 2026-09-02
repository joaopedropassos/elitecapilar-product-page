import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Heart,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

const relatedSearches = [
  "prótese capilar curta",
  "sistema careca por fazer",
  "densidade baixa prótese",
];

function StarRating() {
  return (
    <div className="flex items-center gap-1" aria-label="Avaliação de 4.5 de 5">
      {[0, 1, 2, 3].map((star) => (
        <span key={star} className="text-[19px] leading-none text-[#bc8b36]">★</span>
      ))}
      <span className="relative text-[19px] leading-none text-[#bc8b36]">
        <span className="absolute left-0 top-0 overflow-hidden" style={{ width: "52%" }}>★</span>
        <span className="text-[#dfd8cd]">★</span>
      </span>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [search, setSearch] = useState("");
  const [promoOpen, setPromoOpen] = useState(false);
  const [directOrder, setDirectOrder] = useState({ name: "", email: "", emailConfirmation: "", phone: "", postalCode: "", street: "", addressNumber: "", complement: "", neighborhood: "", city: "", state: "", consentTerms: false, consentPrivacy: false });
  const [pixPayment, setPixPayment] = useState<{ paymentId: string; status: string; qrCodeBase64: string; qrCode: string; ticketUrl: string | null; expiresAt: string | null; orderNumber: string; totalCents: number } | null>(null);
  const { data: directSalesStatus } = trpc.payments.directSalesStatus.useQuery();
  const pixPaymentMutation = trpc.payments.createDirectOrderPix.useMutation();

  const handleAddToCart = () => {
    if (!directSalesStatus?.enabled) {
      toast.info("Checkout Pix em homologação", { description: "A compra pelo Mercado Livre continua disponível nos produtos com link comissionado.", duration: 3600 });
      return;
    }
    setPromoOpen(true);
  };

  const handleRelatedSearch = (value: string) => {
    setSearch(value);
    toast.info(`Buscando por “${value}”`, { duration: 2200 });
  };

  const handlePromotionalCheckout = async () => {
    const email = directOrder.email.trim().toLowerCase();
    const confirmation = directOrder.emailConfirmation.trim().toLowerCase();
    if (!email || email !== confirmation) {
      toast.error("Confirme o mesmo e-mail nos dois campos", { duration: 3000 });
      return;
    }
    if (!directOrder.consentTerms || !directOrder.consentPrivacy) {
      toast.error("Aceite os termos de venda e a política de privacidade", { duration: 3000 });
      return;
    }
    try {
      const payment = await pixPaymentMutation.mutateAsync({
        ...directOrder,
        email,
        emailConfirmation: confirmation,
        state: directOrder.state.trim().toUpperCase(),
        consentTerms: true,
        consentPrivacy: true,
      });
      setPixPayment(payment);
    } catch {
      toast.error("Não foi possível criar o pedido", { description: "Revise os dados de entrega e tente novamente.", duration: 3200 });
    }
  };

  const handleCopyPix = async () => {
    if (!pixPayment) return;
    await navigator.clipboard.writeText(pixPayment.qrCode);
    toast.success("Código Pix copiado", { duration: 2200 });
  };

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-[#24231f]">
      <div className="top-strip px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.26em] text-white sm:text-[11px]">
        TOCA DO MACHO · TUDO PARA O HOMEM · 10% DE DESCONTO NO PIX
      </div>

      <header className="border-b border-[#ece8e1] bg-[#fbfaf8]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-5 py-5 lg:px-10">
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            className="icon-button shrink-0"
          >
            {menuOpen ? <X size={21} strokeWidth={1.7} /> : <Menu size={21} strokeWidth={1.7} />}
          </button>
          <a href="#top" className="brand whitespace-nowrap" aria-label="TOCA DO MACHO">
            <span className="brand-mark">t</span>
            <span>TOCA DO MACHO</span>
          </a>

          <div className="relative mx-auto hidden w-full max-w-[520px] lg:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a958d]" size={17} strokeWidth={1.7} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && search.trim()) {
                  toast.info(`Buscando por “${search}”`, { duration: 2200 });
                }
              }}
              className="search-input w-full"
              placeholder="Buscar um produto..."
              aria-label="Buscar um produto"
            />
            <button
              onClick={() => search.trim() && toast.info(`Buscando por “${search}”`, { duration: 2200 })}
              className="absolute right-1.5 top-1.5 grid h-10 w-10 place-items-center rounded-[9px] bg-[#252522] text-white transition hover:bg-[#47453f] active:scale-[.97]"
              aria-label="Pesquisar"
            >
              <Search size={17} strokeWidth={2} />
            </button>
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <button className="icon-button hidden sm:inline-flex" aria-label="Minha conta" onClick={() => toast.info("Área do cliente em breve") }>
              <UserRound size={20} strokeWidth={1.6} />
            </button>
            <button className="relative icon-button" aria-label={`Carrinho com ${cartCount} itens`} onClick={() => toast.info(cartCount ? `${cartCount} item(ns) no seu carrinho` : "Seu carrinho está vazio") }>
              <ShoppingBag size={20} strokeWidth={1.6} />
              <span className="cart-badge">{cartCount}</span>
            </button>
          </div>
        </div>

        <div className="border-t border-[#efede9] lg:hidden">
          <div className="relative mx-5 my-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a958d]" size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="search-input w-full"
              placeholder="Buscar um produto..."
            />
          </div>
        </div>

        <nav className="hidden border-t border-[#efede9] lg:block" aria-label="Categorias principais">
          <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-10 px-10 py-3.5">
            {["Games", "Roupas Masculinas", "Barba & Cabelo", "Perfumes Masculinos", "Cuidados de Pele", "Óleos Capilares"].map((item) => (
              <a key={item} href="#produto" className="nav-link group">
                {item}
                <ChevronDown size={13} className="transition group-hover:translate-y-0.5" />
              </a>
            ))}
            <a href="/beleza-mais-vendidos.html" className="nav-link group text-[#087a5b]">
              Ofertas com link
              <ExternalLink size={13} className="transition group-hover:translate-x-0.5" />
            </a>
          </div>
        </nav>

        {menuOpen && (
          <div className="mobile-menu border-t border-[#ece8e1] bg-white px-5 py-5 lg:hidden">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a09484]">Explorar coleção</p>
            <div className="grid gap-1">
              {["Games", "Roupas Masculinas", "Barba & Cabelo", "Perfumes Masculinos", "Cuidados de Pele", "Óleos Capilares"].map((item, index) => (
                <a key={item} href="#produto" onClick={() => setMenuOpen(false)} className="flex items-center justify-between border-b border-[#f1eee9] py-3.5 text-[15px] font-medium">
                  <span><span className="mr-3 text-xs text-[#b6a68f]">0{index + 1}</span>{item}</span>
                  <ArrowRight size={16} className="text-[#a09484]" />
                </a>
              ))}
              <a href="/beleza-mais-vendidos.html" onClick={() => setMenuOpen(false)} className="flex items-center justify-between border-b border-[#f1eee9] py-3.5 text-[15px] font-medium text-[#087a5b]">
                <span><span className="mr-3 text-xs text-[#b6a68f]">05</span>Ofertas com link</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        )}
      </header>

      <main id="top" className="mx-auto max-w-[1440px] px-5 pb-20 lg:px-10">
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap py-5 text-[11px] text-[#8f8a82] sm:py-7 sm:text-xs">
          <a href="#top" className="transition hover:text-[#24231f]">Home</a>
          <ChevronRight size={13} />
          <span className="truncate">Sistema Capilar de Micro-Stubble Aero-Densidade - Efeito Careca por Fazer</span>
        </div>

        <section className="promo-banner mb-8" aria-label="Oferta promocional Pix">
          <div className="promo-copy">
            <div className="promo-kicker"><span className="promo-live-dot" /> Oferta exclusiva · tempo limitado</div>
            <h2>Todo o site com <strong>10% de desconto no Pix</strong></h2>
            <p>Na compra direta pelo site, pague via Pix e aproveite 10% de desconto. Ofertas do Mercado Livre seguem o anúncio.</p>
          </div>
          <button onClick={handleAddToCart} className="promo-button">{directSalesStatus?.enabled ? "Garantir oferta" : "Em homologação"} <ArrowRight size={16} /></button>
        </section>

        <div className="mb-7 max-w-4xl animate-fade-up lg:hidden">
          <p className="eyebrow mb-3">Coleção Micro-Stubble · 2025</p>
          <h1 className="product-title">Sistema Capilar de Micro-Stubble Aero-Densidade <em>— Efeito Careca por Fazer</em></h1>
        </div>

        <div id="produto" className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(370px,.75fr)] lg:gap-16 xl:gap-20">
          <section className="animate-fade-up">
            <div className="mb-7 hidden max-w-4xl lg:block">
              <p className="eyebrow mb-3">Coleção Micro-Stubble · 2025</p>
              <h1 className="product-title">Sistema Capilar de Micro-Stubble Aero-Densidade <em>— Efeito Careca por Fazer</em></h1>
            </div>

            <div className="relative">
              <div className="group relative overflow-hidden rounded-[22px] border border-[#e7e1d9] bg-[#ddd8d0] shadow-[0_22px_55px_-30px_rgba(35,31,23,.4)]">
                <div className="main-stage toca-hero-visual">
                  <div className="stage-grain" />
                  <div className="stage-badge"><Sparkles size={13} /> Resultado natural</div>
                  <div className="stage-caption">
                    <span className="caption-line" />
                    <span>Micro-Stubble · 25–30% de densidade</span>
                  </div>
                </div>
                <button
                  onClick={() => setWishlist((saved) => !saved)}
                  className={`absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-white/60 bg-white/85 backdrop-blur-md transition hover:scale-105 ${wishlist ? "text-[#b15f50]" : "text-[#312f2a]"}`}
                  aria-label={wishlist ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                  <Heart size={19} fill={wishlist ? "currentColor" : "none"} strokeWidth={1.7} />
                </button>
                <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/60 bg-white/85 px-3 py-2 text-[10px] font-bold uppercase tracking-[.15em] text-[#38342d] backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-[#6b976e] shadow-[0_0_0_3px_rgba(107,151,110,.16)]" />
                  Em estoque
                </div>
              </div>

            </div>

            <article className="description-block mt-14 border-t border-[#e9e4dc] pt-9 lg:mt-16">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <p className="eyebrow mb-2">Detalhes essenciais</p>
                  <h2 className="section-title">Descrição do produto</h2>
                </div>
                <span className="hidden text-[11px] font-semibold uppercase tracking-[.18em] text-[#a09484] sm:block">EC · 001</span>
              </div>
              <div className="grid gap-8 md:grid-cols-[.9fr_1.1fr]">
                <ul className="benefits-list">
                  {["Tecnologia Bio-Skin Ultra-Invisível", "Densidade de 25–30% para visual discreto", "Perfeito para manutenção do estilo raspado", "Aplicação direta e imperceptível"].map((item) => (
                    <li key={item}><span className="check-dot"><Check size={12} strokeWidth={3} /></span>{item}</li>
                  ))}
                </ul>
                <div className="space-y-4 text-[14px] leading-[1.8] text-[#6c6861]">
                  <p>Desenhado para quem busca um visual de cabelo raspado com acabamento natural, o Micro-Stubble combina uma base ultrafina a fios estrategicamente distribuídos.</p>
                  <p>O resultado é uma aparência discreta, confortável e pronta para acompanhar sua rotina — sem excessos e sem revelar o segredo.</p>
                </div>
              </div>
              <div className="mt-9 grid grid-cols-3 gap-3 border-t border-[#eee9e2] pt-6 text-center">
                <div><p className="spec-value">25–30%</p><p className="spec-label">Densidade</p></div>
                <div><p className="spec-value">Bio-Skin</p><p className="spec-label">Base invisível</p></div>
                <div><p className="spec-value">BR</p><p className="spec-label">Produção premium</p></div>
              </div>
            </article>
          </section>

          <aside className="lg:sticky lg:top-7 animate-fade-up-delay">
            <div className="purchase-card">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <StarRating />
                  <span className="text-[12px] font-semibold text-[#38342d]">4.5</span>
                </div>
                <a href="#avaliacoes" className="review-link">40 reviews</a>
              </div>

              <div className="purchase-divider" />

              <ul className="product-points">
                {["Tecnologia Bio-Skin Ultra-Invisível", "Densidade 25–30% para visual discreto", "Perfeito para manutenção do estilo raspado", "Aplicação direta e imperceptível"].map((point) => (
                  <li key={point}><span />{point}</li>
                ))}
              </ul>

              <div className="purchase-divider" />

              <p className="price-kicker">Preço de referência <span className="line-through">R$ 1.250,00</span></p>
              <div className="mt-2 flex items-baseline gap-3">
                <p className="price">R$ 1.125,00</p>
                <span className="price-tag">-10%</span>
              </div>
              <p className="installment"><strong>Pagamento à vista via Pix</strong></p>

              <div className="installment-select">
                <span>Venda direta pela TOCA DO MACHO</span>
                <ShieldCheck size={16} />
              </div>

              <div className="shipping-note"><span className="truck-icon"><Truck size={18} strokeWidth={1.7} /></span><span><strong>Frete Grátis</strong><br />para todo o Brasil</span><span className="shipping-check"><Check size={13} strokeWidth={3} /></span></div>

              <button onClick={handleAddToCart} className="cta-button">{directSalesStatus?.enabled ? "Comprar no Pix por R$ 1.125" : "Compra Pix em homologação"} <ArrowRight size={18} /></button>
              <p className="cta-caption">Pedido próprio · Mercado Pago · envio discreto</p>

              <div className="payment-methods">
                <span className="payment-methods-label">Pagamento desta oferta</span>
                <span className="payment-chip pix-chip"><span className="pix-symbol">◆</span> Pix</span>
              </div>

              <div className="security-grid">
                <div className="security-tile"><ShieldCheck size={19} /><span><strong>Compra segura</strong><small>Ambiente protegido</small></span></div>
                <div className="security-tile"><span className="lock-seal">✓</span><span><strong>Compra online</strong><small>7 dias para arrependimento</small></span></div>
              </div>
            </div>

            <div className="related-block mt-8" id="avaliacoes">
              <div className="mb-4 flex items-end justify-between">
                <div><p className="eyebrow mb-2">Encontre seu estilo</p><h2 className="font-serif text-[24px] font-semibold tracking-[-.02em]">Buscas relacionadas</h2></div>
                <Search size={17} className="mb-1 text-[#a79b8a]" />
              </div>
              <div className="flex flex-wrap gap-2.5">
                {relatedSearches.map((item) => (
                  <button key={item} onClick={() => handleRelatedSearch(item)} className="pill-button"><Search size={14} />{item}</button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3 border-t border-[#e9e4dc] pt-5 text-[11px] text-[#7d766d]">
              <span className="h-2 w-2 rounded-full bg-[#6b976e]" />
              Atendimento especializado via WhatsApp
              <a href="#whatsapp" className="ml-auto font-bold text-[#272521] underline decoration-[#cbbda9] underline-offset-4">Falar agora</a>
            </div>
          </aside>
        </div>

      </main>

      {promoOpen && (
        <div className="promo-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setPromoOpen(false)}>
          <section className="promo-modal" role="dialog" aria-modal="true" aria-labelledby="promo-title">
            <button className="promo-modal-close" onClick={() => setPromoOpen(false)} aria-label="Fechar oferta"><X size={18} /></button>
            <p className="eyebrow mb-2">Venda direta · Pix Mercado Pago</p>
            {pixPayment ? (
              <>
                <h2 id="promo-title" className="font-serif text-[30px] leading-none tracking-[-.03em]">Pedido {pixPayment.orderNumber}</h2>
                <p className="mt-3 text-[13px] leading-[1.65] text-[#756e64]">Escaneie o QR Code no app do seu banco ou copie o código. O pedido será processado depois que o Mercado Pago confirmar o pagamento.</p>
                <div className="pix-qr-wrap"><img src={`data:image/png;base64,${pixPayment.qrCodeBase64}`} alt="QR Code para pagamento Pix de R$ 1.125,00" /></div>
                <div className="pix-code-box"><span>{pixPayment.qrCode}</span><button onClick={handleCopyPix} className="pix-copy-button" aria-label="Copiar código Pix"><Copy size={15} /> Copiar</button></div>
                <div className="promo-modal-summary"><span>Total do pedido · 10% de desconto</span><strong>R$ 1.125,00</strong></div>
                {pixPayment.ticketUrl && <a className="pix-open-link" href={pixPayment.ticketUrl} target="_blank" rel="noreferrer">Abrir instruções de pagamento <ArrowRight size={15} /></a>}
                <p className="promo-modal-footnote"><ShieldCheck size={14} /> Guarde o número do pedido. O status é confirmado pelo Mercado Pago.</p>
              </>
            ) : (
              <>
                <h2 id="promo-title" className="font-serif text-[30px] leading-none tracking-[-.03em]">Entrega e pagamento</h2>
                <p className="mt-3 text-[13px] leading-[1.65] text-[#756e64]">A TOCA DO MACHO será a vendedora responsável. Preencha os dados necessários para entrega e confirme o Pix no seu banco.</p>
                {directSalesStatus?.seller && <div className="direct-seller-card"><span><small>Vendedor</small><strong>{directSalesStatus.seller.legalName}</strong></span><span><small>CPF/CNPJ</small><strong>{directSalesStatus.seller.taxId}</strong></span><span><small>Prazo estimado</small><strong>{directSalesStatus.seller.shippingEstimate}</strong></span><span><small>Suporte</small><strong>{directSalesStatus.seller.supportEmail}</strong></span></div>}
                <div className="direct-checkout-grid mt-6">
                  <label className="promo-field direct-full"><span>Nome completo</span><input autoComplete="name" value={directOrder.name} onChange={(event) => setDirectOrder({ ...directOrder, name: event.target.value })} placeholder="Nome do destinatário" autoFocus /></label>
                  <label className="promo-field"><span>Seu e-mail</span><input type="email" autoComplete="email" value={directOrder.email} onChange={(event) => setDirectOrder({ ...directOrder, email: event.target.value })} placeholder="voce@exemplo.com" /></label>
                  <label className="promo-field"><span>Confirme seu e-mail</span><input type="email" value={directOrder.emailConfirmation} onChange={(event) => setDirectOrder({ ...directOrder, emailConfirmation: event.target.value })} placeholder="Digite novamente" /></label>
                  <label className="promo-field"><span>Telefone</span><input type="tel" autoComplete="tel" value={directOrder.phone} onChange={(event) => setDirectOrder({ ...directOrder, phone: event.target.value })} placeholder="(11) 99999-9999" /></label>
                  <label className="promo-field"><span>CEP</span><input inputMode="numeric" autoComplete="postal-code" value={directOrder.postalCode} onChange={(event) => setDirectOrder({ ...directOrder, postalCode: event.target.value })} placeholder="00000-000" /></label>
                  <label className="promo-field direct-full"><span>Endereço</span><input autoComplete="address-line1" value={directOrder.street} onChange={(event) => setDirectOrder({ ...directOrder, street: event.target.value })} placeholder="Rua ou avenida" /></label>
                  <label className="promo-field"><span>Número</span><input value={directOrder.addressNumber} onChange={(event) => setDirectOrder({ ...directOrder, addressNumber: event.target.value })} placeholder="123" /></label>
                  <label className="promo-field"><span>Complemento</span><input autoComplete="address-line2" value={directOrder.complement} onChange={(event) => setDirectOrder({ ...directOrder, complement: event.target.value })} placeholder="Apto. 10 (opcional)" /></label>
                  <label className="promo-field"><span>Bairro</span><input value={directOrder.neighborhood} onChange={(event) => setDirectOrder({ ...directOrder, neighborhood: event.target.value })} placeholder="Bairro" /></label>
                  <label className="promo-field"><span>Cidade</span><input autoComplete="address-level2" value={directOrder.city} onChange={(event) => setDirectOrder({ ...directOrder, city: event.target.value })} placeholder="Cidade" /></label>
                  <label className="promo-field"><span>UF</span><input autoComplete="address-level1" maxLength={2} value={directOrder.state} onChange={(event) => setDirectOrder({ ...directOrder, state: event.target.value.toUpperCase() })} placeholder="SP" /></label>
                </div>
                <div className="direct-consents">
                  <label><input type="checkbox" checked={directOrder.consentTerms} onChange={(event) => setDirectOrder({ ...directOrder, consentTerms: event.target.checked })} /><span>Li e aceito os <a href="/termos-de-venda.html" target="_blank">Termos de Venda</a>, incluindo entrega, troca, arrependimento e garantia.</span></label>
                  <label><input type="checkbox" checked={directOrder.consentPrivacy} onChange={(event) => setDirectOrder({ ...directOrder, consentPrivacy: event.target.checked })} /><span>Autorizo o uso dos dados para pagamento, atendimento e entrega, conforme a <a href="/politica-de-privacidade.html" target="_blank">Política de Privacidade</a>.</span></label>
                </div>
                <div className="promo-modal-summary"><span>De R$ 1.250,00 · desconto Pix de 10%</span><strong>R$ 1.125,00</strong></div>
                <button onClick={handlePromotionalCheckout} disabled={pixPaymentMutation.isPending} className="cta-button mt-5">{pixPaymentMutation.isPending ? "Criando pedido..." : "Criar pedido e gerar Pix"}<ArrowRight size={17} /></button>
                <p className="promo-modal-footnote"><ShieldCheck size={14} /> Pagamento seguro. Seus dados não são vendidos nem usados em links de afiliado.</p>
              </>
            )}
          </section>
        </div>
      )}

      <a href="#whatsapp" className="whatsapp-fab" aria-label="Falar com a TOCA DO MACHO no WhatsApp" onClick={() => toast.success("Abrindo atendimento TOCA DO MACHO") }>
        <span className="whatsapp-ring" />
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.52 3.48A11.8 11.8 0 0 0 12.08 0C5.55 0 .24 5.31.24 11.84c0 2.09.55 4.13 1.6 5.92L.14 24l6.39-1.67a11.8 11.8 0 0 0 5.55 1.4h.01c6.52 0 11.83-5.31 11.83-11.84a11.8 11.8 0 0 0-3.4-8.41ZM12.09 21.7h-.01a9.82 9.82 0 0 1-5.01-1.37l-.36-.21-3.79.99 1.01-3.69-.23-.38a9.82 9.82 0 1 1 8.39 4.66Zm5.39-7.36c-.29-.15-1.72-.85-1.99-.95-.27-.1-.46-.15-.65.15-.19.29-.75.95-.92 1.14-.17.19-.34.22-.63.07-.29-.15-1.2-.44-2.29-1.42-.85-.76-1.42-1.69-1.59-1.98-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.65-1.56-.89-2.14-.23-.56-.47-.48-.65-.49h-.55c-.19 0-.49.07-.75.36-.26.29-.98.96-.98 2.35s1 2.73 1.14 2.92c.14.19 1.97 3.01 4.77 4.22.67.29 1.2.46 1.61.59.68.22 1.3.19 1.79.12.55-.08 1.72-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.34Z" fill="currentColor" /></svg>
      </a>
    </div>
  );
}
