/** Shared between the header check and anything that reacts to it. */
export const STORAGE_KEY = 'nestloop-pincode';

/**
 * Fired on window when the visitor sets or changes their pincode, so the
 * delivery line on the unit page updates without a reload. localStorage's own
 * `storage` event only fires in OTHER tabs, which is not what we need here.
 */
export const PINCODE_EVENT = 'nestloop:pincode';

export function announcePincode() {
  window.dispatchEvent(new Event(PINCODE_EVENT));
}
