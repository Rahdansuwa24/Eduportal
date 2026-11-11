--
-- PostgreSQL database dump
--

\restrict 2YCwXqEVt6Be9dSFfzYXbl2vGG31UYn7jcoFrjgGZdoiURVco9eMCQ7FxFapKde

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.ujian DROP CONSTRAINT IF EXISTS ujian_mapel_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ujian DROP CONSTRAINT IF EXISTS ujian_guru_id_fkey;
ALTER TABLE IF EXISTS ONLY public.presensi DROP CONSTRAINT IF EXISTS presensi_siswa_id_fkey;
ALTER TABLE IF EXISTS ONLY public.presensi DROP CONSTRAINT IF EXISTS presensi_kurikulum_id_fkey;
ALTER TABLE IF EXISTS ONLY public.presensi DROP CONSTRAINT IF EXISTS presensi_diubah_oleh_guru_id_fkey;
ALTER TABLE IF EXISTS ONLY public.perizinan DROP CONSTRAINT IF EXISTS perizinan_siswa_id_fkey;
ALTER TABLE IF EXISTS ONLY public.perizinan DROP CONSTRAINT IF EXISTS perizinan_disetujui_oleh_guru_id_fkey;
ALTER TABLE IF EXISTS ONLY public.materi DROP CONSTRAINT IF EXISTS materi_mapel_id_fkey;
ALTER TABLE IF EXISTS ONLY public.materi DROP CONSTRAINT IF EXISTS materi_guru_id_fkey;
ALTER TABLE IF EXISTS ONLY public.kurikulum DROP CONSTRAINT IF EXISTS kurikulum_mapel_id_fkey;
ALTER TABLE IF EXISTS ONLY public.hasil_ujian DROP CONSTRAINT IF EXISTS hasil_ujian_ujian_id_fkey;
ALTER TABLE IF EXISTS ONLY public.hasil_ujian DROP CONSTRAINT IF EXISTS hasil_ujian_siswa_id_fkey;
ALTER TABLE IF EXISTS ONLY public.detail_soal DROP CONSTRAINT IF EXISTS detail_soal_ujian_id_fkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.ujian DROP CONSTRAINT IF EXISTS ujian_pkey;
ALTER TABLE IF EXISTS ONLY public.presensi DROP CONSTRAINT IF EXISTS presensi_pkey;
ALTER TABLE IF EXISTS ONLY public.perizinan DROP CONSTRAINT IF EXISTS perizinan_pkey;
ALTER TABLE IF EXISTS ONLY public.pengaturan_sekolah DROP CONSTRAINT IF EXISTS pengaturan_sekolah_pkey;
ALTER TABLE IF EXISTS ONLY public.materi DROP CONSTRAINT IF EXISTS materi_pkey;
ALTER TABLE IF EXISTS ONLY public.mapel DROP CONSTRAINT IF EXISTS mapel_pkey;
ALTER TABLE IF EXISTS ONLY public.mapel DROP CONSTRAINT IF EXISTS mapel_kode_mapel_key;
ALTER TABLE IF EXISTS ONLY public.kurikulum DROP CONSTRAINT IF EXISTS kurikulum_pkey;
ALTER TABLE IF EXISTS ONLY public.hasil_ujian DROP CONSTRAINT IF EXISTS hasil_ujian_pkey;
ALTER TABLE IF EXISTS ONLY public.detail_soal DROP CONSTRAINT IF EXISTS detail_soal_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.ujian ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.presensi ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.perizinan ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.pengaturan_sekolah ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.materi ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.mapel ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.kurikulum ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.hasil_ujian ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.detail_soal ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.ujian_id_seq;
DROP TABLE IF EXISTS public.ujian;
DROP SEQUENCE IF EXISTS public.presensi_id_seq;
DROP TABLE IF EXISTS public.presensi;
DROP SEQUENCE IF EXISTS public.perizinan_id_seq;
DROP TABLE IF EXISTS public.perizinan;
DROP SEQUENCE IF EXISTS public.pengaturan_sekolah_id_seq;
DROP TABLE IF EXISTS public.pengaturan_sekolah;
DROP SEQUENCE IF EXISTS public.materi_id_seq;
DROP TABLE IF EXISTS public.materi;
DROP SEQUENCE IF EXISTS public.mapel_id_seq;
DROP TABLE IF EXISTS public.mapel;
DROP SEQUENCE IF EXISTS public.kurikulum_id_seq;
DROP TABLE IF EXISTS public.kurikulum;
DROP SEQUENCE IF EXISTS public.hasil_ujian_id_seq;
DROP TABLE IF EXISTS public.hasil_ujian;
DROP SEQUENCE IF EXISTS public.detail_soal_id_seq;
DROP TABLE IF EXISTS public.detail_soal;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: detail_soal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.detail_soal (
    id integer NOT NULL,
    ujian_id integer,
    pertanyaan text NOT NULL,
    tipe_soal character varying(20) NOT NULL,
    pilihan_a text,
    pilihan_b text,
    pilihan_c text,
    pilihan_d text,
    kunci_jawaban text NOT NULL,
    CONSTRAINT detail_soal_tipe_soal_check CHECK (((tipe_soal)::text = ANY ((ARRAY['pg'::character varying, 'isian'::character varying])::text[])))
);


