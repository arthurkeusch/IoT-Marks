<template>
  <div class="page">
    <div class="header">
      <div class="title">
        <h1>IoT-Marks</h1>
        <p>Units · rankings · averages</p>
      </div>
    </div>

    <div class="accordion">
      <section class="acc-item">
        <button class="acc-trigger" type="button" @click="toggleOpen(ALL_ID)" :aria-expanded="isOpen(ALL_ID)">
          <span class="acc-left">
            <span class="acc-badge">Overview</span>
            <span class="acc-label">Overall averages</span>
          </span>
          <span class="acc-right">
            <span class="acc-meta">{{ allRowsSorted.length }} students</span>
            <span class="acc-chevron" :class="{ open: isOpen(ALL_ID) }">
              <svg class="icon" viewBox="0 0 16 16" aria-hidden="true">
                <path
                    fill="currentColor"
                    d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                />
              </svg>
            </span>
          </span>
        </button>

        <div class="acc-panel" v-show="isOpen(ALL_ID)">
          <div class="table-wrap">
            <table class="table">
              <thead>
              <tr>
                <th class="col-rank sticky-left">#</th>
                <th class="col-student sticky-left-2">Student</th>

                <th v-for="ue in normalizedUes" :key="ue.id" class="col-exam">
                  <div class="th-top">
                    <div class="th-title">
                      <div class="th-name">{{ ue.label }}</div>
                      <div class="th-sub">Unit average</div>
                    </div>
                    <div class="th-sort">
                      <button
                          class="sort-btn"
                          type="button"
                          @click="toggleAllSort(ue.id)"
                          :class="sortBtnClass(allSortState(ue.id))"
                          :aria-label="'Sort by ' + ue.label"
                      >
                        <SortIcon :state="allSortState(ue.id)" />
                      </button>
                    </div>
                  </div>
                </th>

                <th class="col-avg">
                  <div class="th-top">
                    <div class="th-title">
                      <div class="th-name">Overall average</div>
                      <div class="th-sub">Units (equal weight)</div>
                    </div>
                    <div class="th-sort">
                      <button
                          class="sort-btn"
                          type="button"
                          @click="toggleAllSort(ALL_AVG_KEY)"
                          :class="sortBtnClass(allSortState(ALL_AVG_KEY))"
                          aria-label="Sort by overall average"
                      >
                        <SortIcon :state="allSortState(ALL_AVG_KEY)" />
                      </button>
                    </div>
                  </div>
                </th>
              </tr>
              </thead>

              <tbody>
              <tr v-for="(row, idx) in allRowsSorted" :key="row.studentId">
                <td class="col-rank sticky-left">{{ idx + 1 }}</td>
                <td class="col-student sticky-left-2">
                  <div class="student">
                    <div class="student-id">{{ row.studentId }}</div>
                    <div class="student-name" v-if="studentName(row.studentId)">{{ studentName(row.studentId) }}</div>
                  </div>
                </td>

                <td v-for="ue in normalizedUes" :key="ue.id" class="cell">
                  <span :class="['badge', row.ueAvg[ue.id] == null ? 'muted' : '']">{{ fmt(row.ueAvg[ue.id]) }}</span>
                </td>

                <td class="cell avg-cell">
                  <span :class="['badge', row.globalAvg == null ? 'muted' : '']">{{ fmt(row.globalAvg) }}</span>
                </td>
              </tr>

              <tr v-if="allRowsSorted.length === 0">
                <td :colspan="2 + normalizedUes.length + 1" class="empty">No data to display.</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section v-for="ue in normalizedUes" :key="ue.id" class="acc-item">
        <button class="acc-trigger" type="button" @click="toggleOpen(ue.id)" :aria-expanded="isOpen(ue.id)">
          <span class="acc-left">
            <span class="acc-badge">Unit</span>
            <span class="acc-label">{{ ue.label }}</span>
          </span>
          <span class="acc-right">
            <span class="acc-meta">{{ ue.rowsSorted.length }} students · {{ ue.exams.length }} exams</span>
            <span class="acc-chevron" :class="{ open: isOpen(ue.id) }">
              <svg class="icon" viewBox="0 0 16 16" aria-hidden="true">
                <path
                    fill="currentColor"
                    d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                />
              </svg>
            </span>
          </span>
        </button>

        <div class="acc-panel" v-show="isOpen(ue.id)">
          <div class="table-wrap">
            <table class="table">
              <thead>
              <tr>
                <th class="col-rank sticky-left">#</th>
                <th class="col-student sticky-left-2">Student</th>

                <th v-for="exam in ue.exams" :key="exam.id" class="col-exam">
                  <div class="th-top">
                    <div class="th-title">
                      <div class="th-name">{{ exam.label }}</div>
                      <div class="th-sub">coef {{ exam.coef }}</div>
                    </div>
                    <div class="th-sort">
                      <button
                          class="sort-btn"
                          type="button"
                          @click="toggleUeSort(ue.id, exam.id)"
                          :class="sortBtnClass(ueSortState(ue.id, exam.id))"
                          :aria-label="'Sort by ' + exam.label"
                      >
                        <SortIcon :state="ueSortState(ue.id, exam.id)" />
                      </button>
                    </div>
                  </div>
                </th>

                <th class="col-avg">
                  <div class="th-top">
                    <div class="th-title">
                      <div class="th-name">Unit average</div>
                      <div class="th-sub">weighted</div>
                    </div>
                    <div class="th-sort">
                      <button
                          class="sort-btn"
                          type="button"
                          @click="toggleUeSort(ue.id, UE_AVG_KEY)"
                          :class="sortBtnClass(ueSortState(ue.id, UE_AVG_KEY))"
                          aria-label="Sort by unit average"
                      >
                        <SortIcon :state="ueSortState(ue.id, UE_AVG_KEY)" />
                      </button>
                    </div>
                  </div>
                </th>
              </tr>
              </thead>

              <tbody>
              <tr v-for="(row, idx) in ue.rowsSorted" :key="row.studentId">
                <td class="col-rank sticky-left">{{ idx + 1 }}</td>
                <td class="col-student sticky-left-2">
                  <div class="student">
                    <div class="student-id">{{ row.studentId }}</div>
                    <div class="student-name" v-if="studentName(row.studentId)">{{ studentName(row.studentId) }}</div>
                  </div>
                </td>

                <td v-for="exam in ue.exams" :key="exam.id" class="cell">
                    <span :class="['badge', row.grades?.[exam.id] == null ? 'muted' : '']">
                      {{ fmt(row.grades?.[exam.id]) }}
                    </span>
                </td>

                <td class="cell avg-cell">
                  <span :class="['badge', row.ueAvg == null ? 'muted' : '']">{{ fmt(row.ueAvg) }}</span>
                </td>
              </tr>

              <tr v-if="ue.rowsSorted.length === 0">
                <td :colspan="2 + ue.exams.length + 1" class="empty">No data to display.</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, reactive, ref } from "vue"

