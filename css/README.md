# CSS 수정 위치

- `common.css`: 전 페이지 공통 상단 로고, 메뉴, 커서, 하단 계정명
- `product-cards.css`: 메인 상품 카드와 상세페이지 하단 상품 카드
- `pages/home.css`: 메인페이지 소개와 상품 배치
- `pages/product.css`: 제품 상세페이지, 도장, 설명, 구매 버튼과 팝업
- `pages/product-description.css`: 설명 영역 접기·펼치기 동작. `product.css` 뒤에 적용
- `pages/product-stamp.css`: 도장 원본의 투명도 외곽을 따라 퍼지는 노란빛. 2.8초 주기, 최대 불투명도 0.18, 3회 반복
- `pages/archive.css`: 아카이브 중앙 이미지, 하단 설명, 이전·다음 미리보기
- `pages/about.css`: 비교용 룩북의 왼쪽 이미지 목록과 오른쪽 뷰어·제품 컷
- `pages/manual-reference.css`: 메뉴얼 문서 레이아웃과 최소 12px 본문
- `font.css`: 폰트 등록과 공통 색상 변수

## 상단 로고·메뉴·입술 정렬

`common.css`의 `--header-inset: 30px`가 모든 페이지의 상단·좌우 바깥 여백입니다.
로고, 메뉴, 입술을 한 헤더 행에 넣고 `align-items: center`로 세로 중앙선을 맞춥니다.
`--header-row-height`는 공통 행 높이, `--header-control-gap`은 메뉴와 입술 사이 간격입니다.
모바일도 여백 30px를 유지하며, 좁은 화면에서는 로고 폭과 메뉴 간격을 줄입니다. 서체와 굵기는 그대로입니다.
메인의 스크롤 후 작은 로고도 같은 중심선과 여백을 사용합니다. 첫 화면의 큰 로고는 좌우 30px를 비웁니다.
페이지별 CSS에서 헤더 위치를 덮어쓰지 않고 공통 파일에서 함께 조절합니다.

## 모바일 메인·상세페이지

760px 이하에서 메인 상품 목록은 가운데 정렬한 2열로 표시합니다.
`pages/home.css`의 모바일 `.shop-grid`에서 열 수와 `gap`을 조절하고,
`product-cards.css` 하단에서 카드 이미지 영역과 모바일 글자 크기를 조절합니다.
컬렉션 필터 결과가 홀수 개면 마지막 상품도 가운데에 표시합니다.

상세페이지는 `pages/product.css` 하단의 모바일 규칙에서 조절합니다.
상세 이미지가 화면 너비 전체를 채우며 이미지 → 도장 → 상품명·가격·설명 → 구매 버튼 → 전체 상품 목록 순서로 이어집니다.
모바일 도장의 크기는 `.detail-info-toggle`의 `width`와 `height`, 이미지 아래 여백은 `margin`입니다.
설명 좌우 여백은 `.detail-actions`의 `padding`, 글자 크기는 `.detail-description-body`에서 조절합니다.
모바일 도장 문구는 노란색 전체 화면 오버레이로 열립니다. 모든 제품의 문구를 실제 화면 너비·높이에 맞춰 자동 축소하며, 웹폰트·화면 회전·뷰포트 변화 후 다시 계산합니다.
PC 오프닝과 고정 설명 영역 해제 계산은 모바일에서 실행하지 않습니다.
PC·모바일의 description은 닫을 때 설명 영역의 높이도 함께 줄어듭니다. PC 구매 영역은 전체 높이에 맞춰 세로 중앙 정렬되고, 모바일에서는 아래 버튼과 콘텐츠가 위로 이어집니다.
동작과 속도는 `pages/product-description.css`의 `.detail-description-collapse`와 `380ms`에서 조절합니다. 이 파일은 `product.css` 다음에 불러옵니다.
구매·장바구니 버튼 위 간격은 `pages/product.css`의 `.detail-product-details`에서 조절합니다. PC는 `margin-bottom: calc(80px * var(--stage-scale, 1))`의 80px, 모바일은 같은 선택자의 `margin-bottom: 32px`입니다. 숫자를 줄이면 버튼이 위로 올라갑니다.
도장 배경빛은 `pages/product-stamp.css`의 `--stamp-glow-duration`, `--stamp-glow-opacity`, `--stamp-glow-repeats`에서 조절합니다.
원형 그라디언트 대신 `stamp_red.webp`의 투명도 모양을 마스크로 사용합니다. 색은 `--stamp-glow-color`, 외곽으로 퍼지는 정도는 `--stamp-glow-blur`에서 조절합니다.
도장 원본과 마스크를 모두 가운데 정렬·contain으로 표시해 PC·모바일에서 외곽이 일치합니다.
도장이 처음 화면에 보일 때만 시작하고, 누르거나 3회 반복이 끝나면 종료합니다. 이미지 자체의 위치·선명도는 바꾸지 않습니다.

