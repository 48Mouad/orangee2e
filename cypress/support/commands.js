// cypress/support/commands.js

// تعطيل animations باش نقللو flakiness
beforeEach(() => {
  cy.window({ log: false }).then((w) => {
    const style = w.document.createElement('style');
    style.setAttribute('data-cy', 'cypress-no-anim');
    style.innerHTML = `
      * { scroll-behavior: auto !important; }
      *, *::before, *::after { transition: none !important; animation: none !important; }
    `;
    w.document.head.appendChild(style);
  });
});

// idle بسيطة وآمنة
Cypress.Commands.add('idle', (ms = 350) => {
  return cy.wait(ms, { log: false });
});

// انتظار جاهزية الصفحة بلا cy.contains وبلا data-cy ضروري
Cypress.Commands.add('waitForPageReady', (opts = {}) => {
  const { marker, fallbackTextRegex, extraSelector, timeout = 30000 } = opts;

  cy.get('body', { timeout }).should('be.visible');

  if (marker) {
    cy.get(marker, { timeout }).should('be.visible');
  }

  if (fallbackTextRegex) {
    const patterns = Array.isArray(fallbackTextRegex) ? fallbackTextRegex : [fallbackTextRegex];
    cy.get('body', { timeout }).should(($b) => {
      const t = ($b.text() || '');
      const ok = patterns.some((re) => re.test(t));
      if (!ok) throw new Error('page not ready (text not found yet)');
    });
  }

  if (extraSelector) {
    cy.get(extraSelector, { timeout }).should('be.visible');
  }

  cy.idle(250);
});

// كليك آمن
Cypress.Commands.add('safeClick', (selector, timeout = 10000) => {
  cy.get(selector, { timeout }).should('be.visible').and('not.be.disabled').click();
});