const ALL_ID = "__ALL__"
const UE_AVG_KEY = "__UE_AVG__"
const ALL_AVG_KEY = "__ALL_AVG__"

const SortIcon = defineComponent({
  name: "SortIcon",
  props: { state: { type: String, default: "none" } },
  setup(props) {
    return () => {
      if (props.state === "asc") {
        return h("svg", { class: "icon", viewBox: "0 0 16 16", "aria-hidden": "true" }, [
          h("path", { fill: "currentColor", d: "M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5A.5.5 0 0 0 8 15z" })
        ])
      }
      if (props.state === "desc") {
        return h("svg", { class: "icon", viewBox: "0 0 16 16", "aria-hidden": "true" }, [
          h("path", { fill: "currentColor", d: "M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z" })
        ])
      }
      return h("svg", { class: "icon", viewBox: "0 0 16 16", "aria-hidden": "true" }, [
        h("path", {
          fill: "currentColor",
          d: "M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5zm-7-14a.5.5 0 0 0-.5.5v11.793l-3.146-3.147a.5.5 0 0 0-.708.708l4 4a.5.5 0 0 0 .708 0l4-4a.5.5 0 0 0-.708-.708L5 13.293V1.5A.5.5 0 0 0 4.5 1z"
        })
      ])
    }
  }
})

const students = ref([
  { studentId: "221001", firstName: "Martin" },
  { studentId: "221002", firstName: "Bernard" },
  { studentId: "221003", firstName: "" }
])

const studentMap = computed(() => {
  const m = new Map()
  for (const s of Array.isArray(students.value) ? students.value : []) {
    const id = String(s?.studentId ?? "").trim()
    if (!id) continue
    const name = String(s?.firstName ?? "").trim()
    m.set(id, name)
  }
  return m
})

