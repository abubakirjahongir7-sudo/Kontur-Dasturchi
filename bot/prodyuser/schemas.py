"""AI javoblarining tuzilmasi. Claude ham, Gemini ham shu Pydantic modellar bo'yicha
JSON qaytaradi, shuning uchun javobni qo'lda "taxmin qilib" o'qishga hojat yo'q."""

from typing import Literal

from pydantic import BaseModel


class ClarifyQuestion(BaseModel):
    question: str
    option_a: str
    option_b: str
    why: str


class ProfileReview(BaseModel):
    summary: str
    gaps: list[str]
    questions: list[ClarifyQuestion]


class ContentPillar(BaseModel):
    name: str
    description: str
    share_percent: int


class Strategy(BaseModel):
    positioning: str
    audience_portrait: str
    pains: list[str]
    desires: list[str]
    objections: list[str]
    tone_of_voice: str
    content_pillars: list[ContentPillar]
    hook_styles: list[str]
    funnel: str
    posting_plan: str
    growth_focus: str
    avoid: list[str]


class Scene(BaseModel):
    time: str
    visual: str
    speech: str
    on_screen_text: str


class Scenario(BaseModel):
    title: str
    goal: Literal["views", "followers", "clients"]
    content_pillar: str
    format: str
    duration_sec: int
    hook: str
    hook_on_screen: str
    scenes: list[Scene]
    cta: str
    caption: str
    hashtags: list[str]
    music_vibe: str
    filming_tips: list[str]
    why_it_works: str
    best_time_to_post: str


class ScenarioBatch(BaseModel):
    scenarios: list[Scenario]


class Metric(BaseModel):
    name: str
    value: str


class AnalyticsReport(BaseModel):
    metrics: list[Metric]
    views: int
    score: int
    verdict: Literal["viral", "good", "average", "poor"]
    summary: str
    what_worked: list[str]
    what_failed: list[str]
    hook_analysis: str
    retention_analysis: str
    recommendations: list[str]
    lessons: list[str]
    missing_data: list[str]
    needs_rewrite: bool


class AnswerItem(BaseModel):
    qid: str
    answer: str


class ProfileExtract(BaseModel):
    answers: list[AnswerItem]
    notes: list[str]


class ImageText(BaseModel):
    text: str
