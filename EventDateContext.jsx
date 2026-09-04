import React, { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "asliceofg-event-date";

const EventDateContext = createContext(null);

// Unlike EventTypeContext, this never auto-opens on page load - it only
// opens the first time a visitor tries to rent something and no event
// date is on file yet. See EventDatePicker.
export function EventDateProvider({ children }) {
  const [eventDate, setEventDateState] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(STORAGE_KEY) || "";
  });

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [onResolve, setOnResolve] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (eventDate) window.localStorage.setItem(STORAGE_KEY, eventDate);
  }, [eventDate]);

  const hasEventDate = Boolean(eventDate);

  const setEventDate = (date) => {
    setEventDateState(date);
    setIsPickerOpen(false);
  };

  // Opens the picker and returns a promise that resolves with the date
  // once chosen, so a caller (e.g. "Check dates") can await it inline
  // instead of juggling its own open/close state.
  const requestEventDate = () =>
    new Promise((resolve) => {
      if (hasEventDate) {
        resolve(eventDate);
        return;
      }
      setOnResolve(() => resolve);
      setIsPickerOpen(true);
    });

  const chooseEventDate = (date) => {
    setEventDate(date);
    if (onResolve) {
      onResolve(date);
      setOnResolve(null);
    }
  };

  const closePicker = () => {
    setIsPickerOpen(false);
    if (onResolve) {
      onResolve(null);
      setOnResolve(null);
    }
  };

  return (
    <EventDateContext.Provider
      value={{
        eventDate,
        hasEventDate,
        isPickerOpen,
        setEventDate,
        requestEventDate,
        chooseEventDate,
        closePicker,
      }}
    >
      {children}
    </EventDateContext.Provider>
  );
}

export function useEventDate() {
  const ctx = useContext(EventDateContext);
  if (!ctx) {
    throw new Error("useEventDate() must be called inside an <EventDateProvider>");
  }
  return ctx;
}
