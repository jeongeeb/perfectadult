# perfectadult

사이트에 표시하는 이미지는 WebP를 사용합니다. PNG/JPEG 원본은 편집용으로 보관하며
브라우저에서는 같은 이름의 `.webp` 파일을 불러옵니다.
WebP 디코딩에 실패하는 macOS Safari 등에서는 PNG/JPEG 대체 파일로 자동 전환합니다.
Safari 13은 처음부터 PNG/JPEG를 요청해 실패한 WebP 이미지가 보이는 시간을 없앱니다.
이미지를 추가한 뒤 `python3 scripts/build_image_fallbacks.py`로 대체 경로 목록도 갱신합니다.
`css/browser-compat.css`는 구형 브라우저의 화면 높이·이미지 비율 배치를 보완합니다.
Safari 13에서 지원하지 않는 `inset`·논리 여백 단축 속성은 물리 방향 속성으로 보완하며,
메뉴얼의 노드 재배치는 `replaceElementChildren` 호환 함수를 사용합니다.
아카이브 전환·하단 이동은 `scrollPageTo`를 통해 구형 Safari에서도 부드럽게 이동합니다.
Safari 13에서는 화면 밖의 지연 로딩 이미지와 착용컷을 한꺼번에 내려받지 않고,
화면 접근·갤러리 사전 로딩·마우스/키보드 포커스에 맞춰 요청합니다.
대체 파일은 `assets/compat/`에 생성됩니다. 긴 상품 설명 이미지는 해상도를 유지하고,
인물 사진은 페이지와 같은 흰 배경의 JPEG, 겹쳐지는 제품 컷은 투명 PNG로 제공합니다.
도장은 별도의 512px WebP/PNG를 `assets/display/`에 생성해 PC·모바일에서 공통 사용합니다.
원본 파일은 수정하지 않습니다. 메뉴얼 배경 SVG도 Safari 13이 읽을 수 있는 PNG를 내장합니다.

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
