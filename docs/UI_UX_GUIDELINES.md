# 🎨 Guide UI/UX - Portail JHMH

## 📐 Règles de styling fondamentales

### ⚠️ Règles critiques Tailwind

#### 1. NE PAS utiliser les classes `space-*`

```css
/* ❌ INTERDIT - Ne fonctionne pas correctement */
.space-y-4
.space-x-2

/* ✅ UTILISER À LA PLACE */
.my-4    /* margin vertical */
.mx-2    /* margin horizontal */
.py-4    /* padding vertical */
.px-2    /* padding horizontal */
.gap-4   /* pour flexbox/grid */
```

#### 2. Préférer gap pour flexbox/grid

```tsx
// ✅ BON : Utiliser gap pour les conteneurs flex/grid
<div className="flex gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// ❌ ÉVITER : space-* classes
<div className="flex space-x-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

---

## 🎨 Palette graphique

### Couleurs principales

```css
/* Couleurs système (définies dans globals.css) */
--primary: #0d1b3c /* Bleu marine corporate - Couleur principale */
  --primary-foreground: #ffffff /* Blanc pur pour contraste optimal */
  --secondary: #f8fafc /* Gris très clair */ --accent: #f59e0b
  /* Orange accent (conservé) */ --muted: #f1f5f9 /* Gris clair */
  --destructive: #dc2626 /* Rouge erreur */ --success: #059669 /* Vert succès */;
```

### Hiérarchie des couleurs

#### 🔵 **Bleu marine (#0D1B3C) - Couleur dominante**

- **Usage** : CTA principaux, titres importants, navigation active
- **Avantages** : Contraste fort avec le blanc, professionnel, lisible
- **Applications** :
  - Boutons primaires
  - Liens de navigation actifs
  - Titres de sections importantes
  - Icônes principales

#### ⚪ **Blanc (#FFFFFF) - Couleur de contraste**

- **Usage** : Arrière-plans, texte sur fond sombre
- **Avantages** : Clarté maximale, pureté du design
- **Applications** :
  - Arrière-plans de cartes
  - Texte sur boutons bleus
  - Espaces de respiration

#### 🔘 **Gris clair (#F8FAFC) - Couleur secondaire**

- **Usage** : Arrière-plans subtils, états désactivés
- **Applications** :
  - Boutons secondaires
  - Zones de contenu secondaire
  - Séparateurs subtils

### Utilisation des couleurs

```tsx
// ✅ Utiliser les variables CSS pour cohérence
<div className="bg-primary text-primary-foreground">
<div className="text-muted-foreground">
<div className="border-border">

// ✅ Boutons avec contraste optimal
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Action principale
</Button>

// ✅ Navigation avec états clairs
<nav className="bg-background border-b border-border">
  <a className="text-primary font-medium">Actif</a>
  <a className="text-muted-foreground hover:text-primary">Inactif</a>
</nav>

// ❌ Éviter les couleurs hardcodées
<div className="bg-blue-600 text-white">
<div className="text-gray-500">
```

### Accessibilité et contraste

#### ✅ **Combinaisons recommandées (WCAG AA+)**

- **Bleu marine + Blanc** : Ratio 15.8:1 (Excellent)
- **Bleu marine + Gris clair** : Ratio 12.1:1 (Excellent)
- **Texte gris + Blanc** : Ratio 4.8:1 (Conforme AA)

#### ⚠️ **À éviter**

- Bleu marine + couleurs saturées
- Gris trop clairs sur blanc
- Texte coloré sans contraste suffisant

### États interactifs

```tsx
// ✅ États avec variations de la couleur principale
<Button className="bg-primary hover:bg-primary/90 active:bg-primary/95">
<Link className="text-primary hover:text-primary/80">
<Input className="border-border focus:border-primary focus:ring-primary/20">
```

---

## 📏 Système d'espacement

### Échelle d'espacement standard

```css
/* Échelle recommandée (en rem) */
1  = 0.25rem  = 4px    /* Très petit */
2  = 0.5rem   = 8px    /* Petit */
3  = 0.75rem  = 12px   /* Petit-moyen */
4  = 1rem     = 16px   /* Standard */
6  = 1.5rem   = 24px   /* Moyen */
8  = 2rem     = 32px   /* Grand */
12 = 3rem     = 48px   /* Très grand */
```

### Règles d'espacement

```tsx
// ✅ Composants : padding interne
<Card className="p-6">        // Padding standard
<Button className="px-4 py-2"> // Padding bouton

// ✅ Layout : margin externe
<section className="mb-8">    // Margin entre sections
<div className="mt-4">        // Margin top

// ✅ Flexbox/Grid : gap
<div className="flex gap-4">  // Espacement entre éléments
<div className="grid gap-6">  // Espacement grille
```

---

## 🔤 Typographie

### Hiérarchie des titres

```tsx
// ✅ Hiérarchie claire
<h1 className="text-3xl font-bold tracking-tight">     // Page title
<h2 className="text-xl font-semibold">                 // Section title
<h3 className="text-lg font-medium">                   // Subsection
<p className="text-sm text-muted-foreground">          // Description
```

### Tailles de texte

```css
text-xs    = 12px   /* Petites annotations */
text-sm    = 14px   /* Texte secondaire */
text-base  = 16px   /* Texte principal */
text-lg    = 18px   /* Sous-titres */
text-xl    = 20px   /* Titres sections */
text-2xl   = 24px   /* Titres importantes */
text-3xl   = 30px   /* Titres de page */
```

---

## 📱 Responsive Design

### Breakpoints

```css
sm:  640px   /* Petites tablettes */
md:  768px   /* Tablettes */
lg:  1024px  /* Petits écrans */
xl:  1280px  /* Écrans standards */
2xl: 1536px  /* Grands écrans */
```

### Approche Mobile-First

```tsx
// ✅ Mobile-first responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
<div className="px-4 md:px-6 lg:px-8">
<div className="text-sm md:text-base">

