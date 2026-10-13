# Schema bắt buộc cho kịch bản + slide theo chủ đề

Hai tệp đích (dùng chung cho cả 10 chủ đề, mỗi agent chỉ thêm đúng phần của
mình vào, KHÔNG xóa phần chủ đề khác nếu tệp đã có người viết trước):

## docs/kich_ban_chu_de.json

```json
{
  "ch01_cd1": {
    "chuong": 1,
    "chu_de": 1,
    "ma_chuong": "ch01",
    "tieu_de": "Khái niệm khởi nghiệp, ý tưởng và kế hoạch kinh doanh",
    "tieu_de_en": "...",
    "diem_doc": [
      { "loi_doc": "câu/đoạn tiếng Việt", "loi_doc_en": "bản dịch tiếng Anh" }
    ]
  }
}
```

Khóa đối tượng cấp 1 là `ch0N_cdM` (N=01..05, M=1 hoặc 2) — ĐÚNG 10 khóa,
không thêm/bớt. `diem_doc` là mảng các điểm đọc theo đúng thứ tự trình bày.

### Yêu cầu nội dung mỗi chủ đề (diem_doc)

- Điểm đọc đầu tiên: lời chào mở đầu. Nếu đây là chủ đề 2 của chương, MỞ ĐẦU
  bằng một câu nhắc lại ý chính của chủ đề 1 cùng chương. Nếu đây là chủ đề 1
  của chương 2 trở đi, MỞ ĐẦU bằng một câu nhắc lại ý chính của CHƯƠNG TRƯỚC.
  Chủ đề 1 Chương 1 không cần nhắc lại gì (mở đầu toàn học phần).
- Các điểm đọc tiếp theo: triển khai đúng nội dung chủ đề đã mô tả trong
  `docs/NGUON_THAM_CHIEU.md`, viết sâu, có ví dụ cụ thể, số liệu minh họa
  (ghi rõ nếu là số liệu minh họa dựng ra, không phải thật), lồng ghép tình
  huống "chị Hoa" hoặc "gốm đỏ Vĩnh Long" khi hợp nội dung (không bắt buộc ở
  mọi chủ đề, chỉ khi tự nhiên).
- Điểm đọc cuối: tóm tắt ngắn 2-3 ý chính của chủ đề này, rồi một câu mời làm
  bài tập tự đánh giá cuối chủ đề (không nêu tên file/ứng dụng cụ thể, chỉ
  nói "các em làm bài tập tự đánh giá cuối chủ đề này trước khi sang phần
  tiếp theo"). Nếu là chủ đề 2 (chủ đề cuối của chương), thêm một câu hẹn gặp
  lại ở chương tiếp theo (chương 5 thì không cần câu hẹn gặp lại).

### Yêu cầu độ dài (RẤT QUAN TRỌNG — quy định bắt buộc video 7-15 phút/chủ đề)

Tốc độ đọc tính theo 206 từ/phút (đo thật, xem ghi chú trong
`docs/NGUON_THAM_CHIEU.md`). Tổng số từ tiếng Việt trong toàn bộ `diem_doc`
của MỘT chủ đề phải nằm trong khoảng **1900–2400 từ** (tương đương ~9,5–12
phút kể cả nghỉ chuyển slide) — không được dưới 1850 từ (rủi ro dưới 7 phút
sau khi trừ hao) và không vượt 2900 từ (rủi ro vượt 15 phút). Viết xong PHẢI
tự đếm từ bằng lệnh `python3 -c "print(len(open('...').read().split()))"`
hoặc tương đương trên riêng từng câu `loi_doc` cộng lại — không ước lượng
bằng mắt.

## docs/slide_noi_dung_chu_de.json

```json
{
  "ch01_cd1": [
    {
      "slide": 1,
      "kicker": "",
      "title": "...",
      "title_en": "...",
      "bullets": ["...", "..."],
      "bullets_en": ["...", "..."]
    }
  ]
}
```

Số phần tử trong mảng `slide_noi_dung_chu_de["ch0N_cdM"]` PHẢI bằng đúng số
phần tử trong `diem_doc` của `kich_ban_chu_de["ch0N_cdM"]` (ánh xạ 1-1 theo
thứ tự, giống cách hai tệp docs/kich_ban_on_tap.json +
docs/slide_noi_dung.json cũ đã làm — đọc hai tệp đó ở
`/home/user/enquiz/docs/` để biết đúng văn phong/mức độ chi tiết).

- Slide đầu tiên: slide bìa chủ đề — `title` = tiêu đề chủ đề, `bullets` =
  1-2 câu mô tả ngắn.
- Slide cuối: slide chốt — `title` bắt đầu bằng "Tổng kết" hoặc tương tự,
  `bullets` = các ý chốt + câu mời làm bài tập.
- Các slide giữa: `bullets` tối đa 5 gạch đầu dòng, mỗi gạch đầu dòng ≤20 từ,
  KHÔNG chép nguyên văn `loi_doc` — chỉ tóm tắt từ khóa/ý chính (đúng Điều 18:
  "không viết theo kiểu toàn văn").
- `kicker` để trống `""` trừ khi muốn gắn nhãn ngắn (vd "Tình huống").

## Việc cần làm của mỗi agent

1. Đọc `/home/user/entrepreneurship_ec1606/docs/NGUON_THAM_CHIEU.md` (bắt
   buộc, có mô tả đúng nội dung chủ đề được giao).
2. Đọc phần chương tương ứng trong
   `/home/user/enquiz/docs/kich_ban_on_tap.json` và
   `/home/user/enquiz/docs/slide_noi_dung.json` để nắm văn phong, các khái
   niệm đã dùng, và tránh viết trùng lặp 100% câu chữ (có thể tái sử dụng ý
   nhưng phải viết lại sâu hơn, không copy nguyên văn).
3. Đọc `/home/user/enquiz/data/ch0N.js` (N = số chương) để lấy thêm khái
   niệm/kiến thức cụ thể từ ngân hàng 60 câu hỏi, đảm bảo nội dung bài giảng
   khớp với nội dung sẽ được kiểm tra.
4. Mỗi agent phụ trách MỘT chương viết ra HAI tệp riêng (tránh đụng độ ghi
   đồng thời giữa các agent chạy song song):
   `/home/user/entrepreneurship_ec1606/docs/kich_ban_chu_de_ch0N.json` và
   `/home/user/entrepreneurship_ec1606/docs/slide_noi_dung_chu_de_ch0N.json`
   (N = số chương được giao). Mỗi tệp chỉ chứa 2 khóa `ch0N_cd1`,
   `ch0N_cd2` của chương đó — đúng cấu trúc JSON mô tả ở trên. Việc gộp các
   tệp riêng thành hai tệp tổng `kich_ban_chu_de.json` /
   `slide_noi_dung_chu_de.json` sẽ do bước sau thực hiện, KHÔNG phải việc
   của agent này.
5. Chạy kiểm tra đếm từ + đếm số phần tử khớp nhau cho đúng 2 khóa (`cd1`,
   `cd2`) của chương được giao, in kết quả ra để xác nhận.
