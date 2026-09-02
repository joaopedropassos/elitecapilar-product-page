import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import type { inferRouterOutputs } from "@trpc/server";
import { Mail, MapPin, PackageCheck, Phone, RefreshCw, Save, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { AppRouter } from "../../../server/routers";

type AdminOrder = inferRouterOutputs<AppRouter>["orders"]["list"][number];
type FulfillmentStatus = "paid" | "processing" | "shipped" | "delivered" | "canceled" | "refunded";

const statusLabels: Record<string, string> = {
  creating_payment: "Criando pagamento",
  awaiting_payment: "Aguardando Pix",
  paid: "Pago · ação necessária",
  processing: "Compra no fornecedor",
  shipped: "Enviado",
  delivered: "Entregue",
  payment_failed: "Pagamento falhou",
  canceled: "Cancelado",
  refunded: "Reembolsado",
};

const statusColors: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-800",
  processing: "bg-amber-100 text-amber-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-slate-200 text-slate-700",
  awaiting_payment: "bg-stone-100 text-stone-700",
  payment_failed: "bg-red-100 text-red-700",
  canceled: "bg-red-100 text-red-700",
  refunded: "bg-purple-100 text-purple-700",
};

function OrderCard({ order, onSaved }: { order: AdminOrder; onSaved: () => Promise<unknown> }) {
  const [status, setStatus] = useState<FulfillmentStatus>(["paid", "processing", "shipped", "delivered", "canceled", "refunded"].includes(order.status) ? order.status as FulfillmentStatus : "paid");
  const [supplierOrderReference, setSupplierOrderReference] = useState(order.supplierOrderReference ?? "");
  const [trackingCode, setTrackingCode] = useState(order.trackingCode ?? "");
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl ?? "");
  const mutation = trpc.orders.updateFulfillment.useMutation();

  const save = async () => {
    try {
      await mutation.mutateAsync({ orderNumber: order.orderNumber, status, supplierOrderReference, trackingCode, trackingUrl });
      await onSaved();
      toast.success(`Pedido ${order.orderNumber} atualizado`);
    } catch {
      toast.error("Não foi possível atualizar o pedido");
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <header className="flex flex-col gap-3 border-b border-stone-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-stone-400">Pedido</p><h2 className="mt-1 text-lg font-bold text-stone-900">{order.orderNumber}</h2><p className="mt-1 text-xs text-stone-500">{new Date(order.createdAt).toLocaleString("pt-BR")}</p></div>
        <span className={`w-fit rounded-full px-3 py-1.5 text-[10px] font-bold ${statusColors[order.status] ?? "bg-stone-100 text-stone-700"}`}>{statusLabels[order.status] ?? order.status}</span>
      </header>
      <div className="grid gap-6 p-5 lg:grid-cols-[1fr_1fr]">
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold"><PackageCheck className="h-4 w-4 text-emerald-700" /> Venda</h3>
          <dl className="grid gap-2 text-xs text-stone-600"><div><dt className="font-semibold text-stone-900">Produto</dt><dd>{order.productTitle}</dd></div><div className="flex gap-6"><div><dt className="font-semibold text-stone-900">Total</dt><dd>{(order.totalCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</dd></div><div><dt className="font-semibold text-stone-900">Pagamento</dt><dd>{order.paymentId ?? "Não associado"}</dd></div></div></dl>
          <h3 className="mb-3 mt-6 flex items-center gap-2 text-sm font-bold"><MapPin className="h-4 w-4 text-emerald-700" /> Cliente e entrega</h3>
          <div className="space-y-2 text-xs leading-5 text-stone-600"><p className="font-semibold text-stone-900">{order.customerName}</p><p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {order.customerEmail}</p><p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {order.customerPhone}</p><p>{order.street}, {order.addressNumber}{order.complement ? `, ${order.complement}` : ""}<br />{order.neighborhood} · {order.city}/{order.state}<br />CEP {order.postalCode}</p></div>
        </section>
        <section className="rounded-xl bg-stone-50 p-4">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold"><Truck className="h-4 w-4 text-emerald-700" /> Fulfillment manual</h3>
          <div className="grid gap-3">
            <label className="grid gap-1.5 text-[10px] font-bold uppercase tracking-wide text-stone-500">Andamento<select value={status} onChange={(event) => setStatus(event.target.value as FulfillmentStatus)} className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-xs font-medium normal-case text-stone-900 outline-none focus:border-emerald-600"><option value="paid">Pago · aguardando ação</option><option value="processing">Compra feita no fornecedor</option><option value="shipped">Enviado</option><option value="delivered">Entregue</option><option value="canceled">Cancelado</option><option value="refunded">Reembolsado</option></select></label>
            <label className="grid gap-1.5 text-[10px] font-bold uppercase tracking-wide text-stone-500">Referência do fornecedor<input value={supplierOrderReference} onChange={(event) => setSupplierOrderReference(event.target.value)} className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-xs font-medium normal-case text-stone-900 outline-none focus:border-emerald-600" placeholder="Número da compra direta" /></label>
            <label className="grid gap-1.5 text-[10px] font-bold uppercase tracking-wide text-stone-500">Código de rastreio<input value={trackingCode} onChange={(event) => setTrackingCode(event.target.value)} className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-xs font-medium normal-case text-stone-900 outline-none focus:border-emerald-600" /></label>
            <label className="grid gap-1.5 text-[10px] font-bold uppercase tracking-wide text-stone-500">Link de rastreio<input value={trackingUrl} onChange={(event) => setTrackingUrl(event.target.value)} className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-xs font-medium normal-case text-stone-900 outline-none focus:border-emerald-600" placeholder="https://..." /></label>
            <Button onClick={save} disabled={mutation.isPending} className="mt-1 bg-emerald-800 text-white hover:bg-emerald-900"><Save className="mr-2 h-4 w-4" />{mutation.isPending ? "Salvando..." : "Salvar andamento"}</Button>
          </div>
        </section>
      </div>
    </article>
  );
}

export default function OrdersAdmin() {
  const { user, loading } = useAuth();
  const queryInput = useMemo(() => ({ limit: 100 }), []);
  const ordersQuery = trpc.orders.list.useQuery(queryInput, { enabled: user?.role === "admin", retry: false });

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl py-4 sm:px-3 sm:py-8">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-emerald-700">Operação própria</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900">Pedidos e entregas</h1><p className="mt-2 max-w-2xl text-sm text-stone-500">Use esta área para executar a compra direta no fornecedor, registrar o rastreio e acompanhar cada pedido pago.</p></div>
          <Button variant="outline" onClick={() => ordersQuery.refetch()} disabled={ordersQuery.isFetching}><RefreshCw className={`mr-2 h-4 w-4 ${ordersQuery.isFetching ? "animate-spin" : ""}`} />Atualizar</Button>
        </div>
        {!loading && user?.role !== "admin" && <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800"><strong>Acesso restrito.</strong> Somente o administrador da loja pode visualizar dados de pedidos.</div>}
        {user?.role === "admin" && ordersQuery.isLoading && <div className="rounded-2xl border border-stone-200 bg-white p-8 text-sm text-stone-500">Carregando pedidos...</div>}
        {user?.role === "admin" && ordersQuery.error && <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">Não foi possível carregar os pedidos.</div>}
        {user?.role === "admin" && ordersQuery.data?.length === 0 && <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center"><PackageCheck className="mx-auto h-9 w-9 text-stone-300" /><h2 className="mt-4 text-lg font-bold">Nenhum pedido ainda</h2><p className="mt-1 text-sm text-stone-500">Os pedidos aparecerão aqui após a criação do checkout.</p></div>}
        <div className="grid gap-5">{ordersQuery.data?.map((order) => <OrderCard key={order.id} order={order} onSaved={ordersQuery.refetch} />)}</div>
      </div>
    </DashboardLayout>
  );
}