`header.css`는 이전 통합 파일이며 새 HTML에서는 사용하지 않습니다.

메뉴얼과 아카이브의 왼쪽 메뉴는 항상 `common.css`의 `.page-side-index`와
`.page-side-nav`를 함께 사용합니다. 크기·위치·모바일 배치는 이 공통 규칙에서만
수정하고, 페이지별 CSS에서 덮어쓰지 않습니다. 기본값은 Arial Narrow 12px,
위 128px / 왼쪽 30px입니다.

모든 영문은 `font.css`의 `--en-font`에 지정한 Arial Narrow를 사용합니다.
일반 Arial로 변경하지 않습니다. 상단 메뉴는 Arial Narrow 볼드(700)를 사용합니다.

메뉴얼은 한글과 영어의 본문·소제목·부제목 크기와 굵기를 각각 조절합니다.
목록 숫자는 해당 언어 본문의 크기와 굵기를 따라갑니다. 문장 중간의 개별 강조는 추가하지 않습니다.
영어는 Arial Narrow를 유지하며 400(Regular)과 700(Bold) 폰트 파일을 사용합니다.
600~800은 같은 Bold로 표시될 수 있습니다. 더 두껍게 보이려면 영문 stroke 값을 조절하고, 원본 굵기만 사용하려면 stroke를 0px로 설정합니다.
문단 안의 소제목은 `.manual-label` 뒤에 `<br>`을 넣어 바로 다음 줄에 설명을 배치합니다.

## Manual 중앙 본문과 로고 배경

`pages/manual-reference.css`의 `.manual-page`에서 조절합니다.

| 조정할 부분 | 수정할 값 |
| --- | --- |
| 영어·한글 2단 전체 너비 | `--manual-content-width` 안의 최대 너비 |
| 영어·한글 열 사이 여백 | `--manual-column-gap` |
| 마지막 그레이 도장 크기 | `--manual-end-stamp-width` (기본 160px) |
| 마지막 도장 기울기 | `--manual-end-stamp-angle` (기본 -14deg) |
| 마지막 도장 좌우·상하 이동 | `--manual-end-stamp-x`, `--manual-end-stamp-y` |
| 마지막 도장 위 간격 | `--manual-end-stamp-gap` |
| 한글 본문 크기 / 굵기 | `--manual-kr-body-size`, `--manual-kr-body-weight` |
| 한글 소제목 크기 / 굵기 | `--manual-kr-subheading-size`, `--manual-kr-subheading-weight` |
| 한글 부제목 크기 / 굵기 | `--manual-kr-heading-size`, `--manual-kr-heading-weight` |
| 영어 본문 크기 / 굵기 | `--manual-en-body-size`, `--manual-en-body-weight` |
| 영어 소제목 크기 / 굵기 | `--manual-en-subheading-size`, `--manual-en-subheading-weight` |
| 영어 부제목 크기 / 굵기 | `--manual-en-heading-size`, `--manual-en-heading-weight` |
| 영문 추가 굵기 | `--manual-en-body-stroke: 0.2px`, `--manual-en-subheading-stroke: 0.25px`, `--manual-en-heading-stroke: 0.4px` |
| 본문 줄 간격 | `--manual-line-height` (배수, 예: `1.4`) |
| 부제목 줄 간격 | `--manual-heading-line-height` (배수) |
| 소제목 줄 간격 | `--manual-subheading-line-height` (배수) |
| 본문 문단 사이 | `--manual-paragraph-gap` (px) |
| 부제목과 첫 소제목 사이 | `--manual-heading-gap` (px) |
| 소제목과 설명 본문 사이 | `--manual-subheading-gap` (px, `h4`와 문단 안 소제목 모두 적용) |
| 소제목·설명 묶음 사이 | `--manual-subsection-gap` (px) |
| 목록 항목 사이 | `--manual-list-item-gap` (px) |
| 자간 | `--manual-letter-spacing` (현재 -0.01em, 음수는 좁게 / 양수는 넓게) |
| 배경 로고 한 개의 고정 너비 | `--manual-logo-size` (현재 460px, 본문·화면 너비와 무관) |
| 로고 가로 간격 | `--manual-logo-gap-x` (px, 음수 = 좁게 / 0 = 원본 / 양수 = 넓게) |
| 로고 세로 간격 | `--manual-logo-gap-y` (px, 음수 = 좁게 / 0 = 원본 / 양수 = 넓게) |
| 전체 배경 너비 | `--manual-logo-width` (로고 크기 × 가로 개수 + 열 사이 간격) |
| 배경 좌우 이동 | `--manual-logo-x` (중앙 기준, 양수: 오른쪽 / 음수: 왼쪽) |
| 배경 시작 위치 | `--manual-logo-top` (PC 108px, 모바일 0px) |
| 배경 로고 색상 | `--manual-logo-color` (HEX 색상, 예: `#000000`, `#ff0000`) |
| 배경 로고 진하기 | `--manual-logo-opacity` (현재 0.12, 커질수록 진하게) |
| 한 줄의 로고 개수 | `--manual-logo-columns` (현재 2개) |

