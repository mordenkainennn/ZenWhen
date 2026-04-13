<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import LoadingState from "@/components/LoadingState.vue";
import PageHeader from "@/components/PageHeader.vue";
import { useTaskStore } from "@/stores/task";
import {
  addMonths,
  formatDateTime,
  formatLongDate,
  formatMonthLabel,
  getMonthGrid,
  nowIso,
  startOfMonthKey,
  toDateKey,
  todayKey,
} from "@/utils/date";

const taskStore = useTaskStore();
const visibleMonth = ref(nowIso());
const selectedDateKey = ref(todayKey());

onMounted(() => {
  if (!taskStore.tasks.length) {
    void taskStore.loadTasks();
  }
});

const calendarDays = computed(() => getMonthGrid(visibleMonth.value));

const activeTasks = computed(() =>
  taskStore.tasks
    .filter((task) => !task.completed && !task.archived)
    .sort((left, right) => left.dueAt.localeCompare(right.dueAt)),
);

const taskCountByDay = computed(() => {
  const counts = new Map<string, number>();

  for (const task of activeTasks.value) {
    const key = toDateKey(task.dueAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return counts;
});

const selectedDayTasks = computed(() =>
  activeTasks.value.filter((task) => toDateKey(task.dueAt) === selectedDateKey.value),
);

const selectedDayLabel = computed(() => formatLongDate(selectedDateKey.value));

function showPreviousMonth() {
  visibleMonth.value = addMonths(visibleMonth.value, -1);
  selectedDateKey.value = startOfMonthKey(visibleMonth.value);
}

function showNextMonth() {
  visibleMonth.value = addMonths(visibleMonth.value, 1);
  selectedDateKey.value = startOfMonthKey(visibleMonth.value);
}

function jumpToToday() {
  visibleMonth.value = nowIso();
  selectedDateKey.value = todayKey();
}

function selectDay(dateKey: string) {
  selectedDateKey.value = dateKey;
}
</script>

<template>
  <section class="page-stack">
    <PageHeader
      title="Calendar"
      description="A simplified time-distribution view for spotting busy days."
    />

    <LoadingState
      v-if="taskStore.loading"
      title="Loading calendar"
      description="Building your month view and daily task counts."
    />

    <section v-else class="calendar-shell">
      <div class="calendar-toolbar">
        <div class="calendar-toolbar-actions">
          <button class="secondary-button" type="button" @click="showPreviousMonth">Previous</button>
          <button class="secondary-button" type="button" @click="jumpToToday">Today</button>
        </div>
        <h3>{{ formatMonthLabel(visibleMonth) }}</h3>
        <button class="secondary-button" type="button" @click="showNextMonth">Next</button>
      </div>

      <div class="calendar-weekdays">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      <div class="calendar-grid">
        <button
          v-for="day in calendarDays"
          :key="day.key"
          class="calendar-day"
          :class="{
            'calendar-day-outside': !day.isCurrentMonth,
            'calendar-day-selected': selectedDateKey === day.key,
            'calendar-day-today': day.key === todayKey(),
          }"
          type="button"
          @click="selectDay(day.key)"
        >
          <span class="calendar-day-number">{{ day.dayNumber }}</span>
          <span v-if="taskCountByDay.get(day.key)" class="calendar-day-count">
            {{ taskCountByDay.get(day.key) }} task<span v-if="taskCountByDay.get(day.key)! > 1">s</span>
          </span>
        </button>
      </div>
    </section>

    <section v-if="!taskStore.loading" class="day-panel">
      <header class="day-panel-header">
        <div>
          <p class="page-kicker">Selected Day</p>
          <h3>{{ selectedDayLabel }}</h3>
        </div>
        <p class="day-panel-summary">
          {{ selectedDayTasks.length }} active task<span v-if="selectedDayTasks.length !== 1">s</span>
        </p>
      </header>

      <div v-if="selectedDayTasks.length" class="day-task-list">
        <article v-for="task in selectedDayTasks" :key="task.id" class="day-task-card">
          <div class="day-task-top">
            <h4>{{ task.title }}</h4>
            <RouterLink class="task-edit-link" :to="`/tasks/${task.id}/edit`">Edit</RouterLink>
          </div>
          <p v-if="task.notes" class="task-notes">{{ task.notes }}</p>
          <p class="day-task-meta">Due {{ formatDateTime(task.dueAt) }}</p>
        </article>
      </div>
      <div v-else class="empty-state">
        <h3>No active tasks on this date</h3>
        <p>Select another day to inspect your upcoming workload.</p>
      </div>
    </section>
  </section>
</template>
