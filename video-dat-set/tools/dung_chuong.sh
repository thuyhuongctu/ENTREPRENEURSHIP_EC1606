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
  # Dựng theo từng đoạn 2 000 khung, mỗi đoạn một tệp, đoạn đã có thì
  # bỏ qua. Một video dựng 4–5 giờ; máy chủ khởi động lại giữa chừng (đã xảy
  # ra ở SX03, mất 12 563 khung = hơn 2 giờ) thì chỉ mất đúng đoạn đang dở.
  # Tiếng ghép riêng bằng ghep_am.py rồi mới đưa vào, để không có khoảng
  # lặng hay tiếng tách ở chỗ nối các đoạn AAC.
  P="out/phan_$MA"; mkdir -p "$P"
  # Số khung tính đúng như doDai() trong Goc.tsx: ceil(giây × 30) từng slide.
  TONG=$(python3 -c "
import json,math,sys
sl=[s for s in json.load(open('$DAY/du-lieu/ch$CC.json'))['slides'] if s['video']==$V]
am={a['so']:a['giay'] for a in json.load(open('public/am-thanh/ch$CC/so_do.json'))['slides'] if a['video']==$V}
print(sum(math.ceil(am.get(s['so'],8)*30) for s in sl))")
  [ -n "$TONG" ] || { echo "không đọc được số khung của $MA"; exit 1; }
  DOAN=${DOAN:-2000}; A=0; N=0; : > "$P/ds.txt"
  while [ $A -lt $TONG ]; do
    Z=$((A + DOAN - 1)); [ $Z -ge $TONG ] && Z=$((TONG - 1))
    T=$(printf '%s/%03d.mp4' "$P" $N)
    if [ ! -s "$T" ]; then
      npx remotion render src/index.ts "EC1606-$MA" "$T.dang.mp4" $TRINH \
        --frames=$A-$Z --muted --codec=h264 --crf=20 --image-format=jpeg --jpeg-quality=92 --gl=swangle
      mv "$T.dang.mp4" "$T"
    fi
    echo "file '$(basename "$T")'" >> "$P/ds.txt"
    A=$((Z + 1)); N=$((N + 1))
  done
  python3 "$DAY/tools/ghep_am.py" "$DAY/du-lieu/ch$CC.json" "public/am-thanh/ch$CC/so_do.json" $V "$P/am.wav"
  ffmpeg -loglevel error -y -f concat -safe 0 -i "$P/ds.txt" -i "$P/am.wav" \
    -map 0:v -map 1:a -c:v copy -ac 2 -c:a pcm_s16le "out/EC1606_${MA}_tho.mov"
  sh "$DAY/tools/hoan_thien.sh" "out/EC1606_${MA}_tho.mov" "out/EC1606_$MA.mp4"
  mkdir -p "$GOC/chuong-$CC/chu-de-$V/bai-giang"
  cp "out/EC1606_$MA.mp4" "$GOC/chuong-$CC/chu-de-$V/bai-giang/"
  rm -rf "$P" "out/EC1606_${MA}_tho.mov"
  echo "xong $MA"
done
