import 'cypress-file-upload';
Cypress.on('uncaught:exception', () => false);
Cypress.Commands.add('idle', (ms = 200) => cy.wait(ms));
Cypress.Commands.add('disableAnimations', () => {
  const styles = `*{transition:none!important;animation:none!important;caret-color:transparent!important;} html{scroll-behavior:auto!important;}`;
  cy.document().then((doc)=>{const style=doc.createElement('style');style.id='e2e-no-anim';style.innerHTML=styles;doc.head.appendChild(style);});
});
Cypress.Commands.add('waitForPageReady', () => { cy.document().its('readyState').should('eq','complete'); cy.disableAnimations(); });
Cypress.Commands.add('getCheckoutRoot', () => {
  const guess='iframe[src*="check"], iframe[id*="check"], iframe[name*="check"], iframe[src*="secure"], iframe[src*="auth"]';
  return cy.get('body').then(($b)=>{const $ifr=$b.find(guess); if($ifr.length){return cy.wrap($ifr.first()).its('0.contentDocument.body',{log:false}).should('not.be.empty').then((b)=>cy.wrap(b));} return cy.wrap($b);});
});
Cypress.Commands.add('closeBannersIfAny', ()=> cy.getCheckoutRoot().then(($r)=>{const s='button,[role="button"],[aria-label],[title],.close,[data-testid*="close"],.cookie,.cookies,.cc-window button'; const rx=/(accepter|j'accepte|ok|fermer|close|dismiss|×|x)/i; const $btns=$r.find(s).filter((_,el)=>{const t=(el.getAttribute('aria-label')||el.getAttribute('title')||el.textContent||'').toLowerCase().trim();return rx.test(t)}); if($btns.length) cy.wrap($btns[0]).click({force:true});}));
Cypress.Commands.add('ensureEmailMode', ()=> cy.getCheckoutRoot().then(($r)=>{const $switch=$r.find('button,[role=tab],a').filter((_,el)=>/e-?mail|courriel/i.test(el.textContent||'')); if($switch.length) cy.wrap($switch[0]).click({force:true});}));
Cypress.Commands.add('clickContinueOnIdentification', ()=> cy.getCheckoutRoot().then(($r)=>{const $btn=$r.find('button,a').filter((_,el)=>/continuer|suivant|livraison|adresse|next/i.test(el.textContent||'')); if($btn.length) cy.wrap($btn[0]).click({force:true});}));
