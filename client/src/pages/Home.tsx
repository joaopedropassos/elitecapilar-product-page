import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Copy, ExternalLink, Menu, Search, ShoppingCart, SlidersHorizontal, UserRound, X } from "lucide-react";
import { toast } from "sonner";

type CatalogProductId = "barba-01" | "perfume-01" | "roupa-01" | "game-01";
type CatalogProduct = { id: CatalogProductId; category: string; title: string; seller: string; rating: string; sold: string; fullPrice: number; image: string; url: string; badge: string };

const products: CatalogProduct[] = [
  { id: "barba-01", category: "Barba & Cabelo", title: "Máquina Profissional Wahl Magic Clip Black Sem Fio", seller: "TECLA ONLINE", rating: "4.8", sold: "+5 mil vendidos", fullPrice: 610, image: "/manus-storage/barba-vphz_07e9b633.webp", url: "https://meli.la/2K66kNt", badge: "Mais vendido" },
  { id: "perfume-01", category: "Perfumes", title: "Perfume de Feromônios Dominus Men 50 ml", seller: "Dominus Men", rating: "4.8", sold: "+5 mil vendidos", fullPrice: 89.9, image: "/manus-storage/perfume-5fez_e9d38f50.webp", url: "https://meli.la/16iAifj", badge: "Mais vendido" },
  { id: "roupa-01", category: "Roupas Masculinas", title: "Kit 3 Camisetas Masculinas 100% Algodão Premium", seller: "Mercado Livre", rating: "4.8", sold: "+5 mil vendidos", fullPrice: 67.99, image: "/manus-storage/kit-camisetas-premium_32ec08fb.webp", url: "https://meli.la/127D3t4", badge: "Mais vendido" },
  { id: "game-01", category: "Games", title: "Console PlayStation 5 Slim Edição Digital", seller: "Pilaresdasabedoria", rating: "4.9", sold: "+1 mil vendidos", fullPrice: 4490, image: "/manus-storage/ps5-slim-digital_e52909a3.webp", url: "https://meli.la/2zRQSV7", badge: "Escolha premium" },
];