function studentName(id) {
  const name = studentMap.value.get(String(id))
  return name ? name : ""
}

const ueTable = ref([
  {
    code: "UNIT-IOT-101",
    name: "Sensors & acquisition",
    exams: [
      {
        name: "Midterm",
        coefficient: 2,
        notes: [
          { studentId: "221001", note: 14.5 },
          { studentId: "221002", note: 11.0 },
          { studentId: "221003", note: 9.5 }
        ]
      },
      {
        name: "Lab",
        coefficient: 1,
        notes: [
          { studentId: "221001", note: 16.0 },
          { studentId: "221002", note: 12.5 },
          { studentId: "221003", note: 10.0 }
        ]
      }
    ]
  },
  {
    code: "UNIT-IOT-102",
    name: "IoT networks",
    exams: [
      {
        name: "Project",
        coefficient: 3,
        notes: [
          { studentId: "221001", note: 15.0 },
          { studentId: "221002", note: 13.0 },
          { studentId: "221003", note: 12.0 }
        ]
      }
    ]
  }
])

const openSet = reactive(new Set([ALL_ID]))
const ueSort = reactive({})
const allSort = reactive({ key: ALL_AVG_KEY, dir: "desc" })

function isOpen(id) {
  return openSet.has(id)
}

function toggleOpen(id) {
  if (openSet.has(id)) openSet.delete(id)
  else openSet.add(id)
}

function toStr(v) {
  if (v == null) return ""
  return String(v)
}

function pick(obj, keys, fallback = null) {
  for (const k of keys) if (obj && obj[k] != null) return obj[k]
  return fallback
}

