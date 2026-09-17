/**
 * madplan-card.js
 *
 * A custom Lovelace card for the "madplan" integration: a weekly dinner
 * planner backed by a freezer/cabinet storage system.
 *
 * Card config:
 *   type: custom:madplan-card
 *   entry_id: "<config_entry_id>"
 *   title: "Madplan"   # optional
 */

const DAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const UNITS = ["stk", "pakke", "pose", "gram", "liter"];
const DEFAULT_UNIT = "stk";

const TRANSLATIONS = {
  da: {
    card_title: "Madplan", loading: "Indlæser…",
    tab_madplan: "Madplan", tab_inventory: "Lager", tab_storage: "Opbevaring", tab_items: "Varer", tab_shopping: "Indkøbsliste",
    day_monday: "Mandag", day_tuesday: "Tirsdag", day_wednesday: "Onsdag", day_thursday: "Torsdag",
    day_friday: "Fredag", day_saturday: "Lørdag", day_sunday: "Søndag",
    prev_week: "‹ Uge", next_week: "Uge ›", week_label: "Uge {n}",
    dinner_placeholder: "Hvad skal vi have? F.eks. kylling i karry med ris…",
    search_placeholder: "Søg efter en vare (f.eks. kylling)…",
    btn_save: "Gem", btn_edit: "Rediger", btn_delete: "Slet", btn_complete: "Marker som lavet",
    completed_badge: "✓ Lavet", used_items: "Brugte varer:",
    save_status_saved: "✓ Gemt", save_status_saving: "Gemmer…", save_status_unsaved: "● Ændringer gemmes…", save_status_error: "⚠ Kunne ikke gemme",
    no_stock: "Ikke på lager", add_to_shopping: "+ Tilføj til indkøbsliste",
    in_storage_at: "i {storage} / {location}",
    not_in_list: "Findes ikke i vareliste endnu.", add_to_items: "+ Tilføj \"{name}\" til vareliste",
    storages_title: "Mine opbevaringssteder", add_storage: "+ Tilføj opbevaringssted",
    storage_name: "Navn (f.eks. Fryser)", storage_type: "Type (f.eks. fryser/skab)",
    locations_label: "Rum (f.eks. Skuffe 1, Skuffe 2)", locations_hint: "Adskil med komma",
    btn_add: "Tilføj", btn_cancel: "Annullér", btn_remove: "Fjern",
    consume: "Forbrug", consume_quantity: "Mængde at bruge", confirm_consume: "Brug",
    add_location: "+ Tilføj rum", location_name_placeholder: "Navn på rum",
    empty_location: "— tomt —", place_item: "+ Placér vare",
    select_item: "— Vælg vare —", reserved_for: "Reserveret til {day}",
    storage_item_search_placeholder: "Søg efter vare…",
    reservations: "Reserveret til: {days}",
    no_storages: "Du har ikke tilføjet nogen opbevaringssteder endnu.",
    items_title: "Vareliste", new_item_placeholder: "Ny vare, f.eks. Kyllingebryst",
    item_search_placeholder: "Søg i varer…", no_matching_items: "Ingen varer matcher søgningen.", no_items: "Ingen varer endnu.",
    shopping_title: "Indkøbsliste", no_shopping_items: "Indkøbslisten er tom.",
    note_placeholder: "Note (valgfri)", quantity_placeholder: "Mængde",
    unit_stk: "stk", unit_pakke: "pakker", unit_pose: "poser", unit_gram: "gram", unit_liter: "liter",
    remaining: "tilbage",
    inventory_search_placeholder: "Søg i dit lager…", inventory_empty: "Der er ikke noget tilgængeligt på lager endnu.", inventory_no_match: "Ingen lagervarer matcher søgningen.", available: "tilgængelig",
    place_in_storage: "+ Placér i opbevaring", select_storage: "— Vælg opbevaring —", select_location: "— Vælg rum —",
    confirm_remove_storage: "Fjern dette opbevaringssted? Alle varer i det bliver fjernet.",
    confirm_remove_location: "Fjern dette rum? Varer i det bliver fjernet.",
    confirm_delete_dinner: "Slet denne madplan? Reserverede varer bliver frigivet.",
    confirm_complete_dinner: "Marker som lavet? Varerne fjernes fra lageret.",
    confirm_remove_item: "Fjern denne vare fra varelisten?",
    confirm_remove_stored_item: "Fjern denne vare fra opbevaringen?",
    confirm_remove_shopping_item: "Fjern denne vare fra indkøbslisten?",
    error_prefix: "Fejl: ",
    editor_entry_id_label: "Config Entry ID",
    editor_entry_id_hint: "Findes i Indstillinger → Integrationer → Madplan → URL for indgangen",
    editor_title_label: "Korttitel", editor_title_optional: "(valgfri)", editor_title_placeholder: "Madplan",
    editor_layout_label: "Layout", editor_layout_standard: "Standard", editor_layout_vertical: "Lodret køleskærm",
  },
  en: {
    card_title: "Dinner Plan", loading: "Loading…",
    tab_madplan: "Plan", tab_inventory: "Inventory", tab_storage: "Storage", tab_items: "Items", tab_shopping: "Shopping list",
    day_monday: "Monday", day_tuesday: "Tuesday", day_wednesday: "Wednesday", day_thursday: "Thursday",
    day_friday: "Friday", day_saturday: "Saturday", day_sunday: "Sunday",
    prev_week: "‹ Week", next_week: "Week ›", week_label: "Week {n}",
    dinner_placeholder: "What's for dinner? E.g. chicken curry with rice…",
    search_placeholder: "Search for an item (e.g. chicken)…",
    btn_save: "Save", btn_edit: "Edit", btn_delete: "Delete", btn_complete: "Mark as cooked",
    completed_badge: "✓ Cooked", used_items: "Used items:",
    save_status_saved: "✓ Saved", save_status_saving: "Saving…", save_status_unsaved: "● Saving changes…", save_status_error: "⚠ Could not save",
    no_stock: "Not in stock", add_to_shopping: "+ Add to shopping list",
    in_storage_at: "in {storage} / {location}",
    not_in_list: "Not in the item list yet.", add_to_items: "+ Add \"{name}\" to item list",
    storages_title: "My storage places", add_storage: "+ Add storage",
    storage_name: "Name (e.g. Freezer)", storage_type: "Type (e.g. freezer/cabinet)",
    locations_label: "Compartments (e.g. Drawer 1, Drawer 2)", locations_hint: "Comma separated",
    btn_add: "Add", btn_cancel: "Cancel", btn_remove: "Remove",
    consume: "Use", consume_quantity: "Amount to use", confirm_consume: "Use",
    add_location: "+ Add compartment", location_name_placeholder: "Compartment name",
    empty_location: "— empty —", place_item: "+ Place item",
    select_item: "— Select item —", reserved_for: "Reserved for {day}",
    storage_item_search_placeholder: "Search for an item…",
    reservations: "Reserved for: {days}",
    no_storages: "You haven't added any storage places yet.",
    items_title: "Item list", new_item_placeholder: "New item, e.g. Chicken breast",
    item_search_placeholder: "Search items…", no_matching_items: "No items match your search.", no_items: "No items yet.",
    shopping_title: "Shopping list", no_shopping_items: "The shopping list is empty.",
    note_placeholder: "Note (optional)", quantity_placeholder: "Amount",
    unit_stk: "pcs", unit_pakke: "packs", unit_pose: "bags", unit_gram: "gram", unit_liter: "liter",
    remaining: "remaining",
    inventory_search_placeholder: "Search your inventory…", inventory_empty: "Nothing is available in storage yet.", inventory_no_match: "No inventory items match your search.", available: "available",
    place_in_storage: "+ Place in storage", select_storage: "— Select storage —", select_location: "— Select compartment —",
    confirm_remove_storage: "Remove this storage? All items in it will be removed.",
    confirm_remove_location: "Remove this compartment? Items in it will be removed.",
    confirm_delete_dinner: "Delete this dinner plan? Reserved items will be freed.",
    confirm_complete_dinner: "Mark as cooked? The items will be removed from storage.",
    confirm_remove_item: "Remove this item from the item list?",
    confirm_remove_stored_item: "Remove this item from storage?",
    confirm_remove_shopping_item: "Remove this item from the shopping list?",
    error_prefix: "Error: ",
    editor_entry_id_label: "Config Entry ID",
    editor_entry_id_hint: "Found in Settings → Integrations → Madplan → entry URL",
    editor_title_label: "Card title", editor_title_optional: "(optional)", editor_title_placeholder: "Dinner Plan",
    editor_layout_label: "Layout", editor_layout_standard: "Standard", editor_layout_vertical: "Vertical fridge screen",
  },
};

function _translate(hass, key, vars) {
  const lang = (hass?.locale?.language || hass?.language || "da").split("-")[0].toLowerCase();
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.da;
  let str = dict[key] ?? TRANSLATIONS.da[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) str = str.replace(`{${k}}`, String(v));
  return str;
}

function _escHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function _getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setHours(0, 0, 0, 0);
  d.setDate(diff);
  return d;
}

function _isoWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function _weekKey(monday) {
  const thursday = new Date(monday);
  thursday.setDate(monday.getDate() + 3);
  return `${thursday.getFullYear()}-W${String(_isoWeekNumber(monday)).padStart(2, "0")}`;
}

