// lib/loadPhonePe.ts
export function loadPhonePeCheckout() {
    if (typeof window === 'undefined') return Promise.resolve();
    if (document.getElementById('phonepe-checkout-js')) return Promise.resolve();
  
    return new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.id = 'phonepe-checkout-js';
      s.src = 'https://mercury.phonepe.com/web/bundle/checkout.js';
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load PhonePe checkout.js'));
      document.body.appendChild(s);
    });
  }
  