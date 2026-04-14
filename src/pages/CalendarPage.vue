<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "@/i18n";
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
const { locale, t } = useI18n();

onMounted(() => {
  if (!taskStore.initialized) {
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
      :title="t('calendar.title')"
      :description="t('calendar.description')"
    />

    <LoadingState
      v-if="taskStore.loading"
      :title="t('loading.calendarTitle')"
      :description="t('loading.calendarDescription')"
    />

    <section v-else class="calendar-shell">
      <div class="calendar-toolbar">
        <div class="calendar-toolbar-actions">
          <button class="secondary-button" type="button" @click="showPreviousMonth">{{ t("calendar.previous") }}</button>
          <button class="secondary-button" type="button" @click="jumpToToday">{{ t("calendar.today") }}</button>
        </div>
        <h3>{{ formatMonthLabel(visibleMonth) }}</h3>
        <button class="secondary-button" type="button" @click="showNextMonth">{{ t("calendar.next") }}</button>
      </div>

      <div class="calendar-weekdays">
        <span>{{ locale === "zh-CN" ? "日" : "Sun" }}</span>
        <span>{{ locale === "zh-CN" ? "一" : "Mon" }}</span>
        <span>{{ locale === "zh-CN" ? "二" : "Tue" }}</span>
        <span>{{ locale === "zh-CN" ? "三" : "Wed" }}</span>
        <span>{{ locale === "zh-CN" ? "四" : "Thu" }}</span>
        <span>{{ locale === "zh-CN" ? "五" : "Fri" }}</span>
        <span>{{ locale === "zh-CN" ? "六" : "Sat" }}</span>
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
            {{ t("calendar.dayCount", { count: taskCountByDay.get(day.key)! }) }}
          </span>
        </button>
      </div>
    </section>

    <section v-if="!taskStore.loading" class="day-panel">
      <header class="day-panel-header">
        <div>
          <p class="page-kicker">{{ t("page.selectedDay") }}</p>
          <h3>{{ selectedDayLabel }}</h3>
        </div>
        <p class="day-panel-summary">{{ t("task.activeCount", { count: selectedDayTasks.length }) }}</p>
      </header>

      <div v-if="selectedDayTasks.length" class="day-task-list">
        <article v-for="task in selectedDayTasks" :key="task.id" class="day-task-card">
          <div class="day-task-top">
            <h4>{{ task.title }}</h4>
            <RouterLink class="task-edit-link" :to="`/tasks/${task.id}/edit`">{{ t("task.edit") }}</RouterLink>
          </div>
          <p v-if="task.notes" class="task-notes">{{ task.notes }}</p>
          <p class="day-task-meta">{{ t("task.due") }} {{ formatDateTime(task.dueAt) }}</p>
        </article>
      </div>
      <div v-else class="empty-state">
        <h3>{{ t("calendar.emptyTitle") }}</h3>
        <p>{{ t("calendar.emptyDescription") }}</p>
      </div>
    </section>
  </section>
</template>
