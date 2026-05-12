<script setup>
  import {ref, onMounted, computed} from "vue";

  const AKEUSCH_ID = "Arthur KEUSCH";
  const akeusch_hovered = ref(false);

  // Variables for expansion panels
  const _semesters = ref([]);
  const _subjects = ref({});

  /************************
  | Load students & marks |
  ************************/

  const students = ref([]);
  const marks = ref([]);
  const fetchStatus = ref(0);  // 0: loading, 1: success, -1: error

  onMounted(async () => {
    // Retrieve students data
    const studentsData = await fetch("/data/students.json");
    if (!studentsData.ok) {
      console.error("Error fetching students:", studentsData.statusText);
      fetchStatus.value = -1;
      return;
    }
    const studentsJson = await studentsData.json();
    students.value = studentsJson;

    // Retrieve marks data
    const marksData = await fetch("/data/marks.json");
    if (!marksData.ok) {
      console.error("Error fetching marks:", marksData.statusText);
      fetchStatus.value = -1;
      return;
    }
    const marksJson = await marksData.json();
    marks.value = marksJson;

    // Expand data structures based on retrieved data
    _semesters.value.push(marks.value[marks.value.length - 1].id);  // Expand the last semester by default
    for (const semester of marks.value) {
      _subjects.value[semester.id] = [`total-${semester.id}`];

      for (const subject of semester.subjects) {
        // Prepare subject total marks for each student
        const subjectTotal = [];
        for (const student of students.value) {
          subjectTotal[student.studentId] = 0;
        }

        // Calculate total marks for each student in the subject
        for (const student of students.value) {
          let studentTotal = 0;
          let studentCoeff = 0;
          for (const mark of subject.marks) {
            const studentMark = mark.marks[student.studentId];
            if (studentMark !== undefined) {
              studentTotal += studentMark * mark.coeff;
              studentCoeff += mark.coeff;
            }
            if (studentCoeff > 0) subjectTotal[student.studentId] = Math.round(studentTotal / studentCoeff * 100) / 100;
            else                  subjectTotal[student.studentId] = null;
          }
        }
        subject.total = subjectTotal;
      }

      // Compute the total marks for the semester for each student
      const total = {};
      for (const student of students.value) {
        let studentTotal = 0;
        let studentCoeff = 0;
        for (const subject of semester.subjects) {
          const studentMark = subject.total[student.studentId];
          if (studentMark !== null) {
            studentTotal += studentMark;
            studentCoeff += 1;
          }
          if (studentCoeff > 0) total[student.studentId] = Math.round(studentTotal / studentCoeff * 100) / 100;
          else                  total[student.studentId] = null;
        }
      }
      semester.total = total;
    }
  });

  // Prepare data tables
  const totalTableHeaders = computed(() => {
    const headers = {};
    for (const semester of marks.value) {
      headers[semester.id] = [];
      headers[semester.id].push({ title: 'Student', key: 'student', align: 'start' });
      for (let subjectIdx = 0; subjectIdx < semester.subjects.length; subjectIdx++) {
        headers[semester.id].push({ title: semester.subjects[subjectIdx].id, key: `subject-${subjectIdx}`, align: 'end' });
      }
      headers[semester.id].push({ title: 'Total', key: 'total', align: 'end' });
    }
    console.debug(headers);
    return headers;
  });

  const totalTableItems = computed(() => {
    const items = {};
    for (const semester of marks.value) {
      items[semester.id] = students.value.map(student => ({
        student: student.name || student.studentId,
        total: semester.total[student.studentId] ?? '-'
      }));
      for (let studentIdx = 0; studentIdx < students.value.length; studentIdx++) {
        const student = students.value[studentIdx];
        for (let subjectIdx = 0; subjectIdx < semester.subjects.length; subjectIdx++) {
          items[semester.id][studentIdx][`subject-${subjectIdx}`] = semester.subjects[subjectIdx].total[student.studentId] ?? '-';
        }
      }
    }
    console.debug(items);
    return items;
  });

  const subjectTableHeaders = computed(() => {
    const headers = {};
    for (const semester of marks.value) {
      headers[semester.id] = {};
      for (const subject of semester.subjects) {
        headers[semester.id][subject.id] = [];
        headers[semester.id][subject.id].push({ title: 'Student', key: 'student', align: 'start' });
        for (let markIdx = 0; markIdx < subject.marks.length; markIdx++) {
          headers[semester.id][subject.id].push({ title: subject.marks[markIdx].name, key: `mark-${markIdx}`, align: 'end' });
        }
        headers[semester.id][subject.id].push({ title: 'Total', key: 'total', align: 'end' });
      }
    }
    console.debug(headers);
    return headers;
  });

  const subjectTableItems = computed(() => {
    const items = {};
    for (const semester of marks.value) {
      items[semester.id] = {};
      for (const subject of semester.subjects) {
        items[semester.id][subject.id] = students.value.map(student => ({
          student: student.name || student.studentId,
          total: subject.total[student.studentId] ?? '-'
        }));
        for (let studentIdx = 0; studentIdx < students.value.length; studentIdx++) {
          const student = students.value[studentIdx];
          for (let markIdx = 0; markIdx < subject.marks.length; markIdx++) {
            items[semester.id][subject.id][studentIdx][`mark-${markIdx}`] = subject.marks[markIdx].marks[student.studentId] ?? '-';
          }
        }
      }
    }
    console.debug(items);
    return items;
  });
