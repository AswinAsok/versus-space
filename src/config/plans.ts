export const FREE_PLAN_POLL_LIMIT = 3;
export const FREE_PLAN_POLL_DURATION_MINUTES = 15;
export const SUPERADMIN_EMAILS = ['aswinasokofficial@gmail.com'];

// DodoPayments Configuration
export const DODO_PAYMENTS_CONFIG = {
  // Replace with your actual DodoPayments product ID from the dashboard
  proProductId: import.meta.env.VITE_DODO_PRO_PRODUCT_ID || 'your_product_id_here',
  checkoutBaseUrl: 'https://checkout.dodopayments.com/buy',
  // Success and cancel redirect URLs
  successUrl: `${window.location.origin}/dashboard?upgrade=success`,
  cancelUrl: `${window.location.origin}/dashboard?upgrade=cancelled`,
};

// Pro plan pricing - One-time lifetime payment
export const PRO_PLAN_PRICE = 1; // $1 USD one-time lifetime payment
