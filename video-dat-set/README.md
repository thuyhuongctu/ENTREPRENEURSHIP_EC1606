# Video bài giảng 3D đất sét (có giọng đọc)

Dựng video bài giảng theo **Quy định 55/QĐ-ĐHSPKTVL-ĐT_ĐBCL (07/7/2025)**,
phong cách 3D đất sét, có nhân vật **Hương AI** dẫn bài và **giọng đọc tổng hợp
từ mẫu giọng của giảng viên**. Bộ video câm cũ trong `chuong-0N/chu-de-M/bai-giang/`
giữ nguyên; video ở đây là bản có giọng.

## Kết quả

Mỗi chương hai video, mỗi video một chủ đề. Số thứ tự `SX` chạy liền cả học
phần (Mẫu HLS-VLU-08, mục 3b), không đánh lại từ 01 ở mỗi chương — đánh lại
thì hai chương sinh ra hai tệp trùng tên.

| Chương | Video 1 (chủ đề 1) | Video 2 (chủ đề 2, ôn tập, tổng kết) |
|---|---|---|
| 1 | `chuong-01/chu-de-1/bai-giang/EC1606_SX01.mp4` | `chuong-01/chu-de-2/bai-giang/EC1606_SX02.mp4` |
| 2 | `chuong-02/chu-de-1/bai-giang/EC1606_SX03.mp4` | `chuong-02/chu-de-2/bai-giang/EC1606_SX04.mp4` |
| 3 | `chuong-03/chu-de-1/bai-giang/EC1606_SX05.mp4` | `chuong-03/chu-de-2/bai-giang/EC1606_SX06.mp4` |
| 4 | `chuong-04/chu-de-1/bai-giang/EC1606_SX07.mp4` | `chuong-04/chu-de-2/bai-giang/EC1606_SX08.mp4` |
| 5 | `chuong-05/chu-de-1/bai-giang/EC1606_SX09.mp4` | `chuong-05/chu-de-2/bai-giang/EC1606_SX10.mp4` |

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
python3 video-dat-set/tools/lay_lich_video.py 2          # → du-lieu/ch02.json

# 2. Đọc lời (môi trường riêng: pip install vieneu faster-whisper soundfile;
#    onnxruntime==1.21.1 — bản 1.31 báo "External data path escapes model
#    directory" khi đọc mô hình từ bộ nhớ đệm Hugging Face)
python video-dat-set/tools/doc_loi.py video-dat-set/du-lieu/ch02.json <thư mục âm thanh>

# 3. Nền sân khấu (một lần cho cả học phần) và hình minh họa 3D từng slide
cd video-dat-set/remotion && npm install
npx remotion still src/index.ts nen-rong  public/nen/rong.png  --gl=swangle
npx remotion still src/index.ts nen-giang public/nen/giang.png --gl=swangle
node dung_minh_hoa.mjs 2        # → public/minh-hoa/ch02/

# 4. Dựng hai video, hoàn thiện (dải màu "tv", -16 LUFS) và đặt vào thư mục bài giảng
sh ../tools/dung_chuong.sh 2 <thư mục âm thanh>
```

Máy không có Chrome riêng của Remotion thì đặt `REMOTION_BROWSER_EXECUTABLE=<đường dẫn Chromium>`
(và thêm `--browser-executable=` cho các lệnh `npx remotion still`).

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
- **Chữ viết tắt đọc theo bảng `DOC_LA`** trong `tools/doc_loi.py` (STP, 4P,
  USP, D2C...), thay theo ranh giới từ. Chương mới có chữ viết tắt mới thì
  thêm vào bảng trước khi đọc, đừng để mô hình tự đoán.

### Hình minh họa 3D đất sét từng slide

Mỗi slide (trừ bìa và lời kết) có một hình minh họa diễn tả nội dung bằng
biểu tượng nặn đất sét: khởi nghiệp là tên lửa, kiểm chứng là kính lúp, chị
Hoa là củ khoai lang, gốm đỏ là bình gốm... Cấu hình nằm ở
`du-lieu/minh_hoa_chNN.json` (bố cục + biểu tượng + nhãn cho từng slide);
thư viện 48 biểu tượng ở `remotion/src/minh-hoa/BieuTuong.tsx`. Thêm biểu
tượng thì dựng bảng soát trước khi dựng cả chương:
`npx remotion still src/index.ts bang-bieu-tuong bang.png --gl=swangle`.

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
