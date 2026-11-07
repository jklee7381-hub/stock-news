import fs from "node:fs";
let d = fs.readFileSync("DESIGN.md", "utf8");
const a = "- 색: 흰 바탕 + 남색 포인트, 긴급은 빨강, 점수는 막대로 표시. 글꼴은 시스템 기본(한글 깨짐 방지).";
if (!d.includes(a)) throw new Error("못 찾음");
d = d.replace(a, "- (2차 변경) '오늘의 스크랩'과 같은 느낌: 흰 머리글 + 남색 그라데이션(#094080→#052561) 큰 제목 'MARKET BRIEF', 그 위로 떠 있는 현황 카드(그림자), 둥근 흰 카드 목록. 포인트 #083891, 긴급 #d92b2b, 글꼴 Manrope + Pretendard(파일을 프로젝트에 포함). 어두운 모드는 쓰지 않음. 로고·기관 표시는 쓰지 않음.");
fs.writeFileSync("DESIGN.md", d);
