import { selectFirstAvailableType } from '../support/helpers/cart';
import { addToCartAndConfirm, goToCartStrict, assertCartNonEmpty } from '../support/helpers/cart';
import { acceptCookiesIfPresent } from '../support/helpers/dom';

describe('STORY — Ajouter → post-panier → panier (+remplacer) [LIGHT]', () => {
  it('TC-STORY (light): parcours minimal', () => {
    cy.visit('/prepaid-mobile-plans', { timeout: 30000 });
    cy.wait(50);
    acceptCookiesIfPresent();

    // افتح تفاصيل عرض
    cy.contains('a,button', /^acheter$/i, { timeout: 15000 }).first().click({ force: true });

    // اختَر نوع باش يتفعّل الزر
    selectFirstAvailableType();

    // دابا كيولي الزر مفعّل
    addToCartAndConfirm();
    goToCartStrict();
    assertCartNonEmpty();
  });
});
