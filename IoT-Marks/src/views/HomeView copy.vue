<template>
  <VApp>
    <VMain class="bg-background">
      <VContainer class="py-6 px-4" style="max-width: 1200px;">
        
        <div class="d-flex align-end justify-space-between mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold mb-0">IoT-Marks</h1>
          </div>
        </div>

        <VExpansionPanels v-model="openedSemesters" multiple variant="accordion">
          <VExpansionPanel
            v-for="semester in normalizedSemesters"
            :key="semester.id"
            :value="semester.id"
            class="mb-4 rounded-lg elevation-2"
          >
            <VExpansionPanelTitle class="bg-surface">
              <div class="d-flex align-center w-100 pr-4">
                <VChip size="small" color="primary" variant="tonal" class="mr-3">
                  Semester
                </VChip>
                <span class="text-h6 font-weight-bold">{{ semester.label }}</span>
                <VSpacer />
                <span class="text-caption text-medium-emphasis">
                  {{ semester.ues.length }} units
                </span>
              </div>
            </VExpansionPanelTitle>

            <VExpansionPanelText class="bg-surface-variant pt-3">
              <VExpansionPanels v-model="openedDetails" multiple variant="accordion">
                
                <!-- Section: Overview -->
                <VExpansionPanel :value="semester.allId" class="mb-3 rounded elevation-1">
                  <VExpansionPanelTitle>
                    <div class="d-flex align-center w-100 pr-4">
                      <VChip size="small" color="info" variant="tonal" class="mr-3">
                        Overview
                      </VChip>
                      <span class="text-subtitle-1 font-weight-bold">Overall averages</span>
                      <VSpacer />
                      <span class="text-caption text-medium-emphasis">
                        {{ semester.allRowsSorted.length }} students
                      </span>
                    </div>
                  </VExpansionPanelTitle>

                  <VExpansionPanelText>
                    <div class="table-wrap border rounded">
                      <VTable class="text-center text-no-wrap custom-table" hover density="comfortable">
                        <thead>
                          <tr>
                            <th class="sticky-col-1 bg-sticky px-3 text-center">#</th>
                            <th class="sticky-col-2 bg-sticky px-3 text-left">Student</th>

                            <th v-for="ue in semester.ues" :key="ue.id" class="px-3">
                              <div class="d-flex align-center justify-center ga-2">
                                <div class="d-flex flex-column align-center">
                                  <span class="font-weight-bold text-truncate" style="max-width: 180px;">{{ ue.label }}</span>
                                  <span class="text-caption text-medium-emphasis">Unit average</span>
                                </div>
                                <VBtn
                                  icon
                                  size="x-small"
                                  :variant="allSortState(semester.id, ue.id) !== 'none' ? 'tonal' : 'text'"
                                  :color="allSortState(semester.id, ue.id) !== 'none' ? 'primary' : 'default'"
                                  @click="toggleAllSort(semester.id, ue.id)"
                                  :aria-label="'Sort by ' + ue.label"
                                >
                                  <VIcon :icon="getSortIcon(allSortState(semester.id, ue.id))" />
                                </VBtn>
                              </div>
                            </th>

                            <th class="px-3 bg-avg-header">
                              <div class="d-flex align-center justify-center ga-2">
                                <div class="d-flex flex-column align-center">
                                  <span class="font-weight-bold text-truncate">Overall average</span>
                                  <span class="text-caption text-medium-emphasis">Units (equal weight)</span>
                                </div>
                                <VBtn
                                  icon
                                  size="x-small"
                                  :variant="allSortState(semester.id, ALL_AVG_KEY) !== 'none' ? 'tonal' : 'text'"
                                  :color="allSortState(semester.id, ALL_AVG_KEY) !== 'none' ? 'primary' : 'default'"
                                  @click="toggleAllSort(semester.id, ALL_AVG_KEY)"
                                  aria-label="Sort by overall average"
                                >
                                  <VIcon :icon="getSortIcon(allSortState(semester.id, ALL_AVG_KEY))" />
                                </VBtn>
                              </div>
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr v-for="(row, idx) in semester.allRowsSorted" :key="row.studentId">
                            <td class="sticky-col-1 bg-sticky font-weight-medium">{{ idx + 1 }}</td>
                            <td class="sticky-col-2 bg-sticky text-left">
                              <div class="d-flex flex-column">
                                <span class="font-weight-bold font-variant-numeric">{{ row.studentId }}</span>
                                <span class="text-caption text-medium-emphasis text-truncate" style="max-width: 180px;" v-if="studentName(row.studentId)">
                                  {{ studentName(row.studentId) }}
                                </span>
                              </div>
                            </td>

                            <td v-for="ue in semester.ues" :key="ue.id">
                              <VChip
                                :color="row.ueAvg[ue.id] == null ? 'grey' : 'primary'"
                                :variant="row.ueAvg[ue.id] == null ? 'tonal' : 'flat'"
                                size="small"
                                class="font-weight-bold font-variant-numeric min-w-70"
                              >
                                {{ fmt(row.ueAvg[ue.id]) }}
                              </VChip>
                            </td>

                            <td class="bg-avg-cell">
                              <VChip
                                :color="row.globalAvg == null ? 'grey' : 'info'"
                                :variant="row.globalAvg == null ? 'tonal' : 'flat'"
                                size="small"
                                class="font-weight-bold font-variant-numeric min-w-70"
                              >
                                {{ fmt(row.globalAvg) }}
                              </VChip>
                            </td>
                          </tr>
                          <tr v-if="semester.allRowsSorted.length === 0">
                            <td :colspan="2 + semester.ues.length + 1" class="text-center text-medium-emphasis py-4">
                              No data to display.
                            </td>
                          </tr>
                        </tbody>
                      </VTable>
                    </div>
                  </VExpansionPanelText>
                </VExpansionPanel>

                <!-- Sections: Units (UEs) -->
                <VExpansionPanel v-for="ue in semester.ues" :key="ue.id" :value="ue.id" class="mb-3 rounded elevation-1">
                  <VExpansionPanelTitle>
                    <div class="d-flex align-center w-100 pr-4">
                      <VChip size="small" color="secondary" variant="tonal" class="mr-3">
                        Unit
                      </VChip>
                      <span class="text-subtitle-1 font-weight-bold">{{ ue.label }}</span>
                      <VSpacer />
                      <span class="text-caption text-medium-emphasis">
                        {{ ue.rowsSorted.length }} students · {{ ue.exams.length }} exams
                      </span>
                    </div>
                  </VExpansionPanelTitle>

                  <VExpansionPanelText>
                    <div class="table-wrap border rounded">
                      <VTable class="text-center text-no-wrap custom-table" hover density="comfortable">
                        <thead>
                          <tr>
                            <th class="sticky-col-1 bg-sticky px-3 text-center">#</th>
                            <th class="sticky-col-2 bg-sticky px-3 text-left">Student</th>

                            <th v-for="exam in ue.exams" :key="exam.id" class="px-3">
                              <div class="d-flex align-center justify-center ga-2">
                                <div class="d-flex flex-column align-center">
                                  <span class="font-weight-bold text-truncate" style="max-width: 140px;">{{ exam.label }}</span>
                                  <span class="text-caption text-medium-emphasis">coef {{ exam.coef }}</span>
                                </div>
                                <VBtn
                                  icon
                                  size="x-small"
                                  :variant="ueSortState(ue.id, exam.id) !== 'none' ? 'tonal' : 'text'"
                                  :color="ueSortState(ue.id, exam.id) !== 'none' ? 'primary' : 'default'"
                                  @click="toggleUeSort(ue.id, exam.id)"
                                  :aria-label="'Sort by ' + exam.label"
                                >
                                  <VIcon :icon="getSortIcon(ueSortState(ue.id, exam.id))" />
                                </VBtn>
                              </div>
                            </th>

                            <th class="px-3 bg-avg-header">
                              <div class="d-flex align-center justify-center ga-2">
                                <div class="d-flex flex-column align-center">
                                  <span class="font-weight-bold text-truncate">Unit average</span>
                                  <span class="text-caption text-medium-emphasis">weighted</span>
                                </div>
                                <VBtn
                                  icon
                                  size="x-small"
                                  :variant="ueSortState(ue.id, UE_AVG_KEY) !== 'none' ? 'tonal' : 'text'"
                                  :color="ueSortState(ue.id, UE_AVG_KEY) !== 'none' ? 'primary' : 'default'"
                                  @click="toggleUeSort(ue.id, UE_AVG_KEY)"
                                  aria-label="Sort by unit average"
                                >
                                  <VIcon :icon="getSortIcon(ueSortState(ue.id, UE_AVG_KEY))" />
                                </VBtn>
                              </div>
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr v-for="(row, idx) in ue.rowsSorted" :key="row.studentId">
                            <td class="sticky-col-1 bg-sticky font-weight-medium">{{ idx + 1 }}</td>
                            <td class="sticky-col-2 bg-sticky text-left">
                              <div class="d-flex flex-column">
                                <span class="font-weight-bold font-variant-numeric">{{ row.studentId }}</span>
                                <span class="text-caption text-medium-emphasis text-truncate" style="max-width: 180px;" v-if="studentName(row.studentId)">
                                  {{ studentName(row.studentId) }}
                                </span>
                              </div>
                            </td>

                            <td v-for="exam in ue.exams" :key="exam.id">
                              <VChip
                                :color="row.grades?.[exam.id] == null ? 'grey' : 'primary'"
                                :variant="row.grades?.[exam.id] == null ? 'tonal' : 'flat'"
                                size="small"
                                class="font-weight-bold font-variant-numeric min-w-70"
                              >
                                {{ fmt(row.grades?.[exam.id]) }}
                              </VChip>
                            </td>

                            <td class="bg-avg-cell">
                              <VChip
                                :color="row.ueAvg == null ? 'grey' : 'info'"
                                :variant="row.ueAvg == null ? 'tonal' : 'flat'"
                                size="small"
                                class="font-weight-bold font-variant-numeric min-w-70"
                              >
                                {{ fmt(row.ueAvg) }}
                              </VChip>
                            </td>
                          </tr>
                          <tr v-if="ue.rowsSorted.length === 0">
                            <td :colspan="2 + ue.exams.length + 1" class="text-center text-medium-emphasis py-4">
                              No data to display.
                            </td>
                          </tr>
                        </tbody>
                      </VTable>
                    </div>
                  </VExpansionPanelText>
                </VExpansionPanel>

              </VExpansionPanels>
            </VExpansionPanelText>
          </VExpansionPanel>
        </VExpansionPanels>

      </VContainer>
    </VMain>
  </VApp>
