import React, {useCallback,useEffect,useMemo,useRef,useState} from "react";
import {useCart} from "../CartContext";
import {supabase} from "../supabaseClient";
import {API_BASE,withBasePath} from "../apiBase";
import SquareCardPayment from "./SquareCardPayment";
import {calculateGPackage} from "../gEventsPricing";
import {estimateBookingDepositCents,estimateSecurityDepositCents} from "../depositTiers";

const G_IDS=new Set([600,604,605,606,607]);
const cash=c=>new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD"}).format(c/100);
export default function GEventsCheckoutModal({catalog=[],onClose}){
  const {items,rentalDates,setRentalDates,removeFromCart,setQuantity}=useCart();
  const selected=useMemo(()=>items.filter(x=>x.kind==="rental"&&G_IDS.has(Number(x.id))),[items]);
  const allItems=useMemo(()=>new Map(catalog.map(i=>[Number(i.id),i])),[catalog]);
  const lines=selected.map(x=>({ ...x,record:allItems.get(Number(x.id))}));
  const subtotal=lines.reduce((sum,x)=>sum+Math.round(Number(x.record?.rental_price||0)*100)*Number(x.quantity||1),0);
  const configured=useMemo(()=>{try{return JSON.parse(localStorage.getItem('asliceofg-g-events-package-v1')||'null')}catch{return null}},[]);
  const pkg=useMemo(()=>{try{return configured&&selected.some(x=>Number(x.id)===600)?calculateGPackage(configured):null}catch{return null}},[configured,selected]);
  const grandTotal=subtotal+(pkg?.addonsCents||0);
  const deposit=estimateBookingDepositCents(grandTotal);
  const security=estimateSecurityDepositCents(grandTotal);
  const [name,setName]=useState('');const [email,setEmail]=useState('');const [phone,setPhone]=useState('');
  const [venueName,setVenueName]=useState('');const [address,setAddress]=useState('');const [eventDate,setEventDate]=useState(rentalDates.event||'');
  const [accepted,setAccepted]=useState(false);const [ready,setReady]=useState(false);
  const [availability,setAvailability]=useState(null);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  const tokenize=useRef(null);
  const onCardReady=useCallback(fn=>{tokenize.current=fn;setReady(Boolean(fn));},[]);
  // Rental availability checks need a date range. Delivery/collection dates remain
  // provisional internal holds, NOT customer self-pickup/self-return appointments.
  const shift=(date,days)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return '';const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);};
  const range={event:eventDate,pickup:shift(eventDate,-1),dropoff:shift(eventDate,1),pickupTime:'09:00',dropoffTime:'21:00',earlyPickupDays:0,extendedReturnDays:0,extraDayFeeCents:0};
  useEffect(()=>{
    if(!eventDate||!selected.length||!catalog.length){setAvailability(null);return;}
    let cancelled=false;setAvailability(null);
    Promise.all(selected.map(async line=>{
      const {data,error}=await supabase.rpc('get_reservation_item_availability',{p_item_id:Number(line.id),p_pickup:range.pickup,p_dropoff:range.dropoff});
      return !error&&Number(data)>=Number(line.quantity||1);
    })).then(checks=>{if(!cancelled)setAvailability(checks.every(Boolean));}).catch(()=>{if(!cancelled)setAvailability(false)});
    return()=>{cancelled=true};
  },[eventDate,selected,catalog]);
  async function pay(){
    if(busy||!accepted||!ready||!availability||!address.trim()||!name.trim()||!email.trim()||!selected.length)return;
    setBusy(true);setError('');
    try{
      const paymentToken=await tokenize.current();
      const response=await fetch(`${API_BASE}/square?resource=g-events-booking`,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          customer:{name:name.trim(),email:email.trim(),phone:phone.trim()||null},
          rentalDates:range,
          items:selected.map(x=>({id:x.id,kind:'rental',meta:null,quantity:x.quantity})),
          gEvents:{venueName:venueName.trim(),venueAddress:address.trim(),agreementAccepted:true,agreementVersion:'g-events-v1',package:pkg?configured:null},
          paymentToken,saveCardOnFile:true,manualPaymentAcknowledged:false
        })
      });
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'Could not complete the reservation.');
      if(result.bookingNumber)window.sessionStorage.setItem('asliceofg-pending-booking-number',result.bookingNumber);
      if(result.redirectUrl){window.location.assign(withBasePath(result.redirectUrl));return;}
      throw new Error('Payment response did not include a confirmation page. Please contact us before trying again.');
    }catch(e){setError(e.message||'Unable to start booking');setBusy(false)}
  }
  return <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-3" role="dialog" aria-modal="true" aria-label="A Slice of G Events checkout">
    <div className="max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 text-[#143d2a] shadow-2xl">
      <button type="button" onClick={onClose} className="float-right text-2xl" aria-label="Close checkout">×</button>
      <p className="text-xs font-bold uppercase tracking-widest text-[#997a3a]">A Slice of G · Events</p>
      <h2 className="mt-2 font-serif text-3xl">Your Event Reservation</h2>
      <p className="mt-2 text-sm">Delivery, installation and collection are handled by our team. There is no self-pickup option.</p>
      <div className="mt-5 space-y-2">{lines.map(x=><div key={x.id} className="flex justify-between border-b py-3 text-sm"><span><span className="block">{x.record?.name||'Rental item'}</span><span className="mt-2 flex items-center gap-3"><button type="button" className="rounded border px-2" aria-label="Decrease quantity" onClick={()=>setQuantity(x.id,'rental',x.quantity-1,x.meta)}>−</button><strong>{x.quantity}</strong><button type="button" className="rounded border px-2" aria-label="Increase quantity" onClick={()=>setQuantity(x.id,'rental',x.quantity+1,x.meta)}>+</button><button type="button" className="text-xs underline" onClick={()=>removeFromCart(x.id,'rental',x.meta)}>Remove</button></span></span><strong>{cash(Math.round(Number(x.record?.rental_price||0)*100)*x.quantity)}</strong></div>)}</div>
      {pkg&&<div className="rounded-lg bg-[#F8F3E8] p-4 text-sm"><h3 className="font-bold">Your treat cart configuration</h3><p>{pkg.guests} guests{pkg.attendants?` · ${pkg.attendants} attendants for ${pkg.hours} hours`:''}</p>{pkg.lines.map(l=><p key={l.id}>{l.quantity} × {l.name}: {cash(l.totalCents)}</p>)}{pkg.staffCents>0&&<p>Staffed service: {cash(pkg.staffCents)}</p>}<strong>Treats and staffing: {cash(pkg.addonsCents)}</strong></div>}
      {!selected.length&&<p className="mt-4 text-red-700">No G Events rentals were found in the cart.</p>}
      <div className="mt-5 grid gap-3"><label className="text-sm">Event date<input className="mt-1 w-full rounded border p-3" type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)}/></label>
      <label className="text-sm">Event venue name (optional)<input className="mt-1 w-full rounded border p-3" value={venueName} onChange={e=>setVenueName(e.target.value)}/></label>
      <label className="text-sm">Event venue / delivery address<textarea className="mt-1 w-full rounded border p-3" rows="2" value={address} onChange={e=>setAddress(e.target.value)} placeholder="Venue name, street address, Toronto / GTA"/></label>
      <label className="text-sm">Full name<input className="mt-1 w-full rounded border p-3" value={name} onChange={e=>setName(e.target.value)}/></label>
      <label className="text-sm">Email<input className="mt-1 w-full rounded border p-3" type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
      <label className="text-sm">Phone<input className="mt-1 w-full rounded border p-3" type="tel" value={phone} onChange={e=>setPhone(e.target.value)}/></label></div>
      <p className="mt-3 text-sm">{availability===null?'Checking date availability…':availability?'Selected items are available for the provisional booking window.':'One or more items are unavailable for that date.'}</p>
      <div className="mt-4 rounded-lg bg-[#f6f0e4] p-4 text-sm"><p>Rental subtotal: <strong>{cash(subtotal)}</strong></p>{pkg&&<p>Treats and staffing: <strong>{cash(pkg.addonsCents)}</strong></p>}<p>Package total: <strong>{cash(grandTotal)}</strong></p><p>Estimated 50% booking deposit: <strong>{cash(deposit)}</strong></p><p>Estimated security deposit: <strong>{cash(security)}</strong></p><p className="mt-2">Delivery, setup and collection are included in the rental price. Selected treats and staffing are included in the package total above.</p></div>
      <label className="mt-5 flex gap-2 text-sm"><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)}/>I agree to the G Events booking terms displayed above and below, including delivery-only service, the 50% booking deposit, remaining balance due seven days before the reserved date window, and refundable security deposit due 48 hours before the reserved date window. Delivery and collection appointment times will be coordinated separately.</label>
       <div className="mt-4 rounded-lg border border-[#D8C69D] bg-[#FFFDF7] p-4 text-sm leading-6">
         <h3 className="font-bold">G Events booking terms · v1</h3>
         <p>Delivery, setup and collection are included in the listed rental price. Self-pickup is not available. The calendar dates surrounding your event are inventory holds, not promised delivery or collection appointment times. We will coordinate access and scheduling with you.</p>
         <p className="mt-2">A 50% booking deposit is collected now. The remaining balance is due seven days before the reserved delivery window, and a refundable security deposit is due 48 hours before that window. The security deposit is subject to return inspection and the applicable rental agreement. Applicable taxes may be charged where required.</p>
         <p className="mt-2">Rental damage, cancellation and refund provisions require the full rental agreement supplied by A Slice of G. Acceptance here records these disclosed checkout terms; it does not replace a separately required signed rental contract.</p>
       </div>
      {error&&<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="mt-5 rounded-lg border p-4"><h3 className="mb-3 font-bold">Secure deposit payment</h3>
         <SquareCardPayment amountCents={deposit} name={name} email={email} phone={phone} saveCard={true} onReady={onCardReady}/>
       </div>
       <button type="button" onClick={pay} disabled={busy||!ready||!accepted||!availability||!address.trim()||!name.trim()||!email.trim()||!selected.length}
         className="mt-4 w-full rounded-lg bg-[#0B4933] p-4 font-bold text-white disabled:opacity-40">{busy?'PROCESSING…':`PAY ${cash(deposit)} DEPOSIT`}</button>
    </div>
  </div>;
}
