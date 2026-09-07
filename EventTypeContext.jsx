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

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // True when the picker was opened by a "Build My Experience" click rather
  // than the header's event-type chip; see openPickerForBuilder below.
  // EventTypePicker reads this to decide whether picking a type should also
  // carry the visitor straight into the Package Builder.
  const [builderIntent, setBuilderIntent] = useState(false);

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

  // Used by the header's event-type chip: just swap the type, no navigation.
  const openPicker = () => {
    setBuilderIntent(false);
    setIsPickerOpen(true);
  };
  // Used by every "Build My Experience" entry point: after picking, the
  // visitor should land in the Package Builder for that type.
  const openPickerForBuilder = () => {
    setBuilderIntent(true);
    setIsPickerOpen(true);
  };
  const closePicker = () => {
    setIsPickerOpen(false);
    setBuilderIntent(false);
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
        builderIntent,
        openPicker,
        openPickerForBuilder,
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
