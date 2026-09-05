import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Copy, CreditCard, ExternalLink, Menu, Search, ShoppingCart, SlidersHorizontal, UserRound, X } from "lucide-react";
import { toast } from "sonner";

type CatalogProductId = "barba-01" | "barba-02" | "perfume-01" | "perfume-02" | "perfume-03" | "perfume-04" | "perfume-05" | "perfume-06" | "perfume-07" | "perfume-08" | "perfume-09" | "roupa-01" | "game-01" | "ferramenta-01" | "game-02" | "game-03" | "game-04" | "tech-01" | "acessorio-01" | "tech-02" | "casa-01" | "suplemento-01" | "suplemento-02" | "impressora-01" | "impressora-02" | "game-05" | "notebook-01" | "kindle-01" | "kindle-02" | "casa-02" | "relogio-01" | "relogio-02" | "relogio-03" | "relogio-04" | "relogio-05";
type CatalogProduct = { id: CatalogProductId; category: string; title: string; seller: string; rating: string; sold: string; fullPrice: number; image: string; url: string; badge: string };

const products: CatalogProduct[] = [
  { id: "barba-01", category: "Barba & Cabelo", title: "ML Máquina Profissional sem Fio com Visor LED e Lâmina de Titânio", seller: "ML", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 81.0, image: "/manus-storage/barba-vphz_07e9b633.webp", url: "https://meli.la/2mrdv8V", badge: "Link validado" },
  { id: "barba-02", category: "Barba & Cabelo", title: "ML Máquina Profissional sem Fio com Visor LED e Regulagem", seller: "ML", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 81.0, image: "/manus-storage/barba-hncl_e49d241e.webp", url: "https://meli.la/2xYVJet", badge: "Link validado" },
  { id: "perfume-01", category: "Perfumes", title: "Dominus Men Perfume de Feromônios 50 ml", seller: "Dominus Men", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 95.0, image: "/manus-storage/perfume-5fez_e9d38f50.webp", url: "https://meli.la/16iAifj", badge: "Link validado" },
  { id: "perfume-02", category: "Perfumes", title: "Primacial Kit 3 Body Splash Masculino Vibration, Blunn e Infalível", seller: "Primacial", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 88.66, image: "/manus-storage/perfume-7t2l_9c8bd257.webp", url: "https://meli.la/1uYgudB", badge: "Link validado" },
  { id: "perfume-03", category: "Perfumes", title: "EZ Black Eau de Parfum Masculino 100 ml", seller: "EZ Black", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 68.9, image: "/manus-storage/perfume-vuuh_1b62b1ee.webp", url: "https://meli.la/1XczxWU", badge: "Link validado" },
  { id: "perfume-04", category: "Perfumes", title: "Lattafa Asad Tradicional Masculino 100 ml", seller: "Lattafa", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 155.0, image: "/manus-storage/perfume-3me5_b9ec5a22.webp", url: "https://meli.la/1NdVfAC", badge: "Link validado" },
  { id: "perfume-05", category: "Perfumes", title: "Paris Elysees Vodka Wild Masculino Intense 100 ml", seller: "Paris Elysees", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 67.9, image: "/manus-storage/perfume-junx_cfd87302.webp", url: "https://meli.la/1gwuDhb", badge: "Link validado" },
  { id: "perfume-06", category: "Perfumes", title: "Emporio Armani Stronger With You EDT 100 ml", seller: "Emporio Armani", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 449.99, image: "/manus-storage/perfume-zyq4_76d61335.webp", url: "https://meli.la/2NR6d1d", badge: "Link validado" },
  { id: "perfume-07", category: "Perfumes", title: "Azzaro The Most Wanted Intense EDP 100 ml", seller: "Azzaro", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 455.57, image: "/manus-storage/perfume-9wh6_97562139.webp", url: "https://meli.la/1SRkfkJ", badge: "Link validado" },
  { id: "perfume-08", category: "Perfumes", title: "Armaf Club de Nuit Intense Man EDT 105 ml", seller: "Armaf", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 215.05, image: "/manus-storage/perfume-zn30_2844ada9.webp", url: "https://meli.la/25Y661u", badge: "Link validado" },
  { id: "perfume-09", category: "Perfumes", title: "Ralph Lauren Polo Sport EDT Masculino 100 ml", seller: "Ralph Lauren", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 236.92, image: "/manus-storage/perfume-p9en_ef9316d0.webp", url: "https://meli.la/1YcXXTq", badge: "Link validado" },
  { id: "roupa-01", category: "Roupas Masculinas", title: "Kit 3 Camisetas Masculinas 100% Algodão Premium", seller: "Mercado Livre", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 67.99, image: "/manus-storage/kit-camisetas-premium_32ec08fb.webp", url: "https://meli.la/127D3t4", badge: "Link validado" },
  { id: "game-01", category: "Games", title: "Console PlayStation 5 Slim Edição Digital", seller: "PlayStation", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 4490.0, image: "/manus-storage/ps5-slim-digital_e52909a3.webp", url: "https://meli.la/2zRQSV7", badge: "Link validado" },
  { id: "ferramenta-01", category: "Ferramentas", title: "PlayStation Store Gift Card Digital", seller: "PlayStation", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 360.0, image: "/manus-storage/playstation-giftcard_8b1dcb32.webp", url: "https://meli.la/1c9h8UY", badge: "Link validado" },
  { id: "game-02", category: "Games", title: "Sony PlayStation Store Gift Card R$ 450 Digital", seller: "PlayStation", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 360.0, image: "/manus-storage/playstation-giftcard_8b1dcb32.webp", url: "https://meli.la/2DnAkcA", badge: "Link validado" },
  { id: "game-03", category: "Games", title: "Sony Controle DualSense sem Fio White para PS5", seller: "Sony", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 397.0, image: "/manus-storage/dualsense_6435a9c3.webp", url: "https://meli.la/26NgNoX", badge: "Link validado" },
  { id: "game-04", category: "Games", title: "Razer Gold Digital R$ 500", seller: "Razer", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 500.0, image: "/manus-storage/razer-gold_67cbb812.webp", url: "https://meli.la/2bCQYpa", badge: "Link validado" },
  { id: "tech-01", category: "Tecnologia", title: "Samsung Galaxy A57 12 GB 512 GB Awesome Navy", seller: "Samsung", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 4549.0, image: "/manus-storage/samsung-a57_767b659e.webp", url: "https://meli.la/32gutB3", badge: "Link validado" },
  { id: "acessorio-01", category: "Acessórios para veículos", title: "Mixs Capacete Robocop Escamoteável Gladiator", seller: "Mixs", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 311.0, image: "/manus-storage/capacete_a12322de.webp", url: "https://meli.la/14QaM9R", badge: "Link validado" },
  { id: "tech-02", category: "Tecnologia", title: "Baseus Carregador portátil MagSafe 5000 mAh 20 W", seller: "Baseus", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 249.9, image: "/manus-storage/carregador-baseus_2b6f9aac.webp", url: "https://meli.la/1zqHVKM", badge: "Link validado" },
  { id: "casa-01", category: "Casa & Limpeza", title: "Alphs Percarbonato de Sódio 100% Tira Manchas Calisul", seller: "Alphs", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 21.31, image: "/manus-storage/percarbonato_b9411ff9.webp", url: "https://meli.la/2B6Vjxz", badge: "Link validado" },
  { id: "suplemento-01", category: "Suplementos", title: "Soldiers Nutrition Creatina Monohidratada em Pó 100% Pura 500 g", seller: "Soldiers Nutrition", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 44.19, image: "/manus-storage/creatina-soldiers_0d149875.webp", url: "https://meli.la/16LXFop", badge: "Link validado" },
  { id: "suplemento-02", category: "Suplementos", title: "Black Skull Whey 100% HD Caramelo Macchiato 900 g", seller: "Black Skull", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 104.0, image: "/manus-storage/whey-black-skull_02f90c03.webp", url: "https://meli.la/1StQFob", badge: "Link validado" },
  { id: "impressora-01", category: "Impressoras 3D", title: "Bambu Lab A1 Mini 3D Cinza", seller: "Bambu Lab", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 1920.0, image: "/manus-storage/bambu-a1-mini_1b2b869c.webp", url: "https://meli.la/342rsbo", badge: "Link validado" },
  { id: "impressora-02", category: "Impressoras 3D", title: "Bambu Lab P1S Combo com AMS", seller: "Bambu Lab", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 7504.0, image: "/manus-storage/bambu-p1s_c7589d14.webp", url: "https://meli.la/1itAwj7", badge: "Link validado" },
  { id: "game-05", category: "Games", title: "Square Enix Final Fantasy VII Rebirth para PlayStation 5", seller: "Square Enix", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 246.13, image: "/manus-storage/final-fantasy-vii_620b7b05.webp", url: "https://meli.la/27xGpPJ", badge: "Link validado" },
  { id: "notebook-01", category: "Notebooks", title: "Acer Aspire 5 Ryzen 5 16 GB 512 GB SSD", seller: "Acer", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 4122.0, image: "/manus-storage/acer-aspire-5_42d6b211.webp", url: "https://meli.la/271wpXk", badge: "Link validado" },
  { id: "kindle-01", category: "Kindle e E-readers", title: "Amazon Capa Folio Premium Magnética para Kindle Scribe", seller: "Amazon", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 1017.0, image: "/manus-storage/kindle-folio_1de98ccf.webp", url: "https://meli.la/12KAAeV", badge: "Link validado" },
  { id: "kindle-02", category: "Kindle e E-readers", title: "Amazon Kindle Colorsoft 2024 32 GB Signature Edition", seller: "Amazon", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 1659.0, image: "/manus-storage/kindle-colorsoft_7c0e0447.webp", url: "https://meli.la/2LtH2jx", badge: "Link validado" },
  { id: "casa-02", category: "Casa & Lifestyle", title: "QW-W Garrafa de Vidro 1 Litro", seller: "QW-W", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 35.04, image: "/manus-storage/garrafa-vidro_b015cf55.webp", url: "https://meli.la/2Hd4y77", badge: "Link validado" },
  { id: "relogio-01", category: "Relógios", title: "Poedagar Oldmoney Aço Inox Prata Social Luxo Premium", seller: "Poedagar", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 119.99, image: "/manus-storage/relogio-poedagar_82f18ca8.webp", url: "https://meli.la/1N9PnoQ", badge: "Link validado" },
  { id: "relogio-02", category: "Relógios", title: "Saint Germain Chroma Masculino Preto Clássico 42 mm", seller: "Saint Germain", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 135.4, image: "/manus-storage/relogio-chroma_985dcbd5.webp", url: "https://meli.la/28iipUm", badge: "Link validado" },
  { id: "relogio-03", category: "Relógios", title: "Casio G-Shock GA-2100-1ADR Carbon Core Guard", seller: "Casio G-Shock", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 399.81, image: "/manus-storage/relogio-gshock_a480da72.webp", url: "https://meli.la/32vUS5J", badge: "Link validado" },
  { id: "relogio-04", category: "Relógios", title: "Casio G-Shock DW-5600BB-1DR Digital Preto", seller: "Casio G-Shock", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 282.11, image: "/manus-storage/relogio-casio_2830c4d0.webp", url: "https://meli.la/2YHC5Qw", badge: "Link validado" },
  { id: "relogio-05", category: "Relógios", title: "OPK 6045 Quartz Masculino Preto", seller: "OPK", rating: "4.8", sold: "+1 mil vendidos", fullPrice: 28.03, image: "/manus-storage/relogio-opk_c73720af.webp", url: "https://meli.la/1ypMKoh", badge: "Link validado" },
];

