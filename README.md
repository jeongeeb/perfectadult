# perfectadult

사이트에 표시하는 이미지는 WebP를 사용합니다. PNG/JPEG 원본은 편집용으로 보관하며
브라우저에서는 같은 이름의 `.webp` 파일을 불러옵니다.

원본 이미지를 추가하거나 교체한 뒤 Python 3와 Pillow가 설치된 환경에서 실행합니다.

```sh
python3 scripts/convert_images.py
```

변환 시 해상도와 투명도를 유지합니다. 로고·도장·커서는 무손실,
제품 상세·메뉴얼 이미지는 품질 92, 사진·렌더 이미지는 품질 88을 사용합니다.
이미지 경로는 `js/shared/data.js`와 각 페이지 코드에서 `.webp`로 지정합니다.

About 페이지는 아카이브와 비교하기 위한 분할 룩북입니다. 왼쪽 썸네일을
새로 만들려면 `python3 scripts/build_lookbook_thumbnails.py`를 실행합니다.
