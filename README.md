<img src="https://github.com/user-attachments/assets/460f7cb9-ccd1-4f5f-887a-55aad1eae418" style="width: 100px" />

# seoulsync82-backend

> **AI 기반으로 서울의 핫플레이스 코스를 추천하는 서비스**  
> 서울 지하철역을 기반으로 한 **코스 추천 로직**과 AI 감정 분석을 결합해, 더욱 정교하고 재미있는 사용자 경험을 목표로 합니다.

---

## 주요 기능 (Key Features)
🔗 [SeoulSync82 – AI 코스 추천 로직](https://ilikezzi.notion.site/SeoulSync82-49ca12c8af2346fdb083527c772f2eb3?pvs=4)


### 1. 코스 추천 및 핫플레이스

- AI 기반 알고리즘으로 식당, 카페, 쇼핑, 전시회, 팝업 장소 추천
- **역 선택 시 지하철역 근방 1.5km** 내 핫플레이스 추천
- 카카오 평점 3.5 이상 데이터를 기반으로 추천

### 2. 사용자 히스토리 기반 추천

- **로그 가중치 방식**으로 리뷰와 평점을 조정
- 중복 추천 방지 및 랜덤 선택 알고리즘을 결합해 다채로운 코스를 제공

### 3. 감정 분석 기반 추천 로직

- 리뷰 데이터를 **ChatGPT API**에 전달하여 NLP로 긍정/부정 감정 분류
- 감정 분석 점수를 기반으로 특정 테마에 맞는 장소 추천

### 4. OAuth 2.0 기반 소셜 로그인

- 카카오, 네이버, 구글, 애플 등의 소셜 로그인 지원
- **JWT 인증 시스템**으로 사용자 세션 관리

### 5. 시각화

- 네이버 지도 API를 활용한 추천 코스 및 사용자 커스텀 코스 시각화

### 6. 서버 인프라 및 최적화

- **DB ERD 설계** 및 인덱스 최적화
- Docker 및 AWS 기반 배포
- 개발 단계에 개인 NAS 인프라를 통한 무료 서버 운영

---

## 기술 스택 (Tech Stack)

| 분야                   | 상세 내용                                                   |
| ---------------------- | ----------------------------------------------------------- |
| **Framework**          | [NestJS](https://nestjs.com/)                               |
| **Language**           | TypeScript                                                  |
| **Database**           | MySQL                                                       |
| **Caching**            | Redis                                                       |
| **API**                | ChatGPT API (OpenAI), Kakao, 네이버 지도 API                |
| **Deployment & CI/CD** | AWS (EC2, S3, CloudFront, ELB), NAS, Docker, GitHub Actions |
| **Auth**               | OAuth 2.0, JWT                                              |
| **Testing**            | [Jest](https://jestjs.io/) (Unit, Integration, E2E)         |
| **Visualization**      | 네이버 지도 API, Firebase 외부 공유                         |
| **Logging**            | Winston                                                     |

---

## 프로젝트 구조 (Project Structure)

```text
seoulsync82-backend
├── src
│   ├── auth          # 소셜 로그인 및 인증 모듈 (OAuth 2.0, JWT 인증, Refresh Token 관리)
│   ├── bookmark      # 코스 북마크 저장 및 관리 (즐겨찾기 추가/삭제)
│   ├── course        # 코스 추천 로직 및 저장 (AI 기반 추천, 사용자 맞춤형 코스 제공)
│   ├── comment       # 커뮤니티 코스 한줄평 작성 및 관리 (사용자 리뷰 작성 및 조회)
│   ├── place         # 장소 데이터 처리 및 조회 (지하철역 근처 장소 검색, 카카오/네이버 데이터 활용)
│   ├── community     # 커뮤니티 기능 (사용자 간 코스 공유 및 상호작용)
│   ├── notification  # 알림 서비스 (한줄평, 좋아요 등의 이벤트 알림)
│   ├── reaction      # 코스 좋아요 리액션 기능 (사용자 간 피드백 제공)
│   ├── search        # 장소 상세 검색 기능 (필터 및 키워드 검색 지원)
│   ├── share         # 추천 코스 외부 공유 기능 (Firebase 및 링크 생성)
│   ├── subway        # 지하철역 데이터 처리 및 매핑 (지하철 역 기반 코스 추천)
│   ├── theme         # 사용자 맞춤형 8가지 테마 기능 (테마별 장소 추천 로직)
│   ├── user          # 유저 관리 기능 (프로필 관리, 활동 기록 조회)
│   ├── commons       # 공통 유틸리티 및 데코레이터 (에러 핸들링, 인터셉터, 필터, 공용 함수)
│   ├── main.ts       # 엔트리 포인트
│   └── app.module.ts # 메인 모듈
├── test              # 테스트 코드 (Jest)
├── dockerfile        # Docker 설정 (프로덕션 환경 컨테이너 구성)
├── package.json
├── tsconfig.json
└── README.md
```

---

## 설치 및 실행 (Installation & Usage)

### Requirements

- **Node.js** (v20+)
- **MySQL** & **Redis**
- **AWS CLI**

```bash
# 프로젝트 클론
git clone https://github.com/SeoulSync82/seoulsync82-backend.git
cd SeoulSync82

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.staging .env

# 서버 실행
npm run start:dev
```

---

# 테스트 (Testing)

```bash
# 단위 테스트 실행
npm run test

# E2E 테스트 실행
npm run test:e2e

# 테스트 커버리지 확인
npm run test:cov
```

---

## 디버깅 설정 (VS Code)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Nest Framework",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug", "--", "--inspect-brk"],
      "autoAttachChildProcesses": true,
      "restart": true,
      "sourceMaps": true,
      "stopOnEntry": false,
      "console": "integratedTerminal"
    }
  ]
}
```

---

## 라이선스 (License)

이 프로젝트는 [MIT License](./LICENSE)에 따라 배포 및 사용이 가능합니다.

---