// ❌ Desktop-first (éviter)
<div className="grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
```

---

## 🎯 Composants UI Standards

### Boutons

```tsx
// ✅ Styles standardisés
<Button className="px-4 py-2">                    // Standard
<Button size="sm" className="px-3 py-1">          // Petit
<Button size="lg" className="px-6 py-3">          // Grand
<Button variant="outline" className="border-2">    // Outline
```

### Cartes

```tsx
// ✅ Structure standard
<Card className="p-6">
  <CardHeader className="pb-4">
    <CardTitle className="text-lg font-semibold">
  </CardHeader>
  <CardContent className="pt-0">
</Card>
```

### Formulaires

```tsx
// ✅ Espacement formulaires
<div className="grid gap-4">
  {' '}
  // Entre champs
  <div className="grid gap-2">
    {' '}
    // Label + input
    <Label>Nom</Label>
    <Input className="px-3 py-2" />
  </div>
</div>
```

---

## 🎨 Patterns visuels

### Ombres et bordures

```tsx
// ✅ Cohérence visuelle
<Card className="border shadow-sm">           // Cartes légères
<Dialog className="border shadow-lg">         // Modales importantes
<Button className="shadow-sm hover:shadow">   // Interaction subtile
```

### États interactifs

```tsx
// ✅ Feedback utilisateur
<Button className="hover:bg-primary/90 transition-colors">
<Card className="hover:shadow-md transition-shadow">
<Input className="focus:ring-2 focus:ring-primary">
```

### Indicateurs de statut

```tsx
// ✅ Couleurs sémantiques
<Badge variant="default">Actif</Badge>        // Neutre
<Badge variant="destructive">Erreur</Badge>   // Rouge
<Badge variant="secondary">En attente</Badge> // Gris
<span className="text-green-600">Succès</span> // Vert
```

---

## 📐 Layout et grilles

### Structure de page

```tsx
// ✅ Layout standard
<main className="flex-1 p-4 pt-0">           // Contenu principal
  <div className="mb-6">                     // Section header
    <h1 className="text-3xl font-bold">
    <p className="text-muted-foreground mt-2">
  </div>

  <div className="grid gap-6">               // Sections content
    <section className="mb-8">
  </div>
</main>
```

### Grilles responsives

```tsx
// ✅ Grilles adaptatives
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
<div className="grid gap-6 lg:grid-cols-4">        // 4 colonnes desktop
<div className="flex flex-col lg:flex-row gap-6">   // Stack mobile, row desktop
```

---

## 🔍 Accessibilité

### Contraste et lisibilité

```tsx
// ✅ Contrastes suffisants
<div className="bg-background text-foreground">     // Contraste principal
<p className="text-muted-foreground">               // Texte secondaire
<Button className="focus:ring-2 focus:ring-offset-2"> // Focus visible
```

### Navigation clavier

```tsx
// ✅ Support clavier
<Button className="focus:outline-none focus:ring-2">
<Input className="focus:border-primary">
<Link className="focus:underline">
```

---

## ⚡ Performance

### Optimisations CSS

```tsx
// ✅ Classes efficaces
<div className="flex items-center gap-2">     // Minimal et clair
<div className="grid grid-cols-2 gap-4">     // Structure simple

// ❌ Sur-engineering
<div className="flex items-center justify-start space-x-2 w-full h-auto">
```

### Animations légères

```tsx
// ✅ Transitions subtiles
<Button className="transition-colors duration-200">
<Card className="transition-shadow hover:shadow-lg">

// ❌ Animations lourdes
<div className="animate-bounce animate-pulse animate-spin">
```

---

## 📋 Checklist qualité UI

### Avant chaque composant

- [ ] Utilise `gap` au lieu de `space-*`
- [ ] Espacement cohérent (4, 6, 8)
- [ ] Variables CSS pour les couleurs
- [ ] Responsive mobile-first
- [ ] États hover/focus définis
- [ ] Contraste suffisant (WCAG AA)
- [ ] Navigation clavier fonctionnelle

### Avant chaque page

- [ ] Hiérarchie typographique claire
- [ ] Grille responsive appropriée
- [ ] Marges cohérentes entre sections
- [ ] Loading states définis
- [ ] Error states gérés

---

## 🚀 Exemples de code

### Composant type

```tsx
export function ExampleCard({ title, description }: Props) {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <div className="flex gap-2">
          <Button size="sm">Action</Button>
          <Button variant="outline" size="sm">
            Annuler
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Layout type

```tsx
export function PageLayout({ children }: Props) {
  return (
    <main className="flex-1 p-4 pt-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Titre</h1>
        <p className="text-muted-foreground mt-2">Description</p>
      </div>

      <div className="grid gap-6">{children}</div>
    </main>
  );
}
```

---

**Note** : Ces règles garantissent une interface cohérente, accessible et performante. Toujours tester sur mobile et desktop avant validation.
