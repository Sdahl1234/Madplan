"""Websocket api."""

import logging
from typing import Any

import probatio

from homeassistant.components import websocket_api
from homeassistant.components.websocket_api import ActiveConnection
from homeassistant.core import HomeAssistant, callback

from .const import DATA_STORE, DOMAIN, EVENT_UPDATED, UNITS
from .store import MadplanError, MadplanStore

_LOGGER = logging.getLogger(__name__)

_WS_API_REGISTERED = "ws_api_registered"

_QUANTITY = probatio.All(probatio.Coerce(float), probatio.Range(min=0.01))
_UNIT = probatio.In(UNITS)
_DINNER_ALLOCATION = probatio.Schema(
    {
        probatio.Required("stored_item_id"): str,
        probatio.Required("quantity"): _QUANTITY,
        probatio.Required("unit"): _UNIT,
    }
)


@callback
def async_register_websocket_api(hass: HomeAssistant) -> None:
    """Register."""
    if hass.data.get(DOMAIN, {}).get(_WS_API_REGISTERED):
        return
    hass.data.setdefault(DOMAIN, {})[_WS_API_REGISTERED] = True
    for cmd in _COMMANDS:
        websocket_api.async_register_command(hass, cmd)


def _get_store(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> MadplanStore | None:
    """Get the store for the entry_id in msg, sending an error if not found."""
    entry_id: str = msg["entry_id"]
    entry_data = hass.data.get(DOMAIN, {}).get(entry_id)
    if entry_data is None:
        connection.send_error(
            msg["id"], "entry_not_found", f"No entry with id {entry_id!r}"
        )
        return None
    return entry_data[DATA_STORE]


@callback
@websocket_api.websocket_command(
    {
        probatio.Required("type"): "madplan/get_config",
        probatio.Required("entry_id"): str,
    }
)
def ws_get_config(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Get config."""
    store = _get_store(hass, connection, msg)
    if store is None:
        return
    connection.send_result(msg["id"], store.get_data())


@websocket_api.websocket_command(
    {
        probatio.Required("type"): "madplan/add_storage",
        probatio.Required("entry_id"): str,
        probatio.Required("name"): str,
        probatio.Required("storage_type"): str,
        probatio.Optional("locations", default=list): [str],
    }
)
@websocket_api.async_response
async def ws_add_storage(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Add storage."""
    store = _get_store(hass, connection, msg)
    if store is None:
        return
    store.add_storage(
        name=msg["name"],
        storage_type=msg["storage_type"],
        location_names=msg["locations"],
    )
    await store.async_save()
    connection.send_result(msg["id"], {"storages": store.get_data()["storages"]})
    _fire_updated(hass, msg["entry_id"])


@websocket_api.websocket_command(
    {
        probatio.Required("type"): "madplan/update_storage",
        probatio.Required("entry_id"): str,
        probatio.Required("storage_id"): str,
        probatio.Required("name"): str,
    }
)
@websocket_api.async_response
async def ws_update_storage(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Update storage."""
    store = _get_store(hass, connection, msg)
    if store is None:
        return
    if store.update_storage(msg["storage_id"], msg["name"]) is None:
        connection.send_error(msg["id"], "not_found", "Storage not found")
        return
    await store.async_save()
    connection.send_result(msg["id"], {"storages": store.get_data()["storages"]})
    _fire_updated(hass, msg["entry_id"])


@websocket_api.websocket_command(
    {
        probatio.Required("type"): "madplan/remove_storage",
        probatio.Required("entry_id"): str,
        probatio.Required("storage_id"): str,
    }
)
@websocket_api.async_response
async def ws_remove_storage(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Remove storage."""
    store = _get_store(hass, connection, msg)
    if store is None:
        return
    if not store.remove_storage(msg["storage_id"]):
        connection.send_error(msg["id"], "not_found", "Storage not found")
        return
    await store.async_save()
    connection.send_result(msg["id"], store.get_data())
    _fire_updated(hass, msg["entry_id"])


@websocket_api.websocket_command(
    {
        probatio.Required("type"): "madplan/add_location",
        probatio.Required("entry_id"): str,
        probatio.Required("storage_id"): str,
        probatio.Required("name"): str,
    }
)
@websocket_api.async_response
async def ws_add_location(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Add location."""
    store = _get_store(hass, connection, msg)
    if store is None:
        return
    location = store.add_location(msg["storage_id"], msg["name"])
    if location is None:
        connection.send_error(msg["id"], "not_found", "Storage not found")
        return
    await store.async_save()
    connection.send_result(msg["id"], {"storages": store.get_data()["storages"]})
    _fire_updated(hass, msg["entry_id"])


@websocket_api.websocket_command(
    {
        probatio.Required("type"): "madplan/remove_location",
        probatio.Required("entry_id"): str,
        probatio.Required("storage_id"): str,
        probatio.Required("location_id"): str,
    }
)
@websocket_api.async_response
async def ws_remove_location(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Remove location."""
    store = _get_store(hass, connection, msg)
    if store is None:
        return
    if not store.remove_location(msg["storage_id"], msg["location_id"]):
        connection.send_error(msg["id"], "not_found", "Location not found")
        return
    await store.async_save()
    connection.send_result(msg["id"], store.get_data())
    _fire_updated(hass, msg["entry_id"])


@websocket_api.websocket_command(
    {
        probatio.Required("type"): "madplan/add_item",
        probatio.Required("entry_id"): str,
        probatio.Required("name"): str,
        probatio.Optional("default_quantity", default=1): _QUANTITY,
        probatio.Optional("default_unit", default=UNITS[0]): _UNIT,
    }
)
@websocket_api.async_response
async def ws_add_item(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Add item."""
    store = _get_store(hass, connection, msg)
    if store is None:
        return
    item = store.add_item(msg["name"], msg["default_quantity"], msg["default_unit"])
    await store.async_save()
    connection.send_result(
        msg["id"], {"item": item, "items": store.get_data()["items"]}
    )
    _fire_updated(hass, msg["entry_id"])


@websocket_api.websocket_command(
    {
        probatio.Required("type"): "madplan/remove_item",
        probatio.Required("entry_id"): str,
        probatio.Required("item_id"): str,
    }
)
@websocket_api.async_response
async def ws_remove_item(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Remove item."""
    store = _get_store(hass, connection, msg)
    if store is None:
        return
    if not store.remove_item(msg["item_id"]):
        connection.send_error(msg["id"], "not_found", "Item not found")
        return
    await store.async_save()
    connection.send_result(msg["id"], {"items": store.get_data()["items"]})
    _fire_updated(hass, msg["entry_id"])


@websocket_api.websocket_command(
    {
        probatio.Required("type"): "madplan/update_item",
        probatio.Required("entry_id"): str,
        probatio.Required("item_id"): str,
        probatio.Required("name"): str,
        probatio.Required("default_quantity"): _QUANTITY,
        probatio.Required("default_unit"): _UNIT,
    }
)
@websocket_api.async_response
async def ws_update_item(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Update an item."""
    store = _get_store(hass, connection, msg)
    if store is None:
        return
    item = store.update_item(
        msg["item_id"],
        msg["name"],
        msg["default_quantity"],
        msg["default_unit"],
    )
    if item is None:
        connection.send_error(msg["id"], "not_found", "Item not found")
        return
    await store.async_save()
    connection.send_result(
        msg["id"], {"item": item, "items": store.get_data()["items"]}
    )
    _fire_updated(hass, msg["entry_id"])


@websocket_api.websocket_command(
    {
        probatio.Required("type"): "madplan/add_stored_item",
        probatio.Required("entry_id"): str,
        probatio.Required("item_id"): str,
        probatio.Required("storage_id"): str,
        probatio.Required("location_id"): str,
        probatio.Optional("quantity", default=1): _QUANTITY,
        probatio.Optional("unit", default=UNITS[0]): _UNIT,
    }
)
@websocket_api.async_response
async def ws_add_stored_item(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Add stored item."""
    store = _get_store(hass, connection, msg)
    if store is None:
        return
    try:
        store.add_stored_item(
            msg["item_id"],
            msg["storage_id"],
            msg["location_id"],
            quantity=msg["quantity"],
            unit=msg["unit"],
        )
    except MadplanError as err:
        connection.send_error(msg["id"], str(err), str(err))
        return
    await store.async_save()
    connection.send_result(
        msg["id"], {"stored_items": store.get_data()["stored_items"]}
    )
    _fire_updated(hass, msg["entry_id"])


@websocket_api.websocket_command(
    {
        probatio.Required("type"): "madplan/remove_stored_item",
        probatio.Required("entry_id"): str,
        probatio.Required("stored_item_id"): str,
    }
)
@websocket_api.async_response
async def ws_remove_stored_item(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Remove stored item."""
    store = _get_store(hass, connection, msg)
    if store is None:
        return
    if not store.remove_stored_item(msg["stored_item_id"]):
        connection.send_error(msg["id"], "not_found", "Stored item not found")
        return
    await store.async_save()
    connection.send_result(msg["id"], store.get_data())
    _fire_updated(hass, msg["entry_id"])


@websocket_api.websocket_command(
    {
        probatio.Required("type"): "madplan/consume_stored_item",
        probatio.Required("entry_id"): str,
        probatio.Required("stored_item_id"): str,
        probatio.Required("quantity"): _QUANTITY,
    }
)
@websocket_api.async_response
async def ws_consume_stored_item(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Consume an unreserved quantity from storage."""
    store = _get_store(hass, connection, msg)
    if store is None:
        return
    try:
        store.consume_stored_item(msg["stored_item_id"], msg["quantity"])
    except MadplanError as err:
        connection.send_error(msg["id"], str(err), str(err))
        return
    await store.async_save()
    connection.send_result(msg["id"], store.get_data())
    _fire_updated(hass, msg["entry_id"])


@websocket_api.websocket_command(
    {
        probatio.Required("type"): "madplan/set_dinner",
        probatio.Required("entry_id"): str,
        probatio.Required("week"): str,
        probatio.Required("day"): str,
        probatio.Optional("text", default=""): str,
        probatio.Optional("allocations", default=list): [_DINNER_ALLOCATION],
    }
)
@websocket_api.async_response
async def ws_set_dinner(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Set dinner."""
    store = _get_store(hass, connection, msg)
    if store is None:
        return
    try:
        store.set_dinner(msg["week"], msg["day"], msg["text"], msg["allocations"])
    except MadplanError as err:
        connection.send_error(msg["id"], str(err), str(err))
        return
    await store.async_save()
    connection.send_result(msg["id"], store.get_data())
    _fire_updated(hass, msg["entry_id"])


@websocket_api.websocket_command(
    {
        probatio.Required("type"): "madplan/delete_dinner",
        probatio.Required("entry_id"): str,
        probatio.Required("week"): str,
        probatio.Required("day"): str,
    }
)
@websocket_api.async_response
async def ws_delete_dinner(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Delete dinner."""
    store = _get_store(hass, connection, msg)
    if store is None:
        return
    if not store.delete_dinner(msg["week"], msg["day"]):
        connection.send_error(msg["id"], "not_found", "Dinner not found")
        return
    await store.async_save()
    connection.send_result(msg["id"], store.get_data())
    _fire_updated(hass, msg["entry_id"])


@websocket_api.websocket_command(
    {
        probatio.Required("type"): "madplan/complete_dinner",
        probatio.Required("entry_id"): str,
        probatio.Required("week"): str,
        probatio.Required("day"): str,
    }
)
@websocket_api.async_response
async def ws_complete_dinner(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Complete dinner."""
    store = _get_store(hass, connection, msg)
    if store is None:
        return
    if store.complete_dinner(msg["week"], msg["day"]) is None:
        connection.send_error(msg["id"], "not_found", "Dinner not found")
        return
    await store.async_save()
    connection.send_result(msg["id"], store.get_data())
    _fire_updated(hass, msg["entry_id"])


@websocket_api.websocket_command(
    {
        probatio.Required("type"): "madplan/add_shopping_item",
        probatio.Required("entry_id"): str,
        probatio.Required("item_id"): str,
        probatio.Optional("quantity", default=1): _QUANTITY,
        probatio.Optional("unit", default=UNITS[0]): _UNIT,
        probatio.Optional("note", default=""): str,
    }
)
@websocket_api.async_response
async def ws_add_shopping_item(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Add shopping item."""
    store = _get_store(hass, connection, msg)
    if store is None:
        return
    try:
        store.add_shopping_item(
            msg["item_id"], quantity=msg["quantity"], unit=msg["unit"], note=msg["note"]
        )
    except MadplanError as err:
        connection.send_error(msg["id"], str(err), str(err))
        return
    await store.async_save()
    connection.send_result(
        msg["id"], {"shopping_list": store.get_data()["shopping_list"]}
    )
    _fire_updated(hass, msg["entry_id"])


@websocket_api.websocket_command(
    {
        probatio.Required("type"): "madplan/remove_shopping_item",
        probatio.Required("entry_id"): str,
        probatio.Required("shopping_id"): str,
    }
)
@websocket_api.async_response
async def ws_remove_shopping_item(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Remove shopping item."""
    store = _get_store(hass, connection, msg)
    if store is None:
        return
    if not store.remove_shopping_item(msg["shopping_id"]):
        connection.send_error(msg["id"], "not_found", "Shopping list item not found")
        return
    await store.async_save()
    connection.send_result(
        msg["id"], {"shopping_list": store.get_data()["shopping_list"]}
    )
    _fire_updated(hass, msg["entry_id"])


@websocket_api.websocket_command(
    {
        probatio.Required("type"): "madplan/add_stored_item_from_shopping",
        probatio.Required("entry_id"): str,
        probatio.Required("shopping_id"): str,
        probatio.Required("storage_id"): str,
        probatio.Required("location_id"): str,
    }
)
@websocket_api.async_response
async def ws_add_stored_item_from_shopping(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Place a shopping list item in storage and remove it from the list."""
    store = _get_store(hass, connection, msg)
    if store is None:
        return
    try:
        store.add_stored_item_from_shopping(
            msg["shopping_id"], msg["storage_id"], msg["location_id"]
        )
    except MadplanError as err:
        connection.send_error(msg["id"], str(err), str(err))
        return
    await store.async_save()
    connection.send_result(msg["id"], store.get_data())
    _fire_updated(hass, msg["entry_id"])


@callback
def _fire_updated(hass: HomeAssistant, entry_id: str) -> None:
    """Notify listeners that the madplan data changed."""
    hass.bus.async_fire(EVENT_UPDATED, {"entry_id": entry_id})


_COMMANDS = [
    ws_get_config,
    ws_add_storage,
    ws_update_storage,
    ws_remove_storage,
    ws_add_location,
    ws_remove_location,
    ws_add_item,
    ws_remove_item,
    ws_update_item,
    ws_add_stored_item,
    ws_remove_stored_item,
    ws_consume_stored_item,
    ws_set_dinner,
    ws_delete_dinner,
    ws_complete_dinner,
    ws_add_shopping_item,
    ws_remove_shopping_item,
    ws_add_stored_item_from_shopping,
]