</script>

<template>
  <VContainer>
    <!-- AKeusch on-hover logo -->
    <div
      :style="{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        pointerEvents: 'none',
        opacity: akeusch_hovered ? 1 : 0,
        transition: 'opacity 0.5s ease'
      }"
    >
      <img
        src="/images/RGB.svg" 
        alt=""
        :style="{
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }"
      />
    </div>

    <!-- Semesters -->
    <VExpansionPanels
      v-model="_semesters"
      variant="accordion"
      multiple
    >

      <!-- Semester (inverted order) -->
      <VExpansionPanel
        v-for="semester in [...marks].reverse()"
        :key="semester.id"
        :value="semester.id"
        class="mb-4 rounded-lg elevation-2"
        style="background-color: rgba(var(--v-theme-surface), 0.5)"
      >
        <!-- Semester Title -->
        <VExpansionPanelTitle>
          <div class="d-flex align-center w-100 pr-4">
            <span class="text-h6 font-weight-bold">{{ semester.name }}</span>
            <VSpacer />
            <VChip size="small" color="primary" variant="tonal" class="font-weight-bold">
              {{ semester.subjects.length }} unit{{ semester.subjects.length !== 1 ? 's' : '' }}
            </VChip>
          </div>
        </VExpansionPanelTitle>

        <!-- Subjects -->
        <VExpansionPanelText class="pt-3">
          <VExpansionPanels
            v-model="_subjects[semester.id]"
            variant="accordion"
            multiple
          >

            <!-- Total -->
            <VExpansionPanel
              :value="'total-' + semester.id"
              class="mb-2 rounded-lg elevation-1"
              style="background-color: rgba(var(--v-theme-surface), 0.6)"
            >
              <!-- Subject Title -->
              <VExpansionPanelTitle>
                <div class="d-flex align-center w-100 pr-4">
                  <span class="text-subtitle-1 font-weight-bold" style="font-size: 1.1rem">Total</span>
                  <VSpacer />
                  <VChip size="small" color="secondary" variant="tonal" class="font-weight-bold">
                    {{ semester.subjects.length }} unit{{ semester.subjects.length !== 1 ? 's' : '' }}
                  </VChip>
                </div>
              </VExpansionPanelTitle>

              <!-- Marks -->
              <VExpansionPanelText class="pt-2">
                <VDataTableVirtual
                  :headers="totalTableHeaders[semester.id]"
                  :items="totalTableItems[semester.id]"
                  density="comfortable"
                  class="bg-transparent"
                  fixed-header
                  hover
                >
                  <!-- Marks headers -->
                  <template 
                    v-for="(item, index) in semester.subjects" 
                    :key="`header-${index}`" 
                    v-slot:[`header.subject-${index}`]="{ column, isSorted, sortBy }"
                  >
                    <VIcon
                      v-if="column.sortable"
                      :icon="isSorted(column) &&sortBy.find(
                        sort => sort.key === column.key).order == 'desc'
                      ? 'mdi-arrow-down' : 'mdi-arrow-up'"
                      :class="[
                        'v-data-table-header__sort-icon',
                        { 'v-data-table-header__sort-icon--active': isSorted(column) }
                      ]"
                    />
                    <span style="font-size: 0.8rem; font-weight: 600">{{ column.title }}</span>
                  </template>

                  <!-- Total header -->
                  <template v-slot:header.total="{ column, isSorted, sortBy }">
                    <VIcon
                      v-if="column.sortable"
                      :icon="isSorted(column) &&sortBy.find(
                        sort => sort.key === column.key).order == 'desc'
                      ? 'mdi-arrow-down' : 'mdi-arrow-up'"
                      :class="[
                        'v-data-table-header__sort-icon',
                        { 'v-data-table-header__sort-icon--active': isSorted(column) }
                      ]"
                    />
                    <span class="text-uppercase font-weight-bold">{{ column.title }}</span>
                  </template>

                  <!-- Student column -->
                  <template v-slot:item.student="{ value }">
                    <span
                      @mouseenter="() => { if (value === AKEUSCH_ID) { akeusch_hovered = true }}"
                      @mouseleave="() => { if (value === AKEUSCH_ID) { akeusch_hovered = false }}"
                    >{{ value }}</span>
                  </template>

                  <!-- Mark columns -->
                  <template 
                    v-for="(item, index) in semester.subjects" 
                    :key="`item-${index}`" 
                    v-slot:[`item.subject-${index}`]="{ value }"
                  >
                    <span class="text-medium-emphasis">{{ value }}</span>
                  </template>

                  <!-- Total column -->
                  <template v-slot:item.total="{ value }">
                    <span class="font-weight-bold">{{ value }}</span>
                  </template>

                </VDataTableVirtual>
              </VExpansionPanelText>
            </VExpansionPanel>

            <!-- Subject -->
            <VExpansionPanel
              v-for="subject in semester.subjects"
              :key="subject.id"
              :value="subject.id"
              class="mb-2 rounded-lg elevation-1"
            >
              <!-- Subject Title -->
              <VExpansionPanelTitle>
                <div class="d-flex align-center w-100 pr-4">
                  <span class="text-subtitle-1 mr-3">{{ subject.name }}</span>
                  <span class="text-medium-emphasis" style="font-size: 0.85rem">({{ subject.id }})</span>
                  <VSpacer />
                  <VChip size="small" color="secondary" variant="tonal">
                    {{ subject.marks.length }} mark{{ subject.marks.length !== 1 ? 's' : '' }}
                  </VChip>
                </div>
              </VExpansionPanelTitle>

              <!-- Marks -->
              <VExpansionPanelText class="pt-2">
                <VDataTableVirtual
                  :headers="subjectTableHeaders[semester.id][subject.id]"
                  :items="subjectTableItems[semester.id][subject.id]"
                  density="comfortable"
                  class="bg-transparent"
                  fixed-header
                  hover
                >
                  <!-- Marks headers -->
                  <template 
                    v-for="(item, index) in subject.marks" 
                    :key="`header-${index}`" 
                    v-slot:[`header.mark-${index}`]="{ column, isSorted, sortBy }"
                  >
                    <VIcon
                      v-if="column.sortable"
                      :icon="isSorted(column) &&sortBy.find(
                        sort => sort.key === column.key).order == 'desc'
                      ? 'mdi-arrow-down' : 'mdi-arrow-up'"
                      :class="[
                        'v-data-table-header__sort-icon',
                        { 'v-data-table-header__sort-icon--active': isSorted(column) }
                      ]"
                    />
                    <span class="text-uppercase" style="font-size: 0.8rem; font-weight: 600">{{ item.name }}</span>
                    <span class="text-medium-emphasis ml-1">({{ item.coeff }})</span>
                  </template>

                  <!-- Total header -->
                  <template v-slot:header.total="{ column, isSorted, sortBy }">
                    <VIcon
                      v-if="column.sortable"
                      :icon="isSorted(column) &&sortBy.find(
                        sort => sort.key === column.key).order == 'desc'
                      ? 'mdi-arrow-down' : 'mdi-arrow-up'"
                      :class="[
                        'v-data-table-header__sort-icon',
                        { 'v-data-table-header__sort-icon--active': isSorted(column) }
                      ]"
                    />
                    <span class="text-uppercase font-weight-bold">{{ column.title }}</span>
                  </template>

                  <!-- Student column -->
                  <template v-slot:item.student="{ value }">
                    <span
                      @mouseenter="() => { if (value === AKEUSCH_ID) { akeusch_hovered = true }}"
                      @mouseleave="() => { if (value === AKEUSCH_ID) { akeusch_hovered = false }}"
                    >{{ value }}</span>
                  </template>

                  <!-- Mark columns -->
                  <template 
                    v-for="(item, index) in subject.marks" 
                    :key="`item-${index}`" 
                    v-slot:[`item.mark-${index}`]="{ value }"
                  >
                    <span class="text-medium-emphasis">{{ value }}</span>
                  </template>

                  <!-- Total column -->
                  <template v-slot:item.total="{ value }">
                    <span class="font-weight-bold">{{ value }}</span>
                  </template>

                </VDataTableVirtual>
              </VExpansionPanelText>
            </VExpansionPanel>

          </VExpansionPanels>
        </VExpansionPanelText>
      </VExpansionPanel>

    </VExpansionPanels>
    </VContainer>
</template>
