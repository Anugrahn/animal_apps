"""Cuts generated art sheets into single pictures for the app.
   python3 cut.py <sheets dir> <out dir> [ASSET_SHEETS.md] [sheet-name ...]

A sheet (see animal-friends-v2/interface/ASSET_SHEETS.md) is a transparent
PNG of objects in rows, left to right, top to bottom. Each object becomes
<out dir>/<file>.webp, named by the table at the end of ASSET_SHEETS.md, at
most 300 px across like the rest of art/pic/.

How a sheet is read: the sheet is a grid (columns x rows, short last row
on the left), one object per cell. Each patch of paint belongs to the
cell that holds most of it; a patch spread over several cells (objects
that touch) is split along the cell lines. In each cell the biggest patch
is the object, and what lies close to it (a leaf, sparkles, a splash) or
is big goes with it; specks from a neighbour are left out, even inside the
cut-out. Each object is cut out with a little margin."""
import os, re, sys
import numpy as np
from PIL import Image
from scipy import ndimage

SHEETS, OUT = sys.argv[1], sys.argv[2]
MD = sys.argv[3] if len(sys.argv) > 3 else os.path.join(os.path.dirname(__file__), '../../animal-friends-v2/interface/ASSET_SHEETS.md')
ONLY = set(sys.argv[4:])
SIZE, PAD = 300, 6

table = {}
for sheet, pos, file in re.findall(r'^\| `(need2-[^`]+)` \| (\d+) \| \S+ \| [^|]+ \| `([^`]+)` \|', open(MD, encoding='utf8').read(), re.M):
    table.setdefault(sheet, {})[int(pos)] = file


def grid(n):
    """How the sheets were laid out (as the generator's manifest gives them)."""
    return {16: (4, 4), 8: (4, 2), 12: (4, 3), 10: (5, 2), 13: (4, 4), 5: (3, 2)}.get(n) or (4, -(-n // 4))


def cut(path, files):
    im = Image.open(path).convert('RGBA')
    rgba = np.array(im)
    paint = rgba[..., 3] > 24
    H, W = paint.shape
    count = len(files)
    cols, rows = grid(count)
    yy, xx = np.indices(paint.shape)
    cell = np.minimum(rows - 1, yy * rows // H) * cols + np.minimum(cols - 1, xx * cols // W)
    lab, n = ndimage.label(paint)
    owner = np.full(paint.shape, -1)
    split = np.zeros(paint.shape, bool)              # paint cut off a neighbour at a cell line
    for k, sl in enumerate(ndimage.find_objects(lab), 1):
        here = lab[sl] == k
        cells = cell[sl][here]
        counts = np.bincount(cells, minlength=cols * rows)
        if counts.max() >= 0.8 * cells.size:
            owner[sl][here] = counts.argmax()          # one object
        else:
            owner[sl][here] = cells                     # objects that touch: split at the cell lines
            split[sl][here] = True
    out = []
    for i in range(count):
        mine = owner == i
        if not mine.any():
            raise ValueError(f'{os.path.basename(path)}: nothing in cell {i + 1}')
        parts, m = ndimage.label(mine)
        boxes = ndimage.find_objects(parts)
        sizes = ndimage.sum(mine, parts, range(1, m + 1))
        main = int(np.argmax(sizes))
        r, c = divmod(i, cols)
        cy0, cy1, cx0, cx1 = r * H // rows, (r + 1) * H // rows, c * W // cols, (c + 1) * W // cols
        at_edge = lambda b: b[1].start <= cx0 + 3 or b[1].stop >= cx1 - 3 or b[0].start <= cy0 + 3 or b[0].stop >= cy1 - 3
        keep = {main}
        box = [boxes[main][0].start, boxes[main][0].stop, boxes[main][1].start, boxes[main][1].stop]
        grew = True
        while grew:                                     # whatever touches the object's reach joins it
            grew = False
            for j, b in enumerate(boxes):
                if j in keep: continue
                small = sizes[j] < 0.05 * sizes[main]
                if small and (split[boxes[j]][parts[boxes[j]] == j + 1].all() or at_edge(b)):
                    continue                            # a bit of the neighbour's object (an arm across the line)
                near = b[0].start < box[1] + 30 and b[0].stop > box[0] - 30 and b[1].start < box[3] + 30 and b[1].stop > box[2] - 30
                if near or sizes[j] >= 0.15 * sizes[main]:
                    keep.add(j); grew = True
                    box = [min(box[0], b[0].start), max(box[1], b[0].stop), min(box[2], b[1].start), max(box[3], b[1].stop)]
        mask = np.isin(parts, [j + 1 for j in keep])
        y0, y1 = max(0, box[0] - PAD), min(H, box[1] + PAD)
        x0, x1 = max(0, box[2] - PAD), min(W, box[3] + PAD)
        piece = rgba[y0:y1, x0:x1].copy()
        # keep the soft edge: pixels next to the object (its faint outline) stay too
        soft = ndimage.binary_dilation(mask, iterations=2)[y0:y1, x0:x1]
        piece[..., 3] = np.where(soft, piece[..., 3], 0)
        out.append(Image.fromarray(piece))
    for pic, file in zip(out, files):
        pic.thumbnail((SIZE, SIZE), Image.LANCZOS)
        pic.save(os.path.join(OUT, file + '.webp'), 'WEBP', quality=88, method=4)
    return len(out)


os.makedirs(OUT, exist_ok=True)
done = 0
for sheet in sorted(table):
    if ONLY and sheet not in ONLY: continue
    path = os.path.join(SHEETS, sheet)
    if not os.path.exists(path):
        print(f'{sheet}: not found, skipped'); continue
    files = [table[sheet][p] for p in sorted(table[sheet])]
    try:
        n = cut(path, files); done += n
        print(f'{sheet}: {n} pictures')
    except ValueError as e:
        print('CHECK BY HAND:', e)
print(f'{done} pictures in {OUT}')
