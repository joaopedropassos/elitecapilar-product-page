from pathlib import Path

root = Path('/home/ubuntu/elitecapilar-product-page')

home = root / 'client/src/pages/Home.tsx'
s = home.read_text()
s = s.replace('TOCA DO MACHO · ESTILO MASCULINO', 'TOCA DO MACHO · 10% DE DESCONTO NO PIX')
s = s.replace('Seu novo visual por <strong>R$ 1.125,00 no Pix</strong>', 'Todo o site com <strong>10% de desconto no Pix</strong>')
s = s.replace('10% de desconto na venda direta. Pedido, atendimento e entrega sob responsabilidade da TOCA DO MACHO.', 'Na compra direta pelo site, pague via Pix e aproveite 10% de desconto. Ofertas do Mercado Livre seguem o anúncio.')
s = s.replace('aria-label="EliteCapilar.com.br"', 'aria-label="TOCA DO MACHO"')
home.write_text(s)

index = root / 'client/index.html'
s = index.read_text()
s = s.replace('TOCA DO MACHO — Sistema Capilar Premium', 'TOCA DO MACHO — Estilo masculino e ofertas com desconto no Pix')
s = s.replace('TOCA DO MACHO — sistemas capilares premium com resultado natural.', 'TOCA DO MACHO — estilo masculino, cuidados pessoais e 10% de desconto no Pix na compra direta.')
s = s.replace('prótese capilar, sistema capilar, micro-stubble, efeito raspado, prótese capilar masculina, TOCA DO MACHO', 'TOCA DO MACHO, desconto Pix, cuidados masculinos, perfumes masculinos, aparadores, prótese capilar')
index.write_text(s)

catalog = root / 'client/public/beleza-mais-vendidos.html'
s = catalog.read_text()
s = s.replace('<title>100 Produtos de Beleza | Ofertas Mercado Livre</title>', '<title>TOCA DO MACHO | Ofertas masculinas no Mercado Livre</title>')
s = s.replace('Seleção editorial com 100 produtos populares de beleza, perfumes, skincare, óleos capilares e aparadores com links comissionados.', 'TOCA DO MACHO: ofertas masculinas selecionadas com links comissionados para o Mercado Livre.')
s = s.replace('<p class="mb-4 text-[10px] font-black uppercase tracking-[.24em] text-[#ddc28f]">Atualização semanal · beleza e cuidado pessoal</p>', '<p class="mb-4 text-[10px] font-black uppercase tracking-[.24em] text-[#ddc28f]">TOCA DO MACHO · 10% DE DESCONTO NO PIX NA COMPRA DIRETA</p>')
s = s.replace('<h1 class="max-w-4xl font-display text-4xl leading-[1.02] tracking-[-.04em] sm:text-6xl">Ofertas masculinas selecionadas com link</h1>', '<h1 class="max-w-4xl font-display text-4xl leading-[1.02] tracking-[-.04em] sm:text-6xl">Ofertas masculinas selecionadas com link</h1>')
s = s.replace('TOCA DO MACHO reúne ofertas com links comissionados. Preços, cashback e disponibilidade devem ser confirmados no anúncio.', 'TOCA DO MACHO reúne ofertas com links comissionados. O desconto de 10% no Pix aplica-se somente à compra direta pelo site; as ofertas do Mercado Livre seguem o anúncio.')
s = s.replace('      </style>', '''
    .toca-brand { color:#b89555; letter-spacing:.08em; text-transform:uppercase; }
    .toca-pix { color:#8ee0b7; }
    .affiliate-cta { background:#087a5b !important; }
    .affiliate-cta:hover { background:#066348 !important; }
      </style>''')
catalog.write_text(s)

# Remove stale brand references from visible administrative copy only.
dash = root / 'client/src/components/DashboardLayout.tsx'
dash.write_text(dash.read_text().replace('EliteCapilar', 'TOCA DO MACHO'))
