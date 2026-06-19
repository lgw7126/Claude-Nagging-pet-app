# 🐾 잔소리펫 (Nagging Pet)

**👉 [앱 실행하기 → https://lgw7126.github.io/Claude-Nagging-pet-app/](https://lgw7126.github.io/Claude-Nagging-pet-app/)**

---

반려동물 케어 주기(심장사상충, 구충제 등)를 등록하면, 반려동물 1인칭 시점의 귀여운 잔소리로 알림을 주는 모바일 웹앱.
URL 하나로 온 가족이 데이터를 공유할 수 있어요. (서버/DB 없음)

## 주요 기능

| 기능 | 설명 |
|------|------|
| 🐾 루틴 등록 | 반려동물 이름, 루틴, 주기, 마지막 투약일 입력 |
| 💬 잔소리 알림 | D-Day에 따라 여유/임박/당일/지각 4단계 메시지 |
| 📷 반려동물 사진 | 프로필 사진 업로드 → 카드에 표시 |
| 🔔 브라우저 알림 | 투약일 D-3 이내 자동 알림 (허용 시) |
| 📋 투약 히스토리 | 완료 처리 기록 날짜별 조회 |
| 🌙 다크모드 | 라이트/다크 테마 전환 |
| 💬 가족 공유 | 현재 데이터를 URL로 변환 → 클립보드 복사 → 카톡 공유 |

## 기술 스택

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Storage**: LocalStorage + URL Query Parameters (서버 없음)
- **Notifications**: Web Notifications API

## 로컬 실행

```bash
npm install
npm run dev
```

## 배포

`main` 브랜치에 푸시하면 GitHub Actions가 자동으로 GitHub Pages에 배포합니다.
