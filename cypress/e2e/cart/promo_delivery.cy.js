import { acceptCookiesIfPresent } from '../../support/helpers/dom';
import { goToCartStrict, assertCartNonEmpty } from '../../support/helpers/cart';
import { setDeliveryCity } from '../../support/helpers/checkout';

const gotoPanierDirect = () => {
  cy.visit('/panier', { timeout: 30000 });
  acceptCookiesIfPresent();
  cy.url({ timeout: 20000 }).should('match', /\/panier|\/cart|\/basket/);
  cy.get('body', { timeout: 15000 }).should(($b) => {
    const t = ($b.text() || '').toLowerCase();
    expect(/panier|votre panier|mon panier|basket|cart/i.test(t)).to.eq(true);
  });
};

const applyPromo = (code, { expectValid = false } = {}) => {
  // 0) حاول تفتح سكسيون "Code promo"
  cy.get('body', { timeout: 15000 }).then(($b) => {
    const toggle = $b.find('button,a,[role="button"],h2,h3,label')
      .filter((i, el) => /code\s*promo|coupon|bon\s*d'?achat|avoir/i.test((el.textContent || '').toLowerCase()))
      .first();
    if (toggle.length) cy.wrap(toggle).click({ force: true });
  });

  // 1) قلب على input promo
  cy.get('body', { timeout: 15000 }).then(($b) => {
    let input = $b.find('input[type="text"], input, [role="textbox"], [contenteditable="true"]').filter((i, el) => {
      const blob = [
        el.getAttribute('placeholder') || '',
        el.getAttribute('name') || '',
        el.getAttribute('id') || '',
        el.getAttribute('aria-label') || '',
        (el.closest('label')?.textContent || ''),
        (el.parentElement?.textContent || '')
      ].join(' ').toLowerCase();
      return /code\s*promo|coupon|bon\s*d'?achat|avoir|promo/i.test(blob);
    }).first();

    
    if (!input.length) {
      // fallback: أول input نصّي فهاد السكسيون
      input = $b.find('input[type="text"], input').first();
    }
    expect(input.length, 'champ "code promo"').to.be.greaterThan(0);
    cy.wrap(input).clear({ force: true }).type(code, { force: true });
  });

  // 2) زر "Appliquer"
  cy.contains('button,a,[role="button"]', /appliquer|valider|ok|ajouter/i, { timeout: 15000 })
    .first().click({ force: true });

  // 3) validation
  cy.wait(400, { log: false });
  cy.get('body', { timeout: 10000 }).then(($b) => {
    const txt = ($b.text() || '').toLowerCase();
    if (expectValid) {
      expect(/(code).*(invalide|incorrect|non valide|expir)/i.test(txt)).to.eq(false);
    } else {
      expect(
        /(code).*(invalide|incorrect|non valide|expir)/i.test(txt) ||
        /(erreur|error)/i.test(txt)
      ).to.eq(true);
    }
  });
};

describe('Panier — Code promo — Livraison Oujda — Commander', () => {
  beforeEach(() => {
    gotoPanierDirect();
    goToCartStrict();
  });

  it('TC05 - Accès direct au panier (non vide)', () => {
    assertCartNonEmpty();
  });

  it('TC06 - Code promo invalide → affiche un message d’erreur', () => {
    assertCartNonEmpty();
    applyPromo('XYZ123', { expectValid: false });
  });

  it('TC07 - Estimer la livraison pour Oujda', () => {
    assertCartNonEmpty();
    setDeliveryCity('Oujda');
  });
});
