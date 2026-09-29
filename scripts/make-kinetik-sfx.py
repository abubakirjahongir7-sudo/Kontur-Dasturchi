"""
"Kinetik" video uchun demo ovoz effektlarini sintez qiladi (original, litsenziya muammosi yo'q).
Natija: public/demo/sfx/kinetik/*.mp3

Ishga tushirish (Python 3 + numpy + scipy + ffmpeg kerak):
    pip install numpy scipy
    python3 scripts/make-kinetik-sfx.py

O'zingizning ovozlaringizni ishlatmoqchi bo'lsangiz, bu skript shart emas:
faylni shu nom bilan public/sfx/kinetik/ ga qo'ying — video avtomatik o'shani oladi.
"""

import os
import shutil
import subprocess
import tempfile
import wave

import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "demo", "sfx", "kinetik")
rng = np.random.default_rng(7)


# ---------- yordamchilar ----------

def t_of(sec):
    return np.arange(int(SR * sec)) / SR


def noise(sec):
    return rng.standard_normal(int(SR * sec))


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)


def sweep_filter(x, f0, f1, kind="band", width=0.6, blocks=160):
    """Chastotasi vaqt bo'yicha o'zgaradigan filtr (bloklarga bo'lib)."""
    out = np.zeros_like(x)
    n = len(x)
    edges = np.linspace(0, n, blocks + 1).astype(int)
    for i in range(blocks):
        a, b = edges[i], edges[i + 1]
        f = f0 * (f1 / f0) ** (i / (blocks - 1))
        pad = min(a, 2048)
        seg = x[a - pad:b]
        if kind == "band":
            y = bp(seg, max(20, f * (1 - width / 2)), min(SR / 2 - 100, f * (1 + width / 2)))
        else:
            y = lp(seg, min(SR / 2 - 100, f))
        out[a:b] = y[pad:]
    return out


def glide_sine(sec, f0, f1, curve="exp"):
    t = t_of(sec)
    if curve == "exp":
        f = f0 * (f1 / f0) ** (t / sec)
    else:
        f = f0 + (f1 - f0) * (t / sec)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def env_exp(sec, decay, attack=0.002):
    t = t_of(sec)
    a = np.clip(t / attack, 0, 1)
    return a * np.exp(-t / decay)


def place(dst, src, at_sec, gain=1.0):
    i = int(at_sec * SR)
    j = min(len(dst), i + len(src))
    dst[i:j] += src[: j - i] * gain
    return dst


def reverb(x, sec=1.2, decay=0.35, mix=0.25):
    ir = noise(sec) * np.exp(-t_of(sec) / decay)
    ir = lp(ir, 6000)
    ir /= np.sqrt(np.sum(ir ** 2))
    wet = np.convolve(x, ir)[: len(x) + int(sec * SR)]
    dry = np.concatenate([x, np.zeros(len(wet) - len(x))])
    return dry * (1 - mix) + wet * mix


def stereo(x, width_ms=9, side=0.18):
    """Kichik kechikish bilan kenglik beradi."""
    d = int(SR * width_ms / 1000)
    l = x.copy()
    r = np.concatenate([np.zeros(d), x[:-d]]) if d else x.copy()
    return np.stack([l * (1 - side) + r * side, r * (1 - side) + l * side], axis=1)


def finish(x, peak_db=-1.0, fade_out=0.02, fade_in=0.001):
    if x.ndim == 1:
        x = stereo(x, 0, 0)
    n_in, n_out = int(fade_in * SR), int(fade_out * SR)
    if n_in:
        x[:n_in] *= np.linspace(0, 1, n_in)[:, None]
    if n_out:
        x[-n_out:] *= np.linspace(1, 0, n_out)[:, None]
    x = x / np.max(np.abs(x)) * 10 ** (peak_db / 20)
    # Oxiridagi eshitilmaydigan jimlikni kesib tashlaymiz
    loud = np.nonzero(np.max(np.abs(x), axis=1) > 10 ** (-60 / 20))[0]
    end = min(len(x), loud[-1] + int(0.02 * SR)) if len(loud) else len(x)
    x = x[:end]
    n_tail = min(end, int(0.02 * SR))
    x[-n_tail:] *= np.linspace(1, 0, n_tail)[:, None]
    return x


