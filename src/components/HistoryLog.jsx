export default function HistoryLog({ history, pets = [], onClear, onClose }) {
  const grouped = groupByDate(history)
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  function exportPDF() {
    const now = new Date().toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric' })
    const petRows = pets.map((p) => {
      const count = history.filter((h) => h.petId === p.id).length
      return `<tr>
        <td>${p.petName}</td><td>${p.routineName}</td>
        <td>${p.intervalDays}일</td><td>${p.lastDoneDate}</td>
        <td>${p.streak || 0}회</td><td>${count}회</td>
      </tr>`
    }).join('')

    const histRows = [...history]
      .sort((a,b) => b.createdAt - a.createdAt)
      .map((h) => `<tr>
        <td>${h.doneDate}</td><td>${h.petName}</td><td>${h.routineName}</td>
        <td style="color:#16a34a">${h.proofPhoto ? '📸 인증 완료' : '완료'}</td>
      </tr>`).join('')

    const html = `<!DOCTYPE html><html lang="ko"><head>
      <meta charset="UTF-8">
      <title>잔소리펫 투약 보고서</title>
      <style>
        body{font-family:-apple-system,sans-serif;padding:32px;color:#1f2937;max-width:800px;margin:0 auto}
        h1{color:#ec4899;margin-bottom:4px}
        .sub{color:#6b7280;font-size:13px;margin-bottom:28px}
        h2{font-size:15px;color:#374151;margin:24px 0 8px;border-bottom:2px solid #fce7f3;padding-bottom:4px}
        table{width:100%;border-collapse:collapse;font-size:13px}
        th{background:#fdf2f8;padding:8px 10px;text-align:left;font-weight:600;color:#6b7280}
        td{padding:7px 10px;border-bottom:1px solid #f3f4f6}
        tr:last-child td{border:none}
        .footer{margin-top:40px;font-size:11px;color:#9ca3af;text-align:center}
      </style>
    </head><body>
      <h1>🐾 잔소리펫 투약 보고서</h1>
      <p class="sub">출력일: ${now} | 총 기록 ${history.length}건</p>
      <h2>📋 현재 루틴 현황</h2>
      <table><thead><tr>
        <th>반려동물</th><th>루틴</th><th>주기</th><th>마지막 투약</th><th>연속</th><th>총 완료</th>
      </tr></thead><tbody>${petRows || '<tr><td colspan="6" style="color:#9ca3af">등록된 루틴 없음</td></tr>'}</tbody></table>
      <h2>📅 투약 상세 기록</h2>
      <table><thead><tr>
        <th>날짜</th><th>반려동물</th><th>루틴</th><th>인증</th>
      </tr></thead><tbody>${histRows || '<tr><td colspan="4" style="color:#9ca3af">기록 없음</td></tr>'}</tbody></table>
      <p class="footer">잔소리펫 (lgw7126.github.io/Claude-Nagging-pet-app) · 수의사 제출용</p>
    </body></html>`

    const win = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
    win.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-900">
      <header className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 px-5 py-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">📋 투약 기록</h2>
        <div className="flex items-center gap-3">
          {history.length > 0 && (
            <>
              <button
                onClick={exportPDF}
                className="text-sm font-semibold text-pink-500 hover:text-pink-600"
              >
                📄 PDF
              </button>
              <button
                onClick={() => { if (confirm('전체 기록을 삭제할까요?')) onClear() }}
                className="text-sm text-red-400 hover:text-red-500"
              >
                전체 삭제
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <span className="text-5xl">📭</span>
            <p className="text-gray-400 dark:text-gray-500">아직 완료한 루틴이 없어요</p>
          </div>
        ) : (
          dates.map((date) => (
            <div key={date}>
              <p className="mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                {formatDate(date)}
              </p>
              <div className="space-y-2">
                {grouped[date].map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-slate-800 px-4 py-3"
                  >
                    {entry.proofPhoto ? (
                      <img
                        src={entry.proofPhoto}
                        alt="완료 인증"
                        className="h-12 w-12 rounded-xl object-cover shrink-0 border border-gray-200 dark:border-slate-600"
                      />
                    ) : (
                      <span className="text-xl shrink-0">✅</span>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {entry.petName}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{entry.routineName}</p>
                    </div>
                    {entry.proofPhoto && (
                      <span className="ml-auto shrink-0 text-xs text-pink-400 font-semibold">📸 인증</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function groupByDate(history) {
  return history.reduce((acc, entry) => {
    const key = entry.doneDate
    if (!acc[key]) acc[key] = []
    acc[key].push(entry)
    return acc
  }, {})
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
}
