// WAVE
export const WAVE_CHECKOUT_URL = `https://api.wave.com/v1/checkout/sessions`;
export const WAVE_PAYOUT_URL = `https://api.wave.com/v1/payout`;

// ORANGE MONEY
export const ORANGE_MONEY_API_URL = 'https://api.orange-sonatel.com';
export const ORANGE_MONEY_GRANT_TYPE = 'client_credentials';

// PAYMENT VALIDITY
export const PAYEMENT_VALIDITY = 3600;

// DEFAULT REDIRECT URL
export const DEFAULT_CANCEL_URL = `https://${process.env.APP_DOMAIN}/cancel`;
export const DEFAULT_SUCCESS_URL = `https://${process.env.APP_DOMAIN}/success`;
