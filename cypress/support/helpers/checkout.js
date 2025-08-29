// cypress/support/helpers/checkout.js

// ——— صفحات العروض (prepaid) ———
export const ensureOnPrepaidList = () => {
  cy.location('pathname', { timeout: 20000 }).then((p) => {
    if (p.includes('/prepaid-mobile-plans')) return
    cy.get('body').then(($b) => {
      const chip = $b.find('a,button,[role="link"]')
        .filter((_, el) => /Carte\s*SIM\s*Prépayée/i.test(el.textContent || ''))
        .first()
      if (chip.length) cy.wrap(chip).click({ force: true })
      else cy.visit('/prepaid-mobile-plans')
    })
  })
  cy.url({ timeout: 20000 }).should('include', '/prepaid-mobile-plans')
}

export const setDeliveryCity = (cityLabel = 'Oujda') => {
  cy.get('body', { timeout: 15000 }).then(($b) => {
    // select
    let sel = $b.find('select').filter((_, el) => {
      const blob = `${el.name || ''} ${el.id || ''} ${(el.getAttribute('aria-label') || '')}`.toLowerCase()
      return /ville|city|localit[eé]|commune|wilaya/.test(blob)
    }).first()
    if (sel.length) {
      cy.wrap(sel).select(cityLabel, { force: true })
      return
    }
    // combobox / input
    let inp = $b.find('input,[role="combobox"]').filter((_, el) => {
      const blob = [
        el.getAttribute('placeholder') || '',
        el.name || '',
        el.id || '',
        el.getAttribute('aria-label') || '',
        el.textContent || '',
      ].join(' ').toLowerCase()
      return /(ville|city|localit[eé]|commune|wilaya|مدينة)/.test(blob)
    }).first()
    if (inp.length) {
      cy.wrap(inp).clear({ force: true }).type(cityLabel, { force: true })
      cy.get('body').then(($b2) => {
        const opt = $b2.find('li,[role="option"],.option,.autocomplete-item')
          .filter((_, el) => new RegExp(cityLabel, 'i').test(el.textContent || ''))
          .first()
        if (opt.length) cy.wrap(opt).click({ force: true })
        else cy.wrap(inp).type('{enter}', { force: true })
      })
    }
  })
  cy.idle(200)
}

// ——— Checkout: Identification ———
export const ensureIdentificationFormReady = () => {
  // نتأكد أننا في ستيب identification (أو نروح لها مباشرة)
  cy.location().then((loc) => {
    const where = (loc.pathname || '') + (loc.search || '')
    if (!/step=identification|checkout|identification|connexion|login/i.test(where)) {
      cy.visit('/panier?step=identification', { timeout: 30000 })
    }
  })

  // guest mode إن وجد
  cy.get('body', { timeout: 15000 }).then(($b) => {
    const guest = $b.find('a,button,[role="button"]')
      .filter((_, el) => /continuer en tant qu.?invité|invité|guest/i.test((el.textContent || '').toLowerCase()))
      .first()
    if (guest.length) cy.wrap(guest).scrollIntoView().click({ force: true })
  })

  // افتح الأقسام القابلة للطيّ
  cy.get('body', { timeout: 15000 }).then(($b) => {
    const toggles = $b.find('h2,h3,button,[role="button"],.accordion,.section')
      .filter((_, el) =>
        /(contact|identit|connexion|login|adresse|identity|هوية|اتصال|العنوان)/i.test((el.textContent || '').toLowerCase())
      )
    toggles.each((_, el) => {
      const expanded = (el.getAttribute('aria-expanded') || '').toLowerCase()
      if (expanded === 'false' || expanded === '') cy.wrap(el).click({ force: true })
    })
  })

  // readiness heuristics (أي واحد يكفي)
  cy.get('body', { timeout: 20000 }).should(($b) => {
    const hasEmail = $b.find('input[type="email"]').length > 0
    const hasPhone = $b.find('input[type="tel"]').length > 0
    const anyMailish = $b.find('input,textarea,[contenteditable="true"]').filter((_, el) => {
      const blob = `${el.type} ${el.name || ''} ${el.id || ''} ${el.placeholder || ''} ${(el.getAttribute('aria-label') || '')}`.toLowerCase()
      return /(e-?mail|courriel|mail|البريد|ايميل|إيميل)/.test(blob)
    }).length > 0
    const pageText = ($b.text() || '').toLowerCase()
    const hasStepText = /(identification|connexion|login|adresse|هوية|تعريف)/i.test(pageText)
    expect(hasEmail || hasPhone || anyMailish || hasStepText, 'identification ready').to.eq(true)
  })
}

