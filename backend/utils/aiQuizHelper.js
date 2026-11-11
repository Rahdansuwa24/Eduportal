/**
 * Helper untuk Ekstraksi & Generasi Soal Kuis Otomatis dari Teks Dokumen (AI Quiz Generator)
 */

const generateQuestionsFromText = (rawText, targetCount = 5) => {
    if (!rawText || typeof rawText !== 'string') {
        return [];
    }

    // Normalisasi teks
    const cleanText = rawText
        .replace(/\r\n/g, '\n')
        .replace(/\t/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // Pecah teks menjadi kalimat-kalimat
    const sentenceDelimiters = /(?<=[.!?])\s+(?=[A-Z0-9"'])/;
    const rawSentences = cleanText.split(sentenceDelimiters)
        .map(s => s.trim())
        .filter(s => s.length >= 35 && s.length <= 300);

    // Filter kalimat yang memiliki bobot informasi konseptual
    const keywordsRegex = /\b(adalah|merupakan|yaitu|disebut|karena|berfungsi|tujuan|metode|prinsip|faktor|proses|hasil|sistem|peran|konsep|komponen|fungsi)\b/i;
    
    let candidateSentences = rawSentences.filter(s => keywordsRegex.test(s));
    if (candidateSentences.length < targetCount) {
        // Ambil kalimat lain yang cukup panjang jika kalimat dengan kata kunci kurang
        const additional = rawSentences.filter(s => !candidateSentences.includes(s));
        candidateSentences = [...candidateSentences, ...additional];
    }

    // Batasi target soal maksimal
    const selectedSentences = candidateSentences.slice(0, Math.max(targetCount, 3));
    const generatedQuestions = [];

    const letters = ['A', 'B', 'C', 'D'];

    selectedSentences.forEach((sentence, idx) => {
        let questionText = '';
        let correctAnswer = '';
        let distractors = [];

        // Pola 1: Definisi ("adalah" / "merupakan" / "yaitu")
        const defMatch = sentence.match(/(.+?)\s+(?:adalah|merupakan|yaitu)\s+(.+)/i);
        // Pola 2: Fungsi ("berfungsi untuk" / "bertujuan untuk")
        const funcMatch = sentence.match(/(.+?)\s+(?:berfungsi untuk|bertujuan untuk|berperan dalam)\s+(.+)/i);

        if (defMatch && defMatch[1].length < 60) {
            const subject = defMatch[1].replace(/^[,\-—\s]+/, '').trim();
            const definition = defMatch[2].replace(/[.;]$/, '').trim();

            questionText = `Berdasarkan teks materi, apa yang dimaksud dengan ${subject}?`;
            correctAnswer = capitalize(definition);
            distractors = [
                `Proses pemisahan komponen ${subject} tanpa melibatkan reaksi terpadu.`,
                `Metode alternatif yang mengabaikan fungsi fundamental dari ${subject}.`,
                `Kondisi statis di mana ${subject} tidak lagi memiliki pengaruh terhadap sistem.`
            ];
        } else if (funcMatch && funcMatch[1].length < 60) {
            const subject = funcMatch[1].replace(/^[,\-—\s]+/, '').trim();
            const functionClause = funcMatch[2].replace(/[.;]$/, '').trim();

            questionText = `Apa fungsi atau peran utama dari ${subject} sesuai penjelasan materi?`;
            correctAnswer = `Untuk ${functionClause}`;
            distractors = [
                `Mengurangi efisiensi kerja pada tahapan operasional sistem.`,
                `Menghentikan interaksi alami antara subsistem yang relevan.`,
                `Sebagai prosedur opsional yang hanya dilakukan saat kondisi darurat.`
            ];
        } else {
            // Pola umum: Pernyataan faktual
            const words = sentence.split(' ');
            const topicPhrase = words.slice(0, 4).join(' ').replace(/[,;:]$/, '');

            questionText = `Manakah pernyataan yang paling tepat terkait pembahasan "${topicPhrase}..." pada materi?`;
            correctAnswer = capitalize(sentence.replace(/[.;]$/, ''));
            distractors = [
                `Pernyataan tersebut hanya berlaku secara teoritis tanpa adanya validasi fakta.`,
                `Faktor di atas tidak memberikan pengaruh signifikan terhadap hasil akhir pembelajaran.`,
                `Konsep tersebut merupakan kebalikan dari prinsip kerja materi yang dibahas.`
            ];
        }

        // Acak posisi kunci jawaban (A, B, C, atau D)
        const targetIndex = idx % 4; // Distribusikan merata: A, B, C, D, A...
        const targetKey = letters[targetIndex];

        const optionsArray = [];
        let distractorIdx = 0;
        for (let i = 0; i < 4; i++) {
            if (i === targetIndex) {
                optionsArray.push(correctAnswer);
            } else {
                optionsArray.push(distractors[distractorIdx] || `Pilihan distraktor alternatif untuk ${questionText.slice(0, 20)}`);
                distractorIdx++;
            }
        }

        generatedQuestions.push({
            id: idx + 1,
            pertanyaan: `${idx + 1}. ${questionText}`,
            tipe_soal: 'pg',
            pilihan_a: optionsArray[0],
            pilihan_b: optionsArray[1],
            pilihan_c: optionsArray[2],
            pilihan_d: optionsArray[3],
            kunci_jawaban: targetKey
        });
    });

    // Jika teks sangat minim atau kurang dari 3 kalimat, lengkapi dengan soal konseptual umum
    while (generatedQuestions.length < 3) {
        const nextId = generatedQuestions.length + 1;
        const targetKey = letters[(nextId - 1) % 4];
        generatedQuestions.push({
            id: nextId,
            pertanyaan: `${nextId}. Berdasarkan keseluruhan ringkasan dokumen yang diunggah, apa kesimpulan inti yang dapat diambil?`,
            tipe_soal: 'pg',
            pilihan_a: targetKey === 'A' ? 'Materi memberikan pemahaman menyeluruh terhadap konsep inti yang dipelajari.' : 'Materi tidak memiliki korelasi langsung dengan kurikulum aktif.',
            pilihan_b: targetKey === 'B' ? 'Materi memberikan pemahaman menyeluruh terhadap konsep inti yang dipelajari.' : 'Seluruh teori yang disajikan telah digantikan oleh model pembelajaran baru.',
            pilihan_c: targetKey === 'C' ? 'Materi memberikan pemahaman menyeluruh terhadap konsep inti yang dipelajari.' : 'Dokumen hanya memuat catatan pendukung tanpa dasar konsep utama.',
            pilihan_d: targetKey === 'D' ? 'Materi memberikan pemahaman menyeluruh terhadap konsep inti yang dipelajari.' : 'Fokus materi terbatas pada evaluasi historis semata.',
            kunci_jawaban: targetKey
        });
    }

    return generatedQuestions;
};

const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

module.exports = {
    generateQuestionsFromText
};