--
-- Name: detail_soal_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.detail_soal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: detail_soal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.detail_soal_id_seq OWNED BY public.detail_soal.id;


--
-- Name: hasil_ujian; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hasil_ujian (
    id integer NOT NULL,
    siswa_id integer,
    ujian_id integer,
    skor numeric(5,2) NOT NULL,
    semester integer NOT NULL,
    submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT hasil_ujian_semester_check CHECK (((semester >= 1) AND (semester <= 6)))
);


--
-- Name: hasil_ujian_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hasil_ujian_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hasil_ujian_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hasil_ujian_id_seq OWNED BY public.hasil_ujian.id;


--
-- Name: kurikulum; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kurikulum (
    id integer NOT NULL,
    mapel_id integer,
    hari character varying(15) NOT NULL,
    waktu_mulai time without time zone NOT NULL,
    waktu_selesai time without time zone NOT NULL,
    ruangan character varying(50) DEFAULT 'Kelas 10 IPA 1'::character varying,
    tahun_ajaran character varying(20) DEFAULT '2026/2027'::character varying,
    semester character varying(10) DEFAULT 'Ganjil'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT kurikulum_hari_check CHECK (((hari)::text = ANY ((ARRAY['Senin'::character varying, 'Selasa'::character varying, 'Rabu'::character varying, 'Kamis'::character varying, 'Jumat'::character varying, 'Sabtu'::character varying])::text[])))
);


--
-- Name: kurikulum_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.kurikulum_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: kurikulum_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.kurikulum_id_seq OWNED BY public.kurikulum.id;


--
-- Name: mapel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mapel (
    id integer NOT NULL,
    nama_mapel character varying(100) NOT NULL,
    kode_mapel character varying(20) NOT NULL,
    tingkat_kelas character varying(10) DEFAULT '10'::character varying NOT NULL,
    jurusan character varying(20) DEFAULT 'UMUM'::character varying NOT NULL,
    tipe_mapel character varying(20) DEFAULT 'wajib'::character varying NOT NULL,
    CONSTRAINT mapel_jurusan_check CHECK (((jurusan)::text = ANY ((ARRAY['IPA'::character varying, 'IPS'::character varying, 'UMUM'::character varying])::text[]))),
    CONSTRAINT mapel_tingkat_kelas_check CHECK (((tingkat_kelas)::text = ANY ((ARRAY['10'::character varying, '11'::character varying, '12'::character varying, 'semua'::character varying])::text[]))),
    CONSTRAINT mapel_tipe_mapel_check CHECK (((tipe_mapel)::text = ANY ((ARRAY['wajib'::character varying, 'peminatan'::character varying])::text[])))
);


--
-- Name: mapel_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mapel_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mapel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mapel_id_seq OWNED BY public.mapel.id;


