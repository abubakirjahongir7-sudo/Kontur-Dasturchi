from aiogram import Router

from . import analytics, common, notion_h, onboarding, profile, scenarios, settings


def build_router() -> Router:
    root = Router(name="root")
    # Tartib muhim: menyu tugmalari birinchi, onboarding javoblari (har qanday matn) — oxirida.
    root.include_routers(
        common.router,
        scenarios.router,
        analytics.router,
        notion_h.router,
        settings.router,
        profile.router,
        onboarding.router,
    )
    return root
