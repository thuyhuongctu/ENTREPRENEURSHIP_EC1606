"""Tách nền trắng khỏi ảnh Hương AI (nền trắng trung tính, áo dài màu kem ấm).

Nền khác áo ở ĐỘ BÃO HÒA chứ không ở độ sáng: áo kem có max-min >= 19,
nền trắng < 8. Vì vậy lấy nền = vùng rất sáng VÀ trung tính, kể cả khe kín
giữa tay và thân (không nối ra mép ảnh) miễn là trắng tinh.
"""
import sys, numpy as np, cv2
from PIL import Image

def tach(src, dst, scale=2):
    im = Image.open(src).convert('RGB')
    im = im.resize((im.width*scale, im.height*scale), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)
    mn, mx = a.min(2), a.max(2)
    nen_ung = ((mn > 232) & (mx - mn < 10))
    # Bóng sàn dưới chân (có ở vài ảnh): gần trung tính, xám nhạt tới xám vừa,
    # nên ngưỡng trên không bắt hết. Ở dải ngang tầm đôi giày (7% chiều cao
    # nhân vật tính từ đáy) chỉ có giày và da chân, đều ngả màu rõ
    # (max-min > 30), nên ở dải này coi mọi điểm gần trung tính là nền.
    dong = np.where((mn < 200).any(1))[0]
    dau, cuoi = dong.min(), dong.max()
    day = np.zeros_like(nen_ung)
    day[int(cuoi - 0.07 * (cuoi - dau)):] = True
    nen_ung = (nen_ung | (day & (mx - mn < 16))).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(nen_ung, 8)
    h, w = nen_ung.shape
    nen = np.zeros_like(nen_ung)
    for i in range(1, n):
        x, y, ww, hh, area = st[i]
        cham_mep = x == 0 or y == 0 or x + ww == w or y + hh == h
        vung = lab == i
        trang_tinh = a[vung].mean() > 246
        o_day = y > cuoi - 0.07 * (cuoi - dau)
        if cham_mep or o_day or (area > 120 * scale * scale and trang_tinh):
            nen[vung] = 1
    than = (1 - nen).astype(np.uint8)
    than = cv2.morphologyEx(than, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(than, 8)
    lon = 1 + np.argmax(st[1:, 4])
    than = (lab == lon).astype(np.float32)
    # Độ phủ mép: làm mềm một chút, rồi gỡ màu trắng bị trộn vào mép.
    alpha = cv2.GaussianBlur(than, (0, 0), 0.9 * scale)
    alpha = np.clip((alpha - 0.15) / 0.7, 0, 1)
    am = alpha[..., None]
    mau = np.where(am > 0.05, (a - (1 - am) * 255) / np.maximum(am, 0.05), a)
    mau = np.clip(mau, 0, 255)
    out = np.dstack([mau, alpha * 255]).astype(np.uint8)
    ys, xs = np.where(alpha > 0.02)
    out = out[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    Image.fromarray(out, 'RGBA').save(dst)
    return out.shape

if __name__ == '__main__':
    print(tach(sys.argv[1], sys.argv[2]))
