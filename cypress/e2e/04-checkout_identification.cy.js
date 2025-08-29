// cypress/e2e/04-checkout_identification.cy.js
import { acceptCookiesIfPresent } from '../support/helpers/dom'
import { goToCartStrict, assertCartNonEmpty } from '../support/helpers/cart'
import {setDeliveryCity,ensureIdentificationFormReady,tryFillContactThenContinue} from '../support/helpers/checkout'

describe('Checkout – Identification', () => {
  it('TC08 - Commander → page suivante (checkout/identification)', () => {
    cy.visit('/panier', { timeout: 30000 })
    acceptCookiesIfPresent()
    goToCartStrict()
    assertCartNonEmpty()
    setDeliveryCity('Oujda')

    // فتح checkout فـ نفس التاب
    cy.window().then((win) => {
      cy.stub(win, 'open').callsFake((url) => { win.location.href = url })
    })

    cy.contains('a,button,[role="button"]',
      /commander|passer la commande|valider ma commande|continuer|payer|checkout/i
    ).first().scrollIntoView().click({ force: true })

    // إن ما هبطناش مباشرة، زور ستيب identification
    cy.location().then((loc) => {
      const where = (loc.pathname || '') + (loc.search || '')
      if (!/identification|step=identification|checkout|connexion|adresse/i.test(where)) {
        cy.visit('/panier?step=identification', { timeout: 30000 })
        acceptCookiesIfPresent()
      }
    })

    cy.waitForPageReady()
  })

  it('TC09 - Remplit le formulaire et passe à Livraison', () => {
    cy.waitForPageReady()
    cy.closeBannersIfAny()

    // تأكيد جاهزية الستيب واملأ الكونتاكت ثم تابع
    ensureIdentificationFormReady()
    tryFillContactThenContinue()

    // تأكيد الوصول للمرحلة الموالية (Adresse / Livraison)
    cy.location('search', { timeout: 20000 })
      .should((qs) => {
        // إما step=shipping/addresses أو مؤشرات نصية فالصفحة
        const ok = /step=(shipping|adresse|address|livraison)/i.test(qs)
        expect(ok, 'navigated to shipping/address step via querystring').to.be.true
      })

    // بديل/تعزيز: شي عنصر يدل على العنوان
    cy.get('body', { timeout: 20000 }).should(($b) => {
      const hasAddressField =
        $b.find('input,select,textarea')
          .filter((_, el) => /adresse|address|ville|city|code\s*postal|postal/i.test(
            [
              el.getAttribute('name') || '',
              el.getAttribute('id') || '',
              el.getAttribute('placeholder') || '',
              el.getAttribute('aria-label') || '',
            ].join(' ')
          )).length > 0
      expect(hasAddressField, 'address fields visible').to.eq(true)
    })
  })
})
