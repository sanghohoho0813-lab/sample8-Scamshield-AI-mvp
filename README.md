# ScamShield — 사기문자·스미싱 위험도 검사 MVP

의심스러운 문자나 링크를 넣으면 **위험 신호와 지금 해야 할 행동**을 쉽게 알려주는 안전 보조 서비스입니다.
모바일 중심의 반응형 웹앱으로, 가입 없이 바로 사용할 수 있습니다. (기획·제작: 미래AI랩)

> 분석 결과는 참고용 위험 신호 안내이며, 실제 사기 여부를 확정하는 판정이 아닙니다.

## 핵심 흐름 (Golden Path)

```
홈(입력) → 문자 붙여넣기 / 샘플 / 캡처 이미지(데모 OCR 확인·수정)
→ 위험도 검사하기 → 분석 진행 오버레이
→ 결과(/result/:id): 결론 → 이유 → 지금 해야 할 행동 → 근거(의심 문구·위험 신호·링크/연락처)
→ 가족에게 공유 → 분석 기록에 반영 → 다시 보기 / 삭제
```

- 분석 완료 시 기록이 저장되고, 결과는 고유 주소(`/result/:id`)를 가져 **새로고침·뒤로가기·딥링크**에서도 유지됩니다.
- 공유(휴대폰 공유 창 또는 복사)하면 해당 기록에 "공유함"이 남습니다.
- 기록은 이 기기의 브라우저(localStorage)에만 저장됩니다. 설정에서 전체 삭제 / 예시 기록으로 되돌리기가 가능합니다.

## 화면 구성

| 경로 | 역할 |
| --- | --- |
| `/` | 입력 우선 홈 — 검사 폼, 최근 검사, 자주 오는 사기 유형 |
| `/result/:id` | 검사 결과 (데스크톱 2열: 판정 고정 패널 + 행동·근거) |
| `/history` | 분석 기록 목록 |
| `/guide` | 공통 5원칙 + 유형별 조심할 문구 (`/guide#delivery` 등 앵커) |
| `/my` | 설정 — 글자 크기, 기록 관리, 서비스 정보 |
| `/about` | 서비스 소개 · 데모 범위 안내 |

`/analyze`, `/history/:id`는 이전 주소 호환용 리다이렉트입니다.

## 데모 범위 (정직한 표기)

| 기능 | 현재 |
| --- | --- |
| 위험도 분석 | **규칙 기반 데모 엔진** (`lib/risk-engine.ts`) — 결정적 결과 |
| 캡처 이미지 인식 | **데모 OCR** — 예시 문장을 채우고 사용자가 확인·수정 |
| LLM 분석 | 연결 구조만 준비 (`app/api/analyze/route.ts`, `AI_API_KEY`) |
| 저장 | 브라우저 localStorage (Supabase 스키마: `supabase/schema.sql`) |

## 디자인 시스템 (`app/globals.css`)

- 팔레트: Brand(Trust Blue/Navy) + Accent(Teal, 브릿지 CTA에 한정) + Neutral + Risk 의미색(낮음·주의·높음·매우 높음)
- 타입 스케일(역할 기반): caption 13 · secondary 15 · **body 17** · card title 19 · section 22–26 · page 32
- 접근성 글자 크기: 설정에서 보통 / 크게(112.5%) / 아주 크게(125%), 첫 페인트 전 적용
- Radius 3단계(12/20/28px), Shadow 3단계(subtle/raised/overlay)

## 미래AI랩 브릿지 CTA

- 컴포넌트: `components/SampleBridgeCTA.tsx` (레이아웃에서 모든 페이지 하단에 노출)
- 링크·문구 수정: `lib/mirae.ts`의 `MIRAE_LINKS`, `MIRAE_COPY`

## 개발

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run typecheck
npm run lint
```

환경변수는 `.env.example` 참고. 값이 없어도 데모 모드로 완전히 동작합니다.
