/**
 * QuizGeneratorAgent
 * Specialized AI Agent for extracting educational concepts and formulating
 * High-Order Thinking (HOTS) multiple-choice quizzes from documents.
 * 
 * Supports Multi-Provider Failover:
 * 1. Google Gemini Flash (Primary LLM)
 * 2. Groq Cloud Llama 3.3 70B (Secondary LLM Failover)
 * 3. Local Heuristic Concept Extractor (Tertiary Offline Fallback)
 */

const { generateQuestionsFromText } = require('../utils/aiQuizHelper');

class QuizGeneratorAgent {
    /**
     * Jalankan eksekusi agen pembuat kuis dengan failover cerdas
     */
    static async generateQuiz({ pdfText, questionCount = 5, documentName = 'Dokumen Materi', subjectName = '' }) {
        const cleanText = (pdfText || '').trim();
        const targetCount = parseInt(questionCount, 10) || 5;
        const fallbackTitle = `Kuis Evaluasi: ${documentName.replace(/\.pdf$/i, '')}`;

        console.log(`🤖 [QuizGeneratorAgent] Memulai perumusan ${targetCount} butir soal dari "${documentName}"...`);

        // -------------------------------------------------------------
        // STRATEGI 1: Google Gemini Flash (Primary LLM)
        // -------------------------------------------------------------
        if (process.env.GEMINI_API_KEY) {
            try {
                console.log('🤖 [QuizGeneratorAgent] Mencoba pemanggilan Agent via Google Gemini Flash...');
                const geminiResult = await this.callGeminiAPI(cleanText, targetCount, fallbackTitle, subjectName);
                if (geminiResult && geminiResult.questions && geminiResult.questions.length > 0) {
                    console.log(`✅ [QuizGeneratorAgent] Sukses dihasilkan oleh Google Gemini Flash (${geminiResult.questions.length} butir soal).`);
                    return {
                        success: true,
                        engine: 'Google Gemini 2.0 Flash',
                        provider: 'gemini',
                        suggested_title: geminiResult.suggested_title || fallbackTitle,
                        questions: geminiResult.questions
                    };
                }
            } catch (err) {
                console.warn(`⚠️ [QuizGeneratorAgent] Google Gemini gagal/limit (${err.message}). Mengalihkan ke provider cadangan...`);
            }
        } else {
            console.log('ℹ️ [QuizGeneratorAgent] GEMINI_API_KEY tidak terdeteksi, memeriksa provider Groq...');
        }

        // -------------------------------------------------------------
        // STRATEGI 2: Groq Cloud Llama 3.3 70B (Secondary Failover LLM)
        // -------------------------------------------------------------
        if (process.env.GROQ_API_KEY) {
            try {
                console.log('🤖 [QuizGeneratorAgent] Mencoba pemanggilan Agent via Groq Cloud (Llama 3.3 70B)...');
                const groqResult = await this.callGroqAPI(cleanText, targetCount, fallbackTitle, subjectName);
                if (groqResult && groqResult.questions && groqResult.questions.length > 0) {
                    console.log(`✅ [QuizGeneratorAgent] Sukses dihasilkan oleh Groq Cloud Llama 3.3 (${groqResult.questions.length} butir soal).`);
                    return {
                        success: true,
                        engine: 'Groq Cloud (Llama 3.3 70B)',
                        provider: 'groq',
                        suggested_title: groqResult.suggested_title || fallbackTitle,
                        questions: groqResult.questions
                    };
                }
            } catch (err) {
                console.warn(`⚠️ [QuizGeneratorAgent] Groq Cloud gagal/limit (${err.message}). Mengalihkan ke Fallback Lokal...`);
            }
        } else {
            console.log('ℹ️ [QuizGeneratorAgent] GROQ_API_KEY tidak terdeteksi, beralih ke Fallback Lokal...');
        }

        // -------------------------------------------------------------
        // STRATEGI 3: Local Heuristic Concept Extractor (Tertiary Fallback)
        // -------------------------------------------------------------
        console.log('🛡️ [QuizGeneratorAgent] Menggunakan Local Heuristic Concept Extractor (Offline Engine)...');
        const localQuestions = generateQuestionsFromText(cleanText, targetCount);
        return {
            success: true,
            engine: 'Local Heuristic Parser (Offline Fallback)',
            provider: 'local',
            suggested_title: fallbackTitle,
            questions: localQuestions
        };
    }

