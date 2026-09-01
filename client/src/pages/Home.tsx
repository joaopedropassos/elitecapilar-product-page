import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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

const gallery = [
  {
    label: "Frontal",
    src: "/manus-storage/product-main-v2_4dea0895.jpg",
    position: "center center",
  },
  {
    label: "Perfil",
    src: "/manus-storage/product-detail-v2_5db35ab0.jpg",
    position: "center center",
  },
  {
    label: "Textura",
    src: "/manus-storage/product-main-v2_4dea0895.jpg",
    position: "center 30%",
  },
  {
    label: "Acabamento",
    src: "/manus-storage/product-detail-v2_5db35ab0.jpg",
    position: "center 65%",
  },
];

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

function MiniPortrait({ src, label, position }: { src: string; label: string; position: string }) {
  return (
    <div className="group relative min-h-[128px] overflow-hidden rounded-[14px] bg-[#d6d0c8]">
      <img
        src={src}
        alt={label}
        className="h-full min-h-[128px] w-full object-cover grayscale-[18%] transition duration-500 group-hover:scale-105"
        style={{ objectPosition: position }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      <span className="absolute bottom-3 left-3 rounded-full bg-[#f6f0e7]/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#25231f]">
        {label}
      </span>
    </div>
  );
}

export default function Home() {
  const [activeImage, setActiveImage] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [search, setSearch] = useState("");
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoEmail, setPromoEmail] = useState("");
  const [promoEmailConfirmation, setPromoEmailConfirmation] = useState("");
  const checkoutMutation = trpc.payments.createCheckout.useMutation();
  const promoMutation = trpc.payments.createPromotionalPixCheckout.useMutation();

  const activePhoto = useMemo(() => gallery[activeImage], [activeImage]);

  const handleAddToCart = async () => {
    setCartCount((count) => count + 1);
    try {
      const checkout = await checkoutMutation.mutateAsync({ quantity: 1 });
      window.location.assign(checkout.checkoutUrl);
    } catch {
      toast.error("Não foi possível abrir o Mercado Pago", {
        description: "Tente novamente em alguns instantes ou fale com nosso atendimento.",
        duration: 3600,
      });
    }
  };

  const handleRelatedSearch = (value: string) => {
    setSearch(value);
    toast.info(`Buscando por “${value}”`, { duration: 2200 });
  };

  const handlePromotionalCheckout = async () => {
    const email = promoEmail.trim().toLowerCase();
    const confirmation = promoEmailConfirmation.trim().toLowerCase();
    if (!email || email !== confirmation) {
      toast.error("Confirme o mesmo e-mail nos dois campos", { duration: 3000 });
      return;
    }
    try {
      const checkout = await promoMutation.mutateAsync({ email });
      window.location.assign(checkout.checkoutUrl);
    } catch {
      toast.error("Não foi possível abrir a oferta Pix", { description: "Tente novamente em alguns instantes.", duration: 3200 });
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-[#24231f]">
      <div className="top-strip px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.26em] text-white sm:text-[11px]">
        Premium Brazilian Hair Replacement
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
          <a href="#top" className="brand whitespace-nowrap" aria-label="EliteCapilar.com.br">
            <span className="brand-mark">e</span>
            <span>EliteCapilar<span className="brand-domain">.com.br</span></span>
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
            {["Prótese Capilar", "Próteses Curtas", "Estilo Raspado", "Sistemas Premium"].map((item) => (
              <a key={item} href="#produto" className="nav-link group">
                {item}
                <ChevronDown size={13} className="transition group-hover:translate-y-0.5" />
              </a>
            ))}
          </div>
        </nav>

        {menuOpen && (
          <div className="mobile-menu border-t border-[#ece8e1] bg-white px-5 py-5 lg:hidden">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a09484]">Explorar coleção</p>
            <div className="grid gap-1">
              {["Prótese Capilar", "Próteses Curtas", "Estilo Raspado", "Sistemas Premium"].map((item, index) => (
                <a key={item} href="#produto" onClick={() => setMenuOpen(false)} className="flex items-center justify-between border-b border-[#f1eee9] py-3.5 text-[15px] font-medium">
                  <span><span className="mr-3 text-xs text-[#b6a68f]">0{index + 1}</span>{item}</span>
                  <ArrowRight size={16} className="text-[#a09484]" />
                </a>
              ))}
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
            <h2>Seu novo visual por <strong>R$ 499,00 no Pix</strong></h2>
            <p>Condição especial para a primeira compra. Pagamento processado com segurança pelo Mercado Pago.</p>
          </div>
          <button onClick={() => setPromoOpen(true)} className="promo-button">Garantir oferta <ArrowRight size={16} /></button>
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
                <div className="main-stage" style={{ backgroundImage: `linear-gradient(180deg, rgba(248,245,240,.06), rgba(22,20,17,.18)), url(${activePhoto.src})`, backgroundPosition: activePhoto.position }}>
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

              <div className="simulation-card">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="eyebrow mb-1.5 text-[#9b805a]">Prova social</p>
                    <h2 className="font-serif text-[21px] font-semibold tracking-[-.02em] text-[#2f2a23]">Simulação de Cliente</h2>
                  </div>
                  <span className="mb-1 text-[12px] font-medium text-[#786c5c]">Sua aparência</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <MiniPortrait src="/manus-storage/customer-before-v2_ab22520f.jpg" label="Antes" position="center center" />
                  <MiniPortrait src="/manus-storage/customer-after-v2_b607e824.jpg" label="Depois" position="center center" />
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-[#7f7466]">
                  <span>Cliente real · resultado individual</span>
                  <span className="font-bold uppercase tracking-[.15em]">01 / 02</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button className="thumb-arrow" onClick={() => setActiveImage((activeImage - 1 + gallery.length) % gallery.length)} aria-label="Imagem anterior"><ChevronLeft size={18} /></button>
              <div className="grid flex-1 grid-cols-4 gap-2.5 sm:gap-3">
                {gallery.map((image, index) => (
                  <button
                    key={image.label}
                    onClick={() => setActiveImage(index)}
                    className={`thumb group relative overflow-hidden rounded-[13px] border-2 bg-[#ded9d1] transition ${activeImage === index ? "border-[#2d2b27]" : "border-transparent opacity-65 hover:opacity-100"}`}
                    aria-label={`Ver imagem ${image.label}`}
                  >
                    <img src={image.src} alt={image.label} className="aspect-[1.15] w-full object-cover grayscale-[15%] transition duration-500 group-hover:scale-105" style={{ objectPosition: image.position }} />
                    {activeImage === index && <span className="absolute inset-x-0 bottom-0 h-1 bg-[#2d2b27]" />}
                  </button>
                ))}
              </div>
              <button className="thumb-arrow" onClick={() => setActiveImage((activeImage + 1) % gallery.length)} aria-label="Próxima imagem"><ChevronRight size={18} /></button>
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

              <p className="price-kicker">Preço com produto</p>
              <div className="mt-2 flex items-baseline gap-3">
                <p className="price">R$ 1.250,00</p>
                <span className="price-tag">-10%</span>
              </div>
              <p className="installment">12x <strong>R$ 125,00</strong> sem juros</p>

              <div className="installment-select">
                <span>12x R$ 125,00 sem juros</span>
                <ChevronDown size={16} />
              </div>

              <div className="shipping-note"><span className="truck-icon"><Truck size={18} strokeWidth={1.7} /></span><span><strong>Frete Grátis</strong><br />para todo o Brasil</span><span className="shipping-check"><Check size={13} strokeWidth={3} /></span></div>

              <button onClick={handleAddToCart} disabled={checkoutMutation.isPending} className="cta-button">{checkoutMutation.isPending ? "Abrindo Mercado Pago..." : "Pagar com Mercado Pago"} <ArrowRight size={18} /></button>
              <p className="cta-caption">Pagamento protegido · envio discreto</p>

              <div className="payment-methods">
                <span className="payment-methods-label">Você pode pagar com</span>
                <span className="payment-chip pix-chip"><span className="pix-symbol">◆</span> Pix</span>
                <span className="payment-chip card-chip"><span className="card-symbol" /> Cartão</span>
              </div>

              <div className="security-grid">
                <div className="security-tile"><ShieldCheck size={19} /><span><strong>Compra segura</strong><small>Ambiente protegido</small></span></div>
                <div className="security-tile"><span className="lock-seal">✓</span><span><strong>Garantia Elite</strong><small>7 dias para trocar</small></span></div>
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
            <p className="eyebrow mb-2">Oferta Pix · Mercado Pago</p>
            <h2 id="promo-title" className="font-serif text-[30px] leading-none tracking-[-.03em]">Confirme seu e-mail</h2>
            <p className="mt-3 text-[13px] leading-[1.65] text-[#756e64]">Vamos usar este e-mail para identificar seu pedido no Mercado Pago. Digite-o duas vezes para confirmar antes de continuar.</p>
            <div className="mt-6 grid gap-3">
              <label className="promo-field"><span>Seu e-mail</span><input type="email" value={promoEmail} onChange={(event) => setPromoEmail(event.target.value)} placeholder="voce@exemplo.com" autoFocus /></label>
              <label className="promo-field"><span>Confirme seu e-mail</span><input type="email" value={promoEmailConfirmation} onChange={(event) => setPromoEmailConfirmation(event.target.value)} placeholder="Digite novamente" onKeyDown={(event) => event.key === "Enter" && handlePromotionalCheckout()} /></label>
            </div>
            <div className="promo-modal-summary"><span>Oferta promocional Pix</span><strong>R$ 499,00</strong></div>
            <button onClick={handlePromotionalCheckout} disabled={promoMutation.isPending} className="cta-button mt-5">{promoMutation.isPending ? "Abrindo Mercado Pago..." : "Continuar para pagar via Pix"}<ArrowRight size={17} /></button>
            <p className="promo-modal-footnote"><ShieldCheck size={14} /> Você confirmará o pagamento dentro do Mercado Pago</p>
          </section>
        </div>
      )}

      <a href="#whatsapp" className="whatsapp-fab" aria-label="Falar com a EliteCapilar no WhatsApp" onClick={() => toast.success("Abrindo atendimento EliteCapilar") }>
        <span className="whatsapp-ring" />
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.52 3.48A11.8 11.8 0 0 0 12.08 0C5.55 0 .24 5.31.24 11.84c0 2.09.55 4.13 1.6 5.92L.14 24l6.39-1.67a11.8 11.8 0 0 0 5.55 1.4h.01c6.52 0 11.83-5.31 11.83-11.84a11.8 11.8 0 0 0-3.4-8.41ZM12.09 21.7h-.01a9.82 9.82 0 0 1-5.01-1.37l-.36-.21-3.79.99 1.01-3.69-.23-.38a9.82 9.82 0 1 1 8.39 4.66Zm5.39-7.36c-.29-.15-1.72-.85-1.99-.95-.27-.1-.46-.15-.65.15-.19.29-.75.95-.92 1.14-.17.19-.34.22-.63.07-.29-.15-1.2-.44-2.29-1.42-.85-.76-1.42-1.69-1.59-1.98-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.65-1.56-.89-2.14-.23-.56-.47-.48-.65-.49h-.55c-.19 0-.49.07-.75.36-.26.29-.98.96-.98 2.35s1 2.73 1.14 2.92c.14.19 1.97 3.01 4.77 4.22.67.29 1.2.46 1.61.59.68.22 1.3.19 1.79.12.55-.08 1.72-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.34Z" fill="currentColor" /></svg>
      </a>
    </div>
  );
}
