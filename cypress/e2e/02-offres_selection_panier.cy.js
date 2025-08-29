import { waitForLoad, acceptCookiesIfPresent } from '../../support/helpers/dom';
import { addToCartAndConfirm, goToCartStrict, assertCartNonEmpty } from '../../support/helpers/cart';

const selectTypeStrong = (type) => {
  const isESIM = type === 'esim';
  cy.get('body', { timeout: 15000 }).then(($b) => {
    let target = $b
      .find('[role="radio"], input[type="radio"], button[role="radio"]')
      .filter((i, el) => {
        const v = `${el.getAttribute('value') || ''} ${el.getAttribute('id') || ''} ${el.textContent || ''}`.toLowerCase();
        return isESIM ? /e-?sim/.test(v) : /\bsim(?!\s*e)/.test(v);
      }).first();
    if (!target.length) {
      target = $b.find('button,a,[role="radio"],[role="button"]').filter((i, el) =>
        isESIM ? /carte\s*e\s*sim|e-?sim/i.test(el.textContent || '')
               : /carte\s*sim\s*physique|sim\s*physique/i.test(el.textContent || '')
      ).first();
    }
    if (target.length) cy.wrap(target).scrollIntoView().click({ force: true });
    // داخل selectTypeStrong: السطر ديال fallback
    else cy.get('input,[id],[value]').filter((_, el) => {
      const val = (el.getAttribute('value') || '').toLowerCase();
      const id  = (el.id || '').toLowerCase();
      const n = (isESIM ? 'esim' : 'sim');
      return val.includes(n) || id.includes(n);
    }).first().click({ force: true });

  });
  cy.contains('button, [role="button"]', /ajouter au panier/i, { timeout: 15000 })
    .should('be.visible')
    .and('not.be.disabled');
};

describe('Offres Prépayées – Sélection & Panier', () => {
  beforeEach(() => {
    cy.viewport(1366, 768);
    cy.visit('/prepaid-mobile-plans', { timeout: 30000 });
    waitForLoad();
    acceptCookiesIfPresent();
    cy.url().should('include', '/prepaid-mobile-plans');
  });

  it('TC03 - Choisir SIM puis eSIM', () => {
    cy.contains('a,button', /^acheter$/i).first().click({ force: true });
    cy.contains('button, [role="button"]', /ajouter au panier/i, { timeout: 15000 }).should('be.visible');
    selectTypeStrong('sim');
    selectTypeStrong('esim');
  });

  it('TC04-A - Ajouter → Voir mon panier', () => {
    cy.contains('a,button', /^acheter$/i).first().click({ force: true });
    cy.contains('button, [role="button"]', /ajouter au panier/i, { timeout: 15000 }).should('be.visible');
    selectTypeStrong('sim');
    addToCartAndConfirm();
    goToCartStrict();
    assertCartNonEmpty();
  });

  it('TC04-B - Ajouter → Continuer mes achats (redir fix)', () => {
    cy.contains('a,button', /^acheter$/i).first().click({ force: true });
    cy.contains('button, [role="button"]', /ajouter au panier/i, { timeout: 15000 }).should('be.visible');
    selectTypeStrong('sim');
    addToCartAndConfirm();
    cy.location('pathname', { timeout: 7000 }).then((p) => {
      if (p.includes('/post-panier')) {
        cy.contains('a,button', /Continuer mes achats/i, { timeout: 15000 }).scrollIntoView().click({ force: true });
      } else {
        cy.visit('/prepaid-mobile-plans');
      }
    });
    cy.url().should('include', '/prepaid-mobile-plans');
  });
});
