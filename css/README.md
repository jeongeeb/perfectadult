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

메뉴얼 설명 본문은 일반 굵기(400)를 유지하며 문장 중간에 강조용 볼드를 넣지 않습니다.
장 제목·소제목과 `.manual-label`만 볼드(700)를 사용합니다.
문단 안의 소제목은 `.manual-label` 뒤에 `<br>`을 넣어 바로 다음 줄에 설명을 배치합니다.