--
-- Name: materi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.materi (
    id integer NOT NULL,
    guru_id integer,
    mapel_id integer,
    judul character varying(150) NOT NULL,
    file_path character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: materi_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.materi_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: materi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.materi_id_seq OWNED BY public.materi.id;


--
-- Name: pengaturan_sekolah; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pengaturan_sekolah (
    id integer NOT NULL,
    tahun_ajaran_aktif character varying(20) DEFAULT '2026/2027'::character varying NOT NULL,
    semester_aktif character varying(10) DEFAULT 'Ganjil'::character varying NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: pengaturan_sekolah_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pengaturan_sekolah_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pengaturan_sekolah_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pengaturan_sekolah_id_seq OWNED BY public.pengaturan_sekolah.id;


--
-- Name: perizinan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.perizinan (
    id integer NOT NULL,
    siswa_id integer,
    alasan character varying(50) NOT NULL,
    keterangan text,
    tanggal_mulai date NOT NULL,
    tanggal_selesai date NOT NULL,
    bukti_file_path character varying(255) NOT NULL,
    status_acc character varying(20) DEFAULT 'pending'::character varying,
    disetujui_oleh_guru_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    waktu_acc timestamp without time zone,
    CONSTRAINT perizinan_alasan_check CHECK (((alasan)::text = ANY ((ARRAY['sakit'::character varying, 'izin_keluarga'::character varying, 'lainnya'::character varying])::text[]))),
    CONSTRAINT perizinan_status_acc_check CHECK (((status_acc)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


--
-- Name: perizinan_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.perizinan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: perizinan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.perizinan_id_seq OWNED BY public.perizinan.id;


--
-- Name: presensi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.presensi (
    id integer NOT NULL,
    siswa_id integer,
    status character varying(20) DEFAULT 'alpa'::character varying NOT NULL,
    waktu_absen timestamp without time zone,
    is_late boolean DEFAULT false,
    diubah_oleh_guru_id integer,
    catatan_guru text,
    tanggal date DEFAULT CURRENT_DATE,
    kurikulum_id integer,
    CONSTRAINT presensi_status_check CHECK (((status)::text = ANY ((ARRAY['hadir'::character varying, 'izin'::character varying, 'alpa'::character varying, 'menunggu_acc'::character varying])::text[])))
);


--
-- Name: presensi_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.presensi_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: presensi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.presensi_id_seq OWNED BY public.presensi.id;


--
-- Name: ujian; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ujian (
    id integer NOT NULL,
    guru_id integer,
    mapel_id integer,
    judul_ujian character varying(150) NOT NULL,
    durasi_menit integer NOT NULL,
    status_acc character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    catatan_waka text,
    CONSTRAINT ujian_status_acc_check CHECK (((status_acc)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


--
-- Name: ujian_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ujian_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ujian_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ujian_id_seq OWNED BY public.ujian.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    nama character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    tingkat_kelas character varying(10) DEFAULT '10'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    jurusan character varying(20) DEFAULT NULL::character varying,
    tanggal_masuk date DEFAULT CURRENT_DATE,
    tanggal_lulus date,
    status_siswa character varying(20) DEFAULT 'aktif'::character varying,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'waka'::character varying, 'guru'::character varying, 'siswa'::character varying])::text[])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: detail_soal id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detail_soal ALTER COLUMN id SET DEFAULT nextval('public.detail_soal_id_seq'::regclass);


--
-- Name: hasil_ujian id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hasil_ujian ALTER COLUMN id SET DEFAULT nextval('public.hasil_ujian_id_seq'::regclass);


--
-- Name: kurikulum id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kurikulum ALTER COLUMN id SET DEFAULT nextval('public.kurikulum_id_seq'::regclass);


--
-- Name: mapel id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mapel ALTER COLUMN id SET DEFAULT nextval('public.mapel_id_seq'::regclass);


--
-- Name: materi id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materi ALTER COLUMN id SET DEFAULT nextval('public.materi_id_seq'::regclass);


--
-- Name: pengaturan_sekolah id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pengaturan_sekolah ALTER COLUMN id SET DEFAULT nextval('public.pengaturan_sekolah_id_seq'::regclass);


--
-- Name: perizinan id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.perizinan ALTER COLUMN id SET DEFAULT nextval('public.perizinan_id_seq'::regclass);


--
-- Name: presensi id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.presensi ALTER COLUMN id SET DEFAULT nextval('public.presensi_id_seq'::regclass);


--
-- Name: ujian id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ujian ALTER COLUMN id SET DEFAULT nextval('public.ujian_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: detail_soal; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.detail_soal (id, ujian_id, pertanyaan, tipe_soal, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban) FROM stdin;
1	1	Apa rumus Pythagoras untuk mencari sisi miring c pada segitiga siku-siku dengan sisi siku-siku a dan b?	pg	c² = a² + b²	c = a + b	c² = a² - b²	c = √(a - b)	A
2	1	Berapakah nilai dari fungsi trigonometri sin(30°)?	pg	0	1/2	1/2√2	1	B
3	1	Jika cos α = 1/2 dan sudut α berada di kuadran I, maka besar sudut α adalah...	pg	30°	45°	60°	90°	C
4	2	Sebuah balok bermassa 5 kg ditarik dengan gaya horizontal 20 N pada permukaan licin. Berapakah percepatan balok?	pg	2 m/s²	4 m/s²	5 m/s²	10 m/s²	B
5	2	Hukum Newton yang berbunyi: "Untuk setiap aksi selalu ada reaksi yang sama besar dan berlawanan arah" adalah...	pg	Hukum I Newton	Hukum II Newton	Hukum III Newton	Hukum Gravitasi Universal	C
6	3	Lembaga independen yang berwenang mengatur dan mengawasi kegiatan di sektor perbankan dan pasar modal di Indonesia adalah...	pg	Bank Indonesia	Otoritas Jasa Keuangan (OJK)	Kementerian Keuangan RI	Lembaga Penjamin Simpanan (LPS)	B
15	7	1. Sederhanakan (7/5) + (7/5) - (7/5).	pg	7/5	14/5	0	7	A
16	7	2. Hitung nilai 2 log 25 – 3 log 5 + log 20 (logaritma basis 10).	pg	5	2	4	3	B
17	7	3. Jika 2log3 = a dan 3log5 = b, maka 2log5 dapat ditulis sebagai …	pg	a²b	ab	(2/3) b	a + b	C
18	7	4. Jumlah akar-akar persamaan 2x² – 3x + 8 = 0 adalah …	pg	-1,5	1,5	3	-3	B
19	7	5. Tentukan himpunan penyelesaian pertaksiran 2x – 5 > 0.	pg	(2,5, ∞)	[2,5, ∞)	(2,5, ∞]	[2,5, ∞)	A
20	7	6. Harga satu pensil adalah … (dalam rupiah).	pg	1.200	900	700	800	D
21	7	7. Jika α dan β adalah akar‑akar persamaan x² – 5x + 6 = 0, maka nilai α·β adalah …	pg	3	4	6	5	C
22	7	8. Diskriminan (D) dari persamaan 3x² – 4x + 1 = 0 adalah …	pg	0	1	2	4	D
23	7	9. Himpunan penyelesaian sistem 2x + 3y = 7 dan 3x – 2y = 4 adalah …	pg	{2,5}	{2,1}	{2,7}	{2,-1}	B
24	7	10. Tentukan himpunan penyelesaian pertaksiran -1 < 2 – 3x < 8.	pg	[-2,-1]	(-2,1]	[-2,1)	(-2,1)	D
25	8	1. Berdasarkan teks materi, apa yang dimaksud dengan Bentuk yang paling sederhana dari ( 7 5)( 7 5) + −?	pg	....... a	Proses pemisahan komponen Bentuk yang paling sederhana dari ( 7 5)( 7 5) + − tanpa melibatkan reaksi terpadu.	Metode alternatif yang mengabaikan fungsi fundamental dari Bentuk yang paling sederhana dari ( 7 5)( 7 5) + −.	Kondisi statis di mana Bentuk yang paling sederhana dari ( 7 5)( 7 5) + − tidak lagi memiliki pengaruh terhadap sistem.	A
26	8	2. Berdasarkan teks materi, apa yang dimaksud dengan Nilai dari 2 ( 7 5) +?	pg	Proses pemisahan komponen Nilai dari 2 ( 7 5) + tanpa melibatkan reaksi terpadu.	..... a	Metode alternatif yang mengabaikan fungsi fundamental dari Nilai dari 2 ( 7 5) +.	Kondisi statis di mana Nilai dari 2 ( 7 5) + tidak lagi memiliki pengaruh terhadap sistem.	B
27	8	3. Manakah pernyataan yang paling tepat terkait pembahasan "Bentuk sederhana dari 3..." pada materi?	pg	Pernyataan tersebut hanya berlaku secara teoritis tanpa adanya validasi fakta.	Faktor di atas tidak memberikan pengaruh signifikan terhadap hasil akhir pembelajaran.	Bentuk sederhana dari 3 2 3 2 − + adalah...... a	Konsep tersebut merupakan kebalikan dari prinsip kerja materi yang dibahas.	C
28	8	4. Berdasarkan teks materi, apa yang dimaksud dengan Bentuk sederhana dari 3 3 2 3 6 2 + −?	pg	Proses pemisahan komponen Bentuk sederhana dari 3 3 2 3 6 2 + − tanpa melibatkan reaksi terpadu.	Metode alternatif yang mengabaikan fungsi fundamental dari Bentuk sederhana dari 3 3 2 3 6 2 + −.	Kondisi statis di mana Bentuk sederhana dari 3 3 2 3 6 2 + − tidak lagi memiliki pengaruh terhadap sistem.	...... a	D
29	8	5. Berdasarkan teks materi, apa yang dimaksud dengan Bentuk sederhana dari 7 2 2 3 6 24 6 a b c a b c − − − − −?	pg	.... a	Proses pemisahan komponen Bentuk sederhana dari 7 2 2 3 6 24 6 a b c a b c − − − − − tanpa melibatkan reaksi terpadu.	Metode alternatif yang mengabaikan fungsi fundamental dari Bentuk sederhana dari 7 2 2 3 6 24 6 a b c a b c − − − − −.	Kondisi statis di mana Bentuk sederhana dari 7 2 2 3 6 24 6 a b c a b c − − − − − tidak lagi memiliki pengaruh terhadap sistem.	A
30	8	6. Berdasarkan teks materi, apa yang dimaksud dengan Nilai dari 2 log 25 – 3 log 5 + log 20?	pg	Proses pemisahan komponen Nilai dari 2 log 25 – 3 log 5 + log 20 tanpa melibatkan reaksi terpadu.	...... a	Metode alternatif yang mengabaikan fungsi fundamental dari Nilai dari 2 log 25 – 3 log 5 + log 20.	Kondisi statis di mana Nilai dari 2 log 25 – 3 log 5 + log 20 tidak lagi memiliki pengaruh terhadap sistem.	B
31	8	7. Berdasarkan teks materi, apa yang dimaksud dengan Jika 2log 3 = a dan 3log 5 =b, maka nilai dari 2log 5?	pg	Proses pemisahan komponen Jika 2log 3 = a dan 3log 5 =b, maka nilai dari 2log 5 tanpa melibatkan reaksi terpadu.	Metode alternatif yang mengabaikan fungsi fundamental dari Jika 2log 3 = a dan 3log 5 =b, maka nilai dari 2log 5.	.... a. a2b c. ab2 b. ab d	Kondisi statis di mana Jika 2log 3 = a dan 3log 5 =b, maka nilai dari 2log 5 tidak lagi memiliki pengaruh terhadap sistem.	C
32	8	8. Manakah pernyataan yang paling tepat terkait pembahasan "Jika diketahui nilai dari..." pada materi?	pg	Pernyataan tersebut hanya berlaku secara teoritis tanpa adanya validasi fakta.	Faktor di atas tidak memberikan pengaruh signifikan terhadap hasil akhir pembelajaran.	Konsep tersebut merupakan kebalikan dari prinsip kerja materi yang dibahas.	Jika diketahui nilai dari log 4,238 = 0,6272 maka nilai dari log 423.800 adalah .... a	D
33	8	9. Berdasarkan teks materi, apa yang dimaksud dengan Nilai b pada persamaan kuadrat 2x2 = 3x – 8?	pg	.... a	Proses pemisahan komponen Nilai b pada persamaan kuadrat 2x2 = 3x – 8 tanpa melibatkan reaksi terpadu.	Metode alternatif yang mengabaikan fungsi fundamental dari Nilai b pada persamaan kuadrat 2x2 = 3x – 8.	Kondisi statis di mana Nilai b pada persamaan kuadrat 2x2 = 3x – 8 tidak lagi memiliki pengaruh terhadap sistem.	A
34	8	10. Manakah pernyataan yang paling tepat terkait pembahasan "Himpunan penyelesaian dari persamaan..." pada materi?	pg	Pernyataan tersebut hanya berlaku secara teoritis tanpa adanya validasi fakta.	Himpunan penyelesaian dari persamaan kuadrat x2 – 5x + 6 = 0 adalah .... a. {2,4} c. {2,5} b. {3,5} d. {2,3} 11	Faktor di atas tidak memberikan pengaruh signifikan terhadap hasil akhir pembelajaran.	Konsep tersebut merupakan kebalikan dari prinsip kerja materi yang dibahas.	B
\.


--
-- Data for Name: hasil_ujian; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hasil_ujian (id, siswa_id, ujian_id, skor, semester, submitted_at) FROM stdin;
1	4	\N	78.50	1	2026-08-09 15:07:19.615384
2	4	\N	82.00	2	2026-08-09 15:07:19.615384
3	4	\N	80.00	3	2026-08-09 15:07:19.615384
4	4	\N	88.50	4	2026-08-09 15:07:19.615384
5	4	\N	91.00	5	2026-08-09 15:07:19.615384
6	4	\N	95.00	6	2026-08-09 15:07:19.615384
8	4	1	100.00	1	2026-11-11 12:57:17.570343
9	4	8	10.00	1	2026-11-11 13:07:08.029506
10	5	\N	72.00	1	2026-11-11 13:22:52.14456
11	5	\N	76.50	2	2026-11-11 13:22:52.14456
12	5	\N	81.00	3	2026-11-11 13:22:52.14456
13	5	\N	84.50	4	2026-11-11 13:22:52.14456
14	5	\N	87.00	5	2026-11-11 13:22:52.14456
15	5	\N	90.00	6	2026-11-11 13:22:52.14456
\.


--
-- Data for Name: kurikulum; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.kurikulum (id, mapel_id, hari, waktu_mulai, waktu_selesai, ruangan, tahun_ajaran, semester, created_at) FROM stdin;
5	1	Senin	07:30:00	09:00:00	Ruang 10 IPA 1	2026/2027	Ganjil	2026-11-11 13:22:52.109009
6	6	Senin	09:15:00	10:45:00	Ruang 10 IPA 1	2026/2027	Ganjil	2026-11-11 13:22:52.112978
7	2	Senin	07:30:00	09:00:00	Lab Fisika	2026/2027	Ganjil	2026-11-11 13:22:52.115571
8	7	Selasa	07:30:00	09:00:00	Lab Bahasa	2026/2027	Ganjil	2026-11-11 13:22:52.116638
9	8	Selasa	09:15:00	10:45:00	Lab Komputer 1	2026/2027	Ganjil	2026-11-11 13:22:52.117701
10	10	Selasa	07:30:00	09:00:00	Lab Biologi	2026/2027	Ganjil	2026-11-11 13:22:52.118863
11	1	Rabu	07:30:00	09:00:00	Ruang 10 IPA 1	2026/2027	Ganjil	2026-11-11 13:22:52.120096
12	6	Rabu	09:15:00	10:45:00	Ruang 10 IPA 1	2026/2027	Ganjil	2026-11-11 13:22:52.121081
13	11	Rabu	07:30:00	09:00:00	Ruang 11 IPS 1	2026/2027	Ganjil	2026-11-11 13:22:52.12213
14	3	Rabu	11:00:00	12:30:00	Ruang 12 IPS 2	2026/2027	Ganjil	2026-11-11 13:22:52.123145
15	8	Kamis	07:30:00	09:00:00	Lab Komputer 2	2026/2027	Ganjil	2026-11-11 13:22:52.124185
16	7	Kamis	09:15:00	10:45:00	Ruang 10 IPA 1	2026/2027	Ganjil	2026-11-11 13:22:52.125284
17	12	Kamis	07:30:00	09:00:00	Ruang 11 IPS 2	2026/2027	Ganjil	2026-11-11 13:22:52.126428
18	1	Jumat	07:30:00	09:00:00	Ruang 10 IPA 1	2026/2027	Ganjil	2026-11-11 13:22:52.127548
19	6	Jumat	09:15:00	10:45:00	Ruang 10 IPA 1	2026/2027	Ganjil	2026-11-11 13:22:52.128707
20	13	Jumat	07:30:00	09:00:00	Ruang 12 IPA 1	2026/2027	Ganjil	2026-11-11 13:22:52.129796
21	8	Sabtu	08:00:00	09:30:00	Lab Komputer	2026/2027	Ganjil	2026-11-11 13:22:52.130813
22	10	Sabtu	08:00:00	09:30:00	Lab Biologi	2026/2027	Ganjil	2026-11-11 13:22:52.131787
\.


--
-- Data for Name: mapel; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mapel (id, nama_mapel, kode_mapel, tingkat_kelas, jurusan, tipe_mapel) FROM stdin;
4	Biologi XI	BIO-21	11	IPA	peminatan
1	Matematika Wajib X	MTK-10-W	10	UMUM	wajib
6	Bahasa Indonesia X	BIN-10-W	10	UMUM	wajib
7	Bahasa Inggris X	ENG-10-W	10	UMUM	wajib
8	Informatika X	INF-10-P	10	UMUM	peminatan
2	Fisika Peminatan XI	FIS-11-P	11	IPA	peminatan
10	Biologi Peminatan XI	BIO-11-P	11	IPA	peminatan
11	Ekonomi Peminatan XI	EKO-11-P	11	IPS	peminatan
12	Sosiologi Peminatan XI	SOS-11-P	11	IPS	peminatan
13	Matematika Lanjut XII	MTK-12-P	12	IPA	peminatan
3	Ekonomi Peminatan XII	EKO-12-P	12	IPS	peminatan
\.


--
-- Data for Name: materi; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.materi (id, guru_id, mapel_id, judul, file_path, created_at) FROM stdin;
2	3	1	bab 2 : dasar aritmatika	uploads/materi/materi-1794376969985-579494633.pdf	2026-11-11 13:02:50.11756
\.


--
-- Data for Name: pengaturan_sekolah; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pengaturan_sekolah (id, tahun_ajaran_aktif, semester_aktif, updated_at) FROM stdin;
1	2026/2027	Ganjil	2026-11-11 13:22:45.654713
\.


--
-- Data for Name: perizinan; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.perizinan (id, siswa_id, alasan, keterangan, tanggal_mulai, tanggal_selesai, bukti_file_path, status_acc, disetujui_oleh_guru_id, created_at, waktu_acc) FROM stdin;
2	4	izin_keluarga	kakak menikah	2026-11-11	2026-11-12	uploads/perizinan/1794368190507-6146859.pdf	approved	3	2026-11-11 10:36:31.244368	2026-11-11 10:36:31.244368
3	4	izin_keluarga	Menghadiri acara pernikahan kakak kandung di luar kota	2026-11-10	2026-11-11	uploads/surat_izin_siti.pdf	approved	3	2026-11-11 13:22:52.153517	2026-11-11 11:22:52.153517
4	5	sakit	Demam tinggi dan flu berat, istirahat atas anjuran dokter	2026-11-11	2026-11-13	uploads/surat_sakit_ahmad.pdf	pending	\N	2026-11-11 13:22:52.161684	\N
5	16	lainnya	Mengikuti seleksi Olimpiade Sains Nasional (OSN) tingkat kota	2026-11-08	2026-11-09	uploads/surat_tugas_osn.pdf	approved	3	2026-11-11 13:22:52.164583	2026-11-08 13:22:52.164583
\.


--
-- Data for Name: presensi; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.presensi (id, siswa_id, status, waktu_absen, is_late, diubah_oleh_guru_id, catatan_guru, tanggal, kurikulum_id) FROM stdin;
1	6	alpa	2026-08-09 17:00:19.343534	t	\N	\N	2026-08-09	\N
5	4	hadir	2026-11-10 13:22:52.167392	f	\N	Hadir tepat waktu dan aktif berdiskusi	2026-11-10	8
6	4	hadir	2026-11-09 13:47:52.168869	t	\N	Terlambat 25 menit karena kendala transportasi	2026-11-09	5
7	5	izin	2026-11-11 13:22:52.170038	f	\N	Izin sakit berdasarkan surat dokter	2026-11-11	11
8	16	hadir	2026-11-11 12:22:52.171152	f	\N	Hadir lengkap	2026-11-11	11
\.


--
-- Data for Name: ujian; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ujian (id, guru_id, mapel_id, judul_ujian, durasi_menit, status_acc, created_at, catatan_waka) FROM stdin;
2	3	2	Ulangan Harian - Hukum Newton & Dinamika Gerak	60	pending	2026-11-08 20:03:49.302662	\N
3	3	3	UTS Gasal - Ekonomi Pembangunan & Pasar Modal	90	approved	2026-11-06 20:03:49.305377	Soal telah disetujui sesuai dengan capaian pembelajaran kurikulum semester ganjil.
1	3	1	Kuis Bab 2 - Trigonometri & Geometri Analitik	45	approved	2026-11-09 18:03:49.216123	Diverifikasi langsung oleh Waka Kurikulum.
8	3	1	Kuis Evaluasi: soal-ujian-kelas-10	45	approved	2026-11-11 13:06:02.790456	Disetujui oleh Waka Kurikulum
7	3	1	Kuis Evaluasi: Materi Matematika Kelas X	45	approved	2026-11-11 13:04:09.194066	Disetujui oleh Waka Kurikulum
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, nama, email, password_hash, role, tingkat_kelas, is_active, created_at, jurusan, tanggal_masuk, tanggal_lulus, status_siswa) FROM stdin;
6	Mahesa Narasinghamurti	mashisa@sekolah.sch.id	$2b$10$EonEHnOuY6FVQD9LiELKve94fk4n9LQ6nw/WCz10u83p2q7IyRBCi	siswa	10	t	2026-08-09 16:57:39.647823	\N	2026-09-07	\N	aktif
1	Admin Utama	admin@sekolah.sch.id	$2b$10$LIPRJmUsSllu4k7oDUxie.aXEC.gk0mPk5aQoRABXBt4sUyAYZI/G	admin	staff	t	2026-08-09 15:07:19.606386	\N	2026-09-07	\N	aktif
2	Waka Kurikulum	waka@sekolah.sch.id	$2b$10$LIPRJmUsSllu4k7oDUxie.aXEC.gk0mPk5aQoRABXBt4sUyAYZI/G	waka	staff	t	2026-08-09 15:07:19.606386	\N	2026-09-07	\N	aktif
3	Pak Budi (Guru Math)	budi@sekolah.sch.id	$2b$10$LIPRJmUsSllu4k7oDUxie.aXEC.gk0mPk5aQoRABXBt4sUyAYZI/G	guru	staff	t	2026-08-09 15:07:19.606386	\N	2026-09-07	\N	aktif
10	Ibu Sri Wahyuni (Guru Bahasa)	sri@sekolah.sch.id	$2b$10$ZzRUnxgPRCpd3gKVsgsjQeCT5xxH.m4ISOSzG30SuMiseRzHbYmTe	guru	staff	t	2026-11-11 13:22:52.036079	\N	2026-11-11	\N	aktif
11	Pak Hendra (Guru Fisika)	hendra@sekolah.sch.id	$2b$10$ZzRUnxgPRCpd3gKVsgsjQeCT5xxH.m4ISOSzG30SuMiseRzHbYmTe	guru	staff	t	2026-11-11 13:22:52.040882	\N	2026-11-11	\N	aktif
12	Ibu Rina Marlina (Guru Biologi)	rina@sekolah.sch.id	$2b$10$ZzRUnxgPRCpd3gKVsgsjQeCT5xxH.m4ISOSzG30SuMiseRzHbYmTe	guru	staff	t	2026-11-11 13:22:52.042867	\N	2026-11-11	\N	aktif
4	Siti Rahma (Siswa Kelas 10)	siti@sekolah.sch.id	$2b$10$LIPRJmUsSllu4k7oDUxie.aXEC.gk0mPk5aQoRABXBt4sUyAYZI/G	siswa	10	t	2026-08-09 15:07:19.606386	UMUM	2026-09-07	\N	aktif
5	Ahmad Fauzi (Siswa Kelas 10)	ahmad@sekolah.sch.id	$2b$10$LIPRJmUsSllu4k7oDUxie.aXEC.gk0mPk5aQoRABXBt4sUyAYZI/G	siswa	10	t	2026-08-09 15:07:19.606386	UMUM	2026-09-07	\N	aktif
15	Bella Safitri (Siswa Kelas 10)	bella@sekolah.sch.id	$2b$10$ZzRUnxgPRCpd3gKVsgsjQeCT5xxH.m4ISOSzG30SuMiseRzHbYmTe	siswa	10	t	2026-11-11 13:22:52.049471	UMUM	2026-11-11	\N	aktif
16	Rizky Pratama (Siswa Kelas 11 IPA)	rizky@sekolah.sch.id	$2b$10$ZzRUnxgPRCpd3gKVsgsjQeCT5xxH.m4ISOSzG30SuMiseRzHbYmTe	siswa	11	t	2026-11-11 13:22:52.052023	IPA	2026-11-11	\N	aktif
17	Dewi Lestari (Siswa Kelas 11 IPS)	dewi@sekolah.sch.id	$2b$10$ZzRUnxgPRCpd3gKVsgsjQeCT5xxH.m4ISOSzG30SuMiseRzHbYmTe	siswa	11	t	2026-11-11 13:22:52.053664	IPS	2026-11-11	\N	aktif
18	Bagas Saputra (Siswa Kelas 12 IPA)	bagas@sekolah.sch.id	$2b$10$ZzRUnxgPRCpd3gKVsgsjQeCT5xxH.m4ISOSzG30SuMiseRzHbYmTe	siswa	12	t	2026-11-11 13:22:52.05535	IPA	2026-11-11	\N	aktif
19	Nadia Putri (Siswa Kelas 12 IPS)	nadia@sekolah.sch.id	$2b$10$ZzRUnxgPRCpd3gKVsgsjQeCT5xxH.m4ISOSzG30SuMiseRzHbYmTe	siswa	12	t	2026-11-11 13:22:52.056982	IPS	2026-11-11	\N	aktif
20	Candra Kusuma (Alumni Berprestasi)	candra@sekolah.sch.id	$2b$10$ZzRUnxgPRCpd3gKVsgsjQeCT5xxH.m4ISOSzG30SuMiseRzHbYmTe	siswa	12	t	2026-11-11 13:22:52.05836	IPA	2026-11-11	\N	lulus
\.


--
-- Name: detail_soal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.detail_soal_id_seq', 34, true);


--
-- Name: hasil_ujian_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.hasil_ujian_id_seq', 15, true);


--
-- Name: kurikulum_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.kurikulum_id_seq', 22, true);


--
-- Name: mapel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mapel_id_seq', 24, true);


--
-- Name: materi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.materi_id_seq', 2, true);


--
-- Name: pengaturan_sekolah_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pengaturan_sekolah_id_seq', 1, false);


--
-- Name: perizinan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.perizinan_id_seq', 5, true);


--
-- Name: presensi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.presensi_id_seq', 8, true);


--
-- Name: ujian_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ujian_id_seq', 8, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 34, true);


--
-- Name: detail_soal detail_soal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detail_soal
    ADD CONSTRAINT detail_soal_pkey PRIMARY KEY (id);


--
-- Name: hasil_ujian hasil_ujian_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hasil_ujian
    ADD CONSTRAINT hasil_ujian_pkey PRIMARY KEY (id);


--
-- Name: kurikulum kurikulum_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kurikulum
    ADD CONSTRAINT kurikulum_pkey PRIMARY KEY (id);


--
-- Name: mapel mapel_kode_mapel_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mapel
    ADD CONSTRAINT mapel_kode_mapel_key UNIQUE (kode_mapel);


--
-- Name: mapel mapel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mapel
    ADD CONSTRAINT mapel_pkey PRIMARY KEY (id);


--
-- Name: materi materi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materi
    ADD CONSTRAINT materi_pkey PRIMARY KEY (id);


--
-- Name: pengaturan_sekolah pengaturan_sekolah_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pengaturan_sekolah
    ADD CONSTRAINT pengaturan_sekolah_pkey PRIMARY KEY (id);


--
-- Name: perizinan perizinan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.perizinan
    ADD CONSTRAINT perizinan_pkey PRIMARY KEY (id);


--
-- Name: presensi presensi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.presensi
    ADD CONSTRAINT presensi_pkey PRIMARY KEY (id);


--
-- Name: ujian ujian_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ujian
    ADD CONSTRAINT ujian_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: detail_soal detail_soal_ujian_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detail_soal
    ADD CONSTRAINT detail_soal_ujian_id_fkey FOREIGN KEY (ujian_id) REFERENCES public.ujian(id) ON DELETE CASCADE;


--
-- Name: hasil_ujian hasil_ujian_siswa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hasil_ujian
    ADD CONSTRAINT hasil_ujian_siswa_id_fkey FOREIGN KEY (siswa_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: hasil_ujian hasil_ujian_ujian_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hasil_ujian
    ADD CONSTRAINT hasil_ujian_ujian_id_fkey FOREIGN KEY (ujian_id) REFERENCES public.ujian(id) ON DELETE CASCADE;


--
-- Name: kurikulum kurikulum_mapel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kurikulum
    ADD CONSTRAINT kurikulum_mapel_id_fkey FOREIGN KEY (mapel_id) REFERENCES public.mapel(id) ON DELETE CASCADE;


--
-- Name: materi materi_guru_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materi
    ADD CONSTRAINT materi_guru_id_fkey FOREIGN KEY (guru_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: materi materi_mapel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materi
    ADD CONSTRAINT materi_mapel_id_fkey FOREIGN KEY (mapel_id) REFERENCES public.mapel(id) ON DELETE CASCADE;


--
-- Name: perizinan perizinan_disetujui_oleh_guru_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.perizinan
    ADD CONSTRAINT perizinan_disetujui_oleh_guru_id_fkey FOREIGN KEY (disetujui_oleh_guru_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: perizinan perizinan_siswa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.perizinan
    ADD CONSTRAINT perizinan_siswa_id_fkey FOREIGN KEY (siswa_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: presensi presensi_diubah_oleh_guru_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.presensi
    ADD CONSTRAINT presensi_diubah_oleh_guru_id_fkey FOREIGN KEY (diubah_oleh_guru_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: presensi presensi_kurikulum_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.presensi
    ADD CONSTRAINT presensi_kurikulum_id_fkey FOREIGN KEY (kurikulum_id) REFERENCES public.kurikulum(id) ON DELETE CASCADE;


--
-- Name: presensi presensi_siswa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.presensi
    ADD CONSTRAINT presensi_siswa_id_fkey FOREIGN KEY (siswa_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ujian ujian_guru_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ujian
    ADD CONSTRAINT ujian_guru_id_fkey FOREIGN KEY (guru_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ujian ujian_mapel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ujian
    ADD CONSTRAINT ujian_mapel_id_fkey FOREIGN KEY (mapel_id) REFERENCES public.mapel(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 2YCwXqEVt6Be9dSFfzYXbl2vGG31UYn7jcoFrjgGZdoiURVco9eMCQ7FxFapKde