function normNumber(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function fmt(v) {
  if (v == null) return "—"
  const n = Number(v)
  if (!Number.isFinite(n)) return "—"
  return n.toFixed(2)
}

function cmpNullable(a, b, dir) {
  const aNull = a == null || !Number.isFinite(Number(a))
  const bNull = b == null || !Number.isFinite(Number(b))
  if (aNull && bNull) return 0
  if (aNull) return 1
  if (bNull) return -1
  const aa = Number(a)
  const bb = Number(b)
  return dir === "asc" ? aa - bb : bb - aa
}

function stableSort(arr, compare) {
  return arr
      .map((v, i) => ({ v, i }))
      .sort((a, b) => {
        const c = compare(a.v, b.v)
        if (c !== 0) return c
        return a.i - b.i
      })
      .map(x => x.v)
}

function computeUeAvg(exams, gradesByExamId) {
  if (!gradesByExamId) return null
  let num = 0
  let den = 0
  for (const ex of exams) {
    const g = gradesByExamId[ex.id]
    if (g == null) continue
    const coef = ex.coef > 0 ? ex.coef : 0
    if (coef <= 0) continue
    num += g * coef
    den += coef
  }
  if (den <= 0) return null
  return num / den
}

function sortBtnClass(state) {
  return {
    "state-none": state === "none",
    "state-asc": state === "asc",
    "state-desc": state === "desc"
  }
}

function allSortState(key) {
  if (allSort.key !== key) return "none"
  if (allSort.dir === "asc") return "asc"
  if (allSort.dir === "desc") return "desc"
  return "none"
}

function ueSortState(ueId, key) {
  const s = ueSort[ueId]
  if (!s) {
    if (key === UE_AVG_KEY) return "desc"
    return "none"
  }
  if (s.key !== key) return "none"
  if (s.dir === "asc") return "asc"
  if (s.dir === "desc") return "desc"
  return "none"
}

function toggleAllSort(key) {
  if (allSort.key !== key) {
    allSort.key = key
    allSort.dir = "desc"
    return
  }
  if (allSort.dir === "desc") {
    allSort.dir = "asc"
    return
  }
  if (allSort.dir === "asc") {
    allSort.key = null
    allSort.dir = null
    return
  }
  allSort.dir = "desc"
}

function toggleUeSort(ueId, key) {
  const s = ueSort[ueId]
  if (!s || s.key !== key) {
    ueSort[ueId] = { key, dir: "desc" }
    return
  }
  if (s.dir === "desc") {
    ueSort[ueId] = { key, dir: "asc" }
    return
  }
  if (s.dir === "asc") {
    ueSort[ueId] = { key: null, dir: null }
    return
  }
  ueSort[ueId] = { key, dir: "desc" }
}

const normalizedUes = computed(() => {
  const raw = Array.isArray(ueTable.value) ? ueTable.value : []

  return raw.map((ueRaw, ueIdx) => {
    const id = toStr(pick(ueRaw, ["id", "ueId", "code", "ueCode"], `UNIT_${ueIdx + 1}`)) || `UNIT_${ueIdx + 1}`
    const label = [toStr(pick(ueRaw, ["code", "ueCode"], "")), toStr(pick(ueRaw, ["name", "ueName", "title"], ""))].filter(Boolean).join(" · ") || id

    const examsRaw = Array.isArray(pick(ueRaw, ["exams", "examens", "evaluations"], [])) ? pick(ueRaw, ["exams", "examens", "evaluations"], []) : []
    const exams = examsRaw.map((exRaw, exIdx) => {
      const exId = toStr(pick(exRaw, ["id", "examId", "code", "key"], `${id}_EX_${exIdx + 1}`)) || `${id}_EX_${exIdx + 1}`
      const exLabel = toStr(pick(exRaw, ["name", "exam", "title", "label"], `Exam ${exIdx + 1}`)) || `Exam ${exIdx + 1}`
      const coef = normNumber(pick(exRaw, ["coef", "coeff", "coefficient"], 1)) ?? 1
      const notesRaw = Array.isArray(pick(exRaw, ["notes", "grades", "results"], [])) ? pick(exRaw, ["notes", "grades", "results"], []) : []
      const notes = notesRaw
          .map(nRaw => {
            const studentId = toStr(pick(nRaw, ["studentId", "id", "num", "numero", "numeroEtudiant"], "")) || ""
            const grade = normNumber(pick(nRaw, ["grade", "note", "value", "score"], null))
            return { studentId, grade }
          })
          .filter(x => x.studentId)

      return { id: exId, label: exLabel, coef, notes }
    })

    const sIds = new Set()
    for (const ex of exams) for (const n of ex.notes) sIds.add(n.studentId)

    const rows = Array.from(sIds).map(studentId => {
      const grades = {}
      for (const ex of exams) {
        const hit = ex.notes.find(x => x.studentId === studentId)
        grades[ex.id] = hit ? hit.grade : null
      }
      const ueAvg = computeUeAvg(exams, grades)
      return { studentId, grades, ueAvg }
    })

    const s = ueSort[id]
    const rowsSorted = (() => {
      if (!s) {
        return stableSort(rows.slice(), (a, b) => cmpNullable(a.ueAvg, b.ueAvg, "desc"))
      }
      if (!s.key || !s.dir) {
        return stableSort(rows.slice(), (a, b) => toStr(a.studentId).localeCompare(toStr(b.studentId)))
      }
      return stableSort(rows.slice(), (a, b) => {
        if (s.key === UE_AVG_KEY) return cmpNullable(a.ueAvg, b.ueAvg, s.dir)
        return cmpNullable(a.grades?.[s.key], b.grades?.[s.key], s.dir)
      })
    })()

    return { id, label, exams, rows, rowsSorted }
  })
})

const allRows = computed(() => {
  const m = new Map()

  for (const ue of normalizedUes.value) {
    for (const r of ue.rows) {
      if (!m.has(r.studentId)) m.set(r.studentId, { studentId: r.studentId, ueAvg: {}, globalAvg: null })
      m.get(r.studentId).ueAvg[ue.id] = r.ueAvg
    }
  }

  const rows = Array.from(m.values()).map(r => {
    const avgs = normalizedUes.value.map(ue => r.ueAvg[ue.id]).filter(v => v != null && Number.isFinite(Number(v)))
    r.globalAvg = avgs.length ? avgs.reduce((a, b) => a + Number(b), 0) / avgs.length : null
    return r
  })

  return rows
})

const allRowsSorted = computed(() => {
  const key = allSort.key
  const dir = allSort.dir
  const base = allRows.value.slice()

  if (!key || !dir) {
    return stableSort(base, (a, b) => toStr(a.studentId).localeCompare(toStr(b.studentId)))
  }

  return stableSort(base, (a, b) => {
    if (key === ALL_AVG_KEY) return cmpNullable(a.globalAvg, b.globalAvg, dir)
    return cmpNullable(a.ueAvg?.[key], b.ueAvg?.[key], dir)
  })
})
</script>

<style scoped>
.page {
  --bg: #0b1020;
  --line: rgba(255, 255, 255, 0.12);
  --grid: rgba(255, 255, 255, 0.10);
  --text: rgba(255, 255, 255, 0.92);
  --muted: rgba(255, 255, 255, 0.62);

  min-height: 100vh;
  background: radial-gradient(1200px 600px at 15% 0%, rgba(78, 161, 255, 0.16), transparent 55%),
  radial-gradient(900px 500px at 85% 10%, rgba(102, 240, 255, 0.10), transparent 60%),
  var(--bg);
  color: var(--text);
  padding: 20px 18px 48px;
  box-sizing: border-box;
}

.header {
  max-width: 1200px;
  margin: 0 auto 14px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.title h1 {
  margin: 0;
  font-size: 26px;
  letter-spacing: 0.2px;
}

.title p {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 13px;
}

.accordion {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.acc-item {
  border: 1px solid var(--line);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.025));
  border-radius: 14px;
  overflow: hidden;
}

.acc-trigger {
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  color: var(--text);
  padding: 12px 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.acc-trigger:hover {
  background: rgba(255, 255, 255, 0.03);
}

.acc-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.acc-badge {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(78, 161, 255, 0.08);
  color: rgba(255, 255, 255, 0.90);
  flex: 0 0 auto;
}

.acc-label {
  font-size: 14px;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.acc-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
}

.acc-meta {
  color: var(--muted);
  font-size: 12px;
}

.acc-chevron {
  display: inline-flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.03);
  transition: transform 160ms ease, background 160ms ease;
}

.acc-chevron:hover {
  background: rgba(255, 255, 255, 0.06);
}

.acc-chevron.open {
  transform: rotate(180deg);
}

.icon {
  width: 16px;
  height: 16px;
  display: block;
}

.acc-panel {
  border-top: 1px solid var(--line);
  padding: 12px 12px 14px;
}

.table-wrap {
  overflow: auto;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: rgba(0, 0, 0, 0.22);
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}

.table th,
.table td {
  text-align: center;
  vertical-align: middle;
  border: 1px solid var(--grid);
  padding: 10px 10px;
}

.table thead th {
  position: sticky;
  top: 0;
  z-index: 3;
  background: rgba(12, 18, 36, 0.96);
  color: rgba(255, 255, 255, 0.88);
  font-size: 12px;
  font-weight: 650;
}

.table tbody tr:hover td {
  background: rgba(255, 255, 255, 0.025);
}

.col-rank {
  width: 62px;
  font-variant-numeric: tabular-nums;
}

.col-student {
  width: 260px;
}

.col-exam {
  min-width: 160px;
}

.col-avg {
  min-width: 170px;
}

.sticky-left {
  position: sticky;
  left: 0;
  z-index: 5;
  background: rgba(12, 18, 36, 0.96);
}

.sticky-left-2 {
  position: sticky;
  left: 62px;
  z-index: 5;
  background: rgba(12, 18, 36, 0.96);
}

.table tbody .sticky-left,
.table tbody .sticky-left-2 {
  background: rgba(0, 0, 0, 0.18);
}

.th-top {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.th-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  align-items: center;
  justify-content: center;
}

.th-name {
  font-size: 12.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.th-sub {
  color: var(--muted);
  font-size: 11px;
  font-weight: 550;
}

.th-sort {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.sort-btn {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.76);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
}

.sort-btn:hover {
  background: rgba(255, 255, 255, 0.06);
}

.sort-btn.state-none {
  color: rgba(255, 255, 255, 0.70);
}

.sort-btn.state-asc,
.sort-btn.state-desc {
  border-color: rgba(78, 161, 255, 0.65);
  background: rgba(78, 161, 255, 0.16);
  color: rgba(255, 255, 255, 0.92);
}

.student {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  justify-content: center;
}

.student-id {
  font-variant-numeric: tabular-nums;
  font-weight: 650;
}

.student-name {
  color: var(--muted);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(78, 161, 255, 0.10);
  font-variant-numeric: tabular-nums;
}

.badge.muted {
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.62);
}

.cell {
  text-align: center;
}

.avg-cell .badge {
  background: rgba(102, 240, 255, 0.10);
}

.empty {
  text-align: center;
  color: var(--muted);
  padding: 18px 10px;
  font-size: 13px;
}
</style>
