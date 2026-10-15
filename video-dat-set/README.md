# Video bài giảng 3D đất sét (có giọng đọc)

Dựng video bài giảng theo **Quy định 55/QĐ-ĐHSPKTVL-ĐT_ĐBCL (07/7/2025)**,
phong cách 3D đất sét, có nhân vật **Hương AI** dẫn bài và **giọng đọc tổng hợp
từ mẫu giọng của giảng viên**. Bộ video câm cũ trong `chuong-0N/chu-de-M/bai-giang/`
giữ nguyên; video ở đây là bản có giọng.

## Kết quả (Chương 1)

| Tệp | Nội dung | Ghi chú |
|---|---|---|
| `chuong-01/chu-de-1/bai-giang/EC1606_SX01.mp4` | Video 1: bìa → mục tiêu → nội dung → chủ đề 1.1 | tên tệp theo Mẫu HLS-VLU-08, mục 3b |
| `chuong-01/chu-de-2/bai-giang/EC1606_SX02.mp4` | Video 2: "đang ở đâu" → chủ đề 1.2 → ôn tập → tình huống → tổng kết → tài liệu → kết | |

Đối chiếu với Mẫu HLS-VLU-08 (Tài liệu hướng dẫn thẩm định HLS):

- **Thời lượng 12–17 phút/video, bình quân khoảng 15 phút** (mục 4a). Phụ lục 1
  ghi 7–15 phút, nhưng hội đồng chấm theo Mẫu 08, nên lấy khoảng chặt hơn.
- 1920×1080, H.264, mở được trên điện thoại và máy tính (mục 7b).
- Mỗi khung có tên trường và tên khoa (Điều 18, khoản 1b khuyến cáo).

## Trung thực về AI — đừng bỏ các dòng ghi chú

- **Giọng đọc không phải giọng thật của cô.** Đây là giọng tổng hợp bằng mô hình
  VieNeu-TTS, nhân bản từ 14 giây giọng thật (`mau-giong/MAU_GIONG_CO_HUONG.wav`,
  cắt từ video 1 gói EC6035TX, do chính cô chọn). Trang bìa mỗi video ghi rõ
  điều này. Không được gọi là "giọng của giảng viên" ở bất cứ đâu.
- **Hương AI là nhân vật do AI tạo**, không phải ảnh thật; mọi khung có nhân vật
  đều kèm dòng chú thích ấy (cùng lý do như ở ComDraft: ảnh nhân vật AI từng bị
  hiểu nhầm là ảnh thật của giảng viên).
- Quy định 55 **không có điều nào** về giọng tổng hợp hay AI; ghi chú ở đây là
  để người xem và hội đồng không hiểu nhầm, không phải vì quy định đòi.

## Dựng lại

Ba bước, đều chạy lại được từ nguồn. Đừng sửa tay video kết quả.

```bash
# 1. Lịch slide + lời đọc, lấy từ tệp nội dung slide mà tools/dung_goi_chuong.py sinh
python3 video-dat-set/tools/lay_lich_video.py 1          # → du-lieu/ch01.json

# 2. Đọc lời (môi trường riêng: pip install vieneu faster-whisper soundfile;
#    onnxruntime==1.21.1 — bản 1.31 báo "External data path escapes model
#    directory" khi đọc mô hình từ bộ nhớ đệm Hugging Face)
python video-dat-set/tools/doc_loi.py video-dat-set/du-lieu/ch01.json <thư mục âm thanh>

# 3. Dựng hình
cd video-dat-set/remotion && npm install
cp <thư mục âm thanh>/*.wav <thư mục âm thanh>/so_do.json public/am-thanh/ch01/
npx remotion still src/index.ts nen-rong  public/nen/rong.png  --gl=swangle
npx remotion still src/index.ts nen-giang public/nen/giang.png --gl=swangle
node dung_minh_hoa.mjs 1        # hình minh họa 3D từng slide → public/minh-hoa/ch01/
npx remotion render src/index.ts EC1606-SX01 out/EC1606_SX01_tho.mp4 --codec=h264 --crf=20 --image-format=jpeg --jpeg-quality=92
npx remotion render src/index.ts EC1606-SX02 out/EC1606_SX02_tho.mp4 --codec=h264 --crf=20 --image-format=jpeg --jpeg-quality=92

# 4. Hoàn thiện: dải màu "tv" cho điện thoại, độ to -16 LUFS (xem ghi chú trong tệp)
sh ../tools/hoan_thien.sh out/EC1606_SX01_tho.mp4 out/EC1606_SX01.mp4
sh ../tools/hoan_thien.sh out/EC1606_SX02_tho.mp4 out/EC1606_SX02.mp4
```

