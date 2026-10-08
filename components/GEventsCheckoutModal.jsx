import React, {useCallback,useEffect,useMemo,useRef,useState} from "react";
import {useCart} from "../CartContext";
import {supabase} from "../supabaseClient";
import {API_BASE,withBasePath} from "../apiBase";
import SquareCardPayment from "./SquareCardPayment";
import {calculateGPackage} from "../gEventsPricing";
import {gEventDeliveryZone} from "../gEventDelivery";
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
  const [postalCode,setPostalCode]=useState('');
  const zone=gEventDeliveryZone(postalCode);
  const grandTotal=subtotal+(pkg?.addonsCents||0)+(zone?.feeCents||0);
  const deposit=estimateBookingDepositCents(grandTotal);
  const security=estimateSecurityDepositCents(grandTotal);
  const [name,setName]=useState('');const [email,setEmail]=useState('');const [phone,setPhone]=useState('');
  const [venueName,setVenueName]=useState('');const [address,setAddress]=useState('');const [eventDate,setEventDate]=useState(rentalDates.event||'');
  const [accepted,setAccepted]=useState(false);const [reviewed,setReviewed]=useState(false);const [showAgreement,setShowAgreement]=useState(false);const agreementCloseRef=useRef(null);const [ready,setReady]=useState(false);
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
    if(busy||!accepted||!reviewed||!ready||!availability||!address.trim()||!zone||!name.trim()||!email.trim()||!selected.length)return;
    setBusy(true);setError('');
    try{
      const paymentToken=await tokenize.current();
      const response=await fetch(`${API_BASE}/square?resource=g-events-booking`,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          customer:{name:name.trim(),email:email.trim(),phone:phone.trim()||null},
          rentalDates:range,
          items:selected.map(x=>({id:x.id,kind:'rental',meta:null,quantity:x.quantity})),
          gEvents:{venueName:venueName.trim(),venueAddress:address.trim(),postalCode:postalCode.trim().toUpperCase(),agreementAccepted:true,agreementReviewed:reviewed,agreementVersion:'asg-events-terms-2026-10-08',package:pkg?configured:null},
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
      <p className="mt-2 text-sm">Delivery, installation and collection are handled by our team. The cart can remain on-site for up to 8 event hours; your setup-ready and collection times are confirmed with the venue. There is no self-pickup option.</p>
      <div className="mt-5 space-y-2">{lines.map(x=><div key={x.id} className="flex justify-between border-b py-3 text-sm"><span><span className="block">{x.record?.name||'Rental item'}</span><span className="mt-2 flex items-center gap-3"><button type="button" className="rounded border px-2" aria-label="Decrease quantity" onClick={()=>setQuantity(x.id,'rental',x.quantity-1,x.meta)}>−</button><strong>{x.quantity}</strong><button type="button" className="rounded border px-2" aria-label="Increase quantity" onClick={()=>setQuantity(x.id,'rental',x.quantity+1,x.meta)}>+</button><button type="button" className="text-xs underline" onClick={()=>removeFromCart(x.id,'rental',x.meta)}>Remove</button></span></span><strong>{cash(Math.round(Number(x.record?.rental_price||0)*100)*x.quantity)}</strong></div>)}</div>
      {pkg&&<div className="rounded-lg bg-[#F8F3E8] p-4 text-sm"><h3 className="font-bold">Your treat cart configuration</h3><p>{pkg.guests} guests{pkg.attendants?` · ${pkg.attendants} attendants for ${pkg.hours} hours`:''}</p>{pkg.lines.map(l=><p key={l.id}>{l.quantity} × {l.name}: {cash(l.totalCents)}</p>)}{pkg.staffCents>0&&<p>Staffed service: {cash(pkg.staffCents)}</p>}<strong>Treats and staffing: {cash(pkg.addonsCents)}</strong></div>}
      {!selected.length&&<p className="mt-4 text-red-700">No G Events rentals were found in the cart.</p>}
      <div className="mt-5 grid gap-3"><label className="text-sm">Event date<input className="mt-1 w-full rounded border p-3" type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)}/></label>
      <label className="text-sm">Event venue name (optional)<input className="mt-1 w-full rounded border p-3" value={venueName} onChange={e=>setVenueName(e.target.value)}/></label>
      <label className="text-sm">Event venue / delivery address<textarea className="mt-1 w-full rounded border p-3" rows="2" value={address} onChange={e=>setAddress(e.target.value)} placeholder="Venue name, street address, Toronto / GTA"/></label>
      <label className="text-sm">Event postal code<input className="mt-1 w-full rounded border p-3" autoComplete="postal-code" value={postalCode} onChange={e=>setPostalCode(e.target.value)} placeholder="M5V 2T6" maxLength={7}/></label>
      <p className="text-sm">{zone?zone.feeCents?`Extended GTA delivery: ${cash(zone.feeCents)}`:"Delivery, setup and collection included at no extra charge.":"Enter an eligible Toronto or GTA postal code to calculate delivery. For other areas, contact us before booking."}</p>
      <label className="text-sm">Full name<input className="mt-1 w-full rounded border p-3" value={name} onChange={e=>setName(e.target.value)}/></label>
      <label className="text-sm">Email<input className="mt-1 w-full rounded border p-3" type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
      <label className="text-sm">Phone<input className="mt-1 w-full rounded border p-3" type="tel" value={phone} onChange={e=>setPhone(e.target.value)}/></label></div>
      <p className="mt-3 text-sm">{availability===null?'Checking date availability…':availability?'Selected items are available for the provisional booking window.':'One or more items are unavailable for that date.'}</p>
      <div className="mt-4 rounded-lg bg-[#f6f0e4] p-4 text-sm"><p>Rental subtotal: <strong>{cash(subtotal)}</strong></p>{pkg&&<p>Treats and staffing: <strong>{cash(pkg.addonsCents)}</strong></p>}<p>Delivery, setup &amp; collection: <strong>{zone?cash(zone.feeCents):"Enter postal code"}</strong></p><p>Package total: <strong>{cash(grandTotal)}</strong></p><p>Estimated 50% booking deposit: <strong>{cash(deposit)}</strong></p><p>Estimated security deposit: <strong>{cash(security)}</strong></p><p className="mt-2">Delivery, setup and collection are included in standard-area rental prices. Eligible extended GTA postal codes add a $50 travel fee, shown above. Treats and staffing are included in the package total above.</p></div>
      <div className="mt-4 rounded-lg border border-[#D8C69D] bg-[#FFF4EA] p-3 text-sm leading-6"><strong>Our commitments:</strong> A Slice of G products are nut-free. Standard recipes contain wheat, eggs and dairy; gluten-free options require advance arrangements. Accessibility requests are welcome. Hate speech, harassment and violence toward any person are not tolerated. <a href="/terms.html" target="_blank" rel="noreferrer" className="font-semibold underline">Full terms &amp; refund policy</a> · <a href="/accessibility.html" target="_blank" rel="noreferrer" className="underline">Accessibility</a>.</div>
      <div className="mt-5 rounded-xl border border-[#D8C69D] bg-[#FFFDF7] p-4 text-sm">
        <p className="text-xs font-bold tracking-widest text-[#9A6D45]">FINAL REVIEW</p>
        <h3 className="mt-2 font-serif text-2xl">Before we make it official.</h3>
        <p className="mt-2">Review the payments, cancellation, equipment care and conduct terms before paying your deposit.</p>
        <button type="button" onClick={()=>setShowAgreement(true)} className="mt-3 w-full rounded-lg border border-[#0B4933] p-3 font-semibold text-[#0B4933]">{reviewed?'Review agreement again':'Review contract & booking terms'}</button>
        <label className="mt-4 flex items-start gap-3 leading-6"><input type="checkbox" className="mt-1 h-5 w-5" disabled={!reviewed} checked={accepted} onChange={e=>setAccepted(e.target.checked)}/> <span>I have reviewed and agree to the <a href="https://asliceofg.com/terms.html" target="_blank" rel="noreferrer" className="underline">A Slice of G Terms &amp; Conditions</a>, including cancellation, refundable security deposits, equipment damage and zero-tolerance conduct policies. <a href="https://asliceofg.com/accessibility.html" target="_blank" rel="noreferrer" className="underline">Accessibility &amp; Inclusion</a>.</span></label>
        {!reviewed&&<p className="mt-2 text-xs">Open and review the agreement to enable the acknowledgment.</p>}
      </div>
      {false&&<label className="mt-5 flex gap-2 text-sm"><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)}/>I agree to the G Events booking terms displayed above and below, including delivery-only service, the 50% booking deposit, remaining balance due seven days before the reserved date window, and refundable security deposit due 48 hours before the reserved date window. Delivery and collection appointment times will be coordinated separately. The cart includes up to 8 on-site event hours. Staffed service covers the selected 2 or 4 continuous hours; additional hours are $75 per attendant per hour, subject to advance arrangement.</label>}
       {false&&<div className="mt-4 rounded-lg border border-[#D8C69D] bg-[#FFFDF7] p-4 text-sm leading-6">
         <h3 className="font-bold">G Events booking terms · v1</h3>
         <p>Delivery, setup and collection are included for eligible standard-area postal codes. Eligible extended GTA postal codes add $50 per booking, disclosed before payment. Self-pickup is not available. The calendar dates surrounding your event are inventory holds, not promised delivery or collection appointment times. We will coordinate access and scheduling with you. Setup is arranged before the event, and collection afterward. The cart may remain on-site for up to 8 event hours. Staffed service is limited to the selected 2 or 4 continuous hours; additional staffed time is $75 per attendant per hour by prior agreement. Additional cart hours require advance approval and pricing.</p>
         <p className="mt-2">A 50% booking deposit is collected now. The remaining balance is due seven days before the reserved delivery window, and a refundable security deposit is due 48 hours before that window. The security deposit is subject to return inspection and the applicable rental agreement. Applicable taxes may be charged where required.</p>
         <p className="mt-2">Rental damage, cancellation and refund provisions require the full rental agreement supplied by A Slice of G. Acceptance here records these disclosed checkout terms; it does not replace a separately required signed rental contract.</p>
       </div>}
      {error&&<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="mt-5 rounded-lg border p-4"><h3 className="mb-3 font-bold">Secure deposit payment</h3>
         <SquareCardPayment amountCents={deposit} name={name} email={email} phone={phone} saveCard={true} onReady={onCardReady}/>
       </div>
       <button type="button" onClick={pay} disabled={busy||!ready||!accepted||!reviewed||!availability||!address.trim()||!zone||!name.trim()||!email.trim()||!selected.length}
         className="mt-4 w-full rounded-lg bg-[#0B4933] p-4 font-bold text-white disabled:opacity-40">{busy?'PROCESSING…':`PAY ${cash(deposit)} DEPOSIT`}</button>
    </div>
    {showAgreement&&<div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 p-3" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setShowAgreement(false)}}>
      <section role="dialog" aria-modal="true" aria-labelledby="asg-review-title" onKeyDown={e=>{if(e.key==='Escape')setShowAgreement(false);if(e.key==='Tab'){const buttons=Array.from(e.currentTarget.querySelectorAll('button,a')).filter(el=>!el.hasAttribute('disabled'));const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}}} className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-[#FFFDF7] text-[#143d2a] shadow-2xl">
        <div className="flex items-start justify-between gap-3 px-6 pt-6"><div><p className="text-xs font-bold uppercase tracking-widest text-[#997a3a]">Checkout · Final review</p><h2 id="asg-review-title" className="mt-2 font-serif text-3xl">Before we make it official.</h2><p className="mt-2 text-sm">Just a few important things before we reserve your date.</p></div><button autoFocus ref={agreementCloseRef} className="text-2xl" aria-label="Close contract review" onClick={()=>setShowAgreement(false)}>×</button></div>
        <div className="overflow-y-auto px-6 py-4 text-sm leading-6"><div className="space-y-3 rounded-xl bg-[#F6F0E7] p-4"><div><strong>Payments & refunds</strong><p>50% to reserve, remaining balance due seven days before your event. Cancellation refunds depend on advance notice under the full terms.</p></div><hr/><div><strong>Refundable security deposit</strong><p>Shown separately based on your booking value, and returned following inspection subject to documented damage or loss.</p></div><hr/><div><strong>Respect & accessibility</strong><p>Accommodation requests are welcome. Hate speech, harassment, threats and violence are not tolerated.</p></div></div><p className="mt-4">Please review the complete policies:</p><div className="mt-2 flex flex-wrap gap-3"><a href="https://asliceofg.com/terms.html" target="_blank" rel="noopener noreferrer" className="font-semibold underline">Full Terms &amp; Conditions ↗</a><a href="https://asliceofg.com/accessibility.html" target="_blank" rel="noopener noreferrer" className="font-semibold underline">Accessibility &amp; Inclusion ↗</a></div><p className="mt-3 text-xs text-[#5C5645]">Your accepted version will be saved with your reservation and available in your client portal. The full policy links open separately for comfortable reading.</p></div>
        <div className="border-t bg-white p-5"><button type="button" className="w-full rounded-lg bg-[#0B4933] px-5 py-3 font-bold text-white" onClick={()=>{setReviewed(true);setShowAgreement(false)}}>I've reviewed the booking terms</button></div>
      </section>
    </div>}
  </div>;
}
