require('dotenv').config();

async function checkGeminiModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('\n======================================================');
    console.log('🔍 [1] MENGECEK MODEL GOOGLE GEMINI (AI STUDIO)');
    console.log('======================================================');
    
    if (!apiKey) {
        console.log('❌ GEMINI_API_KEY belum diisi di file backend/.env');
        console.log('👉 Dapatkan key gratis di: https://aistudio.google.com/app/apikey');
        return;
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`HTTP ${res.status}: ${err}`);
        }

        const data = await res.json();
        const generateModels = (data.models || []).filter(m => 
            m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')
        );

        console.log(`✅ Berhasil terhubung! Ditemukan ${generateModels.length} model pembuat konten:`);
        console.log('------------------------------------------------------');
        
        generateModels.forEach(m => {
            const modelName = m.name.replace('models/', '');
            const isRecommended = ['gemini-2.0-flash', 'gemini-1.5-flash'].includes(modelName);
            const tag = isRecommended ? ' ⭐ [DIREKOMENDASIKAN (FREE TIER)]' : '';
            console.log(`• ${modelName}${tag}`);
            console.log(`  Keterangan : ${m.displayName || '-'}`);
            console.log(`  Batas Token: Max Input: ${m.inputTokenLimit || '-'} | Max Output: ${m.outputTokenLimit || '-'}\n`);
        });
    } catch (error) {
        console.error('❌ Gagal memeriksa model Gemini:', error.message);
    }
}

async function checkGroqModels() {
    const apiKey = process.env.GROQ_API_KEY;
    console.log('\n======================================================');
    console.log('🔍 [2] MENGECEK MODEL GROQ CLOUD');
    console.log('======================================================');

    if (!apiKey) {
        console.log('❌ GROQ_API_KEY belum diisi di file backend/.env');
        console.log('👉 Dapatkan key gratis di: https://console.groq.com/keys');
        return;
    }

    try {
        const url = 'https://api.groq.com/openai/v1/models';
        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`HTTP ${res.status}: ${err}`);
        }

        const data = await res.json();
        const activeModels = (data.data || []).filter(m => m.active !== false);

        console.log(`✅ Berhasil terhubung! Ditemukan ${activeModels.length} model aktif:`);
        console.log('------------------------------------------------------');

        activeModels.forEach(m => {
            const isRecommended = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'].includes(m.id);
            const tag = isRecommended ? ' ⭐ [DIREKOMENDASIKAN (FREE TIER)]' : '';
            console.log(`• ${m.id}${tag}`);
            console.log(`  Pengembang : ${m.owned_by || '-'}`);
            console.log(`  Context Win: ${m.context_window || '-'} tokens\n`);
        });
    } catch (error) {
        console.error('❌ Gagal memeriksa model Groq:', error.message);
    }
}

async function main() {
    console.log('🚀 Memulai Pemeriksaan Model AI Aktif dari file backend/.env...');
    await checkGeminiModels();
    await checkGroqModels();
    console.log('======================================================');
    console.log('Selesai. Anda dapat menyalin nama model di atas ke variabel');
    console.log('GEMINI_MODEL atau GROQ_MODEL di file backend/.env Anda.');
    console.log('======================================================\n');
}

main();
