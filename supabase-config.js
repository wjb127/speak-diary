// Supabase 설정 파일
// 실제 사용 시 환경변수나 별도 설정 파일에서 관리하는 것을 권장합니다.

// Supabase 프로젝트 설정
const SUPABASE_CONFIG = {
    url: 'https://bzzjkcrbwwrqlumxigag.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6emprY3Jid3dycWx1bXhpZ2FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg4MTM0OTUsImV4cCI6MjA0NDM4OTQ5NX0.yuQ9Ofc-s2sSHcRSU2_p9ZtcIL0yracXfVa48ZlmUNY',
    
    // 테이블 설정
    tables: {
        betaSignups: 'beta_signups',
        preorderClicks: 'preorder_clicks',
        preorders: 'preorders'
    }
};

// Supabase 클라이언트 초기화 함수
function initializeSupabase() {
    if (typeof supabase === 'undefined') {
        console.error('Supabase 라이브러리가 로드되지 않았습니다.');
        return null;
    }
    
    return supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}

// 베타 신청 데이터 저장 함수
async function saveBetaSignup(email) {
    const client = initializeSupabase();
    if (!client) {
        throw new Error('Supabase 클라이언트 초기화 실패');
    }
    
    try {
        const { data, error } = await client
            .from(SUPABASE_CONFIG.tables.betaSignups)
            .insert([
                {
                    email: email,
                    created_at: new Date().toISOString(),
                    source: 'website',
                    status: 'pending'
                }
            ]);
        
        if (error) {
            throw error;
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('베타 신청 저장 오류:', error);
        throw error;
    }
}

// 중복 이메일 체크 함수
async function checkEmailExists(email) {
    const client = initializeSupabase();
    if (!client) {
        throw new Error('Supabase 클라이언트 초기화 실패');
    }
    
    try {
        const { data, error } = await client
            .from(SUPABASE_CONFIG.tables.betaSignups)
            .select('email')
            .eq('email', email)
            .limit(1);
        
        if (error) {
            throw error;
        }
        
        return data && data.length > 0;
    } catch (error) {
        console.error('이메일 중복 체크 오류:', error);
        throw error;
    }
}

// 베타 신청 통계 조회 함수 (관리자용)
async function getBetaSignupStats() {
    const client = initializeSupabase();
    if (!client) {
        throw new Error('Supabase 클라이언트 초기화 실패');
    }
    
    try {
        const { data, error } = await client
            .from(SUPABASE_CONFIG.tables.betaSignups)
            .select('*', { count: 'exact' });
        
        if (error) {
            throw error;
        }
        
        return {
            total: data.length,
            data: data
        };
    } catch (error) {
        console.error('베타 신청 통계 조회 오류:', error);
        throw error;
    }
}

// 클릭 추적 함수
async function trackClick(serviceName) {
    const client = initializeSupabase();
    if (!client) {
        throw new Error('Supabase 클라이언트 초기화 실패');
    }
    
    try {
        const { data, error } = await client
            .from(SUPABASE_CONFIG.tables.preorderClicks)
            .insert([
                {
                    service: serviceName,
                    clicked_at: new Date().toISOString()
                }
            ]);
        
        if (error) {
            throw error;
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('클릭 추적 저장 오류:', error);
        throw error;
    }
}

// 사전 주문 저장 함수
async function savePreorder(email, serviceName, marketingOptIn = false) {
    const client = initializeSupabase();
    if (!client) {
        throw new Error('Supabase 클라이언트 초기화 실패');
    }
    
    try {
        const { data, error } = await client
            .from(SUPABASE_CONFIG.tables.preorders)
            .insert([
                {
                    service: serviceName,
                    email: email,
                    marketing_opt_in: marketingOptIn,
                    created_at: new Date().toISOString()
                }
            ]);
        
        if (error) {
            throw error;
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('사전 주문 저장 오류:', error);
        throw error;
    }
}

// 사전 주문 중복 이메일 체크 함수
async function checkPreorderEmailExists(email, serviceName) {
    const client = initializeSupabase();
    if (!client) {
        throw new Error('Supabase 클라이언트 초기화 실패');
    }
    
    try {
        const { data, error } = await client
            .from(SUPABASE_CONFIG.tables.preorders)
            .select('email')
            .eq('email', email)
            .eq('service', serviceName)
            .limit(1);
        
        if (error) {
            throw error;
        }
        
        return data && data.length > 0;
    } catch (error) {
        console.error('사전 주문 이메일 중복 체크 오류:', error);
        throw error;
    }
}

// 클릭 통계 조회 함수 (관리자용)
async function getClickStats(serviceName = null) {
    const client = initializeSupabase();
    if (!client) {
        throw new Error('Supabase 클라이언트 초기화 실패');
    }
    
    try {
        let query = client
            .from(SUPABASE_CONFIG.tables.preorderClicks)
            .select('*', { count: 'exact' });
        
        if (serviceName) {
            query = query.eq('service', serviceName);
        }
        
        const { data, error } = await query;
        
        if (error) {
            throw error;
        }
        
        return {
            total: data.length,
            data: data
        };
    } catch (error) {
        console.error('클릭 통계 조회 오류:', error);
        throw error;
    }
}

// 사전 주문 통계 조회 함수 (관리자용)
async function getPreorderStats(serviceName = null) {
    const client = initializeSupabase();
    if (!client) {
        throw new Error('Supabase 클라이언트 초기화 실패');
    }
    
    try {
        let query = client
            .from(SUPABASE_CONFIG.tables.preorders)
            .select('*', { count: 'exact' });
        
        if (serviceName) {
            query = query.eq('service', serviceName);
        }
        
        const { data, error } = await query;
        
        if (error) {
            throw error;
        }
        
        return {
            total: data.length,
            data: data
        };
    } catch (error) {
        console.error('사전 주문 통계 조회 오류:', error);
        throw error;
    }
}

// 설정 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SUPABASE_CONFIG,
        initializeSupabase,
        saveBetaSignup,
        checkEmailExists,
        getBetaSignupStats,
        trackClick,
        savePreorder,
        checkPreorderEmailExists,
        getClickStats,
        getPreorderStats
    };
} 