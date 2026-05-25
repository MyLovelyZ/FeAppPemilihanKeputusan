import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col flex-1">
      {/* Hero */}
      <section className="flex flex-1 min-h-[calc(100vh-5rem)] items-center justify-center px-8">
        <div className="flex flex-col sm:flex-row items-center gap-10 sm:gap-16">
          <h1 className="text-[24px] leading-snug text-brand-blue text-center sm:text-left">
            Selamat datang,
            <br />
            kita disini untuk membantu
            <br />
            masa depan-mu.
          </h1>
          <Link
            href="/test"
            className="w-[200px] h-[80px] bg-brand-gradient text-white text-[24px] rounded-2xl flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
          >
            Mulai Test
          </Link>
        </div>
      </section>

      {/* Cards */}
      <section className="flex justify-center px-4 sm:px-8 pb-16 sm:pb-20">
        <div className="flex flex-col md:flex-row gap-5 w-full max-w-[960px]">
          {/* Left info card */}
          <div className="w-full md:w-[470px] min-h-[200px] md:h-[300px] text-brand-gradient rounded-2xl p-8 flex flex-col gap-6">
            <p className="text-[16px] leading-relaxed">
              Masih bingung pilih kuliah atau langsung kerja? Tenang, kamu nggak
              sendirian. Quiz ini dibuat buat bantu kamu lebih ngerti diri
              sendiri—mulai dari minat, tujuan, sampai kesiapan kamu ke
              depannya.
            </p>
            <p className="text-[16px] leading-relaxed">
              Lewat beberapa pertanyaan, kamu bakal dapet insight tentang
              pilihan yang paling cocok buat kamu saat ini. Ingat, ini bukan
              penentu masa depan kamu, tapi bisa jadi panduan biar kamu nggak
              asal pilih.
            </p>
          </div>

          {/* Right stacked test cards */}
          <div className="flex flex-col gap-5 w-full md:w-[470px]">
            <Link
              href="/test/jurusan"
              className="w-full h-[140px] bg-brand-gradient text-white rounded-2xl px-6 py-5 flex flex-col justify-between hover:opacity-90 transition-opacity"
            >
              <p className="text-[16px]">Tes Pemilihan Jurusan</p>
              <div className="flex items-end justify-between">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className="text-[16px]">Carilah takdir-mu →</span>
              </div>
            </Link>

            <Link
              href="/test/karir"
              className="w-full h-[140px] bg-brand-gradient text-white rounded-2xl px-6 py-5 flex flex-col justify-between hover:opacity-90 transition-opacity"
            >
              <p className="text-[16px]">Tes Pemilihan Karir</p>
              <div className="flex items-end justify-between">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                <span className="text-[16px]">Carilah takdir-mu →</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer — free-floating */}
      <div className="px-4 sm:px-[30px] pb-8 mt-auto">
        <footer className="w-full h-[170px] max-w-[1860px] mx-auto bg-brand-gradient text-white rounded-3xl flex items-center justify-center">
          <p className="text-2xl sm:text-3xl font-bold">
            footer content work in progress
          </p>
        </footer>
      </div>
    </main>
  );
}
