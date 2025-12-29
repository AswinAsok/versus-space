import { DODO_PAYMENTS_CONFIG } from '../config/plans';

interface CheckoutParams {
  email: string;
  userId: string;
  customerName?: string;
}

/**
 * Generates a DodoPayments checkout URL for the Pro plan
 * Uses static payment link with pre-filled customer info
 */
export function getProCheckoutUrl({ email, userId, customerName }: CheckoutParams): string {
  const { proProductId, checkoutBaseUrl, successUrl, cancelUrl } = DODO_PAYMENTS_CONFIG;

  const params = new URLSearchParams({
    email,
    redirect_url: successUrl,
    cancel_url: cancelUrl,
  });

  // Pass userId as metadata using bracket notation for nested object
  params.set('metadata[userId]', userId);

  if (customerName) {
    params.set('name', customerName);
  }

  return `${checkoutBaseUrl}/${proProductId}?${params.toString()}`;
}

/**
 * Redirects user to DodoPayments checkout
 */
export function redirectToCheckout(params: CheckoutParams): void {
  const checkoutUrl = getProCheckoutUrl(params);
  window.location.href = checkoutUrl;
}
