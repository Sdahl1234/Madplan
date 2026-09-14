"""Store."""

import logging
from typing import Any
import uuid

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import DEFAULT_UNIT, DOMAIN

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1


def _dinner_key(week: str, day: str) -> str:
    """Build the dinner dict key."""
    return f"{week}|{day}"


class MadplanError(Exception):
    """Raised for invalid madplan operations."""


class MadplanStore:
    """Store class."""

    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        """Init."""
        self._store: Store[dict[str, Any]] = Store(
            hass, STORAGE_VERSION, f"{DOMAIN}.{entry_id}"
        )
        self._storages: list[dict[str, Any]] = []
        self._items: list[dict[str, Any]] = []
        self._stored_items: list[dict[str, Any]] = []
        self._dinners: dict[str, dict[str, Any]] = {}
        self._shopping_list: list[dict[str, Any]] = []

    async def async_load(self) -> None:
        """Load."""
        data = await self._store.async_load()
        if data is None:
            return
        self._storages = data.get("storages", [])
        self._items = data.get("items", [])
        self._stored_items = data.get("stored_items", [])
        self._dinners = data.get("dinners", {})
        self._shopping_list = data.get("shopping_list", [])
        # Backfill quantity/unit for data saved before those fields existed.
        for stored_item in self._stored_items:
            stored_item.setdefault("quantity", 1)
            stored_item.setdefault("unit", DEFAULT_UNIT)
            reservations = stored_item.setdefault("reservations", {})
            if stored_item.get("reserved") and stored_item.get("dinner_key"):
                reservations.setdefault(
                    stored_item["dinner_key"], stored_item["quantity"]
                )
            self._update_stored_item_status(stored_item)
        for entry in self._shopping_list:
            entry.setdefault("quantity", 1)
            entry.setdefault("unit", DEFAULT_UNIT)
        for item in self._items:
            item.setdefault("default_quantity", 1)
            item.setdefault("default_unit", DEFAULT_UNIT)
        for dinner in self._dinners.values():
            if "allocations" in dinner:
                continue
            dinner["allocations"] = []
            for stored_item_id in dinner.get("item_ids", []):
                stored_item = next(
                    (si for si in self._stored_items if si["id"] == stored_item_id),
                    None,
                )
                if stored_item is not None:
                    dinner["allocations"].append(
                        {
                            "stored_item_id": stored_item_id,
                            "quantity": stored_item["quantity"],
                            "unit": stored_item["unit"],
                        }
                    )

    async def async_save(self) -> None:
        """Save."""
        await self._store.async_save(
            {
                "storages": self._storages,
                "items": self._items,
                "stored_items": self._stored_items,
                "dinners": self._dinners,
                "shopping_list": self._shopping_list,
            }
        )

    def get_data(self) -> dict[str, Any]:
        """Get all data."""
        return {
            "storages": list(self._storages),
            "items": list(self._items),
            "stored_items": list(self._stored_items),
            "dinners": dict(self._dinners),
            "shopping_list": list(self._shopping_list),
        }

    # -- Storages ---------------------------------------------------------

    def add_storage(
        self, name: str, storage_type: str, location_names: list[str]
    ) -> dict[str, Any]:
        """Add a storage (e.g. a freezer or a cabinet)."""
        storage: dict[str, Any] = {
            "id": str(uuid.uuid4()),
            "name": name,
            "type": storage_type,
            "locations": [
                {"id": str(uuid.uuid4()), "name": location_name}
                for location_name in location_names
            ],
        }
        self._storages.append(storage)
        return storage

    def update_storage(self, storage_id: str, name: str) -> dict[str, Any] | None:
        """Rename a storage."""
        for storage in self._storages:
            if storage["id"] == storage_id:
                storage["name"] = name
                return dict(storage)
        return None

    def remove_storage(self, storage_id: str) -> bool:
        """Remove a storage and everything stored in it."""
        before = len(self._storages)
        self._storages = [s for s in self._storages if s["id"] != storage_id]
        if len(self._storages) == before:
            return False
        for stored_item in [
            si for si in self._stored_items if si["storage_id"] == storage_id
        ]:
            self._discard_stored_item(stored_item)
        return True

    def add_location(self, storage_id: str, name: str) -> dict[str, Any] | None:
        """Add a location (e.g. a drawer) to a storage."""
        for storage in self._storages:
            if storage["id"] == storage_id:
                location = {"id": str(uuid.uuid4()), "name": name}
                storage["locations"].append(location)
                return location
        return None

    def remove_location(self, storage_id: str, location_id: str) -> bool:
        """Remove a location from a storage."""
        for storage in self._storages:
            if storage["id"] == storage_id:
                before = len(storage["locations"])
                storage["locations"] = [
                    location
                    for location in storage["locations"]
                    if location["id"] != location_id
                ]
                if len(storage["locations"]) == before:
                    return False
                for stored_item in [
                    si
                    for si in self._stored_items
                    if si["storage_id"] == storage_id
                    and si["location_id"] == location_id
                ]:
                    self._discard_stored_item(stored_item)
                return True
        return False

    # -- Common item list ---------------------------------------------------

    def add_item(
        self,
        name: str,
        default_quantity: float = 1,
        default_unit: str = DEFAULT_UNIT,
    ) -> dict[str, Any]:
        """Add an item to the common pick-list."""
        item = {
            "id": str(uuid.uuid4()),
            "name": name,
            "default_quantity": default_quantity,
            "default_unit": default_unit,
        }
        self._items.append(item)
        return item

    def remove_item(self, item_id: str) -> bool:
        """Remove an item from the common pick-list."""
        before = len(self._items)
        self._items = [item for item in self._items if item["id"] != item_id]
        return len(self._items) < before

    def update_item(
        self,
        item_id: str,
        name: str,
        default_quantity: float,
        default_unit: str,
    ) -> dict[str, Any] | None:
        """Update an item's name and default amount."""
        for item in self._items:
            if item["id"] == item_id:
                item["name"] = name
                item["default_quantity"] = default_quantity
                item["default_unit"] = default_unit
                return dict(item)
        return None

    # -- Stored items ---------------------------------------------------------

    def add_stored_item(
        self,
        item_id: str,
        storage_id: str,
        location_id: str,
        quantity: float = 1,
        unit: str = DEFAULT_UNIT,
    ) -> dict[str, Any]:
        """Place an item in a storage location."""
        item = next((i for i in self._items if i["id"] == item_id), None)
        if item is None:
            raise MadplanError("item_not_found")
        storage = next((s for s in self._storages if s["id"] == storage_id), None)
        if storage is None:
            raise MadplanError("storage_not_found")
        if not any(location["id"] == location_id for location in storage["locations"]):
            raise MadplanError("location_not_found")
        stored_item = {
            "id": str(uuid.uuid4()),
            "item_id": item_id,
            "item_name": item["name"],
            "storage_id": storage_id,
            "location_id": location_id,
            "quantity": quantity,
            "unit": unit,
            "reservations": {},
            "reserved": False,
            "dinner_key": None,
        }
        self._update_stored_item_status(stored_item)
        self._stored_items.append(stored_item)
        return stored_item

    @staticmethod
    def _reserved_quantity(stored_item: dict[str, Any]) -> float:
        """Return the quantity reserved from a stored item."""
        return sum(stored_item.get("reservations", {}).values())

    def _update_stored_item_status(self, stored_item: dict[str, Any]) -> None:
        """Keep legacy reservation fields in sync for the card."""
        reservations = stored_item.get("reservations", {})
        stored_item["reserved_quantity"] = self._reserved_quantity(stored_item)
        stored_item["remaining_quantity"] = max(
            0, stored_item["quantity"] - stored_item["reserved_quantity"]
        )
        stored_item["reserved"] = bool(reservations)
        stored_item["dinner_key"] = next(iter(reservations), None)

    def remove_stored_item(self, stored_item_id: str) -> bool:
        """Remove a stored item, freeing it from any dinner it's linked to."""
        stored_item = next(
            (si for si in self._stored_items if si["id"] == stored_item_id), None
        )
        if stored_item is None:
            return False
        self._discard_stored_item(stored_item)
        return True

    def consume_stored_item(self, stored_item_id: str, quantity: float) -> bool:
        """Consume an unreserved quantity from a stored item."""
        stored_item = next(
            (si for si in self._stored_items if si["id"] == stored_item_id), None
        )
        if stored_item is None:
            raise MadplanError("stored_item_not_found")
        if quantity > stored_item["remaining_quantity"]:
            raise MadplanError("insufficient_quantity")
        stored_item["quantity"] -= quantity
        if stored_item["quantity"] <= 0:
            self._stored_items.remove(stored_item)
        else:
            self._update_stored_item_status(stored_item)
        return True

    def _discard_stored_item(self, stored_item: dict[str, Any]) -> None:
        """Remove a stored item and unlink it from its dinner, if any."""
        dinner_key = stored_item.get("dinner_key")
        if dinner_key is not None:
            dinner = self._dinners.get(dinner_key)
            if dinner is not None:
                dinner["item_ids"] = [
                    item_id
                    for item_id in dinner["item_ids"]
                    if item_id != stored_item["id"]
                ]
        for dinner in self._dinners.values():
            dinner["allocations"] = [
                allocation
                for allocation in dinner.get("allocations", [])
                if allocation["stored_item_id"] != stored_item["id"]
            ]
        self._stored_items.remove(stored_item)

    # -- Dinners ---------------------------------------------------------

    def get_dinner(self, week: str, day: str) -> dict[str, Any] | None:
        """Get the dinner planned for a given week/day."""
        dinner = self._dinners.get(_dinner_key(week, day))
        return dict(dinner) if dinner is not None else None

    def set_dinner(
        self,
        week: str,
        day: str,
        text: str,
        item_allocations: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """Create or update the dinner plan for a week/day."""
        key = _dinner_key(week, day)
        item_ids = [allocation["stored_item_id"] for allocation in item_allocations]
        requested_by_item: dict[str, float] = {}
        for allocation in item_allocations:
            stored_item_id = allocation["stored_item_id"]
            requested_by_item[stored_item_id] = (
                requested_by_item.get(stored_item_id, 0) + allocation["quantity"]
            )
            stored_item = next(
                (si for si in self._stored_items if si["id"] == stored_item_id), None
            )
            if stored_item is None:
                raise MadplanError("stored_item_not_found")
            if stored_item["unit"] != allocation["unit"]:
                raise MadplanError("unit_mismatch")
            requested = requested_by_item[stored_item_id]
            other_reserved = sum(
                quantity
                for dinner_key, quantity in stored_item.get("reservations", {}).items()
                if dinner_key != key
            )
            if requested + other_reserved > stored_item["quantity"]:
                raise MadplanError("insufficient_quantity")

        if len(requested_by_item) != len(item_allocations):
            raise MadplanError("duplicate_item_allocation")

        for stored_item in self._stored_items:
            stored_item.setdefault("reservations", {}).pop(key, None)
            self._update_stored_item_status(stored_item)
        for allocation in item_allocations:
            stored_item = next(
                si
                for si in self._stored_items
                if si["id"] == allocation["stored_item_id"]
            )
            stored_item["reservations"][key] = allocation["quantity"]
            self._update_stored_item_status(stored_item)

        dinner = {
            "week": week,
            "day": day,
            "text": text,
            "item_ids": list(item_ids),
            "allocations": [dict(allocation) for allocation in item_allocations],
            "completed": False,
            "item_names": [],
        }
        self._dinners[key] = dinner
        return dict(dinner)

    def delete_dinner(self, week: str, day: str) -> bool:
        """Delete a planned dinner, freeing any reserved items."""
        key = _dinner_key(week, day)
        dinner = self._dinners.pop(key, None)
        if dinner is None:
            return False
        for allocation in dinner.get("allocations", []):
            stored_item = next(
                (
                    si
                    for si in self._stored_items
                    if si["id"] == allocation["stored_item_id"]
                ),
                None,
            )
            if stored_item is not None:
                stored_item.get("reservations", {}).pop(key, None)
                self._update_stored_item_status(stored_item)
        return True

    def complete_dinner(self, week: str, day: str) -> dict[str, Any] | None:
        """Mark a dinner as completed, consuming its linked items."""
        key = _dinner_key(week, day)
        dinner = self._dinners.get(key)
        if dinner is None:
            return None
        item_names = []
        for allocation in dinner.get("allocations", []):
            stored_item = next(
                (
                    si
                    for si in self._stored_items
                    if si["id"] == allocation["stored_item_id"]
                ),
                None,
            )
            if stored_item is not None:
                item_names.append(
                    {
                        "name": stored_item["item_name"],
                        "quantity": allocation["quantity"],
                        "unit": allocation["unit"],
                    }
                )
                stored_item["quantity"] -= allocation["quantity"]
                stored_item.get("reservations", {}).pop(key, None)
                if stored_item["quantity"] <= 0:
                    self._stored_items.remove(stored_item)
                else:
                    self._update_stored_item_status(stored_item)
        dinner["completed"] = True
        dinner["item_ids"] = []
        dinner["item_names"] = item_names
        return dict(dinner)

    # -- Shopping list ---------------------------------------------------------

    def add_shopping_item(
        self,
        item_id: str,
        quantity: float = 1,
        unit: str = DEFAULT_UNIT,
        note: str = "",
    ) -> dict[str, Any]:
        """Add an item to the shopping list, summing the amount if already there."""
        item = next((i for i in self._items if i["id"] == item_id), None)
        if item is None:
            raise MadplanError("item_not_found")
        for entry in self._shopping_list:
            if entry["item_id"] == item_id and entry["unit"] == unit:
                entry["quantity"] += quantity
                if note:
                    entry["note"] = note
                return dict(entry)
        entry = {
            "id": str(uuid.uuid4()),
            "item_id": item_id,
            "item_name": item["name"],
            "note": note,
            "quantity": quantity,
            "unit": unit,
        }
        self._shopping_list.append(entry)
        return entry

    def remove_shopping_item(self, shopping_id: str) -> bool:
        """Remove an item from the shopping list."""
        before = len(self._shopping_list)
        self._shopping_list = [
            entry for entry in self._shopping_list if entry["id"] != shopping_id
        ]
        return len(self._shopping_list) < before

    def add_stored_item_from_shopping(
        self, shopping_id: str, storage_id: str, location_id: str
    ) -> dict[str, Any]:
        """Place a shopping list item in storage, removing it from the list."""
        entry = next((e for e in self._shopping_list if e["id"] == shopping_id), None)
        if entry is None:
            raise MadplanError("shopping_item_not_found")
        stored_item = self.add_stored_item(
            entry["item_id"],
            storage_id,
            location_id,
            quantity=entry["quantity"],
            unit=entry["unit"],
        )
        self._shopping_list.remove(entry)
        return stored_item
