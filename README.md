# perfectadult

사이트에 표시하는 이미지는 WebP를 사용합니다. PNG/JPEG 원본은 편집용으로 보관하며
브라우저에서는 같은 이름의 `.webp` 파일을 불러옵니다.
WebP 디코딩에 실패하는 macOS Safari 등에서는 해당 이미지의 PNG/JPEG 원본으로 자동 전환합니다.
이미지를 추가한 뒤 `python3 scripts/build_image_fallbacks.py`로 대체 경로 목록도 갱신합니다.
`css/browser-compat.css`는 구형 브라우저의 화면 높이·이미지 비율 배치를 보완합니다.

원본 이미지를 추가하거나 교체한 뒤 Python 3와 Pillow가 설치된 환경에서 실행합니다.

```sh
python3 scripts/convert_images.py
```

변환 시 해상도와 투명도를 유지합니다. 로고·도장·커서는 무손실,
제품 상세·메뉴얼 이미지는 품질 92, 사진·렌더 이미지는 품질 88을 사용합니다.
이미지 경로는 `js/shared/data.js`와 각 페이지 코드에서 `.webp`로 지정합니다.

About 페이지는 아카이브와 비교하기 위한 분할 룩북입니다. 왼쪽 썸네일을
새로 만들려면 `python3 scripts/build_lookbook_thumbnails.py`를 실행합니다.

Book 페이지는 `book.html`입니다. 기존 지침서 내지의 두 펼침면으로 미리 구성했습니다.
GPT에서 완성한 책 이미지는 `assets/book/`에 저장하고 위 변환 스크립트로 WebP를 만듭니다.
`js/pages/book.js` 맨 위 `bookPublication.slides`의 `src`를 새 `.webp` 경로로 바꾸고,
기존 이미지 분리용 `crop`은 `"full"`로 변경하세요. 이미지 원본 비율은 자동 적용됩니다.
순서·이미지별 설명도 같은 설정에서 바꿉니다. Book 배경색·이미지 높이·글자 설정은
`css/pages/book.css`의 `.book-page` 변수에서 다른 페이지와 독립적으로 조절합니다.