</template>

<script setup>
import { computed, reactive, ref } from "vue"

const ALL_ID = "__ALL__"
const UE_AVG_KEY = "__UE_AVG__"
const ALL_AVG_KEY = "__ALL_AVG__"

// État géré par Vuetify pour l'ouverture des panneaux
const openedSemesters = ref(["S2"])
const openedDetails = ref([semesterAllId("S2")])

const students = ref()
const semesterTable = ref()

const ueSort = reactive({})
const allSort = reactive({})

function getSortIcon(state) {
  if (state === "asc") return "mdi-sort-ascending"
  if (state === "desc") return "mdi-sort-descending"
  return "mdi-sort"
}

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

function semesterAllId(semesterId) {
  return `${semesterId}${ALL_ID}`
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
    .map((x) => x.v)
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

function allSortState(semesterId, key) {
  const s = allSort[semesterId]
  if (!s) {
    if (key === ALL_AVG_KEY) return "desc"
    return "none"
  }
  if (s.key !== key) return "none"
  if (s.dir === "asc") return "asc"
  if (s.dir === "desc") return "desc"
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

function toggleAllSort(semesterId, key) {
  const s = allSort[semesterId]
  if (!s || s.key !== key) {
    allSort[semesterId] = { key, dir: "desc" }
    return
  }
  if (s.dir === "desc") {
    allSort[semesterId] = { key, dir: "asc" }
    return
  }
  if (s.dir === "asc") {
    allSort[semesterId] = { key: null, dir: null }
    return
  }
  allSort[semesterId] = { key, dir: "desc" }
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

function normalizeUes(rawUes, semesterId) {
  const raw = Array.isArray(rawUes) ? rawUes : []

  return raw.map((ueRaw, ueIdx) => {
    const code = toStr(pick(ueRaw, ["id", "ueId", "code", "ueCode"], `UNIT_${ueIdx + 1}`)) || `UNIT_${ueIdx + 1}`
    const id = `${semesterId}_${code}`
    const label = [toStr(pick(ueRaw, ["code", "ueCode"], "")), toStr(pick(ueRaw, ["name", "ueName", "title"], ""))].filter(Boolean).join(" · ") || code

    const examsRaw = Array.isArray(pick(ueRaw, ["exams", "examens", "evaluations"], [])) ? pick(ueRaw, ["exams", "examens", "evaluations"], []) : []
    const exams = examsRaw.map((exRaw, exIdx) => {
      const exKey = toStr(pick(exRaw, ["id", "examId", "code", "key"], `EX_${exIdx + 1}`)) || `EX_${exIdx + 1}`
      const exId = `${id}_${exKey}`
      const exLabel = toStr(pick(exRaw, ["name", "exam", "title", "label"], `Exam ${exIdx + 1}`)) || `Exam ${exIdx + 1}`
      const coef = normNumber(pick(exRaw, ["coef", "coeff", "coefficient"], 1)) ?? 1
      const notesRaw = Array.isArray(pick(exRaw, ["notes", "grades", "results"], [])) ? pick(exRaw, ["notes", "grades", "results"], []) : []
      const notes = notesRaw
        .map((nRaw) => {
          const studentId = toStr(pick(nRaw, ["studentId", "id", "num", "numero", "numeroEtudiant"], "")) || ""
          const grade = normNumber(pick(nRaw, ["grade", "note", "value", "score"], null))
          return { studentId, grade }
        })
        .filter((x) => x.studentId)

      return { id: exId, label: exLabel, coef, notes }
    })

    const sIds = new Set()
    for (const ex of exams) for (const n of ex.notes) sIds.add(n.studentId)

    const rows = Array.from(sIds).map((studentId) => {
      const grades = {}
      for (const ex of exams) {
        const hit = ex.notes.find((x) => x.studentId === studentId)
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
}

function buildAllRows(ues) {
  const m = new Map()

  for (const ue of ues) {
    for (const r of ue.rows) {
      if (!m.has(r.studentId)) m.set(r.studentId, { studentId: r.studentId, ueAvg: {}, globalAvg: null })
      m.get(r.studentId).ueAvg[ue.id] = r.ueAvg
    }
  }

  return Array.from(m.values()).map((r) => {
    const avgs = ues.map((ue) => r.ueAvg[ue.id]).filter((v) => v != null && Number.isFinite(Number(v)))
    r.globalAvg = avgs.length ? avgs.reduce((a, b) => a + Number(b), 0) / avgs.length : null
    return r
  })
}

function sortAllRows(rows, semesterId) {
  const s = allSort[semesterId]
  const key = s ? s.key : ALL_AVG_KEY
  const dir = s ? s.dir : "desc"
  const base = rows.slice()

  if (!key || !dir) {
    return stableSort(base, (a, b) => toStr(a.studentId).localeCompare(toStr(b.studentId)))
  }

  return stableSort(base, (a, b) => {
    if (key === ALL_AVG_KEY) return cmpNullable(a.globalAvg, b.globalAvg, dir)
    return cmpNullable(a.ueAvg?.[key], b.ueAvg?.[key], dir)
  })
}

const normalizedSemesters = computed(() => {
  const raw = Array.isArray(semesterTable.value) ? semesterTable.value : []

  return raw.map((semesterRaw, semesterIdx) => {
    const id = toStr(pick(semesterRaw, ["id", "semesterId", "code"], `S${semesterIdx + 1}`)) || `S${semesterIdx + 1}`
    const label = toStr(pick(semesterRaw, ["name", "title", "label"], id)) || id
    const ues = normalizeUes(pick(semesterRaw, ["ues", "units", "ueTable"], []), id)
    const allRows = buildAllRows(ues)
    const allRowsSorted = sortAllRows(allRows, id)
    return { id, label, allId: semesterAllId(id), ues, allRows, allRowsSorted }
  })
})
</script>

<style scoped>
/*
  La grande majorité du CSS a été supprimée et remplacée par les classes utilitaires 
  et le système de variables/thèmes internes à Vuetify.
  On conserve uniquement le style pour gérer les colonnes figées (sticky) horizontalement.
*/

.table-wrap {
  overflow-x: auto;
  position: relative;
  isolation: isolate;
}

.custom-table th,
.custom-table td {
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
.custom-table th:last-child,
.custom-table td:last-child {
  border-right: none;
}

.sticky-col-1 {
  position: sticky !important;
  left: 0;
  z-index: 2;
  width: 60px;
  min-width: 60px;
}

.sticky-col-2 {
  position: sticky !important;
  left: 60px;
  z-index: 2;
  width: 220px;
  min-width: 220px;
  box-shadow: inset -3px 0 5px -3px rgba(0, 0, 0, 0.1);
}

thead .sticky-col-1,
thead .sticky-col-2 {
  z-index: 4 !important;
}

.bg-sticky {
  background-color: rgb(var(--v-theme-surface));
}

.bg-avg-header {
  background-color: rgba(var(--v-theme-info), 0.05) !important;
}

.bg-avg-cell {
  background-color: rgba(var(--v-theme-info), 0.03) !important;
}

.font-variant-numeric {
  font-variant-numeric: tabular-nums;
}

.min-w-70 {
  min-width: 70px;
}
</style>