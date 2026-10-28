from aiogram.fsm.state import State, StatesGroup


class Clarify(StatesGroup):
    choosing = State()
    own = State()


class Setup(StatesGroup):
    times = State()
    tz = State()


class Gen(StatesGroup):
    wish = State()


class Rewrite(StatesGroup):
    feedback = State()


class NotionSt(StatesGroup):
    token = State()
    import_link = State()
    target = State()


class Analytics(StatesGroup):
    collect = State()