function _fmtDayDate(date) {
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

class MadplanCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._data = { storages: [], items: [], stored_items: [], dinners: {}, shopping_list: [] };
    this._tab = "madplan";
    this._loading = false;
    this._error = null;
    this._weekOffset = 0;
    this._dinnerDrafts = {};
    this._daySearch = {};
    this._dayStatus = {}; // key -> "saved" | "unsaved" | "saving" | "error"
    this._textSaveTimers = {};
    this._dinnerRevisions = {};
    this._dinnerSaveChains = {};

    this._showAddStorage = false;
    this._addStorageData = { name: "", type: "", locations: "" };
    this._addLocationFor = null;
    this._addLocationName = "";
    this._placeItemFor = null; // { storageId, locationId }
    this._placeItemSelected = "";
    this._placeItemSearch = "";
    this._placeItemQuantity = 1;
    this._placeItemUnit = DEFAULT_UNIT;
    this._consumeStoredItemFor = null;
    this._consumeStoredItemQuantity = 1;

    this._newItemName = "";
    this._newItemQuantity = 1;
    this._newItemUnit = DEFAULT_UNIT;
    this._itemSearch = "";
    this._inventorySearch = "";
    this._editItemId = null;
    this._editItemData = { name: "", quantity: 1, unit: DEFAULT_UNIT };
    this._shoppingAddItem = "";
    this._shoppingAddNote = "";
    this._shoppingAddQuantity = 1;
    this._shoppingAddUnit = DEFAULT_UNIT;
    this._placeShoppingFor = null; // shopping entry id
    this._placeShoppingStorageId = "";
    this._placeShoppingLocationId = "";

    this._modal = null;
  }

  setConfig(config) {
    if (!config.entry_id) throw new Error("madplan-card: 'entry_id' is required");
    this._config = { layout: "standard", ...config };
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._loaded) {
      this._loaded = true;
      this._loadData();
      this._subscribe();
    }
  }

  static getConfigElement() {
    return document.createElement("madplan-card-editor");
  }

  static getStubConfig() {
    return { entry_id: "", layout: "standard" };
  }

  connectedCallback() {
    this._render();
  }

  disconnectedCallback() {
    if (this._unsub) {
      this._unsub();
      this._unsub = null;
    }
    this._loaded = false;
  }

  async _subscribe() {
    try {
      this._unsub = await this._hass.connection.subscribeEvents((event) => {
        if (event.data?.entry_id === this._config.entry_id) {
          this._loadData();
        }
      }, "madplan_updated");
    } catch (_) {
      // Subscription not available; the card still works without live updates.
    }
  }

  async _loadData() {
    this._loading = true;
    this._error = null;
    this._render();
    try {
      this._data = await this._send("madplan/get_config", {});
      this._syncDrafts();
    } catch (e) {
      this._error = e.message || String(e);
    }
    this._loading = false;
    this._render();
  }

  async _send(type, extra) {
    return this._hass.connection.sendMessagePromise({
      type,
      entry_id: this._config.entry_id,
      ...extra,
    });
  }

  async _refresh(data) {
    this._data = { ...this._data, ...data };
    this._syncDrafts();
    this._render();
  }

  _syncDrafts() {
    const monday = this._currentMonday();
    const weekKey = _weekKey(monday);
    for (const day of DAY_KEYS) {
      const key = `${weekKey}|${day}`;
      // Don't clobber a day that has a pending or in-flight local edit.
      if (this._dayStatus[key] === "unsaved" || this._dayStatus[key] === "saving") continue;
      const dinner = this._data.dinners[key];
      this._dinnerDrafts[key] = {
        text: dinner ? dinner.text : "",
        allocations: dinner ? [...(dinner.allocations || [])] : [],
      };
      this._dayStatus[key] = "saved";
    }
  }

  async _autoSaveDinner(key) {
    const [week, day] = key.split("|");
    const revision = (this._dinnerRevisions[key] || 0) + 1;
    this._dinnerRevisions[key] = revision;
    this._dayStatus[key] = "saving";
    this._updateSaveStatus(key);
    const previous = this._dinnerSaveChains[key] || Promise.resolve();
    const operation = previous.catch(() => {}).then(async () => {
      const draft = this._dinnerDrafts[key] || { text: "", allocations: [] };
      try {
        const result = await this._send("madplan/set_dinner", {
          week,
          day,
          text: draft.text,
          allocations: draft.allocations,
        });
        if (revision !== (this._dinnerRevisions[key] || 0)) return;
        this._data = { ...this._data, ...result };
        this._dayStatus[key] = "saved";
      } catch (e) {
        if (revision === (this._dinnerRevisions[key] || 0)) {
          this._dayStatus[key] = "error";
          console.error(e);
        }
      }
      if (revision !== (this._dinnerRevisions[key] || 0)) return;
      this._updateChosenItems(key);
      this._updateDayActions(key);
      this._updateSearchArea(key);
    });
    this._dinnerSaveChains[key] = operation;
    await operation;
  }

  async _deleteDinner(key) {
    clearTimeout(this._textSaveTimers[key]);
    const revision = (this._dinnerRevisions[key] || 0) + 1;
    this._dinnerRevisions[key] = revision;
    this._dinnerDrafts[key] = { text: "", allocations: [] };
    const previous = this._dinnerSaveChains[key] || Promise.resolve();
    const operation = previous.catch(() => {}).then(async () => {
      const [week, day] = key.split("|");
      const result = await this._send("madplan/delete_dinner", { week, day });
      if (revision !== (this._dinnerRevisions[key] || 0)) return;
      this._data = { ...this._data, ...result };
      this._dayStatus[key] = "saved";
      this._render();
    });
    this._dinnerSaveChains[key] = operation;
    await operation;
  }

  _saveStatusLabel(key) {
    return this._t(`save_status_${this._dayStatus[key] || "saved"}`);
  }

  _updateSaveStatus(key) {
    const el = this.shadowRoot.querySelector(`.save-status[data-key="${key}"]`);
    if (!el) return;
    el.textContent = this._saveStatusLabel(key);
    el.className = `save-status status-${this._dayStatus[key] || "saved"}`;
  }

  _currentMonday() {
    const monday = _getMonday(new Date());
    monday.setDate(monday.getDate() + this._weekOffset * 7);
    return monday;
  }

  _t(key, vars) {
    return _translate(this._hass, key, vars);
  }

  async _runAction(fn) {
    try {
      await fn();
    } catch (e) {
      this._error = e.message || String(e);
      this._render();
    }
  }

  _confirm(message) {
    return new Promise((resolve) => {
      this._modal = { message, resolve };
      this._render();
    });
  }

  // ---------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------

  _render() {
    const shadow = this.shadowRoot;
    const focus = this._captureFocus();
    shadow.innerHTML = `
      <style>${this._css()}</style>
      <ha-card class="layout-${this._config.layout === "vertical" ? "vertical" : "standard"}" header="${_escHtml(this._config.title || this._t("card_title"))}">
        <div class="card-content">
          ${this._loading ? `<div class="loading">${this._t("loading")}</div>` : ""}
          ${this._error ? `<div class="error">${_escHtml(this._error)}</div>` : ""}
          ${!this._loading ? this._renderTabs() : ""}
          ${!this._loading ? this._renderTabContent() : ""}
        </div>
      </ha-card>
      ${this._modal ? this._renderModal() : ""}
    `;
    this._attachListeners();
    this._restoreFocus(focus);
  }

  _captureFocus() {
    const active = this.shadowRoot?.activeElement;
    if (!active || !active.dataset) return null;
    const key = Object.entries(active.dataset).map(([k, v]) => `[data-${k}="${v}"]`).join("");
    if (!key) return null;
    return {
      selector: `${active.tagName.toLowerCase()}${key}`,
      selectionStart: active.selectionStart,
      selectionEnd: active.selectionEnd,
    };
  }

  _restoreFocus(focus) {
    if (!focus) return;
    const el = this.shadowRoot.querySelector(focus.selector);
    if (!el) return;
    el.focus();
    if (typeof focus.selectionStart === "number" && el.setSelectionRange) {
      try {
        el.setSelectionRange(focus.selectionStart, focus.selectionEnd);
      } catch {
        // Not a text-selectable input (e.g. <select>), ignore.
      }
    }
  }

  _renderTabs() {
    const tabs = [
      { id: "madplan", label: this._t("tab_madplan") },
      { id: "inventory", label: this._t("tab_inventory") },
      { id: "storage", label: this._t("tab_storage") },
      { id: "items", label: this._t("tab_items") },
      { id: "shopping", label: this._t("tab_shopping") },
    ];
    return `
      <div class="tabs">
        ${tabs.map((t) => `<button class="tab ${this._tab === t.id ? "active" : ""}" data-tab="${t.id}">${t.label}</button>`).join("")}
      </div>`;
  }

  _renderTabContent() {
    if (this._tab === "madplan") return this._renderMadplan();
    if (this._tab === "inventory") return this._renderInventory();
    if (this._tab === "storage") return this._renderStorage();
    if (this._tab === "items") return this._renderItems();
    if (this._tab === "shopping") return this._renderShopping();
    return "";
  }

  _getInventoryItems() {
    const inventory = new Map();
    for (const storedItem of this._data.stored_items) {
      const quantity = storedItem.remaining_quantity ?? storedItem.quantity;
      if (quantity <= 0) continue;
      const key = `${storedItem.item_id}|${storedItem.unit}`;
      const current = inventory.get(key);
      inventory.set(key, {
        name: storedItem.item_name,
        unit: storedItem.unit,
        quantity: (current?.quantity || 0) + quantity,
      });
    }
    return [...inventory.values()].sort((left, right) =>
      left.name.localeCompare(right.name, undefined, { sensitivity: "base" })
    );
  }

  _renderInventoryItems() {
    const searchTerm = this._inventorySearch.trim().toLocaleLowerCase();
    const items = this._getInventoryItems().filter((item) =>
      item.name.toLocaleLowerCase().includes(searchTerm)
    );
    if (!items.length) {
      const message = this._getInventoryItems().length
        ? this._t("inventory_no_match")
        : this._t("inventory_empty");
      return `<div class="hint">${message}</div>`;
    }
    return `<ul class="inventory-list">
      ${items.map((item) => `
        <li>
          <span>${_escHtml(item.name)}</span>
          <strong>${this._qtyLabel(item.quantity, item.unit)} <small>${this._t("available")}</small></strong>
        </li>`).join("")}
    </ul>`;
  }

  _renderInventory() {
    return `
      <div class="section inventory-section">
        <h3>${this._t("tab_inventory")}</h3>
        <input type="search" class="inventory-search" data-inventory-search="true" placeholder="${this._t("inventory_search_placeholder")}" value="${_escHtml(this._inventorySearch)}">
        <div class="inventory-results">${this._renderInventoryItems()}</div>
      </div>`;
  }

  _updateInventoryResults() {
    const container = this.shadowRoot.querySelector(".inventory-results");
    if (!container) return;
    container.innerHTML = this._renderInventoryItems();
  }

  _renderModal() {
    return `
      <div class="modal-backdrop">
        <div class="modal">
          <p>${_escHtml(this._modal.message)}</p>
          <div class="modal-actions">
            <button id="modal-cancel">${this._t("btn_cancel")}</button>
            <button id="modal-ok" class="btn-danger">${this._t("btn_delete")}</button>
          </div>
        </div>
      </div>`;
  }

  // -- Madplan tab --------------------------------------------------------

  _availableStoredItems() {
    return this._data.stored_items.filter((si) => (si.remaining_quantity ?? si.quantity) > 0);
  }

  _storageLabel(storedItem) {
    const storage = this._data.storages.find((s) => s.id === storedItem.storage_id);
    const location = storage?.locations.find((l) => l.id === storedItem.location_id);
    return this._t("in_storage_at", { storage: storage?.name || "?", location: location?.name || "?" });
  }

  _reservationLabel(storedItem) {
    const reservations = storedItem.reservations || {};
    const entries = Object.entries(reservations);
    if (!entries.length && storedItem.dinner_key) {
      entries.push([storedItem.dinner_key, storedItem.quantity]);
    }
    const days = entries.map(([dinnerKey, quantity]) => {
      const day = dinnerKey.split("|")[1] || dinnerKey;
      return `${this._t(`day_${day}`)} (${this._qtyLabel(quantity, storedItem.unit)})`;
    });
    return this._t("reservations", { days: days.join(", ") });
  }

  _unitLabel(unit) {
    return this._t(`unit_${unit}`) || unit;
  }

  _qtyLabel(quantity, unit) {
    return `${Number(quantity)} ${this._unitLabel(unit)}`;
  }

  // Rendered into a standalone container so the search input never gets
  // recreated (and thus never loses focus) while the user is typing.
  _renderSearchArea(key) {
    const draft = this._dinnerDrafts[key] || { text: "", allocations: [] };
    const search = this._daySearch[key] || "";
    const term = search.trim().toLowerCase();

    const searchResults = term
          ? this._availableStoredItems()
          .filter((si) => !draft.allocations.some((allocation) => allocation.stored_item_id === si.id))
          .filter((si) => si.item_name.toLowerCase().includes(term))
          .slice(0, 8)
      : [];

    const matchesCommonItem = term
      ? this._data.items.find((it) => it.name.toLowerCase() === term)
      : null;
    const showAddToShopping = term && searchResults.length === 0;

    return `
      ${
        searchResults.length
          ? `<div class="search-results">
              ${searchResults.map((si) => `
                <div class="search-result-row">
                  <input type="number" min="0.01" max="${si.remaining_quantity ?? si.quantity}" step="any" class="search-quantity" data-item="${si.id}" value="${Math.min(1, si.remaining_quantity ?? si.quantity)}">
                  <select class="search-unit" data-item="${si.id}">
                    <option value="${si.unit}">${this._unitLabel(si.unit)}</option>
                  </select>
                  <button class="search-result" data-key="${key}" data-item="${si.id}">
                    ${_escHtml(si.item_name)} <small>${this._qtyLabel(si.remaining_quantity ?? si.quantity, si.unit)} ${this._t("remaining")} · ${this._storageLabel(si)}</small>
                  </button>
                </div>`).join("")}
            </div>`
          : ""
      }
      ${
        showAddToShopping
          ? matchesCommonItem
            ? `
              <div class="search-shopping-row">
                    <input type="number" min="0.01" step="any" class="search-shopping-quantity" data-key="${key}" value="${matchesCommonItem.default_quantity ?? 1}" placeholder="${this._t("quantity_placeholder")}>
                <select class="search-shopping-unit" data-key="${key}">
                      ${UNITS.map((unit) => `<option value="${unit}" ${unit === (matchesCommonItem.default_unit || DEFAULT_UNIT) ? "selected" : ""}>${this._unitLabel(unit)}</option>`).join("")}
                </select>
                <button class="btn-add-shopping" data-key="${key}" data-item-id="${matchesCommonItem.id}">${this._t("no_stock")} — ${this._t("add_to_shopping")}</button>
              </div>`
            : `
              <div class="hint">${this._t("not_in_list")}</div>
              <button class="btn-add-common-item" data-key="${key}" data-name="${_escHtml(search.trim())}">${this._t("add_to_items", { name: _escHtml(search.trim()) })}</button>
            `
          : ""
      }
    `;
  }

  _updateSearchArea(key) {
    const container = this.shadowRoot.querySelector(`.search-area[data-key="${key}"]`);
    if (!container) return;
    container.innerHTML = this._renderSearchArea(key);
    this._attachSearchAreaListeners(container);
  }

  _attachSearchAreaListeners(container) {
    container.querySelectorAll(".search-result").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.key;
        const draft = this._dinnerDrafts[key] || { text: "", allocations: [] };
        const row = btn.closest(".search-result-row");
        const storedItem = this._data.stored_items.find((si) => si.id === btn.dataset.item);
        const quantity = Number(row?.querySelector(".search-quantity")?.value || 0);
        if (!storedItem || !quantity || quantity <= 0 || quantity > (storedItem.remaining_quantity ?? storedItem.quantity)) return;
        draft.allocations.push({
          stored_item_id: btn.dataset.item,
          quantity,
          unit: storedItem.unit,
        });
        this._dinnerDrafts[key] = draft;
        this._daySearch[key] = "";
        const input = this.shadowRoot.querySelector(`.item-search[data-key="${key}"]`);
        if (input) input.value = "";
        this._autoSaveDinner(key);
      });
    });
    container.querySelectorAll(".btn-add-shopping").forEach((btn) => {
      btn.addEventListener("click", () =>
        this._runAction(async () => {
          const row = btn.closest(".search-shopping-row");
          const quantity = Number(row?.querySelector(".search-shopping-quantity")?.value || 0);
          const unit = row?.querySelector(".search-shopping-unit")?.value || DEFAULT_UNIT;
          if (!quantity || quantity <= 0) return;
          const result = await this._send("madplan/add_shopping_item", {
            item_id: btn.dataset.itemId,
            quantity,
            unit,
            note: "",
          });
          await this._refresh(result);
          this._daySearch[btn.dataset.key] = "";
          this._render();
        })
      );
    });
    container.querySelectorAll(".btn-add-common-item").forEach((btn) => {
      btn.addEventListener("click", () =>
        this._runAction(async () => {
          if (!btn.dataset.name) return;
          const result = await this._send("madplan/add_item", { name: btn.dataset.name });
          await this._refresh(result);
          this._daySearch[btn.dataset.key] = btn.dataset.name;
          this._render();
        })
      );
    });
  }

  // Chosen items and day-actions (status + complete/delete) are rendered
  // into their own containers and patched in place, so autosave never has
  // to recreate the textarea/search input and steal focus from the user.
  _renderChosenItems(key) {
    const draft = this._dinnerDrafts[key] || { text: "", allocations: [] };
    const chosenItems = draft.allocations
      .map((allocation) => ({
        storedItem: this._data.stored_items.find(
          (si) => si.id === allocation.stored_item_id
        ),
        allocation,
      }))
      .filter(({ storedItem }) => storedItem)
      .map(({ storedItem, allocation }) => ({ ...storedItem, allocation }));
    return chosenItems.map((si) => `
      <span class="chip" title="${_escHtml(this._storageLabel(si))}">
        ${_escHtml(si.item_name)} <small>${this._qtyLabel(si.allocation.quantity, si.allocation.unit)} · ${_escHtml(this._storageLabel(si))}</small>
        <button class="chip-remove" data-key="${key}" data-item="${si.id}">×</button>
      </span>
    `).join("");
  }

  _updateChosenItems(key) {
    const container = this.shadowRoot.querySelector(`.chosen-items[data-key="${key}"]`);
    if (!container) return;
    container.innerHTML = this._renderChosenItems(key);
    this._attachChosenItemsListeners(container);
  }

  _attachChosenItemsListeners(container) {
    container.querySelectorAll(".chip-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const draft = this._dinnerDrafts[btn.dataset.key] || { text: "", allocations: [] };
        draft.allocations = draft.allocations.filter(
          (allocation) => allocation.stored_item_id !== btn.dataset.item
        );
        this._dinnerDrafts[btn.dataset.key] = draft;
        this._autoSaveDinner(btn.dataset.key);
      });
    });
  }

  _renderDayActions(key) {
    const [week, day] = key.split("|");
    const dinner = this._data.dinners[key];
    return `
      <span class="save-status status-${this._dayStatus[key] || "saved"}" data-key="${key}">${this._saveStatusLabel(key)}</span>
      ${dinner ? `<button class="btn-complete-dinner" data-week="${week}" data-day="${day}">${this._t("btn_complete")}</button>` : ""}
      ${dinner ? `<button class="btn-delete-dinner btn-danger" data-week="${week}" data-day="${day}">${this._t("btn_delete")}</button>` : ""}
    `;
  }

  _updateDayActions(key) {
    const container = this.shadowRoot.querySelector(`.day-actions[data-key="${key}"]`);
    if (!container) return;
    container.innerHTML = this._renderDayActions(key);
    this._attachDayActionsListeners(container);
  }

  _attachDayActionsListeners(container) {
    container.querySelectorAll(".btn-complete-dinner").forEach((btn) => {
      btn.addEventListener("click", () =>
        this._runAction(async () => {
          if (!(await this._confirm(this._t("confirm_complete_dinner")))) return;
          const result = await this._send("madplan/complete_dinner", { week: btn.dataset.week, day: btn.dataset.day });
          await this._refresh(result);
        })
      );
    });
    container.querySelectorAll(".btn-delete-dinner").forEach((btn) => {
      btn.addEventListener("click", () =>
        this._runAction(async () => {
          if (!(await this._confirm(this._t("confirm_delete_dinner")))) return;
          await this._deleteDinner(`${btn.dataset.week}|${btn.dataset.day}`);
        })
      );
    });
  }

  _autoSizeDinnerText(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  _scheduleDinnerTextAutosize() {
    requestAnimationFrame(() => {
      this.shadowRoot.querySelectorAll(".dinner-text").forEach((textarea) => {
        this._autoSizeDinnerText(textarea);
      });
    });
  }

  _renderMadplan() {
    const monday = this._currentMonday();
    const weekKey = _weekKey(monday);
    const weekNum = _isoWeekNumber(monday);

    const days = DAY_KEYS.map((day, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const key = `${weekKey}|${day}`;
      const dinner = this._data.dinners[key];
      const draft = this._dinnerDrafts[key] || { text: "", allocations: [] };
      const completed = dinner?.completed;
      const search = this._daySearch[key] || "";

      return `
        <div class="day-card ${completed ? "completed" : ""}">
          <div class="day-header">
            <span class="day-name">${this._t(`day_${day}`)}</span>
            <span class="day-date">${_fmtDayDate(date)}</span>
            ${completed ? `<span class="badge-completed">${this._t("completed_badge")}</span>` : ""}
          </div>
          ${
            completed
              ? `
            <div class="dinner-text-readonly">${_escHtml(dinner.text)}</div>
            ${dinner.item_names?.length ? `<div class="used-items"><strong>${this._t("used_items")}</strong> ${dinner.item_names.map((it) => `${_escHtml(it.name)} (${this._qtyLabel(it.quantity, it.unit)})`).join(", ")}</div>` : ""}
          `
              : `
            <textarea class="dinner-text" data-key="${key}" placeholder="${this._t("dinner_placeholder")}">${_escHtml(draft.text)}</textarea>
            <div class="chosen-items" data-key="${key}">${this._renderChosenItems(key)}</div>
            <div class="search-row">
              <input type="text" class="item-search" data-key="${key}" placeholder="${this._t("search_placeholder")}" value="${_escHtml(search)}">
            </div>
            <div class="search-area" data-key="${key}">${this._renderSearchArea(key)}</div>
            <div class="day-actions" data-key="${key}">${this._renderDayActions(key)}</div>
          `
          }
        </div>`;
    }).join("");

    return `
      <div class="week-nav">
        <button id="prev-week">${this._t("prev_week")}</button>
        <span class="week-label">${this._t("week_label", { n: weekNum })}</span>
        <button id="next-week">${this._t("next_week")}</button>
      </div>
      <div class="days-grid">${days}</div>`;
  }

  // -- Storage tab --------------------------------------------------------

  _renderStorage() {
    const { storages, stored_items } = this._data;

    const storageBlocks = storages.map((storage) => {
      const locations = storage.locations.map((location) => {
        const items = stored_items.filter((si) => si.location_id === location.id);
        const isPlacing = this._placeItemFor?.storageId === storage.id && this._placeItemFor?.locationId === location.id;
        return `
          <div class="location">
            <div class="location-header">
              <span>${_escHtml(location.name)}</span>
              <button class="btn-remove-location" data-storage="${storage.id}" data-location="${location.id}">${this._t("btn_remove")}</button>
            </div>
            <div class="location-items">
              ${
                items.length
                  ? items.map((si) => `
                    <span class="chip ${si.reserved ? "chip-reserved" : ""}" title="${si.reserved ? _escHtml(this._reservationLabel(si)) : ""}">
                      ${_escHtml(si.item_name)} <small>${this._qtyLabel(si.quantity, si.unit)} (${this._qtyLabel(si.remaining_quantity ?? si.quantity, si.unit)} ${this._t("remaining")})</small>${si.reserved ? " 🔒" : ""}
                      ${si.remaining_quantity > 0 ? `<button class="btn-consume-stored-item" data-id="${si.id}">${this._t("consume")}</button>` : ""}
                      <button class="btn-remove-stored-item" data-id="${si.id}">×</button>
                    </span>`).join("")
                  : `<span class="empty-location">${this._t("empty_location")}</span>`
              }
            </div>
            ${
              this._consumeStoredItemFor
                ? (() => {
                    const consumeItem = items.find((item) => item.id === this._consumeStoredItemFor);
                    if (!consumeItem) return "";
                    return `
                  <div class="consume-item-form">
                    <span>${_escHtml(consumeItem.item_name)} (${this._qtyLabel(consumeItem.remaining_quantity, consumeItem.unit)})</span>
                    <input type="number" min="0.01" max="${consumeItem.remaining_quantity}" step="any" class="consume-item-quantity" placeholder="${this._t("consume_quantity")}" value="${this._consumeStoredItemQuantity}">
                    <button class="btn-confirm-consume" data-id="${consumeItem.id}">${this._t("confirm_consume")}</button>
                    <button class="btn-cancel-consume">${this._t("btn_cancel")}</button>
                  </div>`;
                  })()
                : ""
            }
            ${
              isPlacing
                ? `
              <div class="place-item-form">
                <div class="place-item-picker">
                  <input type="search" class="place-item-search" placeholder="${this._t("storage_item_search_placeholder")}" value="${_escHtml(this._placeItemSearch)}">
                  <div class="place-item-results">${this._renderPlaceItemResults()}</div>
                </div>
                <input type="number" min="0.01" step="any" class="place-item-quantity" placeholder="${this._t("quantity_placeholder")}" value="${this._placeItemQuantity}">
                <select class="place-item-unit">
                  ${UNITS.map((u) => `<option value="${u}" ${this._placeItemUnit === u ? "selected" : ""}>${this._unitLabel(u)}</option>`).join("")}
                </select>
                <button class="btn-confirm-place-item" data-storage="${storage.id}" data-location="${location.id}">${this._t("btn_add")}</button>
                <button class="btn-cancel-place-item">${this._t("btn_cancel")}</button>
              </div>`
                : `<button class="btn-place-item" data-storage="${storage.id}" data-location="${location.id}">${this._t("place_item")}</button>`
            }
          </div>`;
      }).join("");

      const isAddingLocation = this._addLocationFor === storage.id;

      return `
        <div class="storage-card">
          <div class="storage-header">
            <span class="storage-name">${_escHtml(storage.name)}</span>
            <span class="storage-type">${_escHtml(storage.type)}</span>
            <button class="btn-remove-storage btn-danger" data-storage="${storage.id}">${this._t("btn_remove")}</button>
          </div>
          <div class="locations">${locations}</div>
          ${
            isAddingLocation
              ? `
            <div class="add-location-form">
              <input type="text" class="add-location-name" placeholder="${this._t("location_name_placeholder")}" value="${_escHtml(this._addLocationName)}">
              <button class="btn-confirm-add-location" data-storage="${storage.id}">${this._t("btn_add")}</button>
              <button class="btn-cancel-add-location">${this._t("btn_cancel")}</button>
            </div>`
              : `<button class="btn-show-add-location" data-storage="${storage.id}">${this._t("add_location")}</button>`
          }
        </div>`;
    }).join("");

    return `
      <div class="section">
        <h3>${this._t("storages_title")}</h3>
        ${storages.length ? `<div class="storages-grid">${storageBlocks}</div>` : `<div class="hint">${this._t("no_storages")}</div>`}
        ${
          this._showAddStorage
            ? `
          <div class="add-storage-form">
            <input type="text" id="add-storage-name" placeholder="${this._t("storage_name")}" value="${_escHtml(this._addStorageData.name)}">
            <input type="text" id="add-storage-type" placeholder="${this._t("storage_type")}" value="${_escHtml(this._addStorageData.type)}">
            <input type="text" id="add-storage-locations" placeholder="${this._t("locations_label")}" value="${_escHtml(this._addStorageData.locations)}">
            <div class="hint">${this._t("locations_hint")}</div>
            <button id="btn-confirm-add-storage">${this._t("btn_add")}</button>
            <button id="btn-cancel-add-storage">${this._t("btn_cancel")}</button>
          </div>`
            : `<button id="btn-show-add-storage" class="btn-add">${this._t("add_storage")}</button>`
        }
      </div>`;
  }

  _renderPlaceItemResults() {
    const searchTerm = this._placeItemSearch.trim().toLocaleLowerCase();
    const items = this._data.items
      .filter((item) => item.name.toLocaleLowerCase().includes(searchTerm))
      .slice(0, 20);
    if (!items.length) return `<div class="hint">${this._t("no_matching_items")}</div>`;
    return items.map((item) => `
      <button type="button" class="place-item-option ${item.id === this._placeItemSelected ? "selected" : ""}" data-id="${item.id}">
        ${_escHtml(item.name)} <small>${this._qtyLabel(item.default_quantity, item.default_unit)}</small>
      </button>`).join("");
  }

  _updatePlaceItemResults() {
    const container = this.shadowRoot.querySelector(".place-item-results");
    if (!container) return;
    container.innerHTML = this._renderPlaceItemResults();
    this._attachPlaceItemOptionListeners(container);
  }

  _attachPlaceItemOptionListeners(container) {
    container.querySelectorAll(".place-item-option").forEach((button) => {
      button.addEventListener("click", () => {
        this._placeItemSelected = button.dataset.id;
        const item = this._data.items.find((entry) => entry.id === button.dataset.id);
        if (!item) return;
        this._placeItemQuantity = item.default_quantity ?? 1;
        this._placeItemUnit = item.default_unit || DEFAULT_UNIT;
        const quantity = this.shadowRoot.querySelector(".place-item-quantity");
        const unit = this.shadowRoot.querySelector(".place-item-unit");
        if (quantity) quantity.value = this._placeItemQuantity;
        if (unit) unit.value = this._placeItemUnit;
        this._updatePlaceItemResults();
      });
    });
  }

  // -- Items tab --------------------------------------------------------

  _renderItems() {
    return `
      <div class="section">
        <h3>${this._t("items_title")}</h3>
        <input type="search" class="item-list-search" data-item-search="true" placeholder="${this._t("item_search_placeholder")}" value="${_escHtml(this._itemSearch)}">
        <div class="add-item-row add-common-item-row">
          <input type="text" id="new-item-name" placeholder="${this._t("new_item_placeholder")}" value="${_escHtml(this._newItemName)}">
              <input type="number" min="0.01" step="any" id="new-item-quantity" placeholder="${this._t("quantity_placeholder")}" value="${this._newItemQuantity}">
              <select id="new-item-unit">
                ${UNITS.map((unit) => `<option value="${unit}" ${this._newItemUnit === unit ? "selected" : ""}>${this._unitLabel(unit)}</option>`).join("")}
              </select>
          <button id="btn-add-item">${this._t("btn_add")}</button>
        </div>
        <div class="item-list-results">${this._renderItemListResults()}</div>
      </div>`;
  }

  _renderItemListResults() {
    const searchTerm = this._itemSearch.trim().toLocaleLowerCase();
    const filteredItems = this._data.items.filter((item) =>
      item.name.toLocaleLowerCase().includes(searchTerm)
    );
    if (!filteredItems.length) {
      return `<div class="hint">${this._data.items.length ? this._t("no_matching_items") : this._t("no_items")}</div>`;
    }
    return `<ul class="item-list">
      ${filteredItems.map((it) => {
        if (this._editItemId === it.id) {
          return `
            <li class="edit-item-row">
              <input type="text" class="edit-item-name" data-id="${it.id}" value="${_escHtml(this._editItemData.name)}">
              <input type="number" min="0.01" step="any" class="edit-item-quantity" data-id="${it.id}" value="${this._editItemData.quantity}">
              <select class="edit-item-unit" data-id="${it.id}">
                ${UNITS.map((unit) => `<option value="${unit}" ${this._editItemData.unit === unit ? "selected" : ""}>${this._unitLabel(unit)}</option>`).join("")}
              </select>
              <button class="btn-save-item" data-id="${it.id}">${this._t("btn_save")}</button>
              <button class="btn-cancel-item" data-id="${it.id}">${this._t("btn_cancel")}</button>
            </li>`;
        }
        return `
          <li class="common-item-row">
            <span class="item-name">${_escHtml(it.name)}</span>
            <span class="item-quantity">${Number(it.default_quantity)}</span>
            <span class="item-unit">${this._unitLabel(it.default_unit)}</span>
            <button class="btn-edit-item" data-id="${it.id}">${this._t("btn_edit")}</button>
            <button class="btn-remove-item btn-danger" data-id="${it.id}">${this._t("btn_remove")}</button>
          </li>`;
      }).join("")}
    </ul>`;
  }

  _updateItemListResults() {
    const container = this.shadowRoot.querySelector(".item-list-results");
    if (!container) return;
    container.innerHTML = this._renderItemListResults();
    this._attachItemListListeners(container);
  }

  _attachItemListListeners(root) {
    root.querySelectorAll(".btn-edit-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = this._data.items.find((entry) => entry.id === btn.dataset.id);
        if (!item) return;
        this._editItemId = item.id;
        this._editItemData = {
          name: item.name,
          quantity: item.default_quantity ?? 1,
          unit: item.default_unit || DEFAULT_UNIT,
        };
        this._render();
      });
    });
    root.querySelector(".edit-item-name")?.addEventListener("input", (e) => (this._editItemData.name = e.target.value));
    root.querySelector(".edit-item-quantity")?.addEventListener("input", (e) => (this._editItemData.quantity = e.target.value));
    root.querySelector(".edit-item-unit")?.addEventListener("change", (e) => (this._editItemData.unit = e.target.value));
    root.querySelector(".btn-cancel-item")?.addEventListener("click", () => {
      this._editItemId = null;
      this._render();
    });
    root.querySelector(".btn-save-item")?.addEventListener("click", (event) =>
      this._runAction(async () => {
        const name = this._editItemData.name.trim();
        const quantity = Number(this._editItemData.quantity);
        if (!name || !quantity || quantity <= 0) return;
        const result = await this._send("madplan/update_item", {
          item_id: event.currentTarget.dataset.id,
          name,
          default_quantity: quantity,
          default_unit: this._editItemData.unit,
        });
        this._editItemId = null;
        await this._refresh(result);
      })
    );
    root.querySelectorAll(".btn-remove-item").forEach((btn) => {
      btn.addEventListener("click", () =>
        this._runAction(async () => {
          if (!(await this._confirm(this._t("confirm_remove_item")))) return;
          const result = await this._send("madplan/remove_item", { item_id: btn.dataset.id });
          await this._refresh(result);
        })
      );
    });
  }
  // -- Shopping tab --------------------------------------------------------

  _renderShopping() {
    const { shopping_list, items, storages } = this._data;
    return `
      <div class="section">
        <h3>${this._t("shopping_title")}</h3>
        <div class="add-item-row add-shopping-row">
          <select id="shopping-add-item">
            <option value="">${this._t("select_item")}</option>
            ${items.map((it) => `<option value="${it.id}" ${this._shoppingAddItem === it.id ? "selected" : ""}>${_escHtml(it.name)}</option>`).join("")}
          </select>
          <input type="number" min="0.01" step="any" id="shopping-add-quantity" placeholder="${this._t("quantity_placeholder")}" value="${this._shoppingAddQuantity}">
          <select id="shopping-add-unit">
            ${UNITS.map((u) => `<option value="${u}" ${this._shoppingAddUnit === u ? "selected" : ""}>${this._unitLabel(u)}</option>`).join("")}
          </select>
          <input type="text" id="shopping-add-note" placeholder="${this._t("note_placeholder")}" value="${_escHtml(this._shoppingAddNote)}">
          <button id="btn-add-shopping-item">${this._t("btn_add")}</button>
        </div>
        ${
          shopping_list.length
            ? `<ul class="item-list">
                ${shopping_list.map((entry) => {
                  const isPlacing = this._placeShoppingFor === entry.id;
                  const selectedStorage = storages.find((s) => s.id === this._placeShoppingStorageId);
                  return `
                  <li class="shopping-row">
                    <div class="item-row">
                      <span>${_escHtml(entry.item_name)} <small>${this._qtyLabel(entry.quantity, entry.unit)}</small>${entry.note ? ` — <em>${_escHtml(entry.note)}</em>` : ""}</span>
                      <span class="item-actions">
                        <button class="btn-show-place-shopping" data-id="${entry.id}">${this._t("place_in_storage")}</button>
                        <button class="btn-remove-shopping-item btn-danger" data-id="${entry.id}">${this._t("btn_remove")}</button>
                      </span>
                    </div>
                    ${
                      isPlacing
                        ? `
                      <div class="place-shopping-form">
                        <select class="place-shopping-storage" data-id="${entry.id}">
                          <option value="">${this._t("select_storage")}</option>
                          ${storages.map((s) => `<option value="${s.id}" ${this._placeShoppingStorageId === s.id ? "selected" : ""}>${_escHtml(s.name)}</option>`).join("")}
                        </select>
                        <select class="place-shopping-location" data-id="${entry.id}">
                          <option value="">${this._t("select_location")}</option>
                          ${(selectedStorage?.locations || []).map((l) => `<option value="${l.id}" ${this._placeShoppingLocationId === l.id ? "selected" : ""}>${_escHtml(l.name)}</option>`).join("")}
                        </select>
                        <button class="btn-confirm-place-shopping" data-id="${entry.id}">${this._t("btn_add")}</button>
                        <button class="btn-cancel-place-shopping">${this._t("btn_cancel")}</button>
                      </div>`
                        : ""
                    }
                  </li>`;
                }).join("")}
              </ul>`
            : `<div class="hint">${this._t("no_shopping_items")}</div>`
        }
      </div>`;
  }

  // ---------------------------------------------------------------------
  // Listeners
  // ---------------------------------------------------------------------

  _attachListeners() {
    const root = this.shadowRoot;

    root.querySelectorAll("[data-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this._tab = btn.dataset.tab;
        this._render();
      });
    });

    root.querySelector("#prev-week")?.addEventListener("click", () => {
      this._weekOffset -= 1;
      this._syncDrafts();
      this._render();
    });
    root.querySelector("#next-week")?.addEventListener("click", () => {
      this._weekOffset += 1;
      this._syncDrafts();
      this._render();
    });

    root.querySelectorAll(".dinner-text").forEach((el) => {
      this._autoSizeDinnerText(el);
      el.addEventListener("input", () => {
        this._autoSizeDinnerText(el);
        const key = el.dataset.key;
        const draft = this._dinnerDrafts[key] || { text: "", allocations: [] };
        draft.text = el.value;
        this._dinnerDrafts[key] = draft;
        this._dayStatus[key] = "unsaved";
        this._updateSaveStatus(key);
        clearTimeout(this._textSaveTimers[key]);
        this._textSaveTimers[key] = setTimeout(() => this._autoSaveDinner(key), 800);
      });
      el.addEventListener("blur", () => {
        const key = el.dataset.key;
        clearTimeout(this._textSaveTimers[key]);
        if (this._dayStatus[key] === "unsaved") this._autoSaveDinner(key);
      });
    });
    this._scheduleDinnerTextAutosize();

    root.querySelectorAll(".item-search").forEach((el) => {
      el.addEventListener("input", () => {
        this._daySearch[el.dataset.key] = el.value;
        this._updateSearchArea(el.dataset.key);
      });
    });

    root.querySelectorAll(".chosen-items").forEach((container) => this._attachChosenItemsListeners(container));

    root.querySelectorAll(".search-area").forEach((container) => this._attachSearchAreaListeners(container));

    root.querySelectorAll(".day-actions").forEach((container) => this._attachDayActionsListeners(container));

    // Storage tab
    root.querySelector("#btn-show-add-storage")?.addEventListener("click", () => {
      this._showAddStorage = true;
      this._render();
    });
    root.querySelector("#btn-cancel-add-storage")?.addEventListener("click", () => {
      this._showAddStorage = false;
      this._addStorageData = { name: "", type: "", locations: "" };
      this._render();
    });
    root.querySelector("#add-storage-name")?.addEventListener("input", (e) => (this._addStorageData.name = e.target.value));
    root.querySelector("#add-storage-type")?.addEventListener("input", (e) => (this._addStorageData.type = e.target.value));
    root.querySelector("#add-storage-locations")?.addEventListener("input", (e) => (this._addStorageData.locations = e.target.value));
    root.querySelector("#btn-confirm-add-storage")?.addEventListener("click", () =>
      this._runAction(async () => {
        const locations = this._addStorageData.locations.split(",").map((s) => s.trim()).filter(Boolean);
        const result = await this._send("madplan/add_storage", {
          name: this._addStorageData.name,
          storage_type: this._addStorageData.type,
          locations,
        });
        this._showAddStorage = false;
        this._addStorageData = { name: "", type: "", locations: "" };
        await this._refresh(result);
      })
    );

    root.querySelectorAll(".btn-remove-storage").forEach((btn) => {
      btn.addEventListener("click", () =>
        this._runAction(async () => {
          if (!(await this._confirm(this._t("confirm_remove_storage")))) return;
          const result = await this._send("madplan/remove_storage", { storage_id: btn.dataset.storage });
          await this._refresh(result);
        })
      );
    });

    root.querySelectorAll(".btn-show-add-location").forEach((btn) => {
      btn.addEventListener("click", () => {
        this._addLocationFor = btn.dataset.storage;
        this._addLocationName = "";
        this._render();
      });
    });
    root.querySelector("#btn-cancel-add-location")?.addEventListener("click", () => {
      this._addLocationFor = null;
      this._render();
    });
    root.querySelector(".add-location-name")?.addEventListener("input", (e) => (this._addLocationName = e.target.value));
    root.querySelector(".btn-confirm-add-location")?.addEventListener("click", (e) =>
      this._runAction(async () => {
        const result = await this._send("madplan/add_location", {
          storage_id: e.target.dataset.storage,
          name: this._addLocationName,
        });
        this._addLocationFor = null;
        await this._refresh(result);
      })
    );

    root.querySelectorAll(".btn-remove-location").forEach((btn) => {
      btn.addEventListener("click", () =>
        this._runAction(async () => {
          if (!(await this._confirm(this._t("confirm_remove_location")))) return;
          const result = await this._send("madplan/remove_location", {
            storage_id: btn.dataset.storage,
            location_id: btn.dataset.location,
          });
          await this._refresh(result);
        })
      );
    });

    root.querySelectorAll(".btn-place-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        this._placeItemFor = { storageId: btn.dataset.storage, locationId: btn.dataset.location };
        this._placeItemSelected = "";
        this._placeItemSearch = "";
        this._placeItemQuantity = 1;
        this._placeItemUnit = DEFAULT_UNIT;
        this._render();
      });
    });
    root.querySelector(".btn-cancel-place-item")?.addEventListener("click", () => {
      this._placeItemFor = null;
      this._render();
    });
    root.querySelector(".place-item-search")?.addEventListener("input", (e) => {
      this._placeItemSearch = e.target.value;
      this._updatePlaceItemResults();
    });
    root.querySelectorAll(".place-item-option").forEach((button) => {
      button.addEventListener("click", () => {
        this._placeItemSelected = button.dataset.id;
        const item = this._data.items.find((entry) => entry.id === button.dataset.id);
        if (!item) return;
        this._placeItemQuantity = item.default_quantity ?? 1;
        this._placeItemUnit = item.default_unit || DEFAULT_UNIT;
        const quantity = root.querySelector(".place-item-quantity");
        const unit = root.querySelector(".place-item-unit");
        if (quantity) quantity.value = this._placeItemQuantity;
        if (unit) unit.value = this._placeItemUnit;
        this._updatePlaceItemResults();
      });
    });
    root.querySelector(".place-item-quantity")?.addEventListener("input", (e) => (this._placeItemQuantity = e.target.value));
    root.querySelector(".place-item-unit")?.addEventListener("change", (e) => (this._placeItemUnit = e.target.value));
    root.querySelector(".btn-confirm-place-item")?.addEventListener("click", (e) =>
      this._runAction(async () => {
        if (!this._placeItemSelected) return;
        const quantity = Number(this._placeItemQuantity);
        if (!quantity || quantity <= 0) return;
        const result = await this._send("madplan/add_stored_item", {
          item_id: this._placeItemSelected,
          storage_id: e.target.dataset.storage,
          location_id: e.target.dataset.location,
          quantity,
          unit: this._placeItemUnit,
        });
        this._placeItemFor = null;
        await this._refresh(result);
      })
    );

    root.querySelectorAll(".btn-remove-stored-item").forEach((btn) => {
      btn.addEventListener("click", () =>
        this._runAction(async () => {
          if (!(await this._confirm(this._t("confirm_remove_stored_item")))) return;
          const result = await this._send("madplan/remove_stored_item", { stored_item_id: btn.dataset.id });
          await this._refresh(result);
        })
      );
    });
    root.querySelectorAll(".btn-consume-stored-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        this._consumeStoredItemFor = btn.dataset.id;
        this._consumeStoredItemQuantity = 1;
        this._render();
      });
    });
    root.querySelector(".consume-item-quantity")?.addEventListener("input", (e) => {
      this._consumeStoredItemQuantity = e.target.value;
    });
    root.querySelector(".btn-cancel-consume")?.addEventListener("click", () => {
      this._consumeStoredItemFor = null;
      this._render();
    });
    root.querySelector(".btn-confirm-consume")?.addEventListener("click", (e) =>
      this._runAction(async () => {
        const quantity = Number(this._consumeStoredItemQuantity);
        if (!quantity || quantity <= 0) return;
        const result = await this._send("madplan/consume_stored_item", {
          stored_item_id: e.currentTarget.dataset.id,
          quantity,
        });
        this._consumeStoredItemFor = null;
        await this._refresh(result);
      })
    );

    // Items tab
    root.querySelector(".inventory-search")?.addEventListener("input", (e) => {
      this._inventorySearch = e.target.value;
      this._updateInventoryResults();
    });
    root.querySelector(".item-list-search")?.addEventListener("input", (e) => {
      this._itemSearch = e.target.value;
      this._updateItemListResults();
    });
    root.querySelector("#new-item-name")?.addEventListener("input", (e) => (this._newItemName = e.target.value));
    root.querySelector("#new-item-quantity")?.addEventListener("input", (e) => (this._newItemQuantity = e.target.value));
    root.querySelector("#new-item-unit")?.addEventListener("change", (e) => (this._newItemUnit = e.target.value));
    root.querySelector("#btn-add-item")?.addEventListener("click", () =>
      this._runAction(async () => {
        if (!this._newItemName.trim()) return;
        const defaultQuantity = Number(this._newItemQuantity);
        if (!defaultQuantity || defaultQuantity <= 0) return;
        const result = await this._send("madplan/add_item", {
          name: this._newItemName.trim(),
          default_quantity: defaultQuantity,
          default_unit: this._newItemUnit,
        });
        this._newItemName = "";
        this._newItemQuantity = 1;
        this._newItemUnit = DEFAULT_UNIT;
        await this._refresh(result);
      })
    );
    this._attachItemListListeners(root);

    // Shopping tab
    root.querySelector("#shopping-add-item")?.addEventListener("change", (e) => {
      this._shoppingAddItem = e.target.value;
      const item = this._data.items.find((entry) => entry.id === e.target.value);
      if (!item) return;
      this._shoppingAddQuantity = item.default_quantity ?? 1;
      this._shoppingAddUnit = item.default_unit || DEFAULT_UNIT;
      const quantity = root.querySelector("#shopping-add-quantity");
      const unit = root.querySelector("#shopping-add-unit");
      if (quantity) quantity.value = this._shoppingAddQuantity;
      if (unit) unit.value = this._shoppingAddUnit;
    });
    root.querySelector("#shopping-add-quantity")?.addEventListener("input", (e) => (this._shoppingAddQuantity = e.target.value));
    root.querySelector("#shopping-add-unit")?.addEventListener("change", (e) => (this._shoppingAddUnit = e.target.value));
    root.querySelector("#shopping-add-note")?.addEventListener("input", (e) => (this._shoppingAddNote = e.target.value));
    root.querySelector("#btn-add-shopping-item")?.addEventListener("click", () =>
      this._runAction(async () => {
        if (!this._shoppingAddItem) return;
        const quantity = Number(this._shoppingAddQuantity);
        if (!quantity || quantity <= 0) return;
        const result = await this._send("madplan/add_shopping_item", {
          item_id: this._shoppingAddItem,
          quantity,
          unit: this._shoppingAddUnit,
          note: this._shoppingAddNote,
        });
        this._shoppingAddItem = "";
        this._shoppingAddQuantity = 1;
        this._shoppingAddUnit = DEFAULT_UNIT;
        this._shoppingAddNote = "";
        await this._refresh(result);
      })
    );
    root.querySelectorAll(".btn-remove-shopping-item").forEach((btn) => {
      btn.addEventListener("click", () =>
        this._runAction(async () => {
          if (!(await this._confirm(this._t("confirm_remove_shopping_item")))) return;
          const result = await this._send("madplan/remove_shopping_item", { shopping_id: btn.dataset.id });
          await this._refresh(result);
        })
      );
    });

    root.querySelectorAll(".btn-show-place-shopping").forEach((btn) => {
      btn.addEventListener("click", () => {
        this._placeShoppingFor = btn.dataset.id;
        this._placeShoppingStorageId = "";
        this._placeShoppingLocationId = "";
        this._render();
      });
    });
    root.querySelector(".btn-cancel-place-shopping")?.addEventListener("click", () => {
      this._placeShoppingFor = null;
      this._render();
    });
    root.querySelector(".place-shopping-storage")?.addEventListener("change", (e) => {
      this._placeShoppingStorageId = e.target.value;
      this._placeShoppingLocationId = "";
      this._render();
    });
    root.querySelector(".place-shopping-location")?.addEventListener("change", (e) => {
      this._placeShoppingLocationId = e.target.value;
    });
    root.querySelector(".btn-confirm-place-shopping")?.addEventListener("click", (e) =>
      this._runAction(async () => {
        if (!this._placeShoppingStorageId || !this._placeShoppingLocationId) return;
        const result = await this._send("madplan/add_stored_item_from_shopping", {
          shopping_id: e.target.dataset.id,
          storage_id: this._placeShoppingStorageId,
          location_id: this._placeShoppingLocationId,
        });
        this._placeShoppingFor = null;
        await this._refresh(result);
      })
    );

    // Modal
    root.querySelector("#modal-cancel")?.addEventListener("click", () => {
      const resolve = this._modal.resolve;
      this._modal = null;
      this._render();
      resolve(false);
    });
    root.querySelector("#modal-ok")?.addEventListener("click", () => {
      const resolve = this._modal.resolve;
      this._modal = null;
      this._render();
      resolve(true);
    });
  }

  getCardSize() {
    return 8;
  }

  _css() {
    return `
      :host { display: block; }
      .card-content { padding: 8px 16px 16px; }
      .loading, .error, .hint { padding: 8px 0; color: var(--secondary-text-color); }
      .error { color: var(--error-color, #db4437); }
      .tabs { display: flex; flex-wrap: nowrap; gap: 4px; margin-bottom: 12px; border-bottom: 1px solid var(--divider-color); overflow-x: auto; }
      .tab { flex: 1 0 auto; background: none; border: none; padding: 8px 4px; cursor: pointer; font-weight: 500; color: var(--secondary-text-color); border-bottom: 2px solid transparent; white-space: nowrap; }
      .tab.active { color: var(--primary-color); border-bottom-color: var(--primary-color); }
      button { font-family: inherit; cursor: pointer; }

      .week-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
      .week-nav button { background: var(--secondary-background-color, #f0f0f0); border: none; border-radius: 8px; padding: 6px 12px; }
      .week-label { font-weight: 600; }

      .days-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }
      .day-card { background: var(--card-background-color, #fff); border: 1px solid var(--divider-color); border-radius: 12px; padding: 10px; display: flex; flex-direction: column; gap: 6px; }
      .day-card.completed { background: var(--secondary-background-color, #f4f7f2); opacity: 0.85; }
      .day-header { display: flex; align-items: baseline; gap: 6px; }
      .day-name { font-weight: 700; }
      .day-date { color: var(--secondary-text-color); font-size: 0.85em; }
      .badge-completed { margin-left: auto; color: var(--success-color, #2e7d32); font-weight: 600; font-size: 0.85em; }

      .dinner-text { width: 100%; box-sizing: border-box; min-height: 56px; height: auto; overflow-y: hidden; resize: none; border-radius: 8px; border: 1px solid var(--divider-color); padding: 6px 8px; font-family: inherit; }
      .dinner-text-readonly { white-space: pre-wrap; }
      .used-items { font-size: 0.85em; color: var(--secondary-text-color); }

      .chosen-items { display: flex; flex-wrap: wrap; gap: 4px; }
      .chip { background: var(--secondary-background-color, #eef2ee); color: var(--primary-text-color, #202124); border-radius: 14px; padding: 2px 8px; font-size: 0.85em; display: inline-flex; align-items: center; gap: 4px; }
      .chip small { color: var(--secondary-text-color, #5f6368); }
      .chip-reserved { background: var(--secondary-background-color, #eef2ee); color: var(--primary-text-color, #202124); border: 1px solid var(--warning-color, #f9a825); }
      .chip-reserved small { color: var(--secondary-text-color, #5f6368); }
      .chip-remove, .btn-remove-stored-item { background: none; border: none; cursor: pointer; font-size: 1em; line-height: 1; padding: 0 2px; color: var(--secondary-text-color); }
      .btn-consume-stored-item { border: 1px solid var(--warning-color, #f9a825); background: transparent; color: var(--primary-text-color); border-radius: 6px; padding: 2px 5px; font-size: 0.8em; }
      .consume-item-form { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 6px 0; }
      .consume-item-quantity { width: 90px; box-sizing: border-box; border-radius: 8px; border: 1px solid var(--divider-color); padding: 6px 8px; }
      .btn-confirm-consume, .btn-cancel-consume { border: none; border-radius: 8px; padding: 5px 8px; }
      .place-item-picker { flex: 1 1 240px; min-width: 180px; }
      .place-item-search { width: 100%; box-sizing: border-box; border-radius: 8px; border: 1px solid var(--divider-color); padding: 6px 8px; }
      .place-item-results { display: flex; flex-direction: column; max-height: 180px; overflow-y: auto; margin-top: 4px; border: 1px solid var(--divider-color); border-radius: 8px; }
      .place-item-option { border: 0; border-bottom: 1px solid var(--divider-color); background: var(--card-background-color, #fff); color: var(--primary-text-color); padding: 7px 9px; text-align: left; cursor: pointer; }
      .place-item-option:last-child { border-bottom: 0; }
      .place-item-option:hover, .place-item-option.selected { background: var(--secondary-background-color, #eef2ee); }

      .search-row input, .item-search { width: 100%; box-sizing: border-box; border-radius: 8px; border: 1px solid var(--divider-color); padding: 6px 8px; }
      .search-results { display: flex; flex-direction: column; gap: 2px; border: 1px solid var(--divider-color); border-radius: 8px; overflow: hidden; }
      .search-result { text-align: left; border: none; background: var(--card-background-color, #fff); padding: 6px 8px; }
      .search-result:hover { background: var(--secondary-background-color, #f0f0f0); }
      .btn-add-shopping, .btn-add-common-item { border: 1px dashed var(--warning-color, #f9a825); background: none; border-radius: 8px; padding: 6px; color: var(--warning-color, #f9a825); width: 100%; }
      .search-shopping-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
      .search-shopping-quantity { flex: 0 0 90px; min-width: 70px; border-radius: 8px; border: 1px solid var(--divider-color); padding: 6px 8px; }
      .search-shopping-unit { flex: 0 0 100px; min-width: 80px; border-radius: 8px; border: 1px solid var(--divider-color); padding: 6px 8px; }
      .search-shopping-row .btn-add-shopping { flex: 1; }

      .day-actions { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
      .day-actions button { flex: 1; border-radius: 8px; border: none; padding: 6px; background: var(--primary-color); color: var(--text-primary-color, #fff); }
      .save-status { flex: 1; font-size: 0.85em; color: var(--secondary-text-color); }
      .save-status.status-saved { color: var(--success-color, #2e7d32); }
      .save-status.status-saving, .save-status.status-unsaved { color: var(--warning-color, #f9a825); }
      .save-status.status-error { color: var(--error-color, #db4437); }
      .btn-danger { background: var(--error-color, #db4437) !important; }

      .section { margin-bottom: 16px; }
      .section h3 { margin: 0 0 8px; }
      .item-list-search { width: 100%; box-sizing: border-box; margin-bottom: 8px; border-radius: 8px; border: 1px solid var(--divider-color); padding: 8px 10px; font: inherit; }
      .inventory-search { width: 100%; box-sizing: border-box; margin-bottom: 8px; border-radius: 8px; border: 1px solid var(--divider-color); padding: 8px 10px; font: inherit; }
      .inventory-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
      .inventory-list li { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: var(--secondary-background-color, #f7f7f7); border-radius: 8px; padding: 9px 12px; }
      .inventory-list strong { color: var(--primary-text-color); white-space: nowrap; }
      .inventory-list small { color: var(--secondary-text-color); font-weight: 400; }

      .storage-card { border: 1px solid var(--divider-color); border-radius: 12px; padding: 10px; margin-bottom: 10px; }
      .storages-grid { display: block; }
      .storage-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
      .storage-name { font-weight: 700; }
      .storage-type { color: var(--secondary-text-color); font-size: 0.85em; background: var(--secondary-background-color, #eee); border-radius: 10px; padding: 1px 8px; }
      .storage-header .btn-remove-storage { margin-left: auto; border: none; border-radius: 8px; padding: 4px 8px; }

      .locations { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px; }
      .location { background: var(--secondary-background-color, #f7f7f7); border-radius: 8px; padding: 8px; }
      .location-header { display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 4px; }
      .location-header button { border: none; background: none; color: var(--secondary-text-color); font-size: 0.8em; }
      .location-items { display: flex; flex-wrap: wrap; gap: 4px; min-height: 20px; }
      .empty-location { color: var(--secondary-text-color); font-size: 0.85em; }
      .btn-place-item, .btn-show-add-location, .add-location .btn-add { border: 1px dashed var(--divider-color); background: none; border-radius: 8px; padding: 4px 8px; margin-top: 6px; width: 100%; }

      .place-item-form, .add-location-form, .add-storage-form, .add-item-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; align-items: center; }
      .place-item-form select, .add-storage-form input, .add-item-row input, .add-item-row select { flex: 1; min-width: 100px; border-radius: 8px; border: 1px solid var(--divider-color); padding: 6px 8px; }
      input[type="number"].place-item-quantity, input[type="number"]#shopping-add-quantity { flex: 0 0 90px; min-width: 70px; }
      select.place-item-unit, select#shopping-add-unit { flex: 0 0 100px; min-width: 80px; border-radius: 8px; border: 1px solid var(--divider-color); padding: 6px 8px; }

      .btn-add { border: 1px dashed var(--primary-color); background: none; color: var(--primary-color); border-radius: 8px; padding: 8px; width: 100%; }

      .item-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
      .item-list li { background: var(--secondary-background-color, #f7f7f7); border-radius: 8px; padding: 6px 10px; }
      .item-list li:not(.shopping-row) { display: flex; align-items: center; justify-content: space-between; }
      .item-list li button { border: none; border-radius: 8px; padding: 4px 8px; }
      .edit-item-row { display: flex; flex-wrap: wrap; gap: 6px; }
      .edit-item-row input, .edit-item-row select { flex: 1; min-width: 90px; border-radius: 8px; border: 1px solid var(--divider-color); padding: 6px 8px; }
      .item-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      .item-actions { display: flex; gap: 6px; flex-shrink: 0; }
      .place-shopping-form { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
      .place-shopping-form select { flex: 1; min-width: 100px; border-radius: 8px; border: 1px solid var(--divider-color); padding: 6px 8px; }

      .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 10; }
      .modal { background: var(--card-background-color, #fff); border-radius: 12px; padding: 16px; max-width: 320px; }
      .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
      .modal-actions button { border: none; border-radius: 8px; padding: 6px 12px; }

      .layout-vertical .card-content { padding: 12px 14px 18px; font-size: 1.08rem; }
      .layout-vertical .tabs { display: flex; flex-wrap: nowrap; gap: 6px; border-bottom: 0; margin-bottom: 14px; overflow-x: auto; }
      .layout-vertical .tab { flex: 1 0 auto; min-height: 48px; border-radius: 10px; border: 1px solid var(--divider-color); background: var(--secondary-background-color, #f7f7f7); padding: 10px 8px; font-size: 0.95rem; white-space: nowrap; }
      .layout-vertical .tab.active { border-color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 12%, var(--card-background-color)); }
      .layout-vertical .week-nav { gap: 8px; }
      .layout-vertical .week-nav button { min-height: 46px; padding: 10px 14px; font-size: 1rem; }
      .layout-vertical .week-label { font-size: 1.1rem; }
      .layout-vertical .days-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
      .layout-vertical .day-card, .layout-vertical .storage-card, .layout-vertical .location, .layout-vertical .item-list li, .layout-vertical .inventory-list li { border-radius: 10px; padding: 14px; }
      .layout-vertical .day-name { font-size: 1.18rem; }
      .layout-vertical .dinner-text { min-height: 84px; padding: 11px 12px; font-size: 1.05rem; line-height: 1.45; }
      .layout-vertical input, .layout-vertical select, .layout-vertical button { min-height: 44px; font-size: 1rem; }
      .layout-vertical .chip { width: 100%; box-sizing: border-box; justify-content: space-between; border-radius: 10px; padding: 8px 10px; font-size: 0.98rem; }
      .layout-vertical .chosen-items, .layout-vertical .location-items { flex-direction: column; align-items: stretch; }
      .layout-vertical .search-result-row, .layout-vertical .search-shopping-row, .layout-vertical .place-item-form, .layout-vertical .add-item-row, .layout-vertical .place-shopping-form, .layout-vertical .consume-item-form { flex-direction: column; align-items: stretch; }
      .layout-vertical .search-quantity, .layout-vertical .search-unit, .layout-vertical .search-result, .layout-vertical .search-shopping-quantity, .layout-vertical .search-shopping-unit, .layout-vertical .place-item-picker, .layout-vertical .place-item-quantity, .layout-vertical .place-item-unit, .layout-vertical #shopping-add-quantity, .layout-vertical #shopping-add-unit, .layout-vertical .consume-item-quantity { width: 100%; min-width: 0; flex: 1 1 auto; }
      .layout-vertical .search-result-row { display: grid; grid-template-columns: minmax(70px, 0.8fr) minmax(86px, 0.8fr); gap: 6px; align-items: stretch; }
      .layout-vertical .search-result-row .search-result { grid-column: 1 / -1; }
      .layout-vertical .search-result-row .search-quantity, .layout-vertical .search-result-row .search-unit { width: 100%; }
      .layout-vertical .place-item-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: stretch; }
      .layout-vertical .place-item-form .place-item-picker { grid-column: 1 / -1; width: 100%; }
      .layout-vertical .place-item-form .place-item-quantity, .layout-vertical .place-item-form .place-item-unit { grid-column: auto; width: 100%; }
      .layout-vertical .place-item-form .btn-confirm-place-item, .layout-vertical .place-item-form .btn-cancel-place-item { width: 100%; }
      .layout-vertical .add-common-item-row { display: grid; grid-template-columns: minmax(0, 1.8fr) minmax(70px, 0.7fr) minmax(86px, 0.8fr) minmax(76px, 0.7fr); align-items: stretch; }
      .layout-vertical .add-common-item-row #new-item-name, .layout-vertical .add-common-item-row #new-item-quantity, .layout-vertical .add-common-item-row #new-item-unit, .layout-vertical .add-common-item-row #btn-add-item { width: 100%; min-width: 0; }
      .layout-vertical .add-shopping-row { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(70px, 0.55fr) minmax(84px, 0.65fr) minmax(0, 1fr) minmax(76px, 0.55fr); align-items: stretch; }
      .layout-vertical .add-shopping-row #shopping-add-item, .layout-vertical .add-shopping-row #shopping-add-quantity, .layout-vertical .add-shopping-row #shopping-add-unit, .layout-vertical .add-shopping-row #shopping-add-note, .layout-vertical .add-shopping-row #btn-add-shopping-item { width: 100%; min-width: 0; }
      .layout-vertical .item-list li.common-item-row, .layout-vertical .item-list li.edit-item-row { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(58px, 0.5fr) minmax(78px, 0.7fr) minmax(72px, 0.6fr) minmax(82px, 0.7fr); gap: 6px; align-items: center; }
      .layout-vertical .common-item-row .item-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .layout-vertical .common-item-row .item-quantity, .layout-vertical .common-item-row .item-unit { color: var(--secondary-text-color); white-space: nowrap; }
      .layout-vertical .item-list li.edit-item-row input, .layout-vertical .item-list li.edit-item-row select, .layout-vertical .item-list li.common-item-row button, .layout-vertical .item-list li.edit-item-row button { width: 100%; min-width: 0; }
      .layout-vertical .day-actions, .layout-vertical .item-row, .layout-vertical .storage-header, .layout-vertical .location-header { align-items: stretch; }
      .layout-vertical .item-row, .layout-vertical .storage-header { flex-direction: column; }
      .layout-vertical .item-actions, .layout-vertical .day-actions { flex-wrap: wrap; }
      .layout-vertical .day-actions .save-status { flex: 1 1 100%; }
      .layout-vertical .day-actions button { flex: 1 1 0; }
      .layout-vertical .item-actions button { flex: 1 1 100%; }
      .layout-vertical .shopping-row .item-row { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(180px, 1fr); align-items: center; }
      .layout-vertical .shopping-row .item-row > span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .layout-vertical .shopping-row .item-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
      .layout-vertical .shopping-row .item-actions button { width: 100%; min-width: 0; flex: 1 1 auto; }
      .layout-vertical .shopping-row .place-shopping-form { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1.4fr) minmax(74px, 0.6fr) minmax(86px, 0.7fr); align-items: stretch; }
      .layout-vertical .shopping-row .place-shopping-form select, .layout-vertical .shopping-row .place-shopping-form button { width: 100%; min-width: 0; }
      .layout-vertical .storages-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
      .layout-vertical .storage-card { margin-bottom: 0; }
      .layout-vertical .locations { grid-template-columns: 1fr; }
    `;
  }
}

class MadplanCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  connectedCallback() {
    this._render();
  }

  _render() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        .row { margin-bottom: 12px; }
        label { display: block; font-size: 0.85em; color: var(--secondary-text-color); margin-bottom: 4px; }
        input, select { width: 100%; box-sizing: border-box; padding: 8px; border-radius: 8px; border: 1px solid var(--divider-color); }
        .hint { font-size: 0.8em; color: var(--secondary-text-color); margin-top: 4px; }
      </style>
      <div class="row">
        <label>${_translate(this._hass, "editor_entry_id_label")}</label>
        <input id="entry_id" value="${_escHtml(this._config.entry_id || "")}">
        <div class="hint">${_translate(this._hass, "editor_entry_id_hint")}</div>
      </div>
      <div class="row">
        <label>${_translate(this._hass, "editor_title_label")} ${_translate(this._hass, "editor_title_optional")}</label>
        <input id="title" placeholder="${_translate(this._hass, "editor_title_placeholder")}" value="${_escHtml(this._config.title || "")}">
      </div>
      <div class="row">
        <label>${_translate(this._hass, "editor_layout_label")}</label>
        <select id="layout">
          <option value="standard" ${(this._config.layout || "standard") === "standard" ? "selected" : ""}>${_translate(this._hass, "editor_layout_standard")}</option>
          <option value="vertical" ${this._config.layout === "vertical" ? "selected" : ""}>${_translate(this._hass, "editor_layout_vertical")}</option>
        </select>
      </div>
    `;
    this.shadowRoot.querySelector("#entry_id").addEventListener("input", (e) => this._update("entry_id", e.target.value));
    this.shadowRoot.querySelector("#title").addEventListener("input", (e) => this._update("title", e.target.value));
    this.shadowRoot.querySelector("#layout").addEventListener("change", (e) => this._update("layout", e.target.value));
  }

  _update(key, value) {
    this._config = { ...this._config, [key]: value };
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config } }));
  }
}

customElements.define("madplan-card", MadplanCard);
customElements.define("madplan-card-editor", MadplanCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "madplan-card",
  name: "Madplan Card",
  description: "Ugentlig madplan med fryser/skab-styring og indkøbsliste.",
});
