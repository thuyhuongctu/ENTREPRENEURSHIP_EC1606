#!/bin/sh
# Dựng trọn hai video của một chương, từ lời đọc đã có tới tệp nộp:
#   sh video-dat-set/tools/dung_chuong.sh <số chương> <thư mục âm thanh của doc_loi.py>
# Cần hình minh họa đã dựng (node dung_minh_hoa.mjs <chương>). Máy không có
# Chrome riêng của Remotion thì đặt REMOTION_BROWSER_EXECUTABLE.
set -e
C=$1; AM=$2
CC=$(printf '%02d' "$C")
DAY=$(cd "$(dirname "$0")/.." && pwd)
GOC=$(dirname "$DAY")
# lời đọc lệch so_do.json thì dừng ngay, đừng dựng ra video cắt cụt câu
python3 "$DAY/tools/kiem_am.py" "$AM"
cd "$DAY/remotion"
mkdir -p "public/am-thanh/ch$CC" out
cp "$AM"/*.wav "$AM"/so_do.json "public/am-thanh/ch$CC/"
TRINH=${REMOTION_BROWSER_EXECUTABLE:+--browser-executable=$REMOTION_BROWSER_EXECUTABLE}
for V in 1 2; do
  # số SX chạy liền cả học phần: chương C, video V → SX(2C-2+V)
  MA=$(printf 'SX%02d' $((2 * C - 2 + V)))
  # Lần dựng bị ngắt (máy khởi động lại, dừng tay) để lại 2–3 GB khung hình
  # và gói mã trong /tmp; dồn vài lần là đầy đĩa giữa chừng lần dựng sau.
  find /tmp -maxdepth 1 \( -name 'remotion-webpack-bundle-*' -o -name 'react-motion-render*' -o -name 'remotion-v4*' \) -mmin +5 -exec rm -rf {} + 2>/dev/null || true
  npx remotion render src/index.ts "EC1606-$MA" "out/EC1606_${MA}_tho.mp4" $TRINH \
    --codec=h264 --crf=20 --image-format=jpeg --jpeg-quality=92 --gl=swangle
  sh "$DAY/tools/hoan_thien.sh" "out/EC1606_${MA}_tho.mp4" "out/EC1606_$MA.mp4"
  mkdir -p "$GOC/chuong-$CC/chu-de-$V/bai-giang"
  cp "out/EC1606_$MA.mp4" "$GOC/chuong-$CC/chu-de-$V/bai-giang/"
  echo "xong $MA"
done