    /**
     * Tool: Pemanggilan API Google Gemini (Model Gemini 2.0 / 1.5 Flash)
     */
    static async callGeminiAPI(text, count, fallbackTitle, subjectName) {
        const apiKey = process.env.GEMINI_API_KEY;
        const prompt = this.buildPrompt(text, count, subjectName);

        // Prioritas Gemini 2.0 Flash, dengan fallback URL Gemini 1.5 Flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [
                {
                    role: 'user',
                    parts: [{ text: prompt }]
                }
            ],
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.3
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        const rawJsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawJsonText) {
            throw new Error('Respon Gemini tidak memuat teks konten JSON yang valid.');
        }

        const parsed = JSON.parse(rawJsonText);
        return this.sanitizeQuestions(parsed, fallbackTitle);
    }

    /**
     * Tool: Pemanggilan API Groq Cloud (Model Llama 3.3 70B Versatile)
     */
    static async callGroqAPI(text, count, fallbackTitle, subjectName) {
        const apiKey = process.env.GROQ_API_KEY;
        const prompt = this.buildPrompt(text, count, subjectName);

        const url = 'https://api.groq.com/openai/v1/chat/completions';

        const payload = {
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'Anda adalah Asisten Pakar Evaluasi Kurikulum Sekolah Indonesia. Anda menghasilkan output dalam format JSON murni tanpa markdown pembuka/penutup.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error('Respon Groq tidak memuat konten pesan yang valid.');
        }

        const parsed = JSON.parse(content);
        return this.sanitizeQuestions(parsed, fallbackTitle);
    }

    /**
     * Helper: Format Prompt Pedagogis untuk LLM
     */
    static buildPrompt(text, count, subjectName) {
        // Potong teks jika melebihi 40.000 karakter untuk efisiensi
        const truncated = text.length > 40000 ? text.substring(0, 40000) + '... [Teks dipotong]' : text;

        return `
Berdasarkan materi pembelajaran berikut, buatkan tepat ${count} butir soal pilihan ganda (Pilihan A, B, C, D) berbahasa Indonesia yang berkualitas tinggi, mendalam, dan relevan dengan materi${subjectName ? ` untuk mata pelajaran "${subjectName}"` : ''}.

ATURAN PEMBUATAN SOAL:
1. Soal harus menguji pemahaman konsep inti dan penalaran siswa.
2. Setiap butir soal harus memiliki 4 opsi pilihan: "pilihan_a", "pilihan_b", "pilihan_c", "pilihan_d".
3. Kunci jawaban harus jelas dan akurat: "A", "B", "C", atau "D".
4. Distribusikan kunci jawaban secara merata (jangan semua kunci di satu huruf yang sama).
5. Berikan saran judul kuis yang representatif pada "suggested_title".

WAJIB MENGEMBALIKAN OUTPUT DALAM STRUKTUR JSON SEPERTI CONTOH BERIKUT:
{
  "suggested_title": "Kuis Evaluasi: [Topik Utama]",
  "questions": [
    {
      "pertanyaan": "1. [Isi pertanyaan]",
      "pilihan_a": "[Opsi A]",
      "pilihan_b": "[Opsi B]",
      "pilihan_c": "[Opsi C]",
      "pilihan_d": "[Opsi D]",
      "kunci_jawaban": "A"
    }
  ]
}

--- BERKAS MATERI PEMBELAJARAN ---
${truncated}
`;
    }

    /**
     * Tool: Sanitasi & Validasi Output JSON Soal
     */
    static sanitizeQuestions(parsedData, fallbackTitle) {
        const rawList = Array.isArray(parsedData)
            ? parsedData
            : (parsedData.questions || parsedData.soal || []);

        const validKeys = ['A', 'B', 'C', 'D'];
        const sanitized = [];

        rawList.forEach((item, idx) => {
            if (!item.pertanyaan) return;

            let key = (item.kunci_jawaban || item.kunci || 'A').toString().trim().toUpperCase();
            if (!validKeys.includes(key)) {
                key = validKeys[idx % 4];
            }

            sanitized.push({
                id: idx + 1,
                pertanyaan: item.pertanyaan.replace(/^\d+[\.\)]\s*/, `${idx + 1}. `),
                tipe_soal: 'pg',
                pilihan_a: item.pilihan_a || item.a || 'Pilihan A',
                pilihan_b: item.pilihan_b || item.b || 'Pilihan B',
                pilihan_c: item.pilihan_c || item.c || 'Pilihan C',
                pilihan_d: item.pilihan_d || item.d || 'Pilihan D',
                kunci_jawaban: key
            });
        });

        return {
            suggested_title: parsedData.suggested_title || parsedData.judul || fallbackTitle,
            questions: sanitized
        };
    }
}

module.exports = QuizGeneratorAgent;
