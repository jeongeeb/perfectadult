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
흰 배경 위의 인물 사진은 JPEG로 제공합니다. 노란 메인 배경의 인물과 겹쳐지는 제품 컷은
투명 PNG를 사용합니다. 메인 인물에는 흰 배경을 합성하지 않습니다.
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

Safari 13의 한글은 기존 Noto Sans KR 원본에서 만든 고정 굵기 웹 폰트를 사용합니다.
상품 오프닝·도장 문구는 브라우저 가상 Bold 대신 `css/pages/product-typography.css`에서
외곽선 굵기를 조절합니다. 오프닝은 웹 폰트 준비 후 시작합니다.
문구를 추가한 뒤 FontTools·Brotli가 설치된 Python에서 `python3 scripts/build_browser_fonts.py`를
실행하면 사용 글자에 맞춰 `assets/fonts/web/` 파일이 갱신됩니다. 폰트 원본은 보존합니다.
