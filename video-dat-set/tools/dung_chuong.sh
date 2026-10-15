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
cd "$DAY/remotion"
mkdir -p "public/am-thanh/ch$CC" out
cp "$AM"/*.wav "$AM"/so_do.json "public/am-thanh/ch$CC/"
TRINH=${REMOTION_BROWSER_EXECUTABLE:+--browser-executable=$REMOTION_BROWSER_EXECUTABLE}
for V in 1 2; do
  # số SX chạy liền cả học phần: chương C, video V → SX(2C-2+V)
  MA=$(printf 'SX%02d' $((2 * C - 2 + V)))
  npx remotion render src/index.ts "EC1606-$MA" "out/EC1606_${MA}_tho.mp4" $TRINH \
    --codec=h264 --crf=20 --image-format=jpeg --jpeg-quality=92 --gl=swangle
  sh "$DAY/tools/hoan_thien.sh" "out/EC1606_${MA}_tho.mp4" "out/EC1606_$MA.mp4"
  mkdir -p "$GOC/chuong-$CC/chu-de-$V/bai-giang"
  cp "out/EC1606_$MA.mp4" "$GOC/chuong-$CC/chu-de-$V/bai-giang/"
  echo "xong $MA"
done
