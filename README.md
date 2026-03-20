# FleuretAI -- Test Technique

## Infos

- Node.js v22.22.1 ou supérieur requis

```bash
# Lancement
npm install && npm run build && npm start
```
Naviguer sur http://localhost:3000/report
car est vide et http://localhost:3000 contient du boilerplate
## Choix techniques

**Stack :** Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, React Query.

**Génération PDF :** PDFMake. Le choix s'est porté sur PDFMake car la génération se fait entièrement côté serveur à partir d'une définition JSON. Si demain le front est remplacé par une application mobile ou un autre framework, la logique de génération reste intacte et indépendante de React. Les alternatives courantes (react-pdf, html2canvas) sont liées au rendu côté client et ne survivraient pas à un changement de front end. Chaque PDF contient un lien direct pour visualiser la vulnérabilité sur la plateforme FleuretAI.

**Données :** Les rapports sont servis depuis un fichier `mocks.json` via une couche service, ce qui simule une vraie API sans dépendance externe.

## UI/UX

Les couleurs s'inspirent de la palette de la landing page FleuretAI, avec des teintes violettes en oklch pour les modes clair et sombre.

**Système de Tray :** Le tray est un espace de travail temporaire pour regrouper des vulnérabilités à traiter ensemble. Le parcours utilisateur est le suivant :

1. Depuis le tableau de rapport, l'utilisateur sélectionne plusieurs vulnérabilités via les cases à cocher.
2. Il clique sur "Add to Tray" dans l'en-tête pour les envoyer dans le tray actif.
3. Le tray apparaît dans la barre latérale, où les vulnérabilités peuvent être parcourues, partagées (email, Linear) ou supprimées.
4. Plusieurs trays peuvent coexister et être navigués via les flèches dans la sidebar.

Les vulnérabilités déjà présentes dans le tray actif apparaissent avec leur case à cocher désactivée dans le tableau, évitant les doublons.

**Explorateur de vulnérabilités :** Chaque vulnérabilité dispose d'une page de détail avec description complète et recommandations en markdown. Un widget flottant inspiré de Cursor se superpose à la page et permet de naviguer rapidement entre les vulnérabilités sans repasser par le tableau, ainsi que d'effectuer des actions rapides : ajouter au tray, partager, ou télécharger le rapport directement depuis la page de lecture.