const categories = [["Games", "🎮"], ["Roupas", "👕"], ["Barba & Cabelo", "✂️"], ["Perfumes", "🧴"], ["Ferramentas", "🛠️"], ["Tecnologia", "📱"], ["Acessórios para veículos", "🪖"], ["Casa & Limpeza", "🏠"], ["Suplementos", "💪"], ["Impressoras 3D", "🖨️"], ["Notebooks", "💻"], ["Kindle e E-readers", "📚"], ["Casa & Lifestyle", "✨"], ["Relógios", "⌚"]] as const;
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

        <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6"><div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#2574d9]">Ofertas selecionadas</p><h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">Mais vendidos da semana</h2><p className="mt-1 text-sm text-[#6b7280]">Pague via Pix com 10% de desconto no preço cheio</p></div><button onClick={() => setCategory("Todos")} className="hidden rounded-lg bg-[#2574d9] px-4 py-2 text-sm font-bold text-white sm:block">Todos</button></div><div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#e5e7eb] md:grid-cols-4">{visible.map((product) => { const fullPriceCents = Math.round(product.fullPrice * 100); const pixPriceCents = Math.floor(fullPriceCents * .9); return <article className="marketplace-product-card bg-white p-3 sm:p-4" key={product.id}><button className="marketplace-product-visual" onClick={() => startPixCheckout(product)} aria-label={`Pagar ${product.title} via Pix`}>{product.image ? <img src={product.image} alt={product.title} /> : null}<span className="marketplace-ad">Oferta</span><span className="marketplace-cart"><ShoppingCart size={19} /></span></button><p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-[#6b7280]">{product.category}</p><h3 className="mt-1 line-clamp-2 min-h-[40px] text-[15px] font-medium leading-5 sm:text-[17px]">{product.title}</h3><p className="mt-1 text-xs text-[#6b7280]">{product.seller}</p><p className="mt-1 text-xs text-[#2574d9]">★ <strong>{product.rating}</strong> · {product.sold}</p><div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-xs text-[#6b7280] line-through">{formatBRL(fullPriceCents)}</span><b className="rounded bg-[#08a65c] px-1.5 py-1 text-xs text-white">10% OFF</b></div><div className="text-xl font-bold sm:text-2xl">{formatBRL(pixPriceCents)}</div><p className="mt-1 text-xs font-medium text-[#526174]"><CreditCard size={13} className="mr-1 inline-block align-[-2px]" />12x de {formatBRL(Math.round(fullPriceCents / 12))} via Mercado Pago</p><p className="mt-1 text-xs font-semibold text-[#08a65c]">Preço Pix + frete calculado no checkout</p><button onClick={() => startPixCheckout(product)} disabled={directSalesLoading || !pixAvailable} className="marketplace-buy mt-3 w-full rounded-lg px-3 py-3 text-xs font-extrabold text-white sm:text-sm disabled:cursor-not-allowed disabled:opacity-60">{directSalesLoading ? "Verificando Pix..." : pixAvailable ? "Pix · 10% OFF" : "Pix em homologação"}</button><a href={product.url} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-[#2574d9] underline underline-offset-2" aria-label={`Parcelar ${product.title} via Mercado Pago`}><CreditCard size={14} /> Parcelar via Mercado Pago <ExternalLink size={12} /></a><p className="mt-2 text-center text-[10px] text-[#9ca3af]">{product.badge}</p></article>; })}</div>{visible.length === 0 && <div className="rounded-xl bg-white p-12 text-center">Nenhum produto encontrado.</div>}</section>
      </main>
      <footer className="pb-24 pt-2 text-center"><a href="/beleza-mais-vendidos.html" className="text-[9px] text-[#9ca3af] underline underline-offset-2">Ver catálogo ampliado de ofertas</a></footer>
      <nav className="marketplace-bottom-nav fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[#e5e7eb] bg-white px-2 py-2 text-center text-[11px] font-semibold md:hidden"><a href="#top">⌂<span>Início</span></a><a href="#categorias">▦<span>Categorias</span></a><a href="#carrinho">🛒<span>Carrinho</span></a><a href="#ofertas">▷<span>Ofertas</span></a><a href="#menu">☰<span>Mais</span></a></nav>

      {pixOpen && selectedProduct && <div className="fixed inset-0 z-50 overflow-y-auto bg-[#111827]/60 p-4 sm:p-8" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setPixOpen(false)}><section className="mx-auto max-w-2xl rounded-2xl bg-white p-5 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="pix-title"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#08a65c]">Pagamento principal · Mercado Pago</p><h2 id="pix-title" className="mt-1 text-2xl font-extrabold">Pix com 10% de desconto</h2><p className="mt-1 text-sm text-[#6b7280]">{selectedProduct.title}</p></div><button className="marketplace-icon" onClick={() => setPixOpen(false)} aria-label="Fechar"><X size={21} /></button></div>{pixPayment ? <div className="mt-6 text-center"><p className="text-sm font-semibold text-[#08a65c]">Pedido {pixPayment.orderNumber} criado</p><p className="mt-2 text-sm text-[#6b7280]">Escaneie o QR Code ou copie o código Pix para concluir o pagamento.</p><div className="pix-qr-wrap mx-auto mt-4"><img src={`data:image/png;base64,${pixPayment.qrCodeBase64}`} alt="QR Code Pix" /></div><div className="pix-code-box mt-4"><span>{pixPayment.qrCode}</span><button onClick={copyPix} className="pix-copy-button"><Copy size={15} /> Copiar</button></div><div className="mt-4 flex items-center justify-between border-t pt-4 text-sm"><span>Total com 10% OFF</span><strong className="text-xl">{formatBRL(pixPayment.totalCents)}</strong></div></div> : <form className="mt-6" onSubmit={submitPix}><div className="mb-5 rounded-xl bg-[#f0fbf5] p-4 text-sm"><strong>Preço cheio: {formatBRL(Math.round(selectedProduct.fullPrice * 100))}</strong><br /><span className="text-[#087c48]">Total Pix com 10% OFF: {formatBRL(Math.floor(Math.round(selectedProduct.fullPrice * 100) * .9))}</span><br /><span className="text-[#526174]">Frete: {shippingQuote ? formatBRL(shippingQuote.priceCents) : "a calcular pelo CEP"}</span></div><div className="grid gap-3 sm:grid-cols-2">{([["name", "Nome completo", "text"], ["email", "E-mail", "email"], ["emailConfirmation", "Confirme o e-mail", "email"], ["phone", "WhatsApp", "tel"], ["postalCode", "CEP", "text"], ["street", "Rua", "text"], ["addressNumber", "Número", "text"], ["complement", "Complemento (opcional)", "text"], ["neighborhood", "Bairro", "text"], ["city", "Cidade", "text"], ["state", "UF", "text"]] as const).map(([field, label, type]) => <label key={field} className={field === "street" ? "sm:col-span-2" : ""}><span className="mb-1 block text-xs font-bold text-[#374151]">{label}</span><input required={field !== "complement"} type={type} value={String(form[field])} onChange={(event) => updateForm(field, event.target.value)} className="w-full rounded-lg border border-[#d1d5db] px-3 py-2.5 text-sm outline-none focus:border-[#08a65c]" /></label>)}</div><div className="mt-4 rounded-lg bg-[#f0f7ff] p-3 text-sm"><strong>Frete</strong> {shippingLoading ? "Calculando..." : shippingQuote ? `${formatBRL(shippingQuote.priceCents)} · ${shippingQuote.deliveryEstimate}` : "Informe seu CEP de 8 dígitos"}{shippingQuote && <span className="block text-xs text-[#6b7280]">{shippingQuote.region}</span>}{shippingError && <span className="block text-xs text-[#b42318]">Confira o CEP informado.</span>}</div><label className="mt-4 flex gap-2 text-xs leading-5 text-[#4b5563]"><input type="checkbox" checked={form.consentTerms} onChange={(event) => updateForm("consentTerms", event.target.checked)} /> Aceito os <a className="underline" href="/termos-de-venda.html" target="_blank">termos de venda</a>.</label><label className="mt-2 flex gap-2 text-xs leading-5 text-[#4b5563]"><input type="checkbox" checked={form.consentPrivacy} onChange={(event) => updateForm("consentPrivacy", event.target.checked)} /> Aceito a <a className="underline" href="/politica-de-privacidade.html" target="_blank">política de privacidade</a>.</label><button disabled={pixMutation.isPending} className="marketplace-buy mt-5 w-full rounded-lg px-4 py-3.5 text-sm font-extrabold text-white disabled:opacity-60">{pixMutation.isPending ? "Gerando Pix..." : "Gerar Pix com 10% OFF"}</button><p className="mt-3 text-center text-[11px] text-[#9ca3af]">O pedido e o pagamento são processados pelo Mercado Pago. Seus dados são usados para pagamento e entrega.</p></form>}</section></div>}
    </div>
  );
}
