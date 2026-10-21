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

## Về giọng đọc và nhân vật

Từ 16/10/2026, theo quyết định của cô Hương, video **không còn in dòng ghi chú**
"giọng đọc tổng hợp bằng AI" ở trang bìa và "nhân vật minh họa do AI tạo" dưới
Hương AI. Hồ sơ dưới đây giữ lại để biết video được làm thế nào:

- Giọng đọc là giọng tổng hợp bằng mô hình VieNeu-TTS, nhân bản từ 14 giây
  giọng thật của cô (`mau-giong/MAU_GIONG_CO_HUONG.wav`, cắt từ video 1 gói
  EC6035TX, do chính cô chọn).
- Ảnh Hương AI là ảnh do AI tạo, không phải ảnh chụp.
- Quy định 55 không có điều nào về giọng tổng hợp hay AI. Luật Công nghiệp công
  nghệ số 2025 có điều khoản về nhận diện sản phẩm do AI tạo; trước khi phát
  hành rộng nên đối chiếu với quy định của trường.

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
- **Video nào kịch bản quá ngắn thì giãn khoảng nghỉ, không đọc lại**
  (`tools/gian_nghi.py`): chỉ chèn thêm lặng vào đúng các khoảng nghỉ đã đặt,
  lời nói giữ nguyên từng mẫu. Đã dùng một lần cho SX07 (Chương 4, video 1):
  kịch bản 2.226 từ chỉ ra 11,5 phút, giãn nghỉ giữa câu 0,55 → 1,15 giây và
  cuối slide 0,9 → 1,5 giây thì được 12,07 phút. Nhịp video này vì thế chậm hơn
  các video khác; bổ sung lời giảng vẫn là cách đúng hơn.
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

## Bản tiếng Anh (bắt đầu từ Chương 1)

Cùng sân khấu, cùng Hương AI, cùng mẫu giọng của cô, đọc bằng tiếng Anh.
Tệp ra nằm cạnh bản tiếng Việt: `chuong-01/chu-de-1/bai-giang/EC1606_SX01_EN.mp4`.

```bash
python3 video-dat-set/tools/lay_lich_video_en.py 1     # → du-lieu/ch01_en.json, minh_hoa_ch01_en.json
python video-dat-set/tools/doc_loi.py video-dat-set/du-lieu/ch01_en.json <thư mục âm thanh>
sh video-dat-set/tools/dung_chuong.sh 1 <thư mục âm thanh> en
```

- **Lời đọc và chữ trên slide chủ đề lấy bản dịch có sẵn** trong
  `docs/slide_noi_dung_chu_de_chCC.json` (`title_en`, `bullets_en`) và
  `docs/kich_ban_chu_de_chCC.json` (`loi_doc_en`). Ghép theo lời đọc tiếng Việt,
  không theo tiêu đề (trang tổng kết chủ đề và tổng kết chương trùng tiêu đề).
  Lời đọc tiếng Việt trong lịch phải trùng từng chữ với docs; lệch là bản dịch đã
  cũ, trình dựng dừng chứ không dùng.
- **Trang khung** (bìa, mục tiêu, nội dung, đang ở đâu, ôn tập, tình huống, tổng
  kết, tài liệu, lời kết) và **nhãn hình minh họa** dịch ở `du-lieu/dich_en_chCC.json`.
- **Tên trường** theo tên giao dịch quốc tế trong Quyết định 2636/QĐ-BGDĐT
  (07/9/2026): Vinh Long University of Technology and Engineering. "Faculty of
  Business and Law" là bản dịch tên khoa; đối chiếu với tên tiếng Anh khoa dùng
  chính thức nếu có.
- Tiêu đề tiếng Việt giữ ở trường `tieu_de_vi`, vì các luật chọn dáng và nhãn
  "đang ở đâu" trong `BaiGiang.tsx` khớp theo tiêu đề tiếng Việt.
- Tài liệu học tập vẫn là sách tiếng Việt; lời đọc nói rõ điều đó.

## Hương AI mấp máy miệng theo giọng

`tools/bien_do.py` đo độ to của từng tệp lời đọc, 30 giá trị mỗi giây, ghi
`bien_do.json` cạnh `so_do.json`; `dung_chuong.sh` tự chạy nó. Trong video, một
lòng miệng đất sét sẫm mở to nhỏ theo giá trị ấy, khép lại thì nụ cười gốc
trong ảnh hiện ra. Không khớp từng âm như mô hình khớp môi, nhưng chạy trong vài
giây và không cần GPU. Chỗ miệng từng dáng khai ở `remotion/src/mieng.ts`; đổi
ảnh dáng nào thì đo lại dáng ấy. Áp dụng cho mọi lần dựng sau, kể cả bản tiếng
Việt; chưa có `bien_do.json` thì Hương AI không mấp máy như trước.

## Giấy phép công cụ

- VieNeu-TTS: Apache-2.0. (viXTTS cũng đã thử, đọc kém rõ hơn và giấy phép chỉ
  cho phi thương mại, nên không dùng.)
- Remotion: giấy phép công ty của Remotion — miễn phí cho cá nhân và tổ chức
  nhỏ; kiểm lại điều khoản nếu trường dùng ở quy mô lớn.
