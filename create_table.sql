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

-- 클릭 추적 테이블 생성
CREATE TABLE preorder_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service TEXT NOT NULL,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사전 주문 테이블 생성
CREATE TABLE preorders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service TEXT NOT NULL,
    email TEXT NOT NULL,
    marketing_opt_in BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 클릭 추적 테이블 인덱스
CREATE INDEX idx_preorder_clicks_service ON preorder_clicks(service);
CREATE INDEX idx_preorder_clicks_clicked_at ON preorder_clicks(clicked_at);

-- 사전 주문 테이블 인덱스
CREATE INDEX idx_preorders_service ON preorders(service);
CREATE INDEX idx_preorders_email ON preorders(email);
CREATE INDEX idx_preorders_created_at ON preorders(created_at);

-- 클릭 추적 테이블 RLS 활성화
ALTER TABLE preorder_clicks ENABLE ROW LEVEL SECURITY;

-- 사전 주문 테이블 RLS 활성화
ALTER TABLE preorders ENABLE ROW LEVEL SECURITY;

-- 클릭 추적 공개 삽입 정책
CREATE POLICY "Anyone can insert click tracking" ON preorder_clicks
    FOR INSERT WITH CHECK (true);

-- 사전 주문 공개 삽입 정책
CREATE POLICY "Anyone can insert preorders" ON preorders
    FOR INSERT WITH CHECK (true);

-- 관리자만 읽기 가능 정책 (클릭 추적)
CREATE POLICY "Only authenticated users can view click tracking" ON preorder_clicks
    FOR SELECT USING (auth.role() = 'authenticated');

-- 관리자만 읽기 가능 정책 (사전 주문)
CREATE POLICY "Only authenticated users can view preorders" ON preorders
    FOR SELECT USING (auth.role() = 'authenticated'); 