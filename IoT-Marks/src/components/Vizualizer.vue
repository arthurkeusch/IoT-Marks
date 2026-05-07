<script setup>
  import {ref, onMounted, computed} from "vue";

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
            if (studentMark) {
              studentTotal += studentMark * mark.coeff;
              studentCoeff += mark.coeff;
            }
            if (studentCoeff > 0) subjectTotal[student.studentId] = Math.round(studentTotal / studentCoeff, 2);
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
          if (studentCoeff > 0) total[student.studentId] = Math.round(studentTotal / studentCoeff, 2);
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
      headers[semester.id] = [
                                       { title: 'Student', key: 'student',         align: 'start' },
        ...semester.subjects.map(s => ({ title: s.id,      key: `subject-${s.id}`, align: 'end'   })),
                                       { title: 'Total',   key: 'total',           align: 'end'   }
      ];
    }
    return headers;
  });

  const totalTableItems = computed(() => {
    const items = {};
    for (const semester of marks.value) {
      items[semester.id] = students.value.map(student => ({
        student: student.name || student.studentId,
        ...Object.fromEntries(semester.subjects.map(s => [`subject-${s.id}`, s.total[student.studentId] ?? '-'])),
        total: semester.total[student.studentId] ?? '-'
      }));
    }
    return items;
  });

  const subjectTableHeaders = computed(() => {
    const headers = {};
    for (const semester of marks.value) {
      headers[semester.id] = {};
      for (const subject of semester.subjects) {
        headers[semester.id][subject.id] = [
                                     { title: 'Student', key: 'student',        align: 'start' },
          ...subject.marks.map(m => ({ title: m.name,    key: `mark-${m.name}`, align: 'end'   })),
                                     { title: 'Total',   key: 'total',          align: 'end'   }
        ];
      }
    }
    return headers;
  });

  const subjectTableItems = computed(() => {
    const items = {};
    for (const semester of marks.value) {
      items[semester.id] = {};
      for (const subject of semester.subjects) {
        items[semester.id][subject.id] = students.value.map(student => ({
          student: student.name || student.studentId,
          ...Object.fromEntries(subject.marks.map(m => [`mark-${m.name}`, m.marks[student.studentId] ?? '-'])),
          total: subject.total[student.studentId] ?? '-'
        }));
      }
    }
    return items;
  });
</script>

<template>
  <VContainer>
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
            <VChip size="small" color="primary" variant="tonal" class="mr-3"> Semester </VChip>
            <span class="text-h6 font-weight-bold">{{ semester.name }}</span>
            <VSpacer />
            <span class="text-caption text-medium-emphasis">{{ semester.subjects.length }} unit{{ semester.subjects.length !== 1 ? 's' : '' }}</span>
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
            >
              <!-- Subject Title -->
              <VExpansionPanelTitle>
                <div class="d-flex align-center w-100 pr-4">
                  <VChip size="small" color="secondary" variant="tonal" class="mr-3 font-weight-bold"> Total </VChip>
                  <span class="text-subtitle-1 font-weight-bold" style="font-size: 1.1rem">Total</span>
                </div>
              </VExpansionPanelTitle>

              <!-- Marks -->
              <VExpansionPanelText class="pt-2">
                <VDataTableVirtual
                  :headers="totalTableHeaders[semester.id]"
                  :items="totalTableItems[semester.id]"
                  density="comfortable"
                  class="elevation-1"
                  style="background-color: rgb(var(--v-theme-surface-light), 0.2)"
                  fixed-header
                  hover
                >
                  <template 
                    v-for="subject in semester.subjects" 
                    :key="`header-${subject.id}`" 
                    v-slot:[`header.subject-${subject.id}`]="{ column }"
                  >
                    <span style="font-size: 0.8rem; font-weight: 600">{{ column.title }}</span>
                  </template>

                  <template v-slot:header.total="{ column }">
                    <span class="text-uppercase font-weight-bold">{{ column.title }}</span>
                  </template>

                  <template v-slot:item.student="{ value }">
                    <span>{{ value }}</span>
                  </template>

                  <template 
                    v-for="subject in semester.subjects" 
                    :key="`item-${subject.id}`" 
                    v-slot:[`item.subject-${subject.id}`]="{ value }"
                  >
                    <span class="text-medium-emphasis">{{ value }}</span>
                  </template>

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
                  <VChip size="small" color="secondary" variant="tonal" class="mr-3"> UE </VChip>
                  <span class="text-subtitle-1 mr-3">{{ subject.name }}</span>
                  <span class="text-medium-emphasis" style="font-size: 0.85rem">({{ subject.id }})</span>
                  <VSpacer />
                  <span class="text-caption text-medium-emphasis">{{ subject.marks.length }} mark{{ subject.marks.length !== 1 ? 's' : '' }}</span>
                </div>
              </VExpansionPanelTitle>

              <!-- Marks -->
              <VExpansionPanelText class="pt-2">
                <VDataTableVirtual
                  :headers="subjectTableHeaders[semester.id][subject.id]"
                  :items="subjectTableItems[semester.id][subject.id]"
                  density="comfortable"
                  class="elevation-1"
                  style="background-color: rgb(var(--v-theme-surface-light), 0.2)"
                  fixed-header
                  hover
                >
                  <template 
                    v-for="mark in subject.marks" 
                    :key="`header-${mark.name}`" 
                    v-slot:[`header.mark-${mark.name}`]="{ column }"
                  >
                    <span class="text-uppercase" style="font-size: 0.8rem; font-weight: 600">{{ mark.name }}</span>
                    <span class="text-medium-emphasis ml-1">({{ mark.coeff }})</span>
                  </template>

                  <template v-slot:header.total="{ column }">
                    <span class="text-uppercase font-weight-bold">{{ column.title }}</span>
                  </template>

                  <template v-slot:item.student="{ value }">
                    <span>{{ value }}</span>
                  </template>

                  <template 
                    v-for="mark in subject.marks" 
                    :key="`item-${mark.name}`" 
                    v-slot:[`item.mark-${mark.name}`]="{ value }"
                  >
                    <span class="text-medium-emphasis">{{ value }}</span>
                  </template>

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
