import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { withBasePath } from "../apiBase";

// Shared by the Table Box page (pop-up) and the package pages at
// /table-box/<slug>, so both always show the same boxes, prices and stock.

export const DELIVERY_SETUP_ITEM_ID = 572;
export const FALLBACK_PHOTO = "/photos/table-box-after.jpg";

export function money(value) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(Number(value || 0));
}

export function cents(value) {
  return Math.round(Number(value || 0) * 100);
}

export function photoUrl(path) {
  return withBasePath(path || FALLBACK_PHOTO);
}

// How many of an item are physically on hand, ignoring dates. An option a
// package needs more of than that (e.g. 20 goblets when only 8 are owned)
// is hidden rather than offered and then refused at checkout.
export function onHand(item) {
  return Number(item?.quantity_owned || 0) - Number(item?.quantity_out_of_service || 0);
}

// Splits a package's component rows into always-included pieces and the
// choice groups the customer picks one option from.
export function splitComponents(components) {
  const fixed = [];
  const groups = [];
  for (const component of components) {
    if (!component.choice_group) {
      fixed.push(component);
      continue;
    }
    let group = groups.find((g) => g.key === component.choice_group);
    if (!group) {
      group = { key: component.choice_group, label: component.choice_label || "Choose one", options: [] };
      groups.push(group);
    }
    group.options.push(component);
  }
  return { fixed, groups: groups.filter((g) => g.options.length > 0) };
}

// Loads every active Table Box package with its pieces, the optional
// add-ons and the delivery item. `loaded` distinguishes "still fetching"
// from "fetched and there are none", which the package pages need in order
// to tell a missing package from one that has not arrived yet.
export function useTableBoxPackages() {
  const [packages, setPackages] = useState([]);
  const [addons, setAddons] = useState([]);
  const [deliveryItem, setDeliveryItem] = useState(null);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!supabase) {
        setLoaded(true);
        return;
      }

      const [packageResult, componentResult, addonResult, deliveryResult] = await Promise.all([
        supabase.from("table_box_packages").select("*").eq("active", true).order("display_order", { ascending: true }),
        supabase.from("table_box_package_items").select("*").order("display_order", { ascending: true }),
        supabase.from("table_box_package_addons").select("*").eq("active", true).order("display_order", { ascending: true }),
        supabase.from("items").select("*").eq("id", DELIVERY_SETUP_ITEM_ID).maybeSingle(),
      ]);
      if (ignore) return;

      if (packageResult.error || componentResult.error || addonResult.error) {
        setError("Package options are unavailable right now.");
        setLoaded(true);
        return;
      }

      const packageRows = packageResult.data || [];
      const componentRows = componentResult.data || [];
      const addonRows = addonResult.data || [];

      const allItemIds = Array.from(
        new Set(
          [
            ...packageRows.map((row) => row.package_item_id),
            ...componentRows.map((row) => row.item_id),
            ...addonRows.map((row) => row.item_id),
          ].filter(Boolean)
        )
      );

      const { data: itemRows, error: itemsError } = allItemIds.length
        ? await supabase.from("items").select("*").in("id", allItemIds)
        : { data: [], error: null };
      if (ignore) return;
      if (itemsError) {
        setError("Package pricing is unavailable right now.");
        setLoaded(true);
        return;
      }

      const byId = Object.fromEntries((itemRows || []).map((item) => [item.id, item]));

      const hydratedPackages = packageRows
        .map((row) => {
          const packageItem = byId[row.package_item_id];
          if (!packageItem?.active || !packageItem?.rental_price) return null;

          const components = [];
          for (const component of componentRows.filter((c) => c.package_id === row.id)) {
            const item = byId[component.item_id];
            const stocked = item?.active && onHand(item) >= Number(component.quantity);
            // A fixed piece that can't be supplied makes the whole box
            // unavailable; an unstocked alternative just isn't offered.
            if (!stocked && !component.choice_group) return null;
            if (stocked) components.push({ ...component, item_name: item.name });
          }
          const { groups } = splitComponents(components);
          const everyGroupHasOption =
            new Set(componentRows.filter((c) => c.package_id === row.id && c.choice_group).map((c) => c.choice_group)).size ===
            groups.length;
          if (!components.length || !everyGroupHasOption) return null;

          return { ...row, rental_price: Number(packageItem.rental_price), components };
        })
        .filter(Boolean);

      const hydratedAddons = addonRows
        .map((row) => {
          const item = byId[row.item_id];
          if (!item?.active || !item?.rental_price) return null;
          return { ...item, package_addon_id: row.id, add_on_label: row.label };
        })
        .filter(Boolean);

      setPackages(hydratedPackages);
      setAddons(hydratedAddons);
      setDeliveryItem(deliveryResult.data || null);
      setLoaded(true);
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  return { packages, addons, deliveryItem, error, loaded };
}
