# Supabase 연동 가이드

## 1. Supabase 프로젝트 설정

### 1.1 Supabase 계정 생성 및 프로젝트 생성
1. [Supabase](https://supabase.com)에 회원가입
2. 새 프로젝트 생성
3. 프로젝트 URL과 anon key 확인

### 1.2 데이터베이스 테이블 생성
Supabase SQL Editor에서 다음 SQL을 실행하여 베타 신청 테이블을 생성합니다:

```sql
-- 베타 신청 테이블 생성
CREATE TABLE beta_signups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    source VARCHAR(50) DEFAULT 'website',
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT
);

-- 이메일 인덱스 생성 (검색 성능 향상)
CREATE INDEX idx_beta_signups_email ON beta_signups(email);
CREATE INDEX idx_beta_signups_created_at ON beta_signups(created_at);

-- RLS (Row Level Security) 활성화
ALTER TABLE beta_signups ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (베타 신청 허용)
CREATE POLICY "Anyone can insert beta signups" ON beta_signups
    FOR INSERT WITH CHECK (true);

-- 관리자만 읽기 가능 정책 (선택사항)
CREATE POLICY "Only authenticated users can view beta signups" ON beta_signups
    FOR SELECT USING (auth.role() = 'authenticated');
```

### 1.3 환경변수 설정
`supabase-config.js` 파일에서 다음 값들을 실제 값으로 교체:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-project-id.supabase.co',
    anonKey: 'your-anon-key-here',
    
    tables: {
        betaSignups: 'beta_signups'
    }
};
```

## 2. HTML 파일 수정

### 2.1 Supabase 라이브러리 추가
`index.html`의 `<head>` 섹션에 Supabase 라이브러리를 추가:

```html
<!-- Supabase 라이브러리 -->
<script src="https://unpkg.com/@supabase/supabase-js@2"></script>
<!-- Supabase 설정 파일 -->
<script src="supabase-config.js"></script>
```

### 2.2 스크립트 로드 순서
다음 순서로 스크립트를 로드해야 합니다:
1. Supabase 라이브러리
2. supabase-config.js
3. script.js

## 3. JavaScript 코드 수정

### 3.1 실제 Supabase 연동 활성화
`script.js`의 `submitBetaSignup` 함수에서 주석 처리된 Supabase 코드를 활성화:

```javascript
async function submitBetaSignup(email) {
    // 데모 코드 제거하고 실제 Supabase 코드 사용
    try {
        // 중복 이메일 체크
        const emailExists = await checkEmailExists(email);
        if (emailExists) {
            return {
                success: false,
                message: '이미 신청된 이메일입니다.'
            };
        }
        
        // 베타 신청 저장
        const result = await saveBetaSignup(email);
        return {
            success: true,
            message: '베타 신청이 완료되었습니다!'
        };
    } catch (error) {
        console.error('Beta signup error:', error);
        return {
            success: false,
            message: '신청 중 오류가 발생했습니다.'
        };
    }
}
```

## 4. 보안 고려사항

### 4.1 RLS (Row Level Security) 설정
- 베타 신청 테이블에 RLS를 활성화하여 보안 강화
- 일반 사용자는 INSERT만 가능하도록 설정
- 관리자만 SELECT 가능하도록 설정

### 4.2 API 키 보안
- anon key는 공개되어도 안전하지만, service key는 절대 클라이언트에 노출하지 않음
- 환경변수나 별도 설정 파일로 관리 권장

### 4.3 이메일 검증
- 클라이언트 측과 서버 측 모두에서 이메일 형식 검증
- 중복 이메일 방지 로직 구현

## 5. 관리자 대시보드 (선택사항)

### 5.1 베타 신청 현황 조회
```javascript
// 베타 신청 통계 조회
async function viewBetaSignups() {
    try {
        const stats = await getBetaSignupStats();
        console.log(`총 신청자 수: ${stats.total}`);
        console.log('신청자 목록:', stats.data);
    } catch (error) {
        console.error('통계 조회 오류:', error);
    }
}
```

### 5.2 관리자 페이지 생성 (선택사항)
별도의 관리자 페이지를 만들어 베타 신청 현황을 관리할 수 있습니다.

## 6. 테스트

### 6.1 기능 테스트
1. 올바른 이메일 주소로 베타 신청 테스트
2. 중복 이메일 신청 시 오류 메시지 확인
3. 잘못된 이메일 형식 입력 시 검증 확인
4. Supabase 대시보드에서 데이터 저장 확인

### 6.2 오류 처리 테스트
1. 네트워크 오류 시 적절한 메시지 표시
2. Supabase 서버 오류 시 대응
3. 로딩 상태 표시 확인

## 7. 배포 전 체크리스트

- [ ] Supabase 프로젝트 생성 및 설정 완료
- [ ] 데이터베이스 테이블 생성 완료
- [ ] RLS 정책 설정 완료
- [ ] 환경변수 설정 완료
- [ ] HTML에 Supabase 라이브러리 추가 완료
- [ ] JavaScript 코드에서 실제 Supabase 연동 활성화
- [ ] 기능 테스트 완료
- [ ] 오류 처리 테스트 완료

## 8. 문제 해결

### 8.1 자주 발생하는 오류
1. **CORS 오류**: Supabase 프로젝트 설정에서 도메인 허용 목록 확인
2. **RLS 오류**: 정책 설정이 올바른지 확인
3. **API 키 오류**: URL과 anon key가 올바른지 확인

### 8.2 디버깅 팁
- 브라우저 개발자 도구의 Network 탭에서 API 호출 확인
- Console 탭에서 JavaScript 오류 확인
- Supabase 대시보드에서 실시간 로그 확인

## 9. 추가 기능 제안

### 9.1 이메일 알림
- Supabase Edge Functions을 사용하여 신규 베타 신청 시 이메일 알림
- 베타 출시 시 일괄 이메일 발송 기능

### 9.2 분석 기능
- 베타 신청 통계 차트
- 일별/주별 신청 현황 분석
- 이메일 도메인별 분석

### 9.3 추가 정보 수집
- 사용자 이름, 직업, 관심사 등 추가 정보 수집
- 설문조사 기능 추가

## 10. 관리자 대시보드 연동

### 10.1 별도 대시보드 프로젝트 연동
이 랜딩페이지는 별도의 관리자 대시보드 프로젝트와 연동됩니다.

### 10.2 수집되는 데이터 구조

#### 10.2.1 사전 주문 데이터 (`preorders` 테이블)
```json
{
  "id": "fe9b7e3f-5142-4f67-a1a8-aa9d0a58c69c",
  "service": "speak-diary",
  "email": "user@example.com",
  "marketing_opt_in": true,
  "created_at": "2025-07-09 13:56:44.426"
}
```

#### 10.2.2 클릭 추적 데이터 (`preorder_clicks` 테이블)
```json
{
  "id": "uuid",
  "service": "speak-diary",
  "created_at": "2025-07-09 13:56:44.426"
}
```

#### 10.2.3 베타 신청 데이터 (`beta_signups` 테이블)
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "created_at": "2025-07-09 13:56:44.426",
  "source": "website",
  "status": "pending"
}
```