크기는 `14px`, 굵기는 `700`처럼 입력합니다. `--manual-body-size` 등 자동 연결 항목은 수정하지 않아도 됩니다.
영어 설정은 영어 소개와 본문, INTRODUCTION 문구에 적용하고 한글 설정은 한글 소개와 본문에 적용합니다.

PC에서는 영어를 왼쪽, 한글을 오른쪽에 배치합니다. 소개와 각 장을 한 행씩 묶어 같은 내용의 시작 높이를 맞춥니다.
1024px 이하에서는 영어 소개와 전체 본문을 먼저 표시하고, 그 다음 한글 소개와 전체 본문을 표시합니다. 화면이 넓어지면 장별 2단 배치로 돌아갑니다.
모바일(760px 이하)의 배경 로고는 화면 안에 2개가 온전히 들어오도록 크기를 맞춥니다. PC의 로고 크기와 개수는 그대로 유지합니다.
문장은 기존 왼쪽 정렬을 유지하며, 언어별 글자 크기와 굵기 설정도 그대로 적용됩니다.
한글 열 위의 INTRODUCTION은 `visibility: hidden`으로 글자만 숨깁니다. 기존 높이·여백은 유지하므로 한글 본문이 위로 올라가지 않습니다.
PC 첫 소개문의 위쪽 여백을 제거해 왼쪽 메뉴와 같은 128px 높이에서 시작합니다. 모바일은 메뉴 아래에 본문을 배치합니다.
로고 배경은 본문과 화면 너비에 따라 축소되지 않는 고정 크기이며, 왼쪽 목차는 공통 스타일을 사용합니다.
`--manual-logo-size`를 500px로 바꾸면 로고 하나가 500px, 2열 전체가 1000px로 커집니다.
배경 타일은 기존 로고에서 ‘聖人用品’ 네 글자만 표시하며 행·열 간격을 포함합니다.
로고 모양은 마스크로 사용하고 색상은 `--manual-logo-color`, 불투명도는 `--manual-logo-opacity`에서 각각 조절합니다.
로고는 장식용 그리드로 배치하며 각 칸의 마스크를 왼쪽 위에 고정합니다.
`--manual-logo-gap-x: 20px`, `--manual-logo-gap-y: 30px`이면 로고 크기를 유지한 채 가로는 20px, 세로는 30px의 여백을 추가합니다.
`--manual-logo-gap-x: -15px`, `--manual-logo-gap-y: -15px`처럼 음수를 입력하면 원본에 포함된 투명 여백을 겹쳐 간격을 줄입니다.
`0.15px`는 0.15px만큼 넓히는 값입니다. 좁히려면 `-15px`처럼 음수와 px 단위를 입력하세요.
`--manual-logo-height`, `--manual-logo-step-x`, `--manual-logo-step-y`는 자동 계산값이므로 수정하지 않아도 됩니다.
`js/pages/manual.js`가 페이지 높이에 맞춰 필요한 로고 개수를 자동으로 채웁니다.
배경 로고는 약 5px 스트로크 효과로 두껍게 표시하며, 상단 착용 이미지는 표시하지 않습니다.
로고 굵기는 `scripts/build_manual_logo_tile.py`의 `STROKE_WIDTH`에서 조절합니다.
`python3 scripts/build_manual_logo_tile.py`로 타일을 다시 만들 수 있습니다.

