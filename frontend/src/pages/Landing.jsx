import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <>
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center min-h-[calc(100vh-4rem)]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3.5 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Prediksi Risiko Kesehatan Digital
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-[clamp(36px,4.2vw,54px)] font-extrabold leading-tight tracking-tight text-slate-900 mb-4">
            Seberapa Sehat <span className="bg-gradient-to-r from-indigo-500 to-indigo-400 bg-clip-text text-transparent">Gaya Hidup Digitalmu?</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-500 max-w-lg mb-8 leading-relaxed">
            Dari durasi main HP sebelum tidur sampai asupan kafein, VitaCheck memetakan seluruh kebiasaanmu menjadi satu skor kesehatan komprehensif. <strong className="text-slate-700">Mulai perbaiki gaya hidupmu hari ini.</strong>
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/predict"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-br from-indigo-500 to-indigo-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Cek Risiko Sekarang →
            </Link>
          </div>
          <p className="text-xs text-slate-400 flex items-start gap-2 mt-6">
            ⓘ Prototipe riset bukan alat diagnosis medis.
          </p>
        </div>

        {/* Wave Card */}
        <div className="bg-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-2xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400">Ritme 24 jam terakhir</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50/10 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Risiko Sedang
            </span>
          </div>
          <svg className="w-full h-32" viewBox="0 0 400 140" preserveAspectRatio="none">
            <defs>
              <linearGradient id="wf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4F5EFF" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#4F5EFF" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,85 C20,55 40,105 60,75 C80,45 100,90 120,65 C140,35 160,95 180,55 C200,15 220,100 240,70 C260,40 280,110 300,65 C320,25 340,95 360,60 C380,35 390,75 400,65" fill="none" stroke="#8A93FF" strokeWidth="2.5" />
            <path d="M0,85 C20,55 40,105 60,75 C80,45 100,90 120,65 C140,35 160,95 180,55 C200,15 220,100 240,70 C260,40 280,110 300,65 C320,25 340,95 360,60 C380,35 390,75 400,65 L400,140 L0,140 Z" fill="url(#wf)" />
            <line x1="0" y1="118" x2="400" y2="118" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <line x1="0" y1="78" x2="400" y2="78" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          </svg>
          <div className="flex justify-between text-[10px] text-slate-500 mt-0.5 px-1">
            <span>00.00</span><span>06.00</span><span>12.00</span><span>18.00</span><span>24.00</span>
          </div>
          <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            Lonjakan malam berkorelasi dengan <strong className="text-white">phone usage before sleep</strong> yang tinggi.
          </p>
        </div>
      </section>



      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-xl mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3.5 py-1.5 rounded-full mb-4">
            Cara Kerja
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Tiga langkah mudah
          </h2>
          <p className="text-slate-500 leading-relaxed">
            Cukup isi data gaya hidup harian, model machine learning akan memproses dan memberikan hasil prediksi beserta rekomendasi.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { num: '1', title: 'Isi Data Gaya Hidup', desc: 'Masukkan informasi kebiasaan harian Anda, seperti durasi screen time, pola tidur, dan tingkat stres.' },
            { num: '2', title: 'Sistem Menganalisis', desc: 'Sistem cerdas kami akan menganalisis data Anda berdasarkan pola yang telah dipelajari untuk melihat potensi risiko.' },
            { num: '3', title: 'Dapatkan Insight', desc: 'Lihat tingkat risiko kesehatan digital Anda beserta rekomendasi praktis untuk gaya hidup yang lebih sehat.' },
          ].map((s, i) => (
            <div key={s.num} className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 relative transition-all hover:shadow-lg hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base mb-4">
                {s.num}
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{s.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              {i < 2 && (
                <span className="hidden md:block absolute top-1/2 -right-3.5 -translate-y-1/2 text-slate-300 text-xl">
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-white border-t border-slate-200 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3.5 py-1.5 rounded-full mb-4">
              Fitur Sistem
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Apa yang bisa kamu lakukan
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, title: 'Prediksi Real-time', desc: 'Hasil prediksi muncul langsung saat kamu menggeser slider.' },
              { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, title: 'Skor Risiko 0–100', desc: 'Nilai numerik hasil weighted scoring dari 9 variabel gaya hidup.' },
              { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>, title: 'Faktor Berpengaruh', desc: 'Lihat variabel mana yang paling berkontribusi terhadap skor risiko.' },
              { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, title: 'Rekomendasi Preventif', desc: 'Saran kesehatan yang dipersonalisasi berdasarkan faktor risiko tertinggi.' },
            ].map((f) => (
              <div key={f.title} className="border border-slate-200 rounded-xl p-6 transition-all hover:shadow-md hover:-translate-y-0.5">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-4 text-lg">
                  {f.icon}
                </div>
                <h4 className="font-bold text-slate-900 mb-2">{f.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-2xl px-8 py-14 sm:py-16 text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Siap cek risiko kesehatan digitalmu?
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-lg mx-auto mb-6">
            Gratis, tanpa login. Cukup isi data gaya hidup harian dan dapatkan hasil prediksi dalam hitungan detik.
          </p>
          <Link
            to="/predict"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-indigo-700 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Mulai Cek Risiko →
          </Link>
        </div>
      </section>
    </>
  )
}