### 10.3 추적되는 클릭 이벤트 (단순화)
사전예약과 체험해보기 버튼만 추적됩니다:

```javascript
// 사전예약 버튼 클릭 시
trackButtonClick('preorder') // 'speak-diary' 서비스로 저장

// 체험해보기 버튼 클릭 시
trackButtonClick('experience') // 'speak-diary' 서비스로 저장
```

### 10.4 추적되는 버튼 (단순화)
- **사전 주문하기 버튼**: 위쪽과 아래쪽 사전예약 섹션의 버튼
- **지금 체험해보기 버튼**: Hero 섹션의 메인 CTA 버튼

### 10.5 추적되지 않는 버튼
- 네비게이션 링크 (데모 체험, 기능, 사용자)
- 데모 기능 버튼들 (영작하기, 번역하기, 말하기 연습 등)
- 서비스 카드 선택

### 10.6 대시보드에서 확인 가능한 통계
- 총 클릭 수 (사전예약 + 체험해보기)
- 사전 주문 수
- 베타 신청 수
- 전환율 (클릭 대비 주문/신청 비율)
- 시간별/일별 트렌드
- 마케팅 동의 비율

### 10.7 실시간 데이터 연동
모든 데이터는 Supabase를 통해 실시간으로 수집되며, 별도 대시보드에서 즉시 확인 가능합니다.

### 10.8 데이터베이스 스키마 업데이트
새로운 데이터 구조를 위해 다음 SQL을 실행하세요:

```sql
-- 사전 주문 테이블 생성 (새로운 구조)
CREATE TABLE preorders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    marketing_opt_in BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 클릭 추적 테이블 생성 (새로운 구조)
CREATE TABLE preorder_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX idx_preorders_email ON preorders(email);
CREATE INDEX idx_preorders_service ON preorders(service);
CREATE INDEX idx_preorders_created_at ON preorders(created_at);
CREATE INDEX idx_preorder_clicks_service ON preorder_clicks(service);
CREATE INDEX idx_preorder_clicks_created_at ON preorder_clicks(created_at);

-- RLS 활성화
ALTER TABLE preorders ENABLE ROW LEVEL SECURITY;
ALTER TABLE preorder_clicks ENABLE ROW LEVEL SECURITY;

-- 공개 삽입 정책
CREATE POLICY "Anyone can insert preorders" ON preorders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert clicks" ON preorder_clicks
    FOR INSERT WITH CHECK (true);
``` 