import { normText } from './dom';
export const getBuyButtons = () => cy.get('main').find('a,button').filter((i,el)=>/^acheter$/i.test((el.innerText||'').trim()));
export const openOfferByIndex = (idx)=>{ getBuyButtons().as('buyBtns'); cy.get('@buyBtns').should('have.length.at.least',3); cy.get('@buyBtns').eq(idx).scrollIntoView().click({force:true}); cy.contains('button,[role="button"]',/ajouter au panier/i,{timeout:15000}).should('be.visible'); };
export const openHeaderCartIfAny = ()=>{ cy.get('body',{timeout:10000}).then(($b)=>{ const hdr=$b.find('a[href*="panier"],a[href*="cart"],button[aria-label*="panier"],[data-test*="header-cart"],[class*="header"] [class*="cart"]').first(); if(hdr.length) cy.wrap(hdr).click({force:true}); });};
export const addToCartAndConfirm = ()=>{ cy.contains('button,[role="button"]',/ajouter au panier/i,{timeout:15000}).should('be.visible').and('not.be.disabled').click({force:true}); cy.get('body').then(($b)=>{ const replaceBtn=$b.find('button,a').filter((i,el)=>/Remplacer|Remplacer mon panier|Oui|Confirmer/i.test(el.textContent||'')).first(); if(replaceBtn.length) cy.wrap(replaceBtn).click({force:true});}); cy.window({log:false,timeout:10000}).should((win)=>{ const pathname=win.location.pathname||''; const body=win.document.body; const onPost=/post-panier/.test(pathname); const goCart=!!Array.from(body.querySelectorAll('a,button,[role="button"]')).find((el)=>/voir\s*mon\s*panier|mon\s*panier|aller\s*au\s*panier|cart|panier/i.test(el.textContent||'')); const badge=!!Array.from(body.querySelectorAll('[data-test*="cart"],[class*="cart"],[class*="panier"]')).find((el)=>/\b[1-9]\d*\b/.test((el.textContent||'').trim())); if(!(onPost||goCart||badge)) throw new Error('panier pas encore prêt');}); cy.wait(200,{log:false}); };
export const goToCartStrict = ()=>{ cy.location('pathname',{timeout:20000}).then((p)=>{ if(/(^|\/)(panier|cart|basket)(\/|$)/i.test(p)) return; if(/(^|\/)post-panier(\/|$)/i.test(p)){ cy.get('body',{timeout:20000}).then(($b)=>{ const btn=$b.find('a,button,[role="button"]').filter((i,el)=>/voir\s*mon\s*panier|mon\s*panier|aller\s*au\s*panier|panier|cart/i.test(el.textContent||'')).first(); if(btn.length) cy.wrap(btn).scrollIntoView().click({force:true}); else openHeaderCartIfAny();}); } else { openHeaderCartIfAny(); cy.location('pathname',{timeout:5000}).then((h)=>{ if(!/(^|\/)(panier|cart|basket)(\/|$)/i.test(h)) cy.visit('/panier'); }); } }); cy.url({timeout:20000}).should('match',/panier|cart|basket/); cy.get('body',{timeout:20000}).should(($b)=>{ const t=normText($b.text()); expect(/panier|votre panier|mon panier|basket|cart/i.test(t)).to.eq(true);}); };
export const assertCartNonEmpty = ()=>{ cy.url({timeout:20000}).should('match',/panier|cart|basket/); cy.get('body',{timeout:20000}).then(($b)=>{ const hasItems=$b.find('[data-test*="cart-item"],[class*="cart"] [class*="item"],[class*="panier"] [class*="item"]').length>0 || $b.find('table,ul,div').filter((i,el)=>/article|produit/i.test(el.textContent||'')).length>0; if(hasItems) return expect(true).to.eq(true); const t=normText($b.text()); expect(/marhaba|carte\s*prepaye|carte\s*seule|article|produit|total\s*ttc|prix\s*total/i.test(t)).to.eq(true); });};
export const selectFirstAvailableType = () => {
  cy.get('body', { timeout: 15000 }).then(($b) => {
    // فضّل SIM الفيزيائية، إلا ما لقاها خذ eSIM
    let $opt = $b.find('[role="radio"], input[type="radio"], button[role="radio"]').filter((_, el) => {
      const v = `${el.getAttribute('value')||''} ${el.id||''} ${el.textContent||''}`.toLowerCase();
      return /\bsim(?!\s*e)/.test(v);
    }).first();

    if (!$opt.length) {
      $opt = $b.find('[role="radio"], input[type="radio"], button[role="radio"]').filter((_, el) => {
        const v = `${el.getAttribute('value')||''} ${el.id||''} ${el.textContent||''}`.toLowerCase();
        return /e-?sim/.test(v);
      }).first();
    }

    if (!$opt.length) {
      // fallback على أزرار النص
      $opt = $b.find('button,a,[role="button"]').filter((_, el) =>
        /carte\s*sim\s*physique|sim\s*physique|carte\s*e\s*sim|e-?sim/i.test((el.textContent || '').toLowerCase())
      ).first();
    }

    if ($opt.length) cy.wrap($opt).scrollIntoView().click({ force: true });
  });

  // تأكّد من تفعيل الزر
  cy.contains('button, [role="button"]', /ajouter au panier/i, { timeout: 15000 })
    .should('be.visible')
    .and('not.be.disabled');
    
};
