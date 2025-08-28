// cypress/support/commands.js

// Plugins
import 'cypress-file-upload';

// قلل الفلايكينس: ما تطيّحش التست بسبب أخطاء JS ديال السايت
Cypress.on('uncaught:exception', () => false);

// بديل بسيط لـ cy.idle اللي كانت كتعطي error
Cypress.Commands.add('idle', (ms = 200) => cy.wait(ms));

// عطّل الأنيميشنز باش العناصر تبان ثابتة
Cypress.Commands.add('disableAnimations', () => {
  const styles = `
    * { transition: none !important; animation: none !important; caret-color: transparent !important; }
    html { scroll-behavior: auto !important; }
  `;
  cy.document().then((doc) => {
    const style = doc.createElement('style');
    style.id = 'e2e-no-anim';
    style.innerHTML = styles;
    doc.head.appendChild(style);
  });
});

// سناير جاهزية الصفحة
Cypress.Commands.add('waitForPageReady', () => {
  cy.document().its('readyState').should('eq', 'complete');
  cy.disableAnimations();
});

// ===== Checkout helpers (iframe-safe, no CSS4 selectors) =====

// رجّع root اللي غادي نخدمو عليه (body ولا iframe ديال الcheckout)
Cypress.Commands.add('getCheckoutRoot', () => {
  const guess =
    'iframe[src*="check"], iframe[id*="check"], iframe[name*="check"], iframe[src*="secure"], iframe[src*="auth"]';
  return cy.get('body').then(($body) => {
    const $ifr = $body.find(guess);
    if ($ifr.length) {
      return cy
        .wrap($ifr.first())
        .its('0.contentDocument.body', { log: false })
        .should('not.be.empty')
        .then((b) => cy.wrap(b));
    }
    return cy.wrap($body);
  });
});

// cypress/support/commands.js
Cypress.Commands.add('closeBannersIfAny', () => {
  return cy.getCheckoutRoot().then(($root) => {
    const candSel = 'button,[role="button"],[aria-label],[title],.close,[data-testid*="close"],.cookie,.cookies,.cc-window button'
    const rx = /(accepter|j'accepte|ok|fermer|close|dismiss|×|x)/i
    const $btns = $root.find(candSel).filter((_, el) => {
      const t = (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '').toLowerCase().trim()
      return rx.test(t)
    })
    if ($btns.length) cy.wrap($btns[0]).click({ force: true })
  })
})


// إلا كان سويتش بين Téléphone/Email بدّل ل Email
Cypress.Commands.add('ensureEmailMode', () => {
  return cy.getCheckoutRoot().then(($root) => {
    const $switch = $root
      .find('button,[role=tab],a')
      .filter((_, el) => /e-?mail|courriel/i.test(el.textContent || ''));
    if ($switch.length) cy.wrap($switch[0]).click({ force: true });
  });
});

// قلب على input ديال الإيميل بطريقة JS فلترة (ماشي CSS4)
Cypress.Commands.add('findEmailInput', () => {
  return cy.getCheckoutRoot().then(($root) => {
    const $cands = $root.find('input,textarea');
    const $match = $cands.filter((_, el) => {
      const t = (el.getAttribute('type') || '').toLowerCase();
      const n = (el.getAttribute('name') || '').toLowerCase();
      const id = (el.getAttribute('id') || '').toLowerCase();
      const ph = (el.getAttribute('placeholder') || '').toLowerCase();
      return t === 'email' || n.includes('mail') || id.includes('mail') || ph.includes('mail');
    });
    return cy.wrap($match.first());
  });
});

// بديل: قلب على input ديال التليفون إلا ما لقيناش الإيميل
Cypress.Commands.add('findPhoneInput', () => {
  return cy.getCheckoutRoot().then(($root) => {
    const $cands = $root.find('input,textarea');
    const $match = $cands.filter((_, el) => {
      const t = (el.getAttribute('type') || '').toLowerCase();
      const n = (el.getAttribute('name') || '').toLowerCase();
      const id = (el.getAttribute('id') || '').toLowerCase();
      const ph = (el.getAttribute('placeholder') || '').toLowerCase();
      return (
        t === 'tel' ||
        n.includes('tel') ||
        n.includes('phone') ||
        id.includes('tel') ||
        id.includes('phone') ||
        ph.includes('télé') ||
        ph.includes('phone')
      );
    });
    return cy.wrap($match.first());
  });
});

// كليكة على Continuer / Suivant / Livraison
Cypress.Commands.add('clickContinueOnIdentification', () => {
  return cy.getCheckoutRoot().then(($root) => {
    const $btn = $root
      .find('button,a')
      .filter((_, el) => /continuer|suivant|livraison|adresse|next/i.test(el.textContent || ''));
    if ($btn.length) cy.wrap($btn[0]).click({ force: true });
  });
});