export const findEmailInput = () =>
  cy.get('body').then(($b) => {
    let input = $b.find('input[type="email"]').first()
    if (!input.length) {
      input = $b.find('input,textarea,[contenteditable="true"]').filter((_, el) => {
        const blob = [
          el.getAttribute('type') || '',
          el.getAttribute('name') || '',
          el.getAttribute('id') || '',
          el.getAttribute('placeholder') || '',
          el.getAttribute('aria-label') || '',
          el.getAttribute('autocomplete') || '',
          el.getAttribute('data-testid') || '',
          (el.textContent || ''),
        ].join(' ').toLowerCase()
        return /(e-?mail|courriel|البريد|ايميل|إيميل)/.test(blob)
      }).first()
    }
    return input.length ? input : null
  })

export const findPhoneInput = () =>
  cy.get('body').then(($b) => {
    const input = $b.find('input[type="tel"]').first()
    if (input.length) return input
    const cand = $b.find('input,textarea').filter((_, el) => {
      const blob = [
        el.getAttribute('type') || '',
        el.getAttribute('name') || '',
        el.getAttribute('id') || '',
        el.getAttribute('placeholder') || '',
        el.getAttribute('aria-label') || '',
        el.getAttribute('autocomplete') || '',
        el.getAttribute('data-testid') || '',
        el.getAttribute('pattern') || '',
      ].join(' ').toLowerCase()
      return /\btel|phone|gsm|portable|t[ée]l[ée]phone|téléphone|هاتف|رقم/.test(blob)
    }).first()
    return cand.length ? cand : null
  })

// يملأ الإيميل/التلفون (داخل iframe إن وجد) ثم ينقر متابعة
export const tryFillContactThenContinue = () => {
  // من commands.js: يبدّل لِـ Email tab إذا موجود
  cy.ensureEmailMode()

  cy.getCheckoutRoot().then(($root) => {
    const $cands = $root.find('input,textarea,[contenteditable="true"]')

    const findMail = () => {
      const $m = $cands.filter((_, el) => {
        const t = (el.getAttribute('type') || '').toLowerCase()
        const n = (el.getAttribute('name') || '').toLowerCase()
        const id = (el.getAttribute('id') || '').toLowerCase()
        const ph = (el.getAttribute('placeholder') || '').toLowerCase()
        const aria = (el.getAttribute('aria-label') || '').toLowerCase()
        const txt = (el.textContent || '').toLowerCase()
        return t === 'email' || /mail|courriel|البريد|ايميل|إيميل/.test([n, id, ph, aria, txt].join(' '))
      }).first()
      return $m.length ? $m : null
    }

    const findTel = () => {
      const $t = $cands.filter((_, el) => {
        const t = (el.getAttribute('type') || '').toLowerCase()
        const n = (el.getAttribute('name') || '').toLowerCase()
        const id = (el.getAttribute('id') || '').toLowerCase()
        const ph = (el.getAttribute('placeholder') || '').toLowerCase()
        const aria = (el.getAttribute('aria-label') || '').toLowerCase()
        const blob = [n, id, ph, aria].join(' ')
        return t === 'tel' || /tel|phone|gsm|portable|télé|telephone|هاتف|رقم/i.test(blob)
      }).first()
      return $t.length ? $t : null
    }

    const $mail = findMail()
    const $tel = !$mail && findTel()

    if ($mail) {
      cy.wrap($mail).clear({ force: true }).type('qa.e2e@example.com', { force: true })
    } else if ($tel) {
      cy.wrap($tel).clear({ force: true }).type('0612345678', { force: true })
    } else {
      throw new Error('[TC09] Aucun champ email/téléphone détecté (même dans l’iframe).')
    }
  })

  // من commands.js: يضغط متابعة/التالي/التوصيل
  cy.clickContinueOnIdentification()
}
