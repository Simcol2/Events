import React, { useMemo, useState } from "react";

export const EXTRA_RENTAL_DAY_CENTS = 500;
export const PICKUP_TIME_OPTIONS = [
  ["09:00", "9:00 AM"],
  ["10:00", "10:00 AM"],
  ["11:00", "11:00 AM"],
  ["12:00", "12:00 PM"],
];

function parseYmd(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const [y,m,d] = value.split("-").map(Number);
  return new Date(Date.UTC(y,m-1,d,12));
}
function ymd(date) { return date.toISOString().slice(0,10); }
export function addCalendarDays(value, days) {
  const d = parseYmd(value); if (!d) return "";
  d.setUTCDate(d.getUTCDate()+Number(days||0)); return ymd(d);
}
export function calendarDayDifference(later, earlier) {
  const a=parseYmd(later), b=parseYmd(earlier); if(!a||!b) return 0;
  return Math.round((a-b)/86400000);
}
export function returnTimeForPickup(time) {
  if(!/^\d{2}:\d{2}$/.test(time||"")) return "";
  const [h,m]=time.split(":").map(Number), total=h*60+m+720;
  return `${String(Math.floor((total%1440)/60)).padStart(2,"0")}:${String(total%60).padStart(2,"0")}`;
}
function timeLabel(v) {
  if(!v) return ""; const [h,m]=v.split(":").map(Number);
  return `${h%12||12}:${String(m).padStart(2,"0")} ${h>=12?"PM":"AM"}`;
}
function dateLabel(v) {
  const d=parseYmd(v); if(!d) return "";
  return new Intl.DateTimeFormat("en-CA",{month:"short",day:"numeric",year:"numeric",timeZone:"UTC"}).format(d);
}
export function normalizeRentalDates(input={}) {
  const event=input.event||"";
  const standardPickup=event?addCalendarDays(event,-1):"";
  const standardDropoff=event?addCalendarDays(event,1):"";
  const pickup=input.pickup||standardPickup, dropoff=input.dropoff||standardDropoff;
  const pickupTime=input.pickupTime||"", dropoffTime=pickupTime?returnTimeForPickup(pickupTime):"";
  const earlyPickupDays=standardPickup&&pickup?Math.max(0,calendarDayDifference(standardPickup,pickup)):0;
  const extendedReturnDays=standardDropoff&&dropoff?Math.max(0,calendarDayDifference(dropoff,standardDropoff)):0;
  return {event,pickup,dropoff,pickupTime,dropoffTime,earlyPickupDays,extendedReturnDays,
    extraDayFeeCents:(earlyPickupDays+extendedReturnDays)*EXTRA_RENTAL_DAY_CENTS};
}
export function rentalDatesValid(input) {
  const d=normalizeRentalDates(input);
  if(!d.event||!d.pickup||!d.dropoff||!d.pickupTime||!d.dropoffTime) return false;
  return d.pickup<=addCalendarDays(d.event,-1) && d.dropoff>=addCalendarDays(d.event,1);
}

