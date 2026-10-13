# -*- coding: utf-8 -*-
"""Mẫu HTML cho ảnh slide bài giảng theo chủ đề — dùng chung bởi
tools/dung_bai_giang.py. Theo đúng phong cách "Cosmic" (nền gradient
xanh-hồng nhạt, badge kicker, số chương dạng gradient, chấm bullet gradient,
Bricolage Grotesque cho tiêu đề, Be Vietnam Pro cho chữ thường) — màu lấy từ
bảng màu của hệ sinh thái Je m'appelle Hương, không mang tên bất kỳ ứng dụng
nào trong nội dung.

Không tự đứng một mình — các hàm trang_* trả về đoạn HTML cho MỘT trang,
tools/dung_bai_giang.py mới là nơi lặp qua toàn bộ slide và chụp ảnh bằng
Playwright.
"""
import os

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_DIR = os.path.join(GOC, 'assets', 'fonts')

DON_VI_DAO_TAO = 'Trường ĐH Sư phạm Kỹ thuật Vĩnh Long &middot; Khởi sự doanh nghiệp (EC1606)'

CSS_TOKENS = """
:root {
  --bg: #F2F5FC;
  --text: #0F1733;
  --text-soft: #3A4568;
  --muted: #5C6889;
  --primary: #0E7FA4;
  --primary-soft: #E1F3F9;
  --secondary: #B85585;
  --secondary-soft: #FBEAF2;
  --border: #D2DAEC;
}
"""

FONT_FACES = f"""
@font-face {{
  font-family: 'Be Vietnam Pro';
  src: url('file://{FONT_DIR}/be-vietnam-pro-400-vietnamese.woff2') format('woff2');
  font-weight: 400;
}}
@font-face {{
  font-family: 'Be Vietnam Pro';
  src: url('file://{FONT_DIR}/be-vietnam-pro-500-vietnamese.woff2') format('woff2');
  font-weight: 500;
}}
@font-face {{
  font-family: 'Be Vietnam Pro';
  src: url('file://{FONT_DIR}/be-vietnam-pro-600-vietnamese.woff2') format('woff2');
  font-weight: 600;
}}
@font-face {{
  font-family: 'Be Vietnam Pro';
  src: url('file://{FONT_DIR}/be-vietnam-pro-700-vietnamese.woff2') format('woff2');
  font-weight: 700;
}}
@font-face {{
  font-family: 'Bricolage Grotesque';
  src: url('file://{FONT_DIR}/bricolage-grotesque-600-vietnamese.woff2') format('woff2');
  font-weight: 600;
}}
@font-face {{
  font-family: 'Bricolage Grotesque';
  src: url('file://{FONT_DIR}/bricolage-grotesque-800-vietnamese.woff2') format('woff2');
  font-weight: 800;
}}
"""

# 1280x720 — HD, đủ độ nét cho video và máy chiếu; cỡ chữ cân theo khung này.
BASE_CSS = """
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
  width: 1280px; height: 720px;
  background: linear-gradient(135deg, #F2F5FC 0%, #EDF1FA 55%, #FBEAF2 100%);
  font-family: 'Be Vietnam Pro', sans-serif;
  color: var(--text);
  overflow: hidden;
}
.page {
  width: 1280px; height: 720px;
  padding: 86px 100px 60px 100px;
  display: flex; flex-direction: column;
  position: relative;
}
.kicker {
  display: inline-block;
  align-self: flex-start;
  background: var(--primary-soft);
  color: var(--primary);
  font-weight: 700;
  font-size: 15px;
  padding: 7px 15px;
  border-radius: 999px;
  margin-bottom: 19px;
}
h1 {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-weight: 800;
  font-size: 35px;
  line-height: 1.18;
  color: var(--text);
  max-width: 1020px;
}
.cover-num {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-weight: 800;
  font-size: 80px;
  line-height: 1;
  background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 5px;
}
.desc {
  font-size: 20px;
  color: var(--muted);
  margin-top: 19px;
  max-width: 950px;
  line-height: 1.5;
}
.bullets { margin-top: 32px; display: flex; flex-direction: column; gap: 20px; }
.bullet { display: flex; align-items: flex-start; gap: 15px; }
.dot {
  flex: 0 0 11px; width: 11px; height: 11px; border-radius: 3px;
  margin-top: 6px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
}
.bullet-text { font-size: 20px; line-height: 1.5; color: var(--text); max-width: 1000px; }
.footer {
  position: absolute; left: 100px; right: 100px; bottom: 33px;
  display: flex; justify-content: space-between; align-items: center;
  font-size: 15px; font-weight: 600; color: var(--muted);
}
.next-pill {
  margin-top: 37px;
  display: inline-flex; align-self: flex-start;
  align-items: center; gap: 10px;
  background: #ffffff; border: 2px solid var(--border);
  border-radius: 999px; padding: 15px 24px;
  font-size: 19px; font-weight: 700; color: var(--primary);
}
"""


def trang_bia(so_chuong, so_chu_de, ten_chu_de, mo_ta, tong_so):
    return f"""<div class="page">
  <span class="kicker">Chương {so_chuong} &middot; Chủ đề {so_chu_de}</span>
  <div class="cover-num">{so_chuong}.{so_chu_de}</div>
  <h1>{ten_chu_de}</h1>
  <p class="desc">{mo_ta}</p>
  <div class="footer"><span>{DON_VI_DAO_TAO}</span><span>1/{tong_so}</span></div>
</div>"""


def trang_noi_dung(kicker, tieu_de, gach_dau_dong, so_trang, tong_so):
    bullets_html = "\n".join(
        f'<div class="bullet"><div class="dot"></div><div class="bullet-text">{b}</div></div>'
        for b in gach_dau_dong
    )
    kicker_html = f'<span class="kicker">{kicker}</span>' if kicker else ""
    return f"""<div class="page">
  {kicker_html}
  <h1>{tieu_de}</h1>
  <div class="bullets">{bullets_html}</div>
  <div class="footer"><span>{DON_VI_DAO_TAO}</span><span>{so_trang}/{tong_so}</span></div>
</div>"""


def trang_ket(so_chuong, so_chu_de, mo_ta, chu_tiep_theo, so_trang, tong_so):
    next_html = f'<div class="next-pill">&rarr; {chu_tiep_theo}</div>' if chu_tiep_theo else ""
    return f"""<div class="page">
  <span class="kicker">Tổng kết Chương {so_chuong} &middot; Chủ đề {so_chu_de}</span>
  <h1>Tổng kết chủ đề</h1>
  <p class="desc">{mo_ta}</p>
  {next_html}
  <div class="footer"><span>{DON_VI_DAO_TAO}</span><span>{so_trang}/{tong_so}</span></div>
</div>"""


def trang_html_day_du(noi_dung_trang):
    return f"""<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<style>{FONT_FACES}{CSS_TOKENS}{BASE_CSS}</style>
</head>
<body>{noi_dung_trang}</body>
</html>"""