Máy không có Chrome riêng của Remotion thì thêm `--browser-executable=<đường dẫn Chromium>`.

### Vì sao làm thế này

- **Thời lượng mỗi slide lấy từ chính bản đọc** (`so_do.json`), không ước theo số
  chữ: hình phải khớp lời từng khung. Thiếu lời đọc của một slide thì bước dựng
  dừng hẳn, để không lọt slide câm vào video (`--props '{"nhap":true}'` chỉ để
  xem thử khi chưa đọc xong).
- **Đọc từng câu rồi chèn khoảng nghỉ 0,55 giây.** Mô hình đọc khoảng 238 từ/phút,
  không có nút chỉnh tốc độ; đọc liền một mạch thì video 1 chỉ chừng 10 phút,
  dưới mức 12 phút. Khoảng nghỉ giữa câu như lúc giảng thật vừa đủ bù.
- **Mỗi câu được nhận dạng lại để soát**, câu sai quá 12% thì đọc lại tối đa ba
  lần. Đây là lưới thô — bộ nhận dạng chép sai cả giọng thật của cô 5–8% —
  không thay việc nghe duyệt.
- **Nền 3D dựng một lần thành ảnh tĩnh.** Máy dựng không có GPU; dựng 3D từng
  khung cho 25 phút video mất hơn 7 giờ. Chuyển động thật nằm ở nhân vật và
  thẻ chữ phía trên.
- **Thẻ chữ hiện ra khi lời đọc chạm tới**: vị trí nhãn thẻ trong lời đọc quy ra
  thời điểm; thẻ đang được giảng có viền vàng.
- **Dáng Hương AI chọn theo tiêu đề slide** (`LUAT_DANG` trong `BaiGiang.tsx`):
  bìa thì chào, câu hỏi thì suy nghĩ, kiểm chứng thì cầm kính lúp...

### Hình minh họa 3D đất sét từng slide

Mỗi slide (trừ bìa và lời kết) có một hình minh họa diễn tả nội dung bằng
biểu tượng nặn đất sét: khởi nghiệp là tên lửa, kiểm chứng là kính lúp, chị
Hoa là củ khoai lang, gốm đỏ là bình gốm... Cấu hình nằm ở
`du-lieu/minh_hoa_ch01.json` (bố cục + biểu tượng + nhãn cho từng slide);
thư viện 31 biểu tượng ở `remotion/src/minh-hoa/BieuTuong.tsx`.

- **Năm bố cục:** `hang` (một hàng bệ), `duong` (bậc thang nâng dần — thứ tự,
  các bước), `chuoi` (chuỗi có mũi tên — quá trình), `vong` (vòng lặp — Lean
  Start-up), `trung_tam` (một tâm, các vệ tinh — hệ sinh thái).
- **Mục `i` hiện ra cùng thẻ chữ `i`** và nảy nhẹ, nhãn tô vàng khi thẻ ấy đang
  được giảng (`theo_the: false` thì các mục hiện lần lượt ngay đầu slide).
- **Dựng từng mục thành một lớp ảnh trong suốt** (`dung_minh_hoa.mjs`) chứ
  không gộp: gộp thì chỉ hiện được cả cụm một lúc.
- **Máy quay và vị trí khai ở một chỗ** (`minh-hoa/boCuc.ts`), dùng chung cho
  lúc dựng ảnh và lúc đặt nhãn trong video, để nhãn luôn nằm đúng chân mục.
  Máy quay trực giao nên phép chiếu tuyến tính, không méo ở hai mép.
- `dung_minh_hoa.mjs` đặt trong `remotion/` chứ không trong `tools/`: Node tìm
  gói theo chỗ đặt tệp. Nó đóng gói một lần rồi dựng cả trăm ảnh (~5 phút).

### Ảnh Hương AI

12 dáng trong `remotion/public/huong-ai/` tách nền trắng từ ảnh cô gửi bằng
`tools/tach_nen_huong_ai.py`. Nền khác áo dài ở **độ bão hòa** chứ không ở độ
sáng (áo kem có max-min ≥ 19, nền trắng < 8), nên lấy nền là vùng rất sáng VÀ
trung tính; khe kín giữa tay và thân cũng là nền nếu trắng tinh. Dải ngang tầm
đôi giày xử lý riêng để bỏ bóng sàn.

## Giấy phép công cụ

- VieNeu-TTS: Apache-2.0. (viXTTS cũng đã thử, đọc kém rõ hơn và giấy phép chỉ
  cho phi thương mại, nên không dùng.)
- Remotion: giấy phép công ty của Remotion — miễn phí cho cá nhân và tổ chức
  nhỏ; kiểm lại điều khoản nếu trường dùng ở quy mô lớn.
