import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.2.0:0',
  releaseNotes: {
    en_US: `Faster pages and self-custodial statements.

- Faster loading: balances appear right away from your last sync while Control Center refreshes them in the background, and pages fill in place instead of waiting behind a spinner. This is most noticeable over Tor.
- Statements: now described as self-custodial. They're generated on your machine and show the date each wallet's ownership was proven.
- Getting started: new installs open with a short introduction you can skip.
- Help: a new Help button next to Lock and Settings opens the help center.

Existing accounts, settings, and statements carry over automatically.`,
    es_ES: `Páginas más rápidas y estados de cuenta en autocustodia.

- Carga más rápida: los saldos aparecen al instante a partir de tu última sincronización mientras Control Center los actualiza en segundo plano, y las páginas se completan en su sitio en lugar de esperar tras un indicador de carga. Se nota sobre todo a través de Tor.
- Estados de cuenta: ahora se describen como de autocustodia. Se generan en tu equipo y muestran la fecha en que se demostró la propiedad de cada monedero.
- Primeros pasos: las instalaciones nuevas se abren con una breve introducción que puedes omitir.
- Ayuda: un nuevo botón de Ayuda junto a Bloquear y Ajustes abre el centro de ayuda.

Las cuentas, los ajustes y los estados de cuenta existentes se conservan automáticamente.`,
    de_DE: `Schnellere Seiten und Kontoauszüge in Selbstverwahrung.

- Schnelleres Laden: Salden erscheinen sofort aus der letzten Synchronisierung, während Control Center sie im Hintergrund aktualisiert, und Seiten füllen sich an Ort und Stelle, statt hinter einem Ladeindikator zu warten. Das macht sich vor allem über Tor bemerkbar.
- Kontoauszüge: werden jetzt als Selbstverwahrung beschrieben. Sie werden auf deinem Gerät erstellt und zeigen das Datum, an dem der Besitz jeder Wallet nachgewiesen wurde.
- Erste Schritte: Neue Installationen beginnen mit einer kurzen Einführung, die du überspringen kannst.
- Hilfe: Eine neue Hilfe-Schaltfläche neben Sperren und Einstellungen öffnet das Hilfe-Center.

Bestehende Konten, Einstellungen und Kontoauszüge werden automatisch übernommen.`,
    pl_PL: `Szybsze strony i wyciągi w samodzielnym przechowywaniu.

- Szybsze ładowanie: salda pojawiają się od razu na podstawie ostatniej synchronizacji, a Control Center odświeża je w tle. Strony wypełniają się na miejscu, zamiast czekać za wskaźnikiem ładowania. Najbardziej widać to przy połączeniu przez Tor.
- Wyciągi: są teraz opisane jako samodzielne przechowywanie. Powstają na Twoim urządzeniu i pokazują datę potwierdzenia własności każdego portfela.
- Pierwsze kroki: nowe instalacje zaczynają się od krótkiego wprowadzenia, które możesz pominąć.
- Pomoc: nowy przycisk Pomoc obok Zablokuj i Ustawienia otwiera centrum pomocy.

Istniejące konta, ustawienia i wyciągi zostają przeniesione automatycznie.`,
    fr_FR: `Pages plus rapides et relevés en auto-garde.

- Chargement plus rapide : les soldes s'affichent immédiatement à partir de votre dernière synchronisation pendant que Control Center les actualise en arrière-plan, et les pages se remplissent sur place au lieu d'attendre derrière un indicateur de chargement. C'est surtout visible via Tor.
- Relevés : ils sont désormais présentés comme des relevés en auto-garde. Ils sont générés sur votre appareil et indiquent la date à laquelle la propriété de chaque portefeuille a été prouvée.
- Premiers pas : les nouvelles installations s'ouvrent sur une courte introduction que vous pouvez passer.
- Aide : un nouveau bouton Aide à côté de Verrouiller et Paramètres ouvre le centre d'aide.

Les comptes, paramètres et relevés existants sont conservés automatiquement.`,
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
