import { useState } from "react";
import { supabase } from "./supabaseClient";
import { useCart } from "./CartContext";
import { rentalDatesValid } from "./components/RentalDateFields";

export function formatRentalDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

// Renting isn't a plain add-to-cart: the chosen dates have to actually be
// free for that item first, checked live against existing reservations, and
// dates have to be collected at all before that check can run. Shared by
// every page that offers a Rent button (the Decor grid and each item's own
// detail page) so the availability check and the "set your dates" prompt
// can never drift into two different behaviors.
export function useRentalFlow() {
  const { addRental, rentalDates, rentalItems } = useCart();
  const [showDatesModal, setShowDatesModal] = useState(false);
  const [pendingRentItem, setPendingRentItem] = useState(null);
  const [pendingQuantity, setPendingQuantity] = useState(1);
  const [rentalNotice, setRentalNotice] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const datesReady = rentalDatesValid(rentalDates);

  const attemptAddRental = async (item, dates, quantity = 1) => {
    setRentalNotice("");

    if (!supabase) {
      addRental(item.id, null, quantity);
      return;
    }

    setCheckingAvailability(true);
    const { data, error: availabilityError } = await supabase.rpc("get_reservation_item_availability", {
      p_item_id: Number(item.id),
      p_pickup: dates.pickup,
      p_dropoff: dates.dropoff,
    });
    setCheckingAvailability(false);

    const alreadyInCart = rentalItems.filter((line) => String(line.id) === String(item.id))
      .reduce((sum, line) => sum + Number(line.quantity || 0), 0);
    if (availabilityError || Number(data || 0) < quantity + alreadyInCart) {
      setRentalNotice(
        `${item.name} isn't available in the requested quantity for ${formatRentalDate(dates.pickup)} to ${formatRentalDate(dates.dropoff)}.`
      );
      return;
    }

    addRental(item.id, null, quantity);
  };

  const handleRent = async (item, requestedQuantity = 1) => {
    const quantity = Math.max(1, Math.floor(Number(requestedQuantity) || 1));
    if (!Number.isFinite(quantity) || checkingAvailability) return;
    if (!datesReady) {
      setPendingRentItem(item);
      setPendingQuantity(quantity);
      setShowDatesModal(true);
      return;
    }
    await attemptAddRental(item, rentalDates, quantity);
  };

  const handleDatesSaved = async (savedDates) => {
    setShowDatesModal(false);
    if (pendingRentItem) {
      const item = pendingRentItem;
      setPendingRentItem(null);
      await attemptAddRental(item, savedDates, pendingQuantity);
    }
  };

  return {
    datesReady,
    rentalDates,
    showDatesModal,
    setShowDatesModal,
    setPendingRentItem,
    rentalNotice,
    checkingAvailability,
    handleRent,
    handleDatesSaved,
  };
}