## About 이미지 위치 조정

`pages/about.css` 상단의 `.about-page`에서 큰 이미지와 제품 컷을 조정합니다.

| 조정할 부분 | 수정할 값 |
| --- | --- |
| 오른쪽 큰 이미지 좌우·상하 | `--about-main-x`, `--about-main-y` (양수: 오른쪽·아래) |
| 오른쪽 큰 이미지 확대·축소 | `--about-main-scale` (1: 기본, 1.1: 10% 확대) |
| 제품 정면 컷 위치 | `--about-cut-right`, `--about-cut-bottom` (커질수록 왼쪽·위) |
| 제품 정면 컷 크기 | `--about-cut-width`, `--about-cut-height` |
| 제품별 정면 컷 크기 | `.about-product-cut[data-product-id="제품 ID"]`의 `--about-cut-item-scale` |
| 왼쪽 목록 전체 위치 | `.about-look-list`의 `padding` |
| 목록의 열 수·이미지 간격 | `.about-thumbnail-grid`의 `grid-template-columns`, `gap` |

태블릿·모바일 제품 컷은 같은 파일 아래 `@media`의 변수를 수정합니다.
왼쪽 목록은 스크롤바를 숨기며 마우스 휠·터치 스크롤은 유지합니다.
왼쪽 제목은 고정하고 `.about-thumbnail-grid` 안의 이미지만 스크롤합니다.
썸네일 번호는 표시하지 않으며, 이미지 사이 간격은 모든 화면에서 `gap: 0`입니다.
왼쪽 썸네일은 360×480px(3:4)로 크롭하며, 원본과 오른쪽 큰 이미지는 유지합니다.

제품별 크기는 `pages/about.css`의 `[제품별 우측 하단 컷 크기]` 주석 아래에서 수정합니다.
제품 번호·이름을 붙인 16개 설정이 있으며 `1`은 기본, `1.2`는 20% 확대, `0.8`은 20% 축소입니다.
같은 제품을 착용한 여러 사진에도 해당 배율이 적용됩니다.

## Archive 제품별 이미지 조정

`pages/archive.css`의 `[제품별 이미지 크기·위치]`에서 제품 번호와 이름을 찾습니다.
각 `.archive-project[data-product-id="제품 ID"]` 안의 세 값만 변경합니다.

| 조정할 부분 | 수정할 값 |
| --- | --- |
| 제품별 이미지 크기 | `--archive-item-scale` (1: 기본, 1.2: 20% 확대) |
| 제품별 좌우 위치 | `--archive-item-x` (양수: 오른쪽, 음수: 왼쪽) |
| 제품별 상하 위치 | `--archive-item-y` (양수: 아래, 음수: 위) |

PC·모바일과 양옆 미리보기에 같은 설정이 적용되며, 제품명·설명 글의 위치는 유지됩니다.

아카이브 이미지는 16번 다음에 1번으로 순환합니다. `.archive-captions`는 이미지 이동 영역과
분리되어 같은 위치에서 투명도만 바뀝니다. 이미지와 설명 사이 간격은 `.archive-page`의
`--archive-caption-gap`에서 조절합니다.

## Archive 하단 프로젝트 정보

화살표는 1번↔16번 제품을 순환합니다. 마지막 제품에서 아래로 휠·세로 스와이프하면 기존 하단 로고와 프로젝트 설명으로 내려갑니다.
마지막 제품에서 ArrowDown 또는 PageDown을 눌러도 하단으로 이동합니다. 상품 전환 도중의 트랙패드 관성은 계속 차단합니다.
