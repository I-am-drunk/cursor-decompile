# Derive light-mode cube uniforms for docs/LOGIN-PAGE-V2.md §6.
# Method: shader emits pow(c/255,3) on a linear canvas. Take each emitted stop in OKLab,
# keep hue and chroma, mirror lightness about the page (L' = Ld + Ll - L), convert back,
# cube-root to get the uniform. Run: python3 -I derive-light.py
def to_oklab(r, g, b):
    l = 0.4122214708*r + 0.5363325363*g + 0.0514459929*b
    m = 0.2119034982*r + 0.6806995451*g + 0.1073969566*b
    s = 0.0883024619*r + 0.2817188376*g + 0.6299787005*b
    l, m, s = l**(1/3), m**(1/3), s**(1/3)
    return (0.2104542553*l + 0.7936177850*m - 0.0040720468*s,
            1.9779984951*l - 2.4285922050*m + 0.4505937099*s,
            0.0259040371*l + 0.7827717662*m - 0.8086757660*s)

def from_oklab(L, a, b):
    l = (L + 0.3963377774*a + 0.2158037573*b) ** 3
    m = (L - 0.1055613458*a - 0.0638541728*b) ** 3
    s = (L - 0.0894841775*a - 1.2914855480*b) ** 3
    return (4.0767416621*l - 3.3077115913*m + 0.2309699292*s,
            -1.2684380046*l + 2.6097574011*m - 0.3413193965*s,
            -0.0041960863*l - 0.7034186147*m + 1.7076147010*s)

STOPS = {"c1": (244, 254, 255), "c2": (255, 122, 152), "c3": (184, 2, 50)}   # EXTRACTED
PAGE_DARK = (7, 9, 10)          # EXTRACTED scene clear
PAGE_LIGHT = (248, 247, 245)    # GAP: replace with measured light --bg-page

def lightness(rgb):
    return to_oklab(*[v / 255 for v in rgb])[0]

def clamp01(v):
    return min(max(v, 0.0), 1.0)

if __name__ == "__main__":
    Ld, Ll = lightness(PAGE_DARK), lightness(PAGE_LIGHT)
    print(f"page L dark {Ld:.3f} light {Ll:.3f}")
    for name, stop in STOPS.items():
        emitted = [(v / 255) ** 3 for v in stop]
        L, a, b = to_oklab(*emitted)
        L2 = clamp01(Ld + Ll - L)
        lin = [clamp01(v) for v in from_oklab(L2, a, b)]
        uniform = tuple(round(255 * v ** (1 / 3)) for v in lin)
        emits = tuple(round(255 * v) for v in lin)
        print(f"{name}: L {L:.3f} -> {L2:.3f}  uniform {uniform}  emits {emits}")
