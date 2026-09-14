# Madplan

Madplan is a Danish-focused Home Assistant custom integration and Lovelace card for weekly dinner planning, inventory management, and shopping lists.

## Installation

### Integration

Copy `custom_components/madplan` to Home Assistant's `config/custom_components` directory.

Then go to:

*Settings -> Devices & services -> Add integration -> Madplan*

Set up the integration through the UI. Restart Home Assistant if the integration does not appear immediately.

Madplan can be used by all authenticated Home Assistant users. Administrator privileges are not required to view or edit the dinner plan, inventory, items, or shopping list.

### Lovelace card

The card is located at:

`config/www/madplan-card/madplan-card.js`

Add the file as a Lovelace resource under:

*Settings -> Dashboards -> Resources -> Add resource*

- URL: `/local/madplan-card/madplan-card.js`
- Type: `JavaScript module`

Then add the card to a dashboard:

```yaml
type: custom:madplan-card
entry_id: "<config_entry_id>"
title: Dinner Plan
```

`title` is optional. The `entry_id` can be found in the URL on the integration page under *Settings -> Devices & services -> Madplan*.

## Tabs

### Dinner plan

The Dinner plan tab shows the selected week with one card per day.

- Enter the dinner and any notes in the text area.
- The text area grows automatically when the text spans multiple lines.
- Search for items that are in storage.
- Select the quantity to use in the dinner.
- Selected items show their quantity and location, for example `500 gram · Freezer / Drawer 2`.
- Changes are saved automatically. The status shows *Saved*, *Saving*, or an error.
- If an item is not in the item list or is not in stock, it can be added to the shopping list directly from the search.

### Inventory

The Inventory tab provides an overview of what is available for new dinners.

- The same item is summed across storage locations when the unit is the same.
- Reserved quantities are subtracted.
- The list is sorted alphabetically.
- The list can be searched live.
- Locations are not shown in this tab because its purpose is to show what can be used.

Example:

```text
Burger buns: 2 pcs available
```

### Storage

Create storage places and their compartments, for example:

```text
Freezer
├── Drawer 1
├── Drawer 2
└── Drawer 3
```

Then place items in the relevant compartment. Each stored item has:

- Total quantity
- Unit
- Reserved quantity
- Remaining quantity
- Reservations with their corresponding weekdays

If you take something from storage without using it in a dinner plan, click *Use* on the storage item and subtract the amount you took. Only the unreserved remainder can be consumed, so planned dinners are protected.

Reserved items are marked with a warning border that remains readable in dark themes.

### Items

The Items tab contains the common items that can be used in inventory and dinner plans.

For each item, you can specify:

- Name
- Default quantity
- Default unit

Example:

```text
Milk         1 liter
French fries 1000 gram
Burger buns  1 pack
```

The default quantity is used automatically when the item is selected in the shopping list, when placing it in storage, or when adding it directly from the Dinner plan search. The quantity can still be changed for a specific action without changing the default.

The Items tab also supports searching, editing, and deleting items. Searching updates without losing focus.

### Shopping list

The shopping list supports quantity, unit, and an optional note.

An item can be added in two ways:

1. From the shopping list form.
2. Directly from the item search on the Dinner plan tab.

After buying an item, choose *Place in storage*, select the storage place and compartment, and the item is removed from the shopping list and added to storage with the same quantity and unit.

## Units

The supported units are:

- `stk` (pieces)
- `pakke` (displayed as `packs`)
- `pose` (displayed as `bags`)
- `gram`
- `liter`

Quantities can be decimals, so for example `0.5 liter` is valid.

## Reservations and consumption

The inventory reserves specific quantities, not entire stored-item records.

Example with burger buns:

```text
In storage:       16 pcs
Saturday:          6 pcs reserved
Sunday:            8 pcs reserved
Wednesday:         2 pcs reserved
Available:         0 pcs
```

If Wednesday's `2 pcs` are removed from the dinner plan, the result is:

```text
Saturday:          6 pcs reserved
Sunday:            8 pcs reserved
Available:         2 pcs
```

- Deleting a dinner releases its reserved quantities.
- Editing a dinner updates its reservations automatically.
- When a dinner is marked as cooked, its reserved quantity is removed from storage.
- If only part of a stored item is used, the remainder stays in storage.
- A reservation cannot exceed the available quantity.
- Items with different units remain separate, for example `1000 gram` and `2 bags`.
- Consuming an item outside the dinner plan only affects its unreserved remainder.

## Data and compatibility

Data is stored in Home Assistant Storage:

`.storage/madplan.<entry_id>`

This follows the same storage pattern as `thermostat_scheduler`.

Existing data without quantity, unit, or default values receives compatible defaults when loaded, normally `1 pcs`.
