import { createRouter, createWebHistory } from "vue-router";
import CalendarPage from "@/pages/CalendarPage.vue";
import InboxPage from "@/pages/InboxPage.vue";
import ReminderPage from "@/pages/ReminderPage.vue";
import ReviewPage from "@/pages/ReviewPage.vue";
import TaskEditorPage from "@/pages/TaskEditorPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "reminder",
      component: ReminderPage,
    },
    {
      path: "/inbox",
      name: "inbox",
      component: InboxPage,
    },
    {
      path: "/review",
      name: "review",
      component: ReviewPage,
    },
    {
      path: "/calendar",
      name: "calendar",
      component: CalendarPage,
    },
    {
      path: "/tasks/new",
      name: "task-create",
      component: TaskEditorPage,
    },
    {
      path: "/tasks/:id/edit",
      name: "task-edit",
      component: TaskEditorPage,
      props: true,
    },
  ],
});

export default router;