const categories = [["Games", "🎮"], ["Roupas", "👕"], ["Barba & Cabelo", "✂️"], ["Perfumes", "🧴"], ["Cuidados de Pele", "🧼"], ["Óleos Capilares", "💧"]] as const;
const emptyForm = { name: "", email: "", emailConfirmation: "", phone: "", postalCode: "", street: "", addressNumber: "", complement: "", neighborhood: "", city: "", state: "", consentTerms: false, consentPrivacy: false, website: "" };
const formatBRL = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [menuOpen, setMenuOpen] = useState(false);
  const [pixOpen, setPixOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [pixPayment, setPixPayment] = useState<{ paymentId: string; status: string; qrCodeBase64: string; qrCode: string; ticketUrl: string | null; expiresAt: string | null; orderNumber: string; totalCents: number; productTitle: string; fullPriceCents: number } | null>(null);
  const [form, setForm] = useState(emptyForm);
  const pixMutation = trpc.payments.createCatalogOrderPix.useMutation();
  const { data: directSalesStatus, isLoading: directSalesLoading } = trpc.payments.directSalesStatus.useQuery();
  const shippingInput = useMemo(() => ({ postalCode: form.postalCode.replace(/\D/g, "") }), [form.postalCode]);
  const { data: shippingQuote, isFetching: shippingLoading, error: shippingError } = trpc.shipping.quote.useQuery(shippingInput, { enabled: shippingInput.postalCode.length === 8 });
  const pixAvailable = Boolean(directSalesStatus?.enabled);

  const visible = products.filter((product) => {
    const matchesCategory = category === "Todos" || product.category === category;
    const matchesQuery = `${product.title} ${product.category} ${product.seller}`.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const startPixCheckout = (product: CatalogProduct) => {
    if (!pixAvailable) {
      toast.info("Pagamento Pix em homologação", { description: "O checkout será liberado após a conclusão do cadastro comercial da loja." });
      return;
    }
    setSelectedProduct(product);
    setPixPayment(null);
    setForm(emptyForm);
    setPixOpen(true);
  };

  const updateForm = (field: keyof typeof emptyForm, value: string | boolean) => setForm((current) => ({ ...current, [field]: value }));

  const submitPix = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProduct) return;
    if (!shippingQuote) {
      toast.error("Informe um CEP válido para calcular o frete");
      return;
    }
    if (form.email.trim().toLowerCase() !== form.emailConfirmation.trim().toLowerCase()) {
      toast.error("Confirme o mesmo e-mail nos dois campos");
      return;
    }
    if (!form.consentTerms || !form.consentPrivacy) {
      toast.error("Aceite os termos de venda e a política de privacidade");
      return;
    }
    try {
      const payment = await pixMutation.mutateAsync({ ...form, productId: selectedProduct.id, email: form.email.trim().toLowerCase(), emailConfirmation: form.emailConfirmation.trim().toLowerCase(), state: form.state.trim().toUpperCase(), consentTerms: true, consentPrivacy: true });
      setPixPayment(payment);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar o Pix agora");
    }
  };

  const copyPix = async () => {
    if (!pixPayment) return;
    await navigator.clipboard.writeText(pixPayment.qrCode);
    toast.success("Código Pix copiado");
  };

  useEffect(() => { document.title = "TOCA DO MACHO | Ofertas masculinas com desconto"; }, []);

  return (
    <div className="marketplace-home min-h-screen bg-[#f7f9fc] text-[#1f2937]">
      <div className="marketplace-yellow px-4 py-3 text-center text-[11px] font-extrabold uppercase tracking-[.18em] text-[#111827]">TOCA DO MACHO · TUDO PARA O HOMEM</div>
      <header className="sticky top-0 z-30 border-b border-[#e5e7eb] bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 sm:px-6">
          <button className="marketplace-icon" onClick={() => setMenuOpen((open) => !open)} aria-label="Abrir menu">{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
          <a href="/" className="marketplace-logo">TOCA <span>DO MACHO</span></a>
          <label className="marketplace-search relative ml-auto hidden max-w-[550px] flex-1 md:block"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280]" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar produtos, marcas e categorias" /></label>
          <div className="ml-auto flex items-center gap-2 md:ml-3"><button className="marketplace-icon" aria-label="Minha conta"><UserRound size={21} /></button><button className="marketplace-icon relative" aria-label="Carrinho"><ShoppingCart size={21} /><b>0</b></button></div>
        </div>
        {menuOpen && <div className="border-t border-[#e5e7eb] bg-white px-4 py-4 md:hidden"><label className="marketplace-search relative block"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280]" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar produtos..." /></label></div>}
      </header>

      <main>
        <section className="mx-auto max-w-[1440px] px-4 pt-5 sm:px-6">
          <div className="marketplace-controls flex items-center gap-5 overflow-x-auto whitespace-nowrap border-b border-[#dfe4ea] pb-3 text-sm font-semibold"><button className="text-[#2574d9]">Categorias⌄</button><span className="text-[#9ca3af]">|</span><button>Marca⌄</button><button className="ml-auto flex items-center gap-2 text-[#2574d9]"><SlidersHorizontal size={18} /> Filtros (3)⌄</button></div>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2 text-sm"><span className="marketplace-pill">▣ Parcelamento sem juros</span><span className="marketplace-pill">🇧🇷 Envio local</span><span className="marketplace-pill">✈️ Internacional</span></div>
          <section className="mascot-banner mt-4 overflow-hidden rounded-2xl" aria-label="Mascote da TOCA DO MACHO">
            <div className="mascot-copy"><p className="text-[11px] font-black uppercase tracking-[.18em] text-[#ffe500]">Bem-vindo à toca</p><h2>Estilo de homem,<br />atitude de macho.</h2><p>Ofertas selecionadas para sua rotina.</p></div>
            <img className="mascot-image" src="/manus-storage/toca-do-macho-mascote_9190a807.png" alt="Mascote da TOCA DO MACHO" />
          </section>
          <div className="marketplace-category-band mt-5 rounded-2xl px-4 py-5 sm:px-7"><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Qual categoria você procura?</h1><div className="mt-5 flex gap-5 overflow-x-auto pb-2">{categories.map(([name, icon]) => <button key={name} onClick={() => setCategory(name === "Roupas" ? "Roupas Masculinas" : name)} className="category-choice"><span>{icon}</span><strong>{name}</strong></button>)}</div></div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6"><div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#2574d9]">Ofertas selecionadas</p><h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">Mais vendidos da semana</h2><p className="mt-1 text-sm text-[#6b7280]">Pague via Pix com 10% de desconto no preço cheio</p></div><button onClick={() => setCategory("Todos")} className="hidden rounded-lg bg-[#2574d9] px-4 py-2 text-sm font-bold text-white sm:block">Todos</button></div><div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#e5e7eb] md:grid-cols-4">{visible.map((product) => { const fullPriceCents = Math.round(product.fullPrice * 100); const pixPriceCents = Math.floor(fullPriceCents * .9); return <article className="marketplace-product-card bg-white p-3 sm:p-4" key={product.id}><button className="marketplace-product-visual" onClick={() => startPixCheckout(product)} aria-label={`Pagar ${product.title} via Pix`}>{product.image ? <img src={product.image} alt={product.title} /> : null}<span className="marketplace-ad">Oferta</span><span className="marketplace-cart"><ShoppingCart size={19} /></span></button><p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-[#6b7280]">{product.category}</p><h3 className="mt-1 line-clamp-2 min-h-[40px] text-[15px] font-medium leading-5 sm:text-[17px]">{product.title}</h3><p className="mt-1 text-xs text-[#6b7280]">{product.seller}</p><p className="mt-1 text-xs text-[#2574d9]">★ <strong>{product.rating}</strong> · {product.sold}</p><div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-xs text-[#6b7280] line-through">{formatBRL(fullPriceCents)}</span><b className="rounded bg-[#08a65c] px-1.5 py-1 text-xs text-white">10% OFF</b></div><div className="text-xl font-bold sm:text-2xl">{formatBRL(pixPriceCents)}</div><p className="mt-1 text-xs font-semibold text-[#08a65c]">Preço Pix + frete calculado no checkout</p><button onClick={() => startPixCheckout(product)} disabled={directSalesLoading || !pixAvailable} className="marketplace-buy mt-3 w-full rounded-lg px-3 py-3 text-xs font-extrabold text-white sm:text-sm disabled:cursor-not-allowed disabled:opacity-60">{directSalesLoading ? "Verificando Pix..." : pixAvailable ? "Pix · 10% OFF" : "Pix em homologação"}</button><a href={product.url} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-[#2574d9] underline underline-offset-2">Ver no Mercado Livre <ExternalLink size={12} /></a><p className="mt-2 text-center text-[10px] text-[#9ca3af]">{product.badge} · alternativa comissionada</p></article>; })}</div>{visible.length === 0 && <div className="rounded-xl bg-white p-12 text-center">Nenhum produto encontrado.</div>}</section>
        <section className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6"><div className="rounded-2xl bg-[#eaf3ff] p-5 text-sm leading-6 text-[#526174]"><strong className="text-[#1f2937]">Como funciona:</strong> o botão verde é o pagamento principal via Pix Mercado Pago, com 10% de desconto calculado sobre o preço cheio exibido. O Mercado Livre é uma alternativa secundária por link comissionado; preços, estoque, frete, entrega e condições são definidos no anúncio.<a href="/beleza-mais-vendidos.html" className="mt-3 inline-flex rounded-lg bg-[#2574d9] px-4 py-2 font-bold text-white no-underline">Ver catálogo ampliado de ofertas</a></div></section>
      </main>
      <nav className="marketplace-bottom-nav fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[#e5e7eb] bg-white px-2 py-2 text-center text-[11px] font-semibold md:hidden"><a href="#top">⌂<span>Início</span></a><a href="#categorias">▦<span>Categorias</span></a><a href="#carrinho">🛒<span>Carrinho</span></a><a href="#ofertas">▷<span>Ofertas</span></a><a href="#menu">☰<span>Mais</span></a></nav>

      {pixOpen && selectedProduct && <div className="fixed inset-0 z-50 overflow-y-auto bg-[#111827]/60 p-4 sm:p-8" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setPixOpen(false)}><section className="mx-auto max-w-2xl rounded-2xl bg-white p-5 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="pix-title"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#08a65c]">Pagamento principal · Mercado Pago</p><h2 id="pix-title" className="mt-1 text-2xl font-extrabold">Pix com 10% de desconto</h2><p className="mt-1 text-sm text-[#6b7280]">{selectedProduct.title}</p></div><button className="marketplace-icon" onClick={() => setPixOpen(false)} aria-label="Fechar"><X size={21} /></button></div>{pixPayment ? <div className="mt-6 text-center"><p className="text-sm font-semibold text-[#08a65c]">Pedido {pixPayment.orderNumber} criado</p><p className="mt-2 text-sm text-[#6b7280]">Escaneie o QR Code ou copie o código Pix para concluir o pagamento.</p><div className="pix-qr-wrap mx-auto mt-4"><img src={`data:image/png;base64,${pixPayment.qrCodeBase64}`} alt="QR Code Pix" /></div><div className="pix-code-box mt-4"><span>{pixPayment.qrCode}</span><button onClick={copyPix} className="pix-copy-button"><Copy size={15} /> Copiar</button></div><div className="mt-4 flex items-center justify-between border-t pt-4 text-sm"><span>Total com 10% OFF</span><strong className="text-xl">{formatBRL(pixPayment.totalCents)}</strong></div></div> : <form className="mt-6" onSubmit={submitPix}><div className="mb-5 rounded-xl bg-[#f0fbf5] p-4 text-sm"><strong>Preço cheio: {formatBRL(Math.round(selectedProduct.fullPrice * 100))}</strong><br /><span className="text-[#087c48]">Total Pix com 10% OFF: {formatBRL(Math.floor(Math.round(selectedProduct.fullPrice * 100) * .9))}</span><br /><span className="text-[#526174]">Frete: {shippingQuote ? formatBRL(shippingQuote.priceCents) : "a calcular pelo CEP"}</span></div><div className="grid gap-3 sm:grid-cols-2">{([["name", "Nome completo", "text"], ["email", "E-mail", "email"], ["emailConfirmation", "Confirme o e-mail", "email"], ["phone", "WhatsApp", "tel"], ["postalCode", "CEP", "text"], ["street", "Rua", "text"], ["addressNumber", "Número", "text"], ["complement", "Complemento (opcional)", "text"], ["neighborhood", "Bairro", "text"], ["city", "Cidade", "text"], ["state", "UF", "text"]] as const).map(([field, label, type]) => <label key={field} className={field === "street" ? "sm:col-span-2" : ""}><span className="mb-1 block text-xs font-bold text-[#374151]">{label}</span><input required={field !== "complement"} type={type} value={String(form[field])} onChange={(event) => updateForm(field, event.target.value)} className="w-full rounded-lg border border-[#d1d5db] px-3 py-2.5 text-sm outline-none focus:border-[#08a65c]" /></label>)}</div><div className="mt-4 rounded-lg bg-[#f0f7ff] p-3 text-sm"><strong>Frete</strong> {shippingLoading ? "Calculando..." : shippingQuote ? `${formatBRL(shippingQuote.priceCents)} · ${shippingQuote.deliveryEstimate}` : "Informe seu CEP de 8 dígitos"}{shippingQuote && <span className="block text-xs text-[#6b7280]">{shippingQuote.region}</span>}{shippingError && <span className="block text-xs text-[#b42318]">Confira o CEP informado.</span>}</div><label className="mt-4 flex gap-2 text-xs leading-5 text-[#4b5563]"><input type="checkbox" checked={form.consentTerms} onChange={(event) => updateForm("consentTerms", event.target.checked)} /> Aceito os <a className="underline" href="/termos-de-venda.html" target="_blank">termos de venda</a>.</label><label className="mt-2 flex gap-2 text-xs leading-5 text-[#4b5563]"><input type="checkbox" checked={form.consentPrivacy} onChange={(event) => updateForm("consentPrivacy", event.target.checked)} /> Aceito a <a className="underline" href="/politica-de-privacidade.html" target="_blank">política de privacidade</a>.</label><button disabled={pixMutation.isPending} className="marketplace-buy mt-5 w-full rounded-lg px-4 py-3.5 text-sm font-extrabold text-white disabled:opacity-60">{pixMutation.isPending ? "Gerando Pix..." : "Gerar Pix com 10% OFF"}</button><p className="mt-3 text-center text-[11px] text-[#9ca3af]">O pedido e o pagamento são processados pelo Mercado Pago. Seus dados são usados para pagamento e entrega.</p></form>}</section></div>}
    </div>
  );
}