def save(name, x):
    os.makedirs(OUT, exist_ok=True)
    ffmpeg = shutil.which("ffmpeg")
    if ffmpeg is None:
        import imageio_ffmpeg  # pip install imageio-ffmpeg

        ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        tmp = f.name
    with wave.open(tmp, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    dst = os.path.join(OUT, f"{name}.mp3")
    subprocess.run([ffmpeg, "-v", "error", "-y", "-i", tmp, "-codec:a", "libmp3lame", "-b:a", "192k", dst], check=True)
    os.remove(tmp)
    print(f"{dst}  ({len(x) / SR:.2f}s)")


# ---------- ovozlar ----------

def suspense_riser(sec=3.0):
    t = t_of(sec)
    grow = (t / sec) ** 2.2
    # Filtri ko'tariladigan shovqin
    air = sweep_filter(noise(sec), 250, 7000, width=0.7) * grow
    # Pastdan yuqoriga siljiydigan ohang + tezlashib boruvchi tremolo
    trem_rate = 4 + 16 * (t / sec) ** 1.5
    trem = 0.6 + 0.4 * np.sin(2 * np.pi * np.cumsum(trem_rate) / SR)
    tone = sum(glide_sine(sec, f, f * 4) * g for f, g in [(110, 1.0), (165, 0.6), (220, 0.45)])
    tone = lp(tone, 3000) * grow * trem
    # Teskari reverb "so'rilishi"
    swell = reverb(bp(noise(sec), 400, 3000) * grow ** 3, 0.6, 0.2, 0.6)[: len(t)]
    x = air * 0.9 + tone * 0.35 + swell * 0.5
    return finish(stereo(x, 12, 0.3), fade_out=0.015)


def drop(sec=1.8):
    t = t_of(sec)
    sub = glide_sine(sec, 130, 32) * env_exp(sec, 0.55, 0.004)
    body = glide_sine(sec, 260, 60) * env_exp(sec, 0.12, 0.002) * 0.5
    fall = sweep_filter(noise(sec), 5000, 150, kind="low") * env_exp(sec, 0.35, 0.003) * 0.6
    click = hp(noise(0.012), 2000) * np.linspace(1, 0, int(0.012 * SR)) * 0.6
    x = sub + body + fall
    x[: len(click)] += click
    x = np.tanh(x * 1.8)
    return finish(stereo(reverb(x, 1.4, 0.4, 0.2), 8, 0.2))


def soft_ui_pop(sec=0.22):
    t = t_of(sec)
    f = 520 + 520 * np.exp(-t / 0.012)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(sec, 0.05, 0.0015)
    tick = bp(noise(sec), 2000, 6000) * env_exp(sec, 0.004, 0.0005) * 0.25
    x = lp(tone + tick, 5000)
    return finish(stereo(reverb(x, 0.3, 0.06, 0.15), 4, 0.15), peak_db=-3)


def shutter_soft_boom(sec=1.5):
    x = np.zeros(int(SR * sec))
    # Fotoapparat zatvori: ikki qisqa "shiq"
    for at, g in [(0.0, 1.0), (0.045, 0.7)]:
        c = hp(bp(noise(0.03), 1500, 9000), 1200) * env_exp(0.03, 0.006, 0.0005)
        place(x, c, at, g * 0.8)
    boom = glide_sine(sec, 90, 42) * env_exp(sec, 0.35, 0.01)
    x += lp(boom, 400) * 0.9
    return finish(stereo(reverb(x, 1.2, 0.35, 0.25), 10, 0.2))


def slice_ring(sec=1.3):
    x = np.zeros(int(SR * sec))
    # "Kesish": tez ko'tariladigan havo shovqini
    sl = sweep_filter(noise(0.16), 1500, 10000, width=0.5, blocks=40)
    sl *= np.sin(np.pi * np.linspace(0, 1, len(sl))) ** 2
    place(x, sl, 0.0, 0.9)
    # Metall "jiring": notekis garmonikalar
    rs = sec - 0.1
    ring = sum(
        np.sin(2 * np.pi * 1350 * m * t_of(rs)) * g * env_exp(rs, d, 0.002)
        for m, g, d in [(1, 1.0, 0.45), (2.76, 0.5, 0.3), (5.4, 0.25, 0.18), (8.93, 0.12, 0.1)]
    )
    place(x, ring, 0.1, 0.45)
    return finish(stereo(reverb(x, 0.9, 0.25, 0.2), 14, 0.35))


def digital_counter(sec=1.0):
    x = np.zeros(int(SR * sec))
    n_ticks = 20
    for i in range(n_ticks):
        at = i * 0.036
        f = 1900 + 300 * (i % 3) + 8 * i
        tick = np.sign(np.sin(2 * np.pi * f * t_of(0.014))) * env_exp(0.014, 0.004, 0.0004)
        place(x, lp(tick, 7000), at, 0.35)
    # Yakuniy "ding"
    for f, at in [(1760, 0.75), (2637, 0.8)]:
        d = np.sin(2 * np.pi * f * t_of(0.2)) * env_exp(0.2, 0.06, 0.002)
        place(x, d, at, 0.5)
    return finish(stereo(x, 3, 0.1), peak_db=-3)


def ui_click(sec=0.07):
    t = t_of(sec)
    tick = hp(noise(sec), 2500) * env_exp(sec, 0.0025, 0.0003)
    tone = np.sin(2 * np.pi * 2100 * t) * env_exp(sec, 0.006, 0.0005) * 0.5
    thump = np.sin(2 * np.pi * 180 * t) * env_exp(sec, 0.01, 0.001) * 0.4
    return finish(stereo(tick + tone + thump, 2, 0.1), peak_db=-3, fade_out=0.005)


def buildup(sec=3.0):
    x = np.zeros(int(SR * sec))
    # Tezlashib boruvchi zarblar (baraban "roll")
    at, gap, i = 0.0, 0.26, 0
    while at < sec - 0.04:
        prog = at / sec
        snare = bp(noise(0.12), 900, 7000) * env_exp(0.12, 0.03, 0.001)
        kick = glide_sine(0.12, 160 + 120 * prog, 55) * env_exp(0.12, 0.04, 0.002)
        place(x, snare * 0.5 + kick * 0.7, at, 0.35 + 0.65 * prog)
        at += gap
        gap = max(0.045, gap * 0.9)
        i += 1
    t = t_of(sec)
    grow = (t / sec) ** 2
    rise = sweep_filter(noise(sec), 300, 8000, width=0.8) * grow * 0.5
    tone = lp(glide_sine(sec, 80, 320) + 0.5 * glide_sine(sec, 120, 480), 2500) * grow * 0.3
    x = x + rise + tone
    return finish(stereo(x, 10, 0.25), fade_out=0.012)


def netflix_style_sting(sec=3.0):
    """Kinematografik "ta-dum" uslubidagi logotip zarbasi (original, nusxa emas)."""
    x = np.zeros(int(SR * sec))
    for at, g, dec in [(0.0, 0.65, 0.18), (0.3, 1.0, 0.5)]:
        hs = 1.2
        sub = glide_sine(hs, 75, 45) * env_exp(hs, dec, 0.003)
        body = lp(glide_sine(hs, 180, 90), 900) * env_exp(hs, dec * 0.5, 0.002) * 0.6
        hit = bp(noise(0.08), 200, 3000) * env_exp(0.08, 0.02, 0.001) * 0.5
        s = sub + body
        s[: len(hit)] += hit
        place(x, np.tanh(s * 1.6), at, g)
    # Ochilib boruvchi yorqin akkord
    ps = sec - 0.3
    t = t_of(ps)
    chord = np.zeros(len(t))
    for f in [65.4, 98.0, 130.8, 155.6, 196.0, 261.6]:  # C minor rangidagi akkord
        for det in (-0.35, 0.35):
            ph = 2 * np.pi * (f + det) * t
            chord += (2 * ((ph / (2 * np.pi)) % 1) - 1) * 0.12  # arra to'lqin
    chord = sweep_filter(chord, 200, 3500, kind="low", blocks=120)
    swell = np.clip(t / 0.9, 0, 1) ** 1.5 * np.exp(-np.maximum(0, t - 1.2) / 0.6)
    place(x, chord * swell, 0.3, 0.55)
    return finish(stereo(reverb(x, 2.0, 0.6, 0.3), 16, 0.3), fade_out=0.3)


if __name__ == "__main__":
    save("suspense-riser", suspense_riser())
    save("drop", drop())
    save("soft-ui-pop", soft_ui_pop())
    save("shutter-soft-boom", shutter_soft_boom())
    save("slice-ring", slice_ring())
    save("digital-counter", digital_counter())
    save("ui-click", ui_click())
    save("buildup", buildup())
    save("netflix", netflix_style_sting())
