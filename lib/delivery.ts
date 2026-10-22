/**
 * Delivery pricing, measured from the Eroor godown.
 *
 *   Up to 15 km      free
 *   15 to 40 km      Rs 25 per km beyond 15, rounded up
 *   Beyond 40 km     we do not deliver
 *
 * The distances are a FIXED TABLE on purpose, not a live lookup. Rs 25 a km is
 * a number customers argue about, so the same pincode must always produce the
 * same fee, and Eby has to be able to defend it on a call. A live API would
 * also give us a checkout that breaks when someone else's service is down.
 *
 * ============================================================================
 * EVERY `km` BELOW IS AN UNVERIFIED ESTIMATE. Check each one against Google
 * Maps, godown to pincode, by road, before taking real bookings. Correcting a
 * row here is the whole job: nothing else needs touching.
 *
 * A pincode NOT in this table is not guessed at. The customer is told the fee
 * will be confirmed on WhatsApp, which is honest and costs us one message.
 * Add rows as you learn them.
 * ============================================================================
 */

export const GODOWN = 'Eroor, Kochi';
export const FREE_RADIUS_KM = 15;
export const PER_KM = 25;
export const MAX_RADIUS_KM = 40;

type Place = { area: string; km: number };

const PLACES: Record<string, Place> = {
  // Free band, within 15 km
  '682306': { area: 'Eroor', km: 1 },
  '682309': { area: 'Irumpanam', km: 4 },
  '682301': { area: 'Tripunithura', km: 4 },
  '682307': { area: 'Udayamperoor', km: 6 },
  '682304': { area: 'Maradu', km: 5 },
  '682040': { area: 'Nettoor', km: 6 },
  '682302': { area: 'Ambalamugal', km: 7 },
  '682506': { area: 'Panangad', km: 7 },
  '682019': { area: 'Vyttila', km: 7 },
  '682033': { area: 'Chambakkara', km: 6 },
  '682013': { area: 'Thevara', km: 8 },
  '682020': { area: 'Kadavanthra', km: 9 },
  '682036': { area: 'Panampilly Nagar', km: 9 },
  '682028': { area: 'Vennala', km: 9 },
  '682312': { area: 'Chottanikkara', km: 10 },
  '682016': { area: 'Ernakulam South', km: 10 },
  '682017': { area: 'Kaloor', km: 11 },
  '682025': { area: 'Palarivattom', km: 11 },
  '682010': { area: 'Edakochi', km: 11 },
  '682314': { area: 'Mulanthuruthy', km: 12 },
  '682018': { area: 'Ernakulam North', km: 12 },
  '682030': { area: 'Kakkanad', km: 12 },
  '682005': { area: 'Thoppumpady', km: 12 },
  '682021': { area: 'Thrikkakara', km: 13 },
  '682042': { area: 'Infopark', km: 13 },
  '682003': { area: 'Willingdon Island', km: 13 },
  '682024': { area: 'Edappally', km: 14 },
  '682311': { area: 'Kolenchery', km: 14 },
  '682308': { area: 'Puthencruz', km: 14 },
  '682006': { area: 'Palluruthy', km: 14 },
  '682002': { area: 'Mattancherry', km: 15 },

  // Charged band, 15 to 40 km
  '682001': { area: 'Fort Kochi', km: 17 },
  '683104': { area: 'Kalamassery', km: 17 },
  '682034': { area: 'Cheranalloor', km: 18 },
  '683561': { area: 'Pukkattupady', km: 20 },
  '683562': { area: 'Kizhakkambalam', km: 20 },
  '686664': { area: 'Piravom', km: 22 },
  '683517': { area: 'Varapuzha', km: 24 },
  '683101': { area: 'Aluva', km: 25 },
  '683542': { area: 'Perumbavoor', km: 30 },
  '683513': { area: 'North Paravur', km: 30 },
  '686141': { area: 'Vaikom', km: 33 },
  '686662': { area: 'Koothattukulam', km: 33 },
  '683572': { area: 'Angamaly', km: 38 },
  '686661': { area: 'Muvattupuzha', km: 38 }
};

export type DeliveryQuote =
  | { state: 'empty' }
  | { state: 'invalid' }
  /** Known pincode we serve. `fee` is 0 inside the free radius. */
  | { state: 'quoted'; pincode: string; area: string; km: number; fee: number }
  /** Known pincode beyond the limit. */
  | { state: 'too-far'; pincode: string; area: string; km: number }
  /** Not in the table. We may well deliver, we just will not invent a price. */
  | { state: 'unknown'; pincode: string };

export function feeForKm(km: number): number {
  if (km <= FREE_RADIUS_KM) return 0;
  return Math.ceil(km - FREE_RADIUS_KM) * PER_KM;
}

export function quote(raw: string): DeliveryQuote {
  const pincode = raw.replace(/\D/g, '');
  if (pincode.length === 0) return { state: 'empty' };
  if (pincode.length !== 6) return { state: 'invalid' };

  const place = PLACES[pincode];
  if (!place) return { state: 'unknown', pincode };

  if (place.km > MAX_RADIUS_KM) {
    return { state: 'too-far', pincode, area: place.area, km: place.km };
  }

  return {
    state: 'quoted',
    pincode,
    area: place.area,
    km: place.km,
    fee: feeForKm(place.km)
  };
}

export function rupees(n: number): string {
  return 'Rs ' + n.toLocaleString('en-IN');
}

/** Short label for the header pill. */
export function quoteLabel(q: DeliveryQuote): string {
  if (q.state === 'quoted') {
    return q.fee === 0 ? `${q.area}, free delivery` : `${q.area}, +${rupees(q.fee)}`;
  }
  return 'Check delivery';
}

/** One plain sentence a customer can act on. */
export function quoteSentence(q: DeliveryQuote): string {
  switch (q.state) {
    case 'quoted':
      return q.fee === 0
        ? `${q.area} is about ${q.km} km from our godown, inside the free range.`
        : `${q.area} is about ${q.km} km out. Delivery is ${rupees(q.fee)}, which is ${rupees(PER_KM)} a km beyond the first ${FREE_RADIUS_KM} km.`;
    case 'too-far':
      return `${q.area} is about ${q.km} km away. We deliver up to ${MAX_RADIUS_KM} km, so we cannot bring it there. You are welcome to collect from the godown in ${GODOWN}.`;
    case 'unknown':
      return `We have not measured ${q.pincode} yet. Book anyway and we will confirm the delivery fee on WhatsApp before anything is charged.`;
    case 'invalid':
      return 'That is not a six digit pincode.';
    default:
      return '';
  }
}
