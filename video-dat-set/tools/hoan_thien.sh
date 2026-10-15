#!/bin/sh
# Hoàn thiện tệp Remotion xuất ra trước khi nộp:
# - Remotion dựng khung JPEG nên video ra mang dải màu "pc" (yuvj420p). Vài
#   trình phát trên điện thoại hiểu sai dải này, màu nhạt đi; Mẫu HLS-VLU-08
#   (mục 7b) đòi mở được trên nhiều thiết bị, nên đổi về dải "tv" (yuv420p).
# - Đưa độ to về -16 LUFS (chuẩn phổ biến cho video phát trên mạng): bản ra
#   thẳng từ mô hình giọng chỉ -20 LUFS, nghe trên điện thoại hơi nhỏ.
# Dùng: sh hoan_thien.sh <vào.mp4> <ra.mp4>
set -e
ffmpeg -loglevel error -y -i "$1" \
  -vf "scale=in_range=pc:out_range=tv,format=yuv420p" \
  -c:v libx264 -preset medium -crf 24 -tune stillimage \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 160k \
  -movflags +faststart "$2"
