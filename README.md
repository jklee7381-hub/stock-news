# 미국지수·반도체 뉴스 알리미

QQQ·나스닥·S&P500과 반도체(SOXX·HBM·TSMC·엔비디아) 관련 기사만 모아 점수로 거르고, 핵심 소식을 텔레그램으로 보내 주는 도구입니다.
개별 급등주·테마주 기사는 배제 단어 규칙으로 걸러 냅니다.

## 하는 일
- 언론사 RSS와 구글뉴스 검색 RSS에서 기사 제목·매체·링크만 수집합니다. (본문은 가져오지 않습니다)
- 필수 키워드가 없거나 배제 단어(급등, 상한가, 특징주, 수주 등)가 있으면 폐기합니다.
- 점수(100점) = 매크로·반도체 영향도 35 + 매체 신뢰도 30 + 다수 매체 동시 보도 20 + 최신성 15
- 긴급 알림: CPI·FOMC 속보, 지수 급변동, 반도체 규제 같은 정책, 빅테크 실적 충격
- 정기 브리핑(한국시간): 월~토 07:00 / 월~금 16:00 / 월~금 21:30
- 웹 화면: 현재 기사 목록과 점수를 읽기 전용으로 보여 줍니다.

## 구성
| 위치 | 역할 |
|---|---|
| `lib/config.ts` | 키워드·배제어·매체표·점수표·RSS 주소 (규칙은 여기서만 고침) |
| `lib/rss.ts`, `filter.ts`, `score.ts`, `urgent.ts` | 수집·거르기·점수·긴급 판정 |
| `lib/summarizer.ts`, `telegram.ts`, `state.ts` | 메시지 문구·전송·중복 방지 |
| `scripts/run.ts` | 실행 진입점 (`urgent`, `briefing <종류>`, `--dry`) |
| `.github/workflows/news.yml` | GitHub Actions 예약 실행 |
| `app/` | 읽기 전용 웹 화면과 `/api/articles` |

## 실행해 보기
```bash
npm install
node scripts/run.ts urgent --dry          # 보내지 않고 시험
node scripts/run.ts briefing us-close --dry
npm run dev                               # http://localhost:3000
```

## 비밀 값
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`는 로컬에서는 `.env`, GitHub Actions에서는 저장소 비밀값(Secrets)에 둡니다. 저장소에는 올리지 않습니다.

## 알아 둘 점
- 투자 조언이 아닙니다. 기사 제목과 원문 링크만 제공합니다.
- GitHub 예약 실행은 몇 분~수십 분 늦게 시작될 수 있습니다.
- 문서: [PRD.md](PRD.md) · [PLAN.md](PLAN.md) · [DESIGN.md](DESIGN.md)
