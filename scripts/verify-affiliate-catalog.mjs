import { readFile } from "node:fs/promises";

const file = new URL("../client/public/beleza-mais-vendidos.html", import.meta.url);
const html = await readFile(file, "utf8");
const sourceProductCount = (html.match(/\{id:'[^']+'/g) || []).length;
const affiliateBlock = html.match(/const AFFILIATE_LINKS = Object\.freeze\(\{([\s\S]*?)\}\);/)?.[1] || "";
const links = [...affiliateBlock.matchAll(/'([^']+)':'(https:\/\/meli\.la\/[A-Za-z0-9]+)'/g)].map((match) => ({ id: match[1], url: match[2] }));
const imageCount = (html.match(/image:'\/manus-storage\//g) || []).length;
const invalidPromises = ["Comprar com Desconto + Cashback", "Buscando o melhor preço com Cashback Méliuz"].filter((text) => html.includes(text));
const failures = [];
if (sourceProductCount !== 194) failures.push(`esperados 194 produtos editoriais na fonte, encontrados ${sourceProductCount}`);
if (links.length !== 105) failures.push(`esperados 105 links, encontrados ${links.length}`);
if (new Set(links.map((item) => item.id)).size !== links.length) failures.push("IDs de afiliado duplicados");
if (new Set(links.map((item) => item.url)).size !== links.length) failures.push("URLs de afiliado duplicadas");
if (imageCount !== 33) failures.push(`esperadas 33 imagens reais, encontradas ${imageCount}`);
if (invalidPromises.length) failures.push(`promessas não comprovadas: ${invalidPromises.join(", ")}`);
if (!html.includes("O link não garante cashback ao comprador")) failures.push("aviso de cashback ausente");
if (!html.includes("Você será redirecionado conscientemente em 1,5 segundo")) failures.push("aviso de redirecionamento ausente");
if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, sourceProductCount, renderedLinkedProducts: 105, affiliateLinks: links.length, realImages: imageCount }, null, 2));
