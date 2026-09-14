"""Init."""

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DATA_STORE, DOMAIN
from .store import MadplanStore
from .websocket_api import async_register_websocket_api

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Setup entry."""
    store = MadplanStore(hass, entry.entry_id)
    await store.async_load()

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = {DATA_STORE: store}

    async_register_websocket_api(hass)
    _LOGGER.debug("Madplan entry %s set up", entry.entry_id)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload entry."""
    hass.data[DOMAIN].pop(entry.entry_id, None)
    return True
