# Orange Maroc – E2E (Cypress)
[![E2E (Cypress)](https://github.com/48Mouad/orangee2e/actions/workflows/cypress.yml/badge.svg)](https://github.com/48Mouad/orangee2e/actions/workflows/cypress.yml)

Tests end-to-end du parcours d’achat carte **SIM/eSIM** sur la boutique Orange Maroc.


## 🚀 Démarrage rapide (VS Code)
### Prérequis
- **Node.js 18+** (`node -v`)
- **npm** (`npm -v`)
- **Google Chrome** (pour le mode headed)

1. **Installer Node.js 18+** (vérifier `node -v`).
2. Ouvrir ce dossier dans **VS Code**.
3. Installer les dépendances :
   ```bash
   npm install
   ```
4. Lancer l’interface Cypress :
Lancer les tests 

UI (dev) :
```bash
npm run cy:open
```

Headless / CI :
 ```bash
npm test
 ```
# ou
 ```bash
npm run cy:run
 ```

L’option SLOW (ms) est supportée : --env SLOW=0 (par défaut 0).

> ℹ️ Le `baseUrl` est configuré dans `cypress.config.js` : `https://boutique.orange.ma`.

## 📁 Structure

```
cypress/
  e2e/
    orange_shop.cy.js       # Specs E2E (TC01…)
  fixtures/                 # Fichiers générés à la volée
  support/
    commands.js             # Helpers + cypress-file-upload
    e2e.js                  # Import des commandes
cypress.config.js
package.json

```
---

## 🧪 Couverture (extraits)

- **TC01** Accès à la page des offres
- **TC02** Ouverture des détails d’offres
- **TC03** Sélection SIM / eSIM
- **TC04-A** Ajouter → Voir mon panier
- **TC04-B** Ajouter → Continuer mes achats
- **TC05** Accès direct au panier
- **TC06** Code promo invalide
- **TC07** Estimation livraison (ex: Oujda)
- **TC08** Commander → étape Identification
- **TC09** Identification → passer à Livraison
- (À étendre : suppression panier, compatibilité eSIM, paiement sandbox CMI, etc.)

---
## 🧰 Scripts npm

| Script | Description |
| --- | --- |
| `npm run cy:open` | Ouvre Cypress en mode interactif |
| `npm run cy:run` | Exécute les tests en headless (Chrome) |
| `npm test` | Alias de `cy:run` (utilisé en CI) |
| `npm run lighthouse` | Mesures de perf (optionnel, Chrome requis) |

## 🤖 CI (GitHub Actions)

Le workflow **`.github/workflows/cypress.yml`** :

- installe Node 18 + Chrome
- exécute la **même commande** que localement (Chrome headless)
- uploade screenshots/videos en cas d’échec
- supporte le **run manuel** via *Actions → Run workflow*

---

## 🛠️ Dépannage rapide

- **Headless vs headed** : le site peut changer de langue ; le pipeline force **FR**.
- **Sélecteurs CSS4 `[attr*="x" i]`** : non supportés par Sizzle → éviter  `i`, préférez un filtrage JS via `.filter()`.
- **Flakiness** : animations désactivées dans `commands.js`, utilisez `waitForPageReady()` au lieu de `cy.wait()` aveugle.
- **Prod** : ces tests ciblent la prod — privilégier un **staging** si possible pour les cas sensibles (paiement).

---

## 🔒 Sécurité (optionnel)

- Ajouter un job **OWASP ZAP Baseline** (scan passif).
- Éviter toute donnée personnelle dans les logs/artefacts.

---

## Licence

Usage interne (QA).

© DIOT SIACI Maroc / Équipe QA E2E.
---
## Run locally
```bash
npm i
npx cypress run \
  --browser chrome --headless \
  --spec cypress/e2e/orange_shop.cy.js \
  --env SLOW=0 \
  --config video=false,screenshotOnRunFailure=false,trashAssetsBeforeRuns=true \
  -- --disable-gpu --disable-dev-shm-usage --no-sandbox --window-size=1366,768
```
---
