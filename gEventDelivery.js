// Event delivery pricing. All charges CAD cents, applied once per booking.
// GTA L-prefixed FSAs beyond the standard included zones are $50. We avoid
// quoting distant L2/L8/L9 or rural L0 postal codes automatically.
export function gEventDeliveryZone(postalInput) {
  const postal=String(postalInput||'').replace(/\s/g,'').toUpperCase();
  if(!/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(postal)||/[DFIOQU]/.test(postal))return null;
  const fsa=postal.slice(0,3);
  if(postal[0]==='M'||['L1S','L1T','L1V','L1W','L1X','L1Z'].includes(fsa))return {feeCents:0,label:'Included delivery, setup & collection'};
  if(/^L[134567]/.test(fsa))return {feeCents:5000,label:'Extended GTA delivery, setup & collection'};
  return null;
}
