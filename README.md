# Học liệu số — Khởi sự doanh nghiệp (EC1606)

Bộ học liệu số (HLS) cho bài giảng trực tuyến học phần **Khởi sự doanh
nghiệp** (EC1606, 02 tín chỉ), Trường Đại học Sư phạm Kỹ thuật Vĩnh Long,
biên soạn theo đúng **Quyết định số 55/QĐ-ĐHSPKTVL-ĐT_ĐBCL (07/7/2025)** —
Quy định đào tạo trực tuyến và xây dựng học liệu số của Trường — và đúng
**Đề cương học phần EC1606** đã được phê duyệt (biên soạn học kỳ 2 năm học
2024-2025, chỉnh sửa lần thứ 3).

Repo này KHÔNG gắn với bất kỳ ứng dụng/sản phẩm phần mềm nào — chỉ chứa tài
liệu giảng dạy chính thức.

## Cấu trúc (đúng Phụ lục 1 của quy định)

### Cấp độ học phần

| Thư mục/tệp | Nội dung | Định lượng theo quy định |
|---|---|---|
| `de-cuong/DE_CUONG_HOC_PHAN_HLS.docx`/`.pdf` | Đề cương học phần biên soạn HLS | Văn bản, 8-12 trang A4 |
| `huong-dan-on-tap/HUONG_DAN_ON_TAP_VA_KIEM_TRA.docx`/`.pdf` | Hướng dẫn ôn tập và kiểm tra toàn học phần | Văn bản, 2-3 trang A4 |

### Cấp độ chương (×5 — `chuong-01` .. `chuong-05`)

Mỗi chương có cấu trúc giống nhau:

| Thư mục/tệp | Nội dung | Định lượng |
|---|---|---|
| `muc-tieu/MUC_TIEU_CHUONG.docx`/`.pdf` | Mục tiêu chương | Văn bản, 300-500 từ |
| `chu-de-1/`, `chu-de-2/` | Hai chủ đề có bài giảng (xem dưới) | ≥2 chủ đề/chương |
| `bai-tap-ket-thuc-chuong/BAI_TAP_KET_THUC_CHUONG.docx`/`.pdf` | Bài tập tự đánh giá kết thúc chương | 10-15 TN + 3-5 tự luận + 1-2 tình huống |
| `danh-gia-ket-thuc-chuong/NGAN_HANG_DANH_GIA.docx`/`.pdf` | Ngân hàng đánh giá kết thúc chương | 20-30 TN + 6-10 tự luận + 2-4 tình huống |

Mỗi `chu-de-N/` (chủ đề có bài giảng) gồm:

| Tệp | Nội dung | Định lượng |
|---|---|---|
| `bai-giang/NNN.jpg` | Ảnh slide bài giảng | ≤10 dòng/slide, ≤20 từ/dòng (Điều 18) |
| `bai-giang/video.mp4` | Video bài giảng | 7-15 phút/clip |
| `TU_NGHIEN_CUU.docx`/`.pdf` | Chủ đề tự nghiên cứu | Văn bản, có trích dẫn giáo trình |
| `BAI_TAP_TU_DANH_GIA.docx`/`.pdf` | Bài tập tự đánh giá kết thúc chủ đề | 4-5 bài có đáp án |

### Danh sách 10 chủ đề

| Chương | Chủ đề 1 | Chủ đề 2 |
|---|---|---|
| 1 — Tổng quan về khởi sự doanh nghiệp | Khái niệm khởi nghiệp, ý tưởng và kế hoạch kinh doanh | Khởi nghiệp cho phụ nữ, người dân tộc thiểu số và hệ sinh thái khởi nghiệp |
| 2 — Đánh giá cơ hội, ý tưởng phát triển kế hoạch kinh doanh | Xác định ý tưởng, sản phẩm và đối tượng khách hàng | Đánh giá cơ hội phát triển dự án |
| 3 — Một số kỹ thuật huy động vốn | Huy động vốn đầu tư và các kỹ thuật huy động vốn | Các chỉ số tài chính cốt yếu mà nhà đầu tư quan tâm |
| 4 — Lựa chọn mô hình kinh doanh | Các loại hình doanh nghiệp và mô hình hợp tác, nhượng quyền | Lựa chọn loại hình phù hợp cho phụ nữ và người dân tộc thiểu số |
| 5 — Marketing cho doanh nghiệp mới | Thị trường mục tiêu, định vị và đối tượng khách hàng (STP) | Xây dựng nhãn hiệu và Marketing hỗn hợp |

Chi tiết nội dung từng chủ đề, thông tin học phần đầy đủ (CĐR, tài liệu tham
khảo, phương pháp đánh giá) xem `docs/NGUON_THAM_CHIEU.md`.

## Hai tình huống minh họa xuyên suốt

"Chị Hoa" (chế biến khoai lang ở Bình Tân, Vĩnh Long) và dự án "gốm đỏ Vĩnh
Long" là **ví dụ dựng ra để giảng dạy** (không phải số liệu thật), dùng để
đáp ứng yêu cầu "tạo tình huống học tập" của Điều 22. Mỗi lần xuất hiện đều
ghi rõ là ví dụ minh họa.

## Dựng lại

Tất cả tệp trong `docs/*.json` là NGUỒN — sửa ở đó rồi chạy lại trình sinh,
đừng sửa tay tệp kết quả (ảnh slide, video, docx, pdf):

```
pip install python-docx reportlab playwright
python3 tools/gop_chu_de.py        # gộp 5 tệp kịch bản/slide theo chương
                                    # thành docs/kich_ban_chu_de.json +
                                    # docs/slide_noi_dung_chu_de.json
python3 tools/dung_bai_giang.py    # dựng 10 video + ảnh slide bài giảng
python3 tools/dung_de_cuong.py     # dựng đề cương học phần HLS
python3 tools/dung_muc_tieu.py     # dựng mục tiêu chương + tự nghiên cứu +
                                    # hướng dẫn ôn tập
python3 tools/dung_bai_tap.py      # dựng bài tập tự đánh giá + ngân hàng
```

`tools/dinh_dang_vanban.py` là nơi định dạng chung (A4, Times New Roman 13,
giãn dòng 1,5, lề 3-2-2-2.5cm — đúng Điều 20) cho mọi tài liệu "toàn văn" —
sửa định dạng thì sửa ở đó, không sửa riêng lẻ từng trình sinh.

`tools/mau_slide.py` là mẫu HTML cho ảnh slide (Playwright, không qua
LibreOffice/soffice).

## Trạng thái

- Video bài giảng hiện là bản **câm** (chỉ ảnh slide, chưa có giọng đọc) —
  môi trường dựng không có công cụ tổng hợp giọng nói (TTS) hay nhân bản
  giọng. Kịch bản đầy đủ nằm ở `docs/kich_ban_chu_de.json` để tác giả đọc
  thu âm hoặc ghi giọng chồng lên (voice-over).
- Thời lượng mỗi video ước tính theo tốc độ 206 từ/phút — đo thật từ bản thu
  giọng thật của tác giả ở học phần khác (Kỹ năng giao tiếp và soạn thảo văn
  bản, repo ComDraft cùng tác giả), KHÔNG PHẢI đo trên giọng đọc thật của bộ
  kịch bản này. Cần đối chiếu lại sau khi có bản thu đầu tiên.

## Tác giả

© Đỗ Thùy Hương, 2026. Khoa Kinh doanh và Luật, Trường Đại học Sư phạm Kỹ
thuật Vĩnh Long.
