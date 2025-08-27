# Orange Maroc – E2E (Cypress)

Tests end-to-end du parcours d’achat carte **SIM/eSIM** sur la boutique Orange Maroc.

## 🚀 Démarrage rapide (VS Code)

1. **Installer Node.js 18+** (vérifier `node -v`).
2. Ouvrir ce dossier dans **VS Code**.
3. Installer les dépendances :
   ```bash
   npm install
   ```
4. Lancer l’interface Cypress :
   ```bash
   npm run cy:open
   ```
   ou en **CI / headless** :
   ```bash
   npm test
   ```

> ℹ️ Le `baseUrl` est configuré dans `cypress.config.js` : `https://boutique.orange.ma`.

## 📁 Structure
```
cypress/
  e2e/
    orange_shop.cy.js      # Specs E2E (vos TC01..TC18)
  fixtures/                # Fichiers de test (générés à la volée)
  support/
    commands.js            # cypress-file-upload + helpers
    e2e.js
cypress.config.js
package.json
```

## 🧪 Couverture des cas
- TC01 Accès page offres
- TC02 Sélection offre
- TC03 Sélection SIM/eSIM
- TC04-A Ajout panier 20DH
- TC04-B Ajout panier Marhaba
- TC05 Accès panier
- TC09 Compatibilité eSIM (smoke)
- TC10 Suppression panier
- TC11 Code promo invalide
- TC12 Upload > 5 Mo
- TC17/TC18 Paiement (placeholders à brancher sur **sandbox CMI**)
Dimareal1946

## 📦 Upload > 5 Mo
Le test **TC12** crée dynamiquement un fichier PDF de 6 Mo (aucun gros fichier conservé dans le repo).

## 🔒 Sécurité (optionnel)
- Ajoutez un job **OWASP ZAP Baseline** en CI pour crawler la page et détecter les risques connus.
- Évitez de stocker des données perso dans les logs/screenshots.

## 📈 Performance (optionnel)
- Script `npm run lighthouse` pour récupérer les indicateurs clés (FCP/LCP/TBT/CLS) sur desktop.
  > Nécessite **Chrome** installé localement.

## ⚠️ Avertissements
- Ces tests agissent **sur un site de production**. Privilégiez un **environnement de staging** quand c’est possible.
- Les flux **paiement** (TC17/TC18) doivent être réalisés **uniquement** en **sandbox** avec cartes de test CMI.

## 🤝 Licence
Usage interne pour validation QA.

# orangee2e

E2E tests for https://boutique.orange.ma using Cypress.

## Run locally
```bash
npm i
npx cypress run \
  --browser chrome --headless \
  --spec cypress/e2e/orange_shop.cy.js \
  --env SLOW=0 \
  --config video=false,screenshotOnRunFailure=false,trashAssetsBeforeRuns=true \
  -- --disable-gpu --disable-dev-shm-usage --no-sandbox --window-size=1366,768
