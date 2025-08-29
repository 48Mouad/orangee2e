import { waitForLoad, acceptCookiesIfPresent } from '../../support/helpers/dom';
import { getBuyButtons, openOfferByIndex } from '../../support/helpers/cart';

describe('Offres Prépayées – Liste', () => {
  beforeEach(() => {
    cy.viewport(1366, 768);
    cy.visit('/prepaid-mobile-plans', { timeout: 30000 });
    waitForLoad();
    acceptCookiesIfPresent();
  });

  it('TC01 - Accès à la page (≥3 offres et ≥3 Acheter)', () => {
    cy.url().should('include', '/prepaid-mobile-plans');
    cy.contains('main', /Carte\s*SIM\s*Prépayée/i).should('be.visible');
    getBuyButtons().should('have.length.at.least', 3);
  });

  it('TC02 - Ouvrir les détails de 3 offres', () => {
    [0,1,2].forEach((i) => {
      cy.visit('/prepaid-mobile-plans', { timeout: 30000 });
      waitForLoad();
      acceptCookiesIfPresent();
      openOfferByIndex(i);
      cy.get('body').then(($b) => {
        const close = $b.find('button, [role="button"]').filter((i, el) =>
          /fermer|close|x/i.test(el.innerText || el.getAttribute('aria-label') || '')
        ).first();
        if (close.length) cy.wrap(close).click({ force: true });
      });
    });
  });
});
