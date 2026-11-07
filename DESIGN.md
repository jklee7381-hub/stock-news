# 미국지수·반도체 뉴스 알리미 설계 (DESIGN)

## 1. 화면 구성
- 화면 1: 기사 현황 (읽기 전용) — 상단 제목·마지막 수집 시각, 점수순 기사 카드(점수, 매체, 시각, 제목 링크, 걸린 키워드, 🚨긴급 표시), 접을 수 있는 "폐기된 기사와 이유" 목록.
- 화면은 이것 하나뿐이다. 전송 버튼은 두지 않는다.

## 2. 데이터 흐름
1. GitHub Actions(예약)가 `node scripts/run.ts urgent|briefing`을 실행한다. (Node 24의 TS 직접 실행, 새 라이브러리 없음)
2. `rss.ts`가 구글뉴스 키워드 RSS와 언론사 RSS를 받아 기사 목록(제목·매체·링크·발행시각)으로 만든다.
3. `filter.ts` 배제어 폐기 → 필수 키워드 확인 → `score.ts` 점수 → `urgent.ts` 긴급 판정.
4. 긴급이면서 아직 안 보낸 기사는 즉시 전송, 브리핑 시간이면 상위 8건을 `summarizer.ts`로 불릿 정리 후 전송.
5. 보낸 기사 링크 해시는 Actions 캐시(`sent.json`)에 기록(최근 7일만).
6. 웹 화면은 같은 `lib`를 서버에서 호출해 5분 캐시로 목록을 보여 준다.

## 3. API
| 주소 | 방식 | 받는 값 | 돌려주는 값 | 오류 |
|---|---|---|---|---|
| /api/articles | GET | 없음 | `{ updatedAt, items[], dropped[] }` | 502 수집 실패 시 `{error}` (상세 내용은 숨김) |

텔레그램 전송 API는 만들지 않는다. 전송은 `scripts/run.ts`(Actions)에서만 일어난다.

## 4. 데이터 형태
```ts
type Article = { title: string; source: string; link: string; publishedAt: string };
type Scored = Article & {
  keywords: string[];
  score: { impact: number; trust: number; multi: number; recency: number; total: number };
  urgent: boolean;
};
type Dropped = Article & { reason: "배제어" | "키워드없음"; detail: string };
```

## 5. 보안 점검표
- [ ] 비밀 값(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)이 코드·로그·커밋에 없다
- [ ] 웹 화면·/api/articles에서 텔레그램을 보낼 수 없다
- [ ] 외부 주소 접속은 코드에 정해 둔 RSS 주소(허용 목록)뿐이고, 사용자 입력으로 주소를 만들지 않는다. 시간(10초)·크기 제한이 있다
- [ ] 텔레그램 메시지에 들어가는 기사 제목은 HTML 특수문자를 막는다
- [ ] 기사 본문은 저장하지 않는다 (제목·링크만)
- [ ] 로그에 토큰이 찍히지 않는다 (오류 시 토큰 가림)

## 6. 디자인
- (2차 변경) '오늘의 스크랩'과 같은 느낌: 흰 머리글 + 남색 그라데이션(#094080→#052561) 큰 제목 'MARKET BRIEF', 그 위로 떠 있는 현황 카드(그림자), 둥근 흰 카드 목록. 포인트 #083891, 긴급 #d92b2b, 글꼴 Manrope + Pretendard(파일을 프로젝트에 포함). 어두운 모드는 쓰지 않음. 로고·기관 표시는 쓰지 않음.
- 모바일 우선, 카드형, 모서리 둥글게. 로고·기관 표시 없음.

## 7. 배포
- 웹 화면: Vercel, 지역 icn1, 환경 변수 없음.
- 예약 실행: GitHub Actions 비밀값 `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
- 접근 보호: 읽기 전용 기사 목록이라 기본은 공개로 제안하되, 배포 전에 사용자가 선택한다.
- 예약 시간(UTC→한국): 브리핑 07:00 = 일~목 22:00 UTC, 16:00 = 월~금 07:00 UTC, 21:30 = 월~금 12:30 UTC. 긴급은 평일 10분마다.

## 8. 2차 추가: 기사 상세 (요약·용어 풀이·본문 앞부분)
- 화면: 기사 카드의 "요약·용어·본문 보기" 버튼 → 요약 / 용어 풀이 / 본문(앞 1,500자) / 원문 링크. 눌렀을 때만 가져온다.
- API: `GET /api/article?id=<링크 해시 16자>` — 주소를 받지 않고 서버의 기사 목록에서 id로 찾는다. 다른 사이트에서 부르면 403.
- 흐름: 구글뉴스 링크면 `lib/gnews.ts`로 원문 주소 해석 → `lib/extract.ts`로 본문 추출(jsdom 26·readability) → `lib/summary.ts` 요약 → `lib/glossary.ts` 용어 풀이.
- 한계: 구글이 요청을 너무 많이 받으면 429로 막을 수 있어 일부 기사는 "원문 주소를 찾지 못했습니다"로 나온다. 성공한 결과만 1시간 보관한다.
- 보안: 본문 서버 저장 없음, 내부 IP 차단, 이동 4회·시간 8초·크기 2MB 제한, 글자만 반환(React가 이스케이프).
