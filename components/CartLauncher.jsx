import React, { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "../CartContext";
import UnifiedCartModal from "./UnifiedCartModal";
import { supabase } from "../supabaseClient";

export default function CartLauncher() {
  const { cartCount } = useCart();
  const [open, setOpen] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [gifts, setGifts] = useState([]);

  useEffect(() => {
    if (!open || !supabase) return;
    let cancelled = false;

    Promise.all([
      supabase.from("items").select("*").eq("active", true),
      supabase.from("gifts").select("*").eq("active", true),
    ]).then(([catalogResult, giftResult]) => {
      if (cancelled) return;
      setCatalog(catalogResult.data || []);
      setGifts(giftResult.data || []);
    });

    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[120] flex h-14 items-center gap-2 rounded-full bg-[#0B4933] px-5 font-[Space_Grotesk] text-sm font-semibold tracking-[0.08em] text-white shadow-xl"
        aria-label={`Open cart with ${cartCount} items`}
      >
        <ShoppingBag size={18} />
        CART
        {cartCount > 0 && (
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#D9AE45] px-1.5 text-xs text-[#0B4933]">
            {cartCount}
          </span>
        )}
      </button>

      {open && <UnifiedCartModal catalog={catalog} gifts={gifts} onClose={() => setOpen(false)} />}
    </>
  );
}
