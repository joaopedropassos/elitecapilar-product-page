import { useEffect, useState } from "react";
import { ExternalLink, Menu, Search, ShoppingCart, SlidersHorizontal, UserRound, X } from "lucide-react";

const products = [
  { id: "barba-01", category: "Barba & Cabelo", title: "Máquina Profissional Wahl Magic Clip Black Sem Fio", seller: "TECLA ONLINE", rating: "4.8", sold: "+5 mil vendidos", price: "R$ 610,00", discount: "16% OFF", image: "/manus-storage/barba-vphz_07e9b633.webp", url: "https://meli.la/2K66kNt", badge: "Mais vendido" },
  { id: "perfume-01", category: "Perfumes", title: "Perfume de Feromônios Dominus Men 50 ml", seller: "Dominus Men", rating: "4.8", sold: "+5 mil vendidos", price: "R$ 89,90", discount: "Oferta", image: "/manus-storage/perfume-5fez_e9d38f50.webp", url: "https://meli.la/16iAifj", badge: "Mais vendido" },
  { id: "roupa-01", category: "Roupas Masculinas", title: "Kit 3 Camisetas Masculinas 100% Algodão Premium", seller: "Mercado Livre", rating: "4.8", sold: "+5 mil vendidos", price: "R$ 67,99", discount: "13% OFF", image: "", url: "https://meli.la/127D3t4", badge: "Mais vendido" },
  { id: "game-01", category: "Games", title: "Console PlayStation 5 Slim Edição Digital", seller: "Pilaresdasabedoria", rating: "4.9", sold: "+1 mil vendidos", price: "R$ 4.490,00", discount: "Oferta", image: "", url: "https://meli.la/2zRQSV7", badge: "Escolha premium" },
];

const categories = [
  ["Games", "🎮"], ["Roupas", "👕"], ["Barba & Cabelo", "✂️"], ["Perfumes", "🧴"], ["Cuidados de Pele", "🧼"], ["Óleos Capilares", "💧"],
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [menuOpen, setMenuOpen] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [redirectTitle, setRedirectTitle] = useState("");

  const visible = products.filter((product) => {
    const matchesCategory = category === "Todos" || product.category === category;
    const matchesQuery = `${product.title} ${product.category} ${product.seller}`.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const openAffiliate = (product: (typeof products)[number]) => {
    setRedirectTitle(product.title);
    setRedirecting(true);
    window.setTimeout(() => {
      window.open(product.url, "_blank", "noopener,noreferrer");
      setRedirecting(false);
    }, 1500);
  };

  useEffect(() => {
    document.title = "TOCA DO MACHO | Ofertas masculinas com desconto";
  }, []);

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
          <div className="marketplace-category-band mt-5 rounded-2xl px-4 py-5 sm:px-7"><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Qual categoria você procura?</h1><div className="mt-5 flex gap-5 overflow-x-auto pb-2">{categories.map(([name, icon]) => <button key={name} onClick={() => setCategory(name === "Roupas" ? "Roupas Masculinas" : name)} className="category-choice"><span>{icon}</span><strong>{name}</strong></button>)}</div></div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6"><div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#2574d9]">Ofertas selecionadas</p><h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">Mais vendidos da semana</h2></div><button onClick={() => setCategory("Todos")} className="hidden rounded-lg bg-[#2574d9] px-4 py-2 text-sm font-bold text-white sm:block">Todos</button></div><div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#e5e7eb] md:grid-cols-4">{visible.map((product) => <article className="marketplace-product-card bg-white p-3 sm:p-4" key={product.id}><button className="marketplace-product-visual" onClick={() => openAffiliate(product)} aria-label={`Abrir ${product.title}`}>{product.image ? <img src={product.image} alt={product.title} /> : <span className="product-placeholder">{product.category === "Games" ? "GAMES" : "TOCA"}</span>}<span className="marketplace-ad">Oferta</span><span className="marketplace-cart"><ShoppingCart size={19} /></span></button><p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-[#6b7280]">{product.category}</p><h3 className="mt-1 line-clamp-2 min-h-[40px] text-[15px] font-medium leading-5 sm:text-[17px]">{product.title}</h3><p className="mt-1 text-xs text-[#6b7280]">{product.seller}</p><p className="mt-1 text-xs text-[#2574d9]">★ <strong>{product.rating}</strong> · {product.sold}</p><div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-xl font-bold sm:text-2xl">{product.price}</span><b className="rounded bg-[#08a65c] px-1.5 py-1 text-xs text-white">{product.discount}</b></div><p className="mt-1 text-xs text-[#08a65c]">Frete grátis · entrega rápida</p><button onClick={() => openAffiliate(product)} className="marketplace-buy mt-3 w-full rounded-lg px-3 py-3 text-xs font-extrabold text-white sm:text-sm">Comprar com link</button><p className="mt-2 text-center text-[10px] text-[#9ca3af]">{product.badge} · link comissionado</p></article>)}</div>{visible.length === 0 && <div className="rounded-xl bg-white p-12 text-center">Nenhum produto encontrado.</div>}</section>
        <section className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6"><div className="rounded-2xl bg-[#eaf3ff] p-5 text-sm leading-6 text-[#526174]"><strong className="text-[#1f2937]">Sobre os links:</strong> ao clicar, você será encaminhado conscientemente ao Mercado Livre por um link comissionado. Preços, estoque, frete, entrega e condições são definidos no anúncio. O desconto de 10% no Pix vale somente para compras diretas elegíveis da TOCA DO MACHO.</div></section>
      </main>
      <nav className="marketplace-bottom-nav fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[#e5e7eb] bg-white px-2 py-2 text-center text-[11px] font-semibold md:hidden"><a href="#top">⌂<span>Início</span></a><a href="#categorias">▦<span>Categorias</span></a><a href="#carrinho">🛒<span>Carrinho</span></a><a href="#ofertas">▷<span>Ofertas</span></a><a href="#menu">☰<span>Mais</span></a></nav>
      {redirecting && <div className="fixed inset-0 z-50 grid place-items-center bg-[#111827]/55 p-5"><div className="w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-2xl"><div className="mx-auto grid h-14 w-14 animate-pulse place-items-center rounded-full bg-[#fff1a8] text-2xl">↗</div><h2 className="mt-5 text-xl font-extrabold">Buscando o melhor preço</h2><p className="mt-2 text-sm leading-6 text-[#6b7280]">Você está sendo redirecionado ao Mercado Livre pelo link comissionado da TOCA DO MACHO.</p><p className="mt-3 truncate text-xs text-[#9ca3af]">{redirectTitle}</p></div></div>}
    </div>
  );
}