export default function RentalDateFields({dates,onChange}) {
  const today=new Date().toISOString().slice(0,10);
  const n=normalizeRentalDates(dates);
  const stdPickup=n.event?addCalendarDays(n.event,-1):"";
  const stdDropoff=n.event?addCalendarDays(n.event,1):"";
  const [earlier,setEarlier]=useState(Boolean(n.event&&n.pickup<stdPickup));
  const [later,setLater]=useState(Boolean(n.event&&n.dropoff>stdDropoff));
  const summary=useMemo(()=>normalizeRentalDates(dates),[dates]);
  const emit=(next)=>onChange(normalizeRentalDates(next));

  function chooseEvent(event) {
    if(!event){ setEarlier(false); setLater(false); return onChange({event:"",pickup:"",dropoff:"",pickupTime:"",dropoffTime:"",earlyPickupDays:0,extendedReturnDays:0,extraDayFeeCents:0});}
    setEarlier(false); setLater(false);
    emit({...dates,event,pickup:addCalendarDays(event,-1),dropoff:addCalendarDays(event,1)});
  }

  return <div className="space-y-5">
    <div>
      <label className="font-[Space_Grotesk] text-xs font-semibold tracking-[.08em] text-[#5C5645]">EVENT DATE</label>
      <input type="date" min={today} value={n.event} onChange={e=>chooseEvent(e.target.value)}
        className="mt-1 w-full rounded-xl border border-[#D9D9D9] bg-white px-4 py-3 text-sm"/>
    </div>

    {n.event && <>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-[#F8F3E8] p-4"><p className="text-[11px] font-bold tracking-[.12em] text-[#8A6A1E]">INCLUDED PICKUP</p><p className="mt-1 text-sm font-semibold text-[#0B4933]">{dateLabel(stdPickup)}</p></div>
        <div className="rounded-xl bg-[#F8F3E8] p-4"><p className="text-[11px] font-bold tracking-[.12em] text-[#8A6A1E]">INCLUDED RETURN</p><p className="mt-1 text-sm font-semibold text-[#0B4933]">{dateLabel(stdDropoff)}</p></div>
      </div>

      <div className="rounded-xl border border-[#E6DDC7] bg-white p-4">
        <label className="text-xs font-bold tracking-[.08em] text-[#5C5645]">CHOOSE YOUR PICKUP TIME</label>
        <select value={n.pickupTime} onChange={e=>emit({...dates,pickupTime:e.target.value})}
          className="mt-2 w-full rounded-xl border border-[#D9D9D9] bg-white px-4 py-3 text-sm">
          <option value="">Select a pickup time</option>
          {PICKUP_TIME_OPTIONS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
        </select>
        {n.pickupTime && <p className="mt-2 text-xs text-[#6F6859]">Return time: <strong>{timeLabel(n.dropoffTime)}</strong> on your return date.</p>}
      </div>

      <div className="rounded-xl border border-[#E6DDC7] bg-[#FFFDF8] p-4">
        <p className="text-sm font-semibold text-[#0B4933]">Need more time?</p>
        <p className="mt-1 text-xs text-[#6F6859]">Earlier pickup is $5 per additional day. Extended return is $5 per additional day.</p>

        <label className="mt-4 flex gap-3 text-sm"><input type="checkbox" checked={earlier}
          onChange={e=>{setEarlier(e.target.checked);emit({...dates,pickup:e.target.checked?(n.pickup||stdPickup):stdPickup});}}/>I need an earlier pickup date</label>
        {earlier && <div className="mt-3"><input type="date" min={today} max={stdPickup} value={n.pickup}
          onChange={e=>emit({...dates,pickup:e.target.value})} className="w-full rounded-xl border border-[#D9D9D9] px-4 py-3"/>
          {n.earlyPickupDays>0 && <p className="mt-2 text-xs font-semibold text-[#8A6A1E]">{n.earlyPickupDays} extra pickup day{n.earlyPickupDays===1?"":"s"}: +${n.earlyPickupDays*5}</p>}
        </div>}

        <label className="mt-4 flex gap-3 text-sm"><input type="checkbox" checked={later}
          onChange={e=>{setLater(e.target.checked);emit({...dates,dropoff:e.target.checked?(n.dropoff||stdDropoff):stdDropoff});}}/>I need a later return date</label>
        {later && <div className="mt-3"><input type="date" min={stdDropoff} value={n.dropoff}
          onChange={e=>emit({...dates,dropoff:e.target.value})} className="w-full rounded-xl border border-[#D9D9D9] px-4 py-3"/>
          {n.extendedReturnDays>0 && <p className="mt-2 text-xs font-semibold text-[#8A6A1E]">{n.extendedReturnDays} extra return day{n.extendedReturnDays===1?"":"s"}: +${n.extendedReturnDays*5}</p>}
        </div>}
      </div>

      {summary.pickupTime && <div className="rounded-xl bg-[#EAF2ED] p-4">
        <p className="text-[11px] font-bold tracking-[.12em] text-[#0B4933]">YOUR RENTAL WINDOW</p>
        <div className="mt-2 space-y-1 text-sm text-[#3E3A31]">
          <p><strong>Pickup:</strong> {dateLabel(summary.pickup)} at {timeLabel(summary.pickupTime)}</p>
          <p><strong>Event:</strong> {dateLabel(summary.event)}</p>
          <p><strong>Return:</strong> {dateLabel(summary.dropoff)} at {timeLabel(summary.dropoffTime)}</p>
          <p><strong>Extra rental days:</strong> {summary.extraDayFeeCents?`+$${(summary.extraDayFeeCents/100).toFixed(2)}`:"$0.00"}</p>
        </div>
      </div>}
    </>}
  </div>;
}
