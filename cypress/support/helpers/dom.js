export const waitForLoad = () => cy.document().its('readyState').should('eq','complete');
export const normText = (s)=> (s||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/\s+/g,' ').trim();
export const acceptCookiesIfPresent = () => { cy.get('body',{timeout:15000}).then(($b)=>{ const btn=$b.find('button,a').filter((i,el)=>/accepter|j[’']?\s*accepte|tout accepter|accept|ok/i.test(el.innerText||'')).first(); if(btn.length) cy.wrap(btn).click({force:true}); });};
