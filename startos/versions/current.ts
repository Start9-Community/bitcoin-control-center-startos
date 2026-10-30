import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.3.1:0',
  releaseNotes: {
    en_US: `Bitkey support and track-only wallets.

- Bitkey: connect your Bitkey by pasting its wallet descriptor from the Bitkey app. Its balance and history show in Control Center. Bitkey doesn't support proving ownership of its keys, so it stays Unverified and isn't included in statements.
- Track a wallet: add an xpub or a wallet descriptor to watch its balance without proving you own it. Prove ownership later by adding the same wallet again with your device.
- Add Account: simpler options, with Manually Sign and Track Balance, ETF, or xpub.
- Manual accounts: the Portfolio chart now starts a manual account's balance on the date you chose, and removing one asks you to confirm first.
- Security updates to third-party dependencies.

Existing accounts, settings, and statements carry over automatically.`,
    es_ES: `Compatibilidad con Bitkey y monederos de solo seguimiento.

- Bitkey: conecta tu Bitkey pegando el descriptor de su monedero desde la app de Bitkey. Su saldo e historial aparecen en Control Center. Bitkey no permite demostrar la propiedad de sus claves, así que se mantiene como No verificado y no se incluye en los estados de cuenta.
- Seguir un monedero: añade una xpub o un descriptor de monedero para ver su saldo sin demostrar que es tuyo. Puedes demostrar la propiedad más adelante añadiendo el mismo monedero con tu dispositivo.
- Añadir cuenta: opciones más sencillas, con Firmar manualmente y Seguir saldo, ETF o xpub.
- Cuentas manuales: el gráfico de Cartera ahora empieza el saldo de una cuenta manual en la fecha que elegiste, y al eliminar una se te pide confirmación.
- Actualizaciones de seguridad de dependencias de terceros.

Las cuentas, los ajustes y los estados de cuenta existentes se conservan automáticamente.`,
    de_DE: `Bitkey-Unterstützung und Wallets zum reinen Beobachten.

- Bitkey: Verbinde deine Bitkey, indem du ihren Wallet-Deskriptor aus der Bitkey-App einfügst. Ihr Saldo und ihre Historie erscheinen in Control Center. Bitkey unterstützt keinen Nachweis des Schlüsselbesitzes, daher bleibt sie Unverifiziert und wird nicht in Kontoauszüge aufgenommen.
- Wallet beobachten: Füge einen xpub oder einen Wallet-Deskriptor hinzu, um den Saldo zu verfolgen, ohne den Besitz nachzuweisen. Den Besitz kannst du später nachweisen, indem du dieselbe Wallet mit deinem Gerät erneut hinzufügst.
- Konto hinzufügen: einfachere Optionen, mit Manuell signieren und Saldo verfolgen, ETF oder xpub.
- Manuelle Konten: Das Portfolio-Diagramm beginnt den Saldo eines manuellen Kontos jetzt an dem von dir gewählten Datum, und vor dem Entfernen wirst du um Bestätigung gebeten.
- Sicherheitsupdates für Abhängigkeiten von Drittanbietern.

Bestehende Konten, Einstellungen und Kontoauszüge werden automatisch übernommen.`,
    pl_PL: `Obsługa Bitkey i portfele tylko do śledzenia.

- Bitkey: połącz swój Bitkey, wklejając deskryptor portfela z aplikacji Bitkey. Jego saldo i historia pojawią się w Control Center. Bitkey nie obsługuje potwierdzania własności kluczy, więc pozostaje Niezweryfikowany i nie jest uwzględniany w wyciągach.
- Śledzenie portfela: dodaj xpub lub deskryptor portfela, aby obserwować saldo bez potwierdzania własności. Własność możesz potwierdzić później, dodając ten sam portfel ponownie za pomocą swojego urządzenia.
- Dodaj konto: prostsze opcje, z Ręcznym podpisem oraz Śledzeniem salda, ETF lub xpub.
- Konta ręczne: wykres Portfela zaczyna teraz saldo konta ręcznego od wybranej przez Ciebie daty, a usunięcie konta wymaga potwierdzenia.
- Aktualizacje zabezpieczeń zależności zewnętrznych.

Istniejące konta, ustawienia i wyciągi zostają przeniesione automatycznie.`,
    fr_FR: `Prise en charge de Bitkey et portefeuilles en suivi seul.

- Bitkey : connectez votre Bitkey en collant le descripteur de son portefeuille depuis l'app Bitkey. Son solde et son historique s'affichent dans Control Center. Bitkey ne permet pas de prouver la propriété de ses clés : il reste donc Non vérifié et n'est pas inclus dans les relevés.
- Suivre un portefeuille : ajoutez une xpub ou un descripteur de portefeuille pour suivre son solde sans prouver qu'il vous appartient. Vous pourrez prouver la propriété plus tard en ajoutant le même portefeuille avec votre appareil.
- Ajouter un compte : des options plus simples, avec Signer manuellement et Suivre le solde, ETF ou xpub.
- Comptes manuels : le graphique Portefeuille fait désormais commencer le solde d'un compte manuel à la date choisie, et sa suppression demande une confirmation.
- Mises à jour de sécurité des dépendances tierces.

Les comptes, paramètres et relevés existants sont conservés automatiquement.`,
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
