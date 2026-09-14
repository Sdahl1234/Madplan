# Madplan

Madplan er en dansk-fokuseret Home Assistant custom integration og Lovelace-card til ugentlig madplan, lagerstyring og indkøbsliste.

## Installation

### Integration

Kopiér `custom_components/madplan` til Home Assistants `config/custom_components`-mappe.

Gå derefter til:

*Indstillinger → Enheder og tjenester → Tilføj integration → Madplan*

Opret integrationen via UI'et. Genstart Home Assistant, hvis integrationen ikke vises med det samme.

Madplan kan bruges af alle autentificerede Home Assistant-brugere. Der kræves ikke administratorrettigheder for at se eller redigere madplan, lager, varer eller indkøbsliste.

### Lovelace-card

Kortet ligger i:

`config/www/madplan-card/madplan-card.js`

Tilføj filen som en Lovelace-ressource under:

*Indstillinger → Dashboards → Ressourcer → Tilføj ressource*

- URL: `/local/madplan-card/madplan-card.js`
- Type: `JavaScript module`

Tilføj derefter kortet til et dashboard:

```yaml
type: custom:madplan-card
entry_id: "<config_entry_id>"
title: Madplan
```

`title` er valgfri. `entry_id` findes i URL'en på integrationssiden under *Indstillinger → Enheder og tjenester → Madplan*.

## Faner

### Madplan

Madplan-fanen viser den valgte uge med en dag pr. kort.

- Skriv retten og eventuelle noter i fritekstfeltet.
- Fritekstfeltet vokser automatisk ved flere linjer.
- Søg efter varer, der er på lager.
- Vælg den mængde, der skal bruges i retten.
- Den valgte vare viser mængde og placering, f.eks. `500 gram · Fryser / Skuffe 2`.
- Ændringer gemmes automatisk. Status vises som *Gemt*, *Gemmer* eller en fejl.
- Hvis en vare ikke findes i vareliste eller ikke er på lager, kan den tilføjes til indkøbslisten direkte fra søgningen.

### Lager

Lager-fanen er et samlet overblik over, hvad der er tilgængeligt til nye retter.

- Samme vare summeres på tværs af opbevaringssteder, når enheden er den samme.
- Reserverede mængder trækkes fra.
- Listen sorteres alfabetisk.
- Listen kan søges live.
- Placeringer vises ikke i denne fane, fordi formålet er at se, hvad der kan bruges.

Eksempel:

```text
Burgerboller: 2 stk tilgængelig
```

### Opbevaring

Opret opbevaringssteder og deres rum, eksempelvis:

```text
Fryser
├── Skuffe 1
├── Skuffe 2
└── Skuffe 3
```

Placér derefter varer i det relevante rum. Hver lagerpost har:

- Samlet mængde
- Enhed
- Reserveret mængde
- Resterende mængde
- Reservationer med tilhørende ugedage

Hvis du tager noget fra lageret uden at bruge det i en madplan, kan du klikke *Forbrug* på lagerposten og trække den konkrete mængde fra. Kun den ikke-reserverede rest kan forbruges, så planlagte middage beskyttes.

Reserverede varer markeres med en warning-kant, der også er læsbar i mørkt tema.

### Varer

Vareliste-fanen indeholder de almindelige varer, som kan bruges i lager og madplan.

For hver vare kan du angive:

- Navn
- Standardmængde
- Standardenhed

Eksempel:

```text
Mælk       1 liter
Pomfritter 1000 gram
Burgerboller 1 pakke
```

Standardmængden bruges automatisk, når varen vælges i indkøbsliste, lagerplacering eller direkte fra søgningen på Madplan-fanen. Den konkrete mængde kan stadig ændres, uden at standarden ændres.

Vareliste-fanen har også søgning, redigering og sletning. Søgningen opdateres uden at miste fokus.

### Indkøbsliste

Indkøbslisten understøtter mængde, enhed og en valgfri note.

En vare kan tilføjes på to måder:

1. Fra indkøbslistens formular.
2. Direkte fra varesøgningen på Madplan-fanen.

Når du har købt en vare, kan du vælge *Placér i opbevaring*, vælge opbevaringssted og rum, hvorefter varen fjernes fra indkøbslisten og tilføjes til lageret med samme mængde og enhed.

## Enheder

De understøttede enheder er:

- `stk`
- `pakke` (vises som `pakker`)
- `pose` (vises som `poser`)
- `gram`
- `liter`

Mængder kan være decimaltal, så eksempelvis `0.5 liter` er gyldigt.

## Reservationer og forbrug

Lageret reserverer konkrete mængder, ikke hele lagerposter.

Eksempel med burgerboller:

```text
På lager:       16 stk
Lørdag:          6 stk reserveret
Søndag:          8 stk reserveret
Onsdag:          2 stk reserveret
Tilgængelig:     0 stk
```

Hvis onsdagens `2 stk` fjernes fra madplanen, bliver resultatet:

```text
Lørdag:          6 stk reserveret
Søndag:          8 stk reserveret
Tilgængelig:     2 stk
```

- Sletning af en middag frigiver de reserverede mængder.
- Ændring af en middag opdaterer reservationen automatisk.
- Når en middag markeres som lavet, trækkes den reserverede mængde fra lageret.
- Hvis kun en del af en lagerpost bruges, bliver resten på lageret.
- En reservation kan ikke overstige den tilgængelige mængde.
- Varer med forskellige enheder holdes adskilt, f.eks. `1000 gram` og `2 poser`.

## Data og kompatibilitet

Data gemmes i Home Assistant Storage:

`.storage/madplan.<entry_id>`

Det følger samme storage-mønster som `thermostat_scheduler`.

Eksisterende data uden mængde, enhed eller standardværdier får kompatible standarder ved indlæsning, normalt `1 stk`.
