"""Does a take say its line, and nothing more? Shared by gen_cb.py (to pick
the best of several takes) and qa.py (to check every recording).

    from asrcheck import Checker
    c = Checker()                       # loads Whisper (base.en) on the CPU, once
    score, extra, heard = c.check(text, samples, rate)

score: the share of the line's words heard (0-1); two words count as the
same when they are spelled nearly alike (Whisper writes "Rawr" for "Roar").
extra: words heard that are not in the line (a tacked-on "didn't you?").
Runs on this computer; nothing is sent anywhere.
"""
import difflib, re
import numpy as np

ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
TENS = 'twenty thirty forty fifty sixty seventy eighty ninety'.split()


def num(n):
    n = int(n)
    if n < 20: return ONES[n]
    if n < 100: return TENS[n // 10 - 2] + ('' if n % 10 == 0 else ' ' + ONES[n % 10])
    return 'one hundred' if n == 100 else str(n)


def words(t):
    t = t.lower().replace('’', "'").replace('…', ' ').replace('-', ' ')
    t = re.sub(r'\d+', lambda m: num(m.group(0)), t)
    t = re.sub(r"[^a-z' ]+", ' ', t)
    return [w.strip("'") for w in t.split() if w.strip("'")]


def alike(a, b):
    return a == b or difflib.SequenceMatcher(a=a, b=b).ratio() >= 0.7


def match(expected, heard):
    """(score, extra) by a forgiving longest common subsequence of words."""
    e, h = words(expected), words(heard)
    if not e:
        return 1.0, 0
    # LCS where nearly-alike words count as the same
    dp = [[0] * (len(h) + 1) for _ in range(len(e) + 1)]
    for i in range(1, len(e) + 1):
        for k in range(1, len(h) + 1):
            dp[i][k] = dp[i - 1][k - 1] + 1 if alike(e[i - 1], h[k - 1]) else max(dp[i - 1][k], dp[i][k - 1])
    same = dp[len(e)][len(h)]
    return same / len(e), max(0, len(h) - same)


class Checker:
    def __init__(self, model='openai/whisper-base.en'):
        from transformers import pipeline
        self.asr = pipeline('automatic-speech-recognition', model=model, device='cpu')

    def heard(self, samples, rate):
        y = np.asarray(samples, dtype=np.float32).reshape(-1)
        if rate != 16000:
            import librosa
            y = librosa.resample(y, orig_sr=rate, target_sr=16000)
        return self.asr({'raw': y, 'sampling_rate': 16000})['text'].strip()

    def check(self, text, samples, rate):
        h = self.heard(samples, rate)
        s, x = match(text, h)
        return s, x, h

    @staticmethod
    def good(text, score, extra):
        n = len(words(text))
        return score >= (0.8 if n > 2 else 0.99) and extra <= (1 if n > 5 else 0)
