import React, { createContext, useContext, useState, useEffect } from "react";
import { EVENT_TYPES, DEFAULT_EVENT_TYPE_ID } from "./eventTypes";

const STORAGE_KEY = "asliceofg-event-type-id";
const CHOSEN_KEY = "asliceofg-event-type-chosen";

const EventTypeContext = createContext(null);

export function EventTypeProvider({ children }) {
  const [eventTypeId, setEventTypeId] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_EVENT_TYPE_ID;
    return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_EVENT_TYPE_ID;
  });

  const [hasChosen, setHasChosen] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(CHOSEN_KEY) === "1";
  });

  // Opens automatically, once ever, on first visit — see App.jsx.
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, eventTypeId);
    }
  }, [eventTypeId]);

  const chooseEventType = (id) => {
    const valid = EVENT_TYPES.some((e) => e.id === id) ? id : DEFAULT_EVENT_TYPE_ID;
    setEventTypeId(valid);
    setHasChosen(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CHOSEN_KEY, "1");
    }
    setIsPickerOpen(false);
  };

  const openPicker = () => setIsPickerOpen(true);
  const closePicker = () => {
    // A dismissal without picking still counts as "asked" so it only
    // auto-opens once ever, defaulting to the site's specialization.
    if (!hasChosen) chooseEventType(DEFAULT_EVENT_TYPE_ID);
    setIsPickerOpen(false);
  };

  const eventType = EVENT_TYPES.find((e) => e.id === eventTypeId) || EVENT_TYPES[0];

  return (
    <EventTypeContext.Provider
      value={{
        eventTypeId,
        eventType,
        eventTypes: EVENT_TYPES,
        hasChosen,
        isPickerOpen,
        openPicker,
        closePicker,
        chooseEventType,
      }}
    >
      {children}
    </EventTypeContext.Provider>
  );
}

export function useEventType() {
  const ctx = useContext(EventTypeContext);
  if (!ctx) {
    throw new Error("useEventType() must be called inside an <EventTypeProvider>");
  }
  return ctx;
}
