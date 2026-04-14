#!/bin/bash
# Download artwork images from Singulart CDN
# Usage: run from the project root

IMG_DIR="public/images"
mkdir -p "$IMG_DIR"

# Artwork ID -> filename mapping (ID_hash -> filename.jpg)
declare -A IMAGES=(
  # Known images with IDs and hashes
  ["2196817_e5c6acda3a39582b33cb381f642ed222"]="the-heritage.jpg"
  ["2280368_c00f1e86057f1f2fbcf7bd7748bc8334"]="mediterranean-mood.jpg"
  ["2146417_c2767bf508d7fcf4526497517b557dd2"]="viennas-view.jpg"
  ["2146432_35998df3167b3e3f3cd80280ea63118f"]="skeleton-in-the-studio.jpg"
  ["2146448_d5ceb55b3181665cefdaa5675f0e06e8"]="shoes.jpg"
  ["2146467_db58e6e51703d09e0b71b8db248f99e0"]="juicy-summer.jpg"
  ["2146437_359d43e022da4251ed9be534ac1a71fa"]="spring-in-vienna.jpg"
  ["2146500_ee170f9f4da6e49c6d36e789fe8edaeb"]="life-on-a-yacht.jpg"
  ["2146519_9bd999632ca76fbcbde23e2a04543a30"]="cats-patrol.jpg"
  ["2146545_f724b3a9147ea8ff4b8992c8b2b42152"]="sunset-in-the-haven.jpg"
  ["2160607_ee5b846811958886715b5bd299598f73"]="ukrainian-doll.jpg"
  ["2191749_31044748edb31e7a684488272dafa9a2"]="chanel-no-5.jpg"
  ["2270469_72e231c5224ca558a6cd402d3c723a60"]="silent-majesty.jpg"
  ["2218345_985440e92b6017123037eb3165fa3575"]="whispering-emotions.jpg"
  ["2242375_208f018ab42f7ac4b9d3fef756974e1"]="finally-a-rest.jpg"
  ["2213813_a22a1ab6e05d8f17df1bf6bd8fe8fb23"]="at-the-edge-of-the-world.jpg"
  ["2221485_a22a1ab6e05d8f17df1bf6bd8fe8fb23"]="the-alpine-lake.jpg"
  ["2260247_bad2674547054d80ee3f2e00a2befa5b"]="spring-awakening.jpg"
  ["2270484_b4527bc11737c95bfbc279323f14854f"]="two-kohlrabi.jpg"
  ["2271682_4d67076cdcc4813977c82e0debb21f11"]="cactus-serenade.jpg"
  ["2290856_cb26532be19d9d7437023c8059f5fe11"]="asparagus-on-wild-garlic.jpg"
  ["2309282_f277c2baaeb4365c0463d1232be546e9"]="snowdrop-symphony.jpg"
)

BASE_URL="https://www.singulart.com/images/artworks/v2/cropped/63359/main/base"

echo "Downloading artwork images from Singulart..."

for key in "${!IMAGES[@]}"; do
  filename="${IMAGES[$key]}"
  url="$BASE_URL/$key.jpeg"
  echo "Downloading $filename..."
  curl -s -o "$IMG_DIR/$filename" \
    -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" \
    -H "Referer: https://www.singulart.com/" \
    "$url"
  
  if [ -f "$IMG_DIR/$filename" ] && [ -s "$IMG_DIR/$filename" ]; then
    echo "  ✓ Saved: $filename ($(du -h "$IMG_DIR/$filename" | cut -f1))"
  else
    echo "  ✗ Failed: $filename"
  fi
done

echo ""
echo "Done! Downloaded ${#IMAGES[@]} images to $IMG_DIR"
