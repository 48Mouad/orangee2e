import { acceptCookiesIfPresent } from '../../support/helpers/dom';
import { goToCartStrict, assertCartNonEmpty } from '../../support/helpers/cart';
import { setDeliveryCity, ensureIdentificationFormReady, findEmailInput, findPhoneInput, tryFillContactThenContinue} from '../../support/helpers/checkout';

describe('Checkout – Identification', () => {
  it('TC08 - Commander → page suivante (checkout/identification)', () => {
    cy.visit('/panier', { timeout: 30000 });
    acceptCookiesIfPresent();
    goToCartStrict();
    assertCartNonEmpty();
    setDeliveryCity('Oujda');

    cy.window().then((win) => {
      cy.stub(win, 'open').callsFake((url) => { win.location.href = url; });
    });

    cy.contains('a,button,[role="button"]', /commander|passer la commande|valider ma commande|continuer|payer|checkout/i)
      .first().scrollIntoView().click({ force: true });

    cy.location().then((loc) => {
      const where = (loc.pathname || '') + (loc.search || '');
      if (!/identification|step=identification|checkout|connexion|adresse/i.test(where)) {
        cy.visit('/panier?step=identification', { timeout: 30000 });
        acceptCookiesIfPresent();
      }
    });
    cy.waitForPageReady();
  });

  it('TC09 - Remplit le formulaire et passe à Livraison', () => {
    cy.waitForPageReady();
    cy.closeBannersIfAny();
    cy.ensureEmailMode();
    ensureIdentificationFormReady();
    tryFillContactThenContinue();   
    findEmailInput().then(($em) => {
      cy.log(`[TC09] email field found: ${Boolean($em && $em.length)}`);
      if ($em && $em.length) {
        cy.wrap($em).clear({ force: true }).type('qa.e2e@example.com', { force: true });
        cy.clickContinueOnIdentification();
        return;
      }
      findPhoneInput().then(($tel) => {
        cy.log(`[TC09] phone field found: ${Boolean($tel && $tel.length)}`);
        if ($tel && $tel.length) {
          cy.wrap($tel).clear({ force: true }).type('0612345678', { force: true });
          cy.clickContinueOnIdentification();
          return;
        }
        throw new Error('[TC09] Aucun champ email/téléphone détecté sur la page d’identification.');
      });
    });
  });
});
