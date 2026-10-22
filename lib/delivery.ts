/**
 * Delivery is Kochi city, roughly 20 km from the Vennala godown. Around 70% of
 * ad leads come from outside that, so the check belongs at the top of the
 * catalog rather than at checkout.
 *
 * Kept as a prefix list on purpose: a precise polygon is not worth it, and the
 * cost of a wrong answer is a phone call, not a failed delivery.
 */

const INSIDE_PREFIXES = ['68200', '68201', '68202', '68203', '68204'];

/** Named areas, so the answer reads as a place rather than a number. */
const AREAS: Record<string, string> = {
  '682001': 'Fort Kochi',
  '682011': 'Ernakulam North',
  '682016': 'Panampilly Nagar',
  '682017': 'Kadavanthra',
  '682018': 'Palarivattom',
  '682019': 'Vyttila',
  '682020': 'Kaloor',
  '682021': 'Edappally',
  '682024': 'Edappally North',
  '682025': 'Vennala',
  '682026': 'Elamakkara',
  '682028': 'Thrikkakara',
  '682030': 'Kakkanad',
  '682033': 'Thevara',
  '682036': 'Maradu',
  '682037': 'Tripunithura',
  '682041': 'Chottanikkara'
};

export type DeliveryCheck =
  | { state: 'empty' }
  | { state: 'invalid' }
  | { state: 'inside'; pincode: string; area: string | null }
  | { state: 'outside'; pincode: string };

export function checkPincode(raw: string): DeliveryCheck {
  const pincode = raw.replace(/\D/g, '');
  if (pincode.length === 0) return { state: 'empty' };
  if (pincode.length !== 6) return { state: 'invalid' };

  const inside = INSIDE_PREFIXES.some((p) => pincode.startsWith(p));
  if (!inside) return { state: 'outside', pincode };

  return { state: 'inside', pincode, area: AREAS[pincode] ?? null };
}

export function areaLabel(check: DeliveryCheck): string {
  if (check.state === 'inside') {
    return check.area ? `${check.area} ${check.pincode}` : check.pincode;
  }
  return 'Kochi, within 20 km';
}
