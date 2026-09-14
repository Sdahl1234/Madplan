"""Configflow."""

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult

from .const import DOMAIN

STEP_USER_SCHEMA = vol.Schema({vol.Required("name", default="Madplan"): str})


class MadplanConfigFlow(ConfigFlow, domain=DOMAIN):
    """Configflow class."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Step user."""
        if user_input is not None:
            return self.async_create_entry(
                title=user_input["name"],
                data={"name": user_input["name"]},
            )
        return self.async_show_form(step_id="user", data_schema=STEP_USER_SCHEMA)
