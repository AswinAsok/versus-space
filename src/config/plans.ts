export const FREE_PLAN_POLL_LIMIT = 3;
export const FREE_PLAN_POLL_DURATION_MINUTES = 15;
export const SUPERADMIN_EMAILS = ['aswinasokofficial@gmail.com'];

// DodoPayments Configuration
const productId = import.meta.env.VITE_DODO_PRO_PRODUCT_ID || '';

// Validate product ID format (should start with 'prd_' for DodoPayments)
const isValidProductId = Boolean(
  productId &&
  productId !== 'your_product_id_here' &&
  productId !== 'your_dodo_product_id' &&
  productId.length > 5
);

export const DODO_PAYMENTS_CONFIG = {
  // Product ID from DodoPayments dashboard
  proProductId: productId,
  // Check if product ID is properly configured
  isConfigured: isValidProductId,
  checkoutBaseUrl: 'https://checkout.dodopayments.com/buy',
  // Success and cancel redirect URLs
  successUrl: `${window.location.origin}/dashboard?upgrade=success`,
  cancelUrl: `${window.location.origin}/dashboard?upgrade=cancelled`,
};

// Pro plan pricing - One-time lifetime payment
export const PRO_PLAN_PRICE = 1; // $1 USD one-time lifetime payment
