# CSS 수정 위치

- `common.css`: 전 페이지 공통 상단 로고, 메뉴, 커서, 하단 계정명
- `product-cards.css`: 메인 상품 카드와 상세페이지 하단 상품 카드
- `pages/home.css`: 메인페이지 소개와 상품 배치
- `pages/product.css`: 제품 상세페이지, 도장, 설명, 구매 버튼과 팝업
- `pages/archive.css`: 아카이브 중앙 이미지, 하단 설명, 이전·다음 미리보기
- `pages/about.css`: 비교용 룩북의 왼쪽 이미지 목록과 오른쪽 뷰어·제품 컷
- `pages/manual-reference.css`: 메뉴얼 문서 레이아웃과 최소 12px 본문
- `font.css`: 폰트 등록과 공통 색상 변수

`header.css`는 이전 통합 파일이며 새 HTML에서는 사용하지 않습니다.

메뉴얼과 아카이브의 왼쪽 메뉴는 항상 `common.css`의 `.page-side-index`와
`.page-side-nav`를 함께 사용합니다. 크기·위치·모바일 배치는 이 공통 규칙에서만
수정하고, 페이지별 CSS에서 덮어쓰지 않습니다. 기본값은 Arial Narrow 12px,
위 128px / 왼쪽 30px입니다.

모든 영문은 `font.css`의 `--en-font`에 지정한 Arial Narrow를 사용합니다.
일반 Arial로 변경하지 않습니다. 상단 메뉴는 Arial Narrow 볼드(700)를 사용합니다.

메뉴얼 한글 본문은 600, 영문은 실제 Arial Narrow Bold(700)를 사용하며 문장 중간에 개별 강조용 볼드를 넣지 않습니다.
부제목(`.manual-rail h2`)은 16px / 800, 소제목(`h4`, `.manual-label`)은 13px / 700을 사용합니다.
본문과 목록 숫자는 13px / 600으로 맞춥니다.
문단 안의 소제목은 `.manual-label` 뒤에 `<br>`을 넣어 바로 다음 줄에 설명을 배치합니다.

## Manual 중앙 본문과 로고 배경

`pages/manual-reference.css`의 `.manual-page`에서 조절합니다.

| 조정할 부분 | 수정할 값 |
| --- | --- |
| 중앙 본문 최대 너비 | `--manual-content-width` 안의 `860px` |
| 본문 / 소제목 / 부제목 크기 | `--manual-body-size: 13px`, `--manual-subheading-size: 13px`, `--manual-heading-size: 16px` |
| 본문 / 부제목 굵기 | `--manual-body-weight: 600`, `--manual-heading-weight: 800` (소제목 700) |
| 영문 추가 굵기 | `--manual-en-body-stroke: 0.2px`, `--manual-en-subheading-stroke: 0.25px`, `--manual-en-heading-stroke: 0.4px` |
| 행간 | `--manual-line-height` (커질수록 넓게) |
| 자간 | `--manual-letter-spacing` (현재 -0.01em, 음수는 좁게 / 양수는 넓게) |
| 배경 로고 한 개의 고정 너비 | `--manual-logo-size` (현재 460px, 본문·화면 너비와 무관) |
| 전체 배경 너비 | `--manual-logo-width` (로고 크기 × 가로 개수, 기본 920px) |
| 배경 좌우 이동 | `--manual-logo-x` (중앙 기준, 양수: 오른쪽 / 음수: 왼쪽) |
| 배경 시작 위치 | `--manual-logo-top` (PC 108px, 모바일 0px) |
| 배경 로고 색상 | `--manual-logo-color` (HEX 색상, 예: `#000000`, `#ff0000`) |
| 배경 로고 진하기 | `--manual-logo-opacity` (현재 0.12, 커질수록 진하게) |
| 한 줄의 로고 개수 | `--manual-logo-columns` (현재 2개) |

본문은 화면 중앙의 한 열에 배치하고 문장은 왼쪽으로 정렬합니다.
로고 배경은 본문과 화면 너비에 따라 축소되지 않는 고정 크기이며, 왼쪽 목차는 공통 스타일을 사용합니다.
`--manual-logo-size`를 500px로 바꾸면 로고 하나가 500px, 2열 전체가 1000px로 커집니다.
배경 타일은 기존 로고에서 ‘聖人用品’ 네 글자만 표시하며 행·열 간격을 포함합니다.
로고 모양은 마스크로 사용하고 색상은 `--manual-logo-color`, 불투명도는 `--manual-logo-opacity`에서 각각 조절합니다.
타일은 왼쪽 위부터 반복합니다. `mask-position: center`로 변경하면 2열의 양 끝 로고가 잘립니다.
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
