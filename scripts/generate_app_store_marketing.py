#!/usr/bin/env python3
"""Generate App Store marketing screenshots with logo, headline, and 3D device frame."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
LOGO_PATH = ROOT / "assets/images/logo-app.png"
OUT_DIR = ROOT / "app-store-screenshots" / "marketing"
SCREENSHOTS_DIR = ROOT / "app-store-screenshots"

BRAND_TEAL_DARK = (34, 95, 112)
BRAND_BG_TOP = (220, 238, 243)
BRAND_BG_BOTTOM = (148, 198, 210)
TEXT_DARK = (22, 30, 36)
TEXT_MUTED = (70, 90, 100)

APP_NAME = "TOSOL"
TYPE_LOGO = 104
TYPE_APP_NAME = 62
TYPE_HEADLINE = 92
TYPE_SUBTITLE = 44
BASE_WIDTH = 1284

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REGULAR = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"

IPHONE_SIZES = {
    "6.7-inch-1284x2778": (1284, 2778),
    "6.5-inch-1242x2688": (1242, 2688),
}

IPAD_SIZES = {
    "12.9-inch-2048x2732": (2048, 2732),
    "12.9-inch-2732x2048": (2732, 2048),
    "13-inch-2064x2752": (2064, 2752),
    "13-inch-2752x2064": (2752, 2064),
}

SCREENS = [
    {
        "source": "6.7-inch-1284x2778/01-trang-chu.png",
        "name": "01-trang-chu",
        "headline": "Quản lý đơn hàng\ndễ dàng",
        "subtitle": "Tạo đơn, theo dõi và giao hàng\nnhanh chóng mọi lúc mọi nơi",
    },
    {
        "source": "6.7-inch-1284x2778/02-san-pham.png",
        "name": "02-san-pham",
        "headline": "Kho hàng\nthông minh",
        "subtitle": "Tìm kiếm và quản lý sản phẩm\nvới giao diện trực quan",
    },
    {
        "source": "6.7-inch-1284x2778/03-tai-khoan.png",
        "name": "03-tai-khoan",
        "headline": "Quản trị\ntoàn diện",
        "subtitle": "Nhân viên, sản phẩm và giao hàng\ntrong một ứng dụng duy nhất",
    },
]

CUSTOM_MARKETING = [
    {
        "source": "marketing/6.7-inch-1284x2778/0-add.png",
        "name": "0-add",
    },
]


def load_font(path: str, size: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()


def vertical_gradient(size: tuple[int, int]) -> Image.Image:
    width, height = size
    img = Image.new("RGB", size)
    draw = ImageDraw.Draw(img)
    for y in range(height):
        t = y / max(height - 1, 1)
        r = int(BRAND_BG_TOP[0] * (1 - t) + BRAND_BG_BOTTOM[0] * t)
        g = int(BRAND_BG_TOP[1] * (1 - t) + BRAND_BG_BOTTOM[1] * t)
        b = int(BRAND_BG_TOP[2] * (1 - t) + BRAND_BG_BOTTOM[2] * t)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    return img


def draw_decorative_circles(base: Image.Image) -> None:
    draw = ImageDraw.Draw(base, "RGBA")
    w, h = base.size
    circles = [
        (int(w * 0.85), int(h * 0.08), int(w * 0.35), (255, 255, 255, 35)),
        (int(w * 0.1), int(h * 0.15), int(w * 0.2), (255, 255, 255, 25)),
        (int(w * 0.75), int(h * 0.55), int(w * 0.45), (46, 113, 133, 18)),
    ]
    for cx, cy, radius, color in circles:
        draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=color)


def wrap_text(text: str, font: ImageFont.FreeTypeFont, max_width: int) -> str:
    lines: list[str] = []
    for paragraph in text.split("\n"):
        words = paragraph.split()
        if not words:
            lines.append("")
            continue
        current = words[0]
        for word in words[1:]:
            test = f"{current} {word}"
            bbox = font.getbbox(test)
            if bbox[2] - bbox[0] <= max_width:
                current = test
            else:
                lines.append(current)
                current = word
        lines.append(current)
    return "\n".join(lines)


def draw_centered_multiline(
    draw: ImageDraw.ImageDraw,
    text: str,
    y: int,
    font: ImageFont.FreeTypeFont,
    fill: tuple[int, ...],
    canvas_width: int,
    line_spacing: int = 8,
    x_offset: int = 0,
) -> int:
    lines = text.split("\n")
    line_heights = [font.getbbox(line)[3] - font.getbbox(line)[1] for line in lines]
    current_y = y
    for i, line in enumerate(lines):
        bbox = font.getbbox(line)
        line_w = bbox[2] - bbox[0]
        x = x_offset + (canvas_width - line_w) // 2
        draw.text((x, current_y), line, font=font, fill=fill)
        current_y += line_heights[i] + line_spacing
    return current_y


def _rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)
    return mask


def _vertical_gradient_rgba(
    size: tuple[int, int],
    top: tuple[int, int, int, int],
    bottom: tuple[int, int, int, int],
) -> Image.Image:
    width, height = size
    img = Image.new("RGBA", size)
    draw = ImageDraw.Draw(img)
    for y in range(height):
        t = y / max(height - 1, 1)
        color = tuple(int(top[i] * (1 - t) + bottom[i] * t) for i in range(4))
        draw.line([(0, y), (width, y)], fill=color)
    return img


def _horizontal_gradient_rgba(
    size: tuple[int, int],
    left: tuple[int, int, int, int],
    right: tuple[int, int, int, int],
) -> Image.Image:
    width, height = size
    img = Image.new("RGBA", size)
    draw = ImageDraw.Draw(img)
    for x in range(width):
        t = x / max(width - 1, 1)
        color = tuple(int(left[i] * (1 - t) + right[i] * t) for i in range(4))
        draw.line([(x, 0), (x, height)], fill=color)
    return img


def _apply_rounded_mask(img: Image.Image, radius: int) -> Image.Image:
    masked = img.copy()
    masked.putalpha(_rounded_mask(img.size, radius))
    return masked


def _perspective_coeffs(
    src: list[tuple[float, float]],
    dst: list[tuple[float, float]],
) -> tuple[float, ...]:
    matrix: list[list[float]] = []
    vector: list[float] = []
    for (x, y), (u, v) in zip(src, dst):
        matrix.append([x, y, 1, 0, 0, 0, -u * x, -u * y])
        vector.append(u)
        matrix.append([0, 0, 0, x, y, 1, -v * x, -v * y])
        vector.append(v)

    aug = [row + [b] for row, b in zip(matrix, vector)]
    n = 8
    for col in range(n):
        pivot = max(range(col, n), key=lambda r: abs(aug[r][col]))
        aug[col], aug[pivot] = aug[pivot], aug[col]
        if abs(aug[col][col]) < 1e-12:
            continue
        for row in range(col + 1, n):
            factor = aug[row][col] / aug[col][col]
            for j in range(col, n + 1):
                aug[row][j] -= factor * aug[col][j]

    result = [0.0] * n
    for i in range(n - 1, -1, -1):
        result[i] = aug[i][n]
        for j in range(i + 1, n):
            result[i] -= aug[i][j] * result[j]
        result[i] /= aug[i][i]
    return tuple(result)


def _apply_3d_perspective(phone: Image.Image, tilt: float = 0.07) -> Image.Image:
    w, h = phone.size
    pad = int(max(w, h) * 0.12)
    canvas = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    canvas.paste(phone, (pad, pad), phone)

    cw, ch = canvas.size
    src = [(0, 0), (cw, 0), (cw, ch), (0, ch)]
    inset_x = int(cw * tilt * 0.35)
    inset_y = int(ch * tilt)
    dst = [
        (inset_x, inset_y),
        (cw - inset_x, inset_y // 2),
        (cw, ch),
        (0, ch - inset_y // 3),
    ]
    coeffs = _perspective_coeffs(src, dst)
    return canvas.transform(
        (cw, ch),
        Image.Transform.PERSPECTIVE,
        coeffs,
        Image.Resampling.BICUBIC,
    )


def _extrude_left_edge(front: Image.Image, depth: int = 18) -> Image.Image:
    """Shear the left bezel strip to create a visible 3D side face."""
    fw, fh = front.size
    strip_w = min(depth, fw // 6)
    strip = front.crop((0, 0, strip_w, fh))

    # Darken strip for side-face shading
    pixels = strip.load()
    for x in range(strip_w):
        shade = 0.55 + 0.45 * (x / max(strip_w - 1, 1))
        for y in range(fh):
            r, g, b, a = pixels[x, y]
            pixels[x, y] = (int(r * shade), int(g * shade), int(b * shade), a)

    shear_x = int(strip_w * 0.55)
    side = strip.transform(
        (strip_w + shear_x, fh),
        Image.Transform.AFFINE,
        (1, 0.32, 0, 0, 1, 0),
        resample=Image.Resampling.BICUBIC,
    )

    combined_w = side.width + fw - strip_w
    combined = Image.new("RGBA", (combined_w, fh), (0, 0, 0, 0))
    combined.paste(side, (0, 0), side)
    combined.paste(front, (side.width - strip_w, 0), front)
    return combined


def create_iphone_mockup(
    screenshot: Image.Image,
    phone_width: int,
    corner_radius: int = 52,
) -> Image.Image:
    """Build a 3D iPhone mockup — metallic bezel, perspective tilt, realistic shadows."""
    bezel = 22
    screen_w = phone_width
    aspect = screenshot.height / screenshot.width
    screen_h = int(screen_w * aspect)
    screenshot = screenshot.resize((screen_w, screen_h), Image.Resampling.LANCZOS)
    screen_radius = max(corner_radius - bezel + 8, 30)

    front_w = screen_w + bezel * 2
    front_h = screen_h + bezel * 2

    # Titanium bezel — light silver gradient
    front = Image.new("RGBA", (front_w, front_h), (0, 0, 0, 0))
    bezel_grad = _vertical_gradient_rgba(
        (front_w, front_h),
        (225, 223, 220, 255),
        (130, 128, 125, 255),
    )
    front.paste(bezel_grad, (0, 0), _rounded_mask((front_w, front_h), corner_radius))

    # Left-edge thickness illusion (dark strip = side face in shadow)
    side_shadow = _horizontal_gradient_rgba(
        (int(bezel * 0.85), front_h),
        (55, 53, 50, 210),
        (130, 128, 125, 0),
    )
    front.paste(side_shadow, (0, 0), side_shadow)

    # Specular highlights
    highlight = Image.new("RGBA", (front_w, front_h), (0, 0, 0, 0))
    h_draw = ImageDraw.Draw(highlight)
    h_draw.rounded_rectangle(
        (1, 1, front_w - 2, front_h - 2),
        radius=corner_radius - 1,
        outline=(255, 255, 255, 70),
        width=2,
    )
    h_draw.line(
        [(bezel, bezel), (bezel, front_h - bezel)],
        fill=(255, 255, 255, 45),
        width=1,
    )
    h_draw.line(
        [(front_w - bezel, bezel + 8), (front_w - bezel, front_h - bezel - 8)],
        fill=(0, 0, 0, 25),
        width=1,
    )
    front = Image.alpha_composite(front, highlight)

    # Screen recess
    recess = Image.new("RGBA", (front_w, front_h), (0, 0, 0, 0))
    ImageDraw.Draw(recess).rounded_rectangle(
        (bezel - 4, bezel - 4, front_w - bezel + 3, front_h - bezel + 3),
        radius=screen_radius + 5,
        fill=(5, 5, 7, 180),
    )
    front = Image.alpha_composite(front, recess)

    # Screen + subtle glass reflection
    screen = Image.new("RGBA", (screen_w, screen_h), (0, 0, 0, 255))
    screen.paste(screenshot.convert("RGBA"), (0, 0))
    screen = _apply_rounded_mask(screen, screen_radius)

    glare = _vertical_gradient_rgba(
        (screen_w, screen_h),
        (255, 255, 255, 38),
        (255, 255, 255, 0),
    )
    glare_mask = Image.new("L", (screen_w, screen_h), 0)
    ImageDraw.Draw(glare_mask).rectangle((0, 0, screen_w, int(screen_h * 0.18)), fill=160)
    glare.putalpha(glare_mask)
    screen = Image.alpha_composite(screen, glare)
    front.paste(screen, (bezel, bezel), screen)

    # Side buttons
    f_draw = ImageDraw.Draw(front)
    for y1, y2 in [(int(front_h * 0.21), int(front_h * 0.26)), (int(front_h * 0.29), int(front_h * 0.34))]:
        f_draw.rounded_rectangle((-4, y1, 1, y2), radius=2, fill=(100, 98, 95, 255))
        f_draw.line([(0, y1 + 1), (0, y2 - 1)], fill=(160, 158, 155, 255), width=1)
    btn_y1, btn_y2 = int(front_h * 0.27), int(front_h * 0.35)
    f_draw.rounded_rectangle((front_w - 2, btn_y1, front_w + 3, btn_y2), radius=2, fill=(145, 143, 140, 255))
    f_draw.line([(front_w, btn_y1 + 2), (front_w, btn_y2 - 2)], fill=(200, 198, 195, 255), width=1)

    # Extrude left edge for 3D side face, then rotate + perspective
    phone_body = _extrude_left_edge(front, depth=int(bezel * 0.9))
    rotated = phone_body.rotate(-10, expand=True, resample=Image.Resampling.BICUBIC)
    phone_3d = _apply_3d_perspective(rotated, tilt=0.08)

    pw, ph = phone_3d.size
    margin = int(max(pw, ph) * 0.04)
    result = Image.new("RGBA", (pw + margin * 2, ph + margin * 2), (0, 0, 0, 0))

    drop = Image.new("RGBA", phone_3d.size, (0, 0, 0, 0))
    ImageDraw.Draw(drop).rounded_rectangle(
        (4, 6, pw - 4, ph - 2),
        radius=corner_radius,
        fill=(10, 25, 35, 50),
    )
    drop = drop.filter(ImageFilter.GaussianBlur(radius=18))
    result.paste(drop, (margin + 8, margin + 10), drop)
    result.paste(phone_3d, (margin, margin), phone_3d)
    return result


def _trim_transparent(img: Image.Image) -> Image.Image:
    bbox = img.getbbox()
    return img.crop(bbox) if bbox else img


def _draw_header_block(
    canvas: Image.Image,
    width: int,
    scale: float,
    headline: str,
    subtitle: str,
    *,
    x_offset: int = 0,
    block_width: int | None = None,
    start_y: int | None = None,
) -> tuple[int, int]:
    """Draw logo, app name, headline, subtitle. Returns (content_bottom_y, block_height)."""
    block_width = block_width or width
    draw = ImageDraw.Draw(canvas)

    logo_size = int(TYPE_LOGO * scale)
    logo_y = start_y if start_y is not None else int(72 * scale)
    with Image.open(LOGO_PATH) as logo_raw:
        logo = logo_raw.convert("RGBA")
        logo.thumbnail((logo_size, logo_size), Image.Resampling.LANCZOS)

    name_font = load_font(FONT_BOLD, int(TYPE_APP_NAME * scale))
    name_bbox = name_font.getbbox(APP_NAME)
    name_w = name_bbox[2] - name_bbox[0]
    name_h = name_bbox[3] - name_bbox[1]
    row_w = logo.width + int(20 * scale) + name_w
    row_x = x_offset + (block_width - row_w) // 2
    name_y = logo_y + (logo.height - name_h) // 2
    canvas.paste(logo, (row_x, logo_y), logo)
    draw.text(
        (row_x + logo.width + int(20 * scale), name_y),
        APP_NAME,
        font=name_font,
        fill=BRAND_TEAL_DARK,
    )

    headline_font = load_font(FONT_BOLD, int(TYPE_HEADLINE * scale))
    headline_y = logo_y + logo_size + int(44 * scale)
    headline_end = draw_centered_multiline(
        draw,
        headline,
        headline_y,
        headline_font,
        TEXT_DARK,
        block_width,
        line_spacing=int(10 * scale),
        x_offset=x_offset,
    )

    subtitle_font = load_font(FONT_REGULAR, int(TYPE_SUBTITLE * scale))
    subtitle_y = headline_end + int(24 * scale)
    wrapped = wrap_text(subtitle, subtitle_font, int(block_width * 0.88))
    subtitle_end = draw_centered_multiline(
        draw,
        wrapped,
        subtitle_y,
        subtitle_font,
        TEXT_MUTED,
        block_width,
        line_spacing=int(12 * scale),
        x_offset=x_offset,
    )

    block_height = subtitle_end - logo_y
    return subtitle_end, block_height


def _place_device_mockup(
    canvas: Image.Image,
    screenshot_path: Path,
    *,
    scale: float,
    region_x: int,
    region_y: int,
    region_w: int,
    region_h: int,
    device_width_ratio: float = 0.56,
) -> Image.Image:
    with Image.open(screenshot_path) as shot:
        phone_w = int(region_w * device_width_ratio)
        mockup = _trim_transparent(
            create_iphone_mockup(shot, phone_w, corner_radius=int(52 * scale))
        )

    fit_scale = min(region_w / mockup.width, region_h / mockup.height)
    mockup = mockup.resize(
        (int(mockup.width * fit_scale), int(mockup.height * fit_scale)),
        Image.Resampling.LANCZOS,
    )

    phone_x = region_x + (region_w - mockup.width) // 2
    phone_y = region_y + (region_h - mockup.height) // 2

    result = canvas.convert("RGBA")
    result.paste(mockup, (phone_x, phone_y), mockup)

    shadow_w = int(mockup.width * 0.75)
    shadow_h = max(int(mockup.height * 0.04), 12)
    ground = Image.new("RGBA", (shadow_w, shadow_h), (0, 0, 0, 0))
    ImageDraw.Draw(ground).ellipse((0, 0, shadow_w - 1, shadow_h - 1), fill=(20, 35, 45, 50))
    ground = ground.filter(ImageFilter.GaussianBlur(radius=10))
    shadow_x = phone_x + (mockup.width - shadow_w) // 2
    shadow_y = phone_y + mockup.height - int(shadow_h * 0.35)
    result.paste(ground, (shadow_x, shadow_y), ground)
    return result


def generate_marketing_image(
    screenshot_path: Path,
    output_path: Path,
    canvas_size: tuple[int, int],
    headline: str,
    subtitle: str,
) -> None:
    width, height = canvas_size
    landscape = width > height

    canvas = vertical_gradient(canvas_size)
    draw_decorative_circles(canvas)
    scale = width / BASE_WIDTH if not landscape else height / 2048

    if landscape:
        left_w = int(width * 0.42)
        pad = int(32 * scale)
        canvas_tmp = vertical_gradient(canvas_size)
        draw_decorative_circles(canvas_tmp)
        est_h = block_h_estimate(scale)
        start_y = max(pad, (height - est_h) // 2)
        subtitle_end, block_h = _draw_header_block(
            canvas,
            width,
            scale,
            headline,
            subtitle,
            x_offset=0,
            block_width=left_w,
            start_y=start_y,
        )
        _ = subtitle_end, block_h
        device_x = left_w + pad
        device_w = width - device_x - pad
        canvas = _place_device_mockup(
            canvas,
            screenshot_path,
            scale=scale,
            region_x=device_x,
            region_y=pad,
            region_w=device_w,
            region_h=height - pad * 2,
            device_width_ratio=0.72,
        )
    else:
        subtitle_end, _ = _draw_header_block(canvas, width, scale, headline, subtitle)
        gap = int(20 * scale)
        device_y = subtitle_end + gap
        canvas = _place_device_mockup(
            canvas,
            screenshot_path,
            scale=scale,
            region_x=0,
            region_y=device_y,
            region_w=width,
            region_h=height - device_y - int(8 * scale),
            device_width_ratio=0.56,
        )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(output_path, "PNG", optimize=True)


def block_h_estimate(scale: float) -> int:
    return int((TYPE_LOGO + TYPE_HEADLINE * 2.2 + TYPE_SUBTITLE * 2) * scale)


def resize_custom_marketing(source: Path, output: Path, canvas_size: tuple[int, int]) -> None:
    """Fit a finished marketing slide into target canvas (letterbox for landscape)."""
    width, height = canvas_size
    landscape = width > height

    with Image.open(source) as src:
        img = src.convert("RGB")
        if not landscape:
            fitted = img.resize((width, height), Image.Resampling.LANCZOS)
            output.parent.mkdir(parents=True, exist_ok=True)
            fitted.save(output, "PNG", optimize=True)
            return

        canvas = vertical_gradient(canvas_size)
        draw_decorative_circles(canvas)
        scale = min(width * 0.52 / img.width, height * 0.92 / img.height)
        new_w = int(img.width * scale)
        new_h = int(img.height * scale)
        resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        x = (width - new_w) // 2
        y = (height - new_h) // 2
        canvas.paste(resized, (x, y))
        output.parent.mkdir(parents=True, exist_ok=True)
        canvas.save(output, "PNG", optimize=True)


def main() -> None:
    all_sizes = {**IPHONE_SIZES, **IPAD_SIZES}

    for folder, size in all_sizes.items():
        for screen in SCREENS:
            src = SCREENSHOTS_DIR / screen["source"]
            if not src.exists():
                raise FileNotFoundError(f"Missing screenshot: {src}")

            dst = OUT_DIR / folder / f"{screen['name']}.png"
            generate_marketing_image(src, dst, size, screen["headline"], screen["subtitle"])
            print(f"Created {dst} ({size[0]}x{size[1]})")

        for item in CUSTOM_MARKETING:
            src = SCREENSHOTS_DIR / item["source"]
            if not src.exists():
                print(f"Skip custom (missing): {src}")
                continue
            dst = OUT_DIR / folder / f"{item['name']}.png"
            if src.resolve() == dst.resolve():
                print(f"Skip custom (source is output): {dst}")
                continue
            resize_custom_marketing(src, dst, size)
            print(f"Created {dst} ({size[0]}x{size[1]}) [custom]")

    print(f"\nDone. Marketing screenshots: {OUT_DIR}")


if __name__ == "__main__":
    main()
