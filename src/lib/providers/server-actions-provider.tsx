import { ActionsProvider } from "./actions";
import type { ActionsContext } from "./actions";
import { createEvent, updateEvent, deleteEvent, getEvent } from "@/app/actions/event";
import { 
  createSchedule, 
  updateSchedule, 
  submitAvailability, 
  getAggregatedTimeSlots,
  getSchedulesByEvent,
  getScheduleByEventAndUser,
  deleteSchedule
} from "@/app/actions/schedule";

// Server Componentで実際のServer Actionsを注入するProvider
export function ServerActionsProvider({ children }: { children: React.ReactNode }) {
  const actions: ActionsContext = {
    event: {
      create: createEvent,
      update: updateEvent,
      delete: deleteEvent,
      get: getEvent,
    },
    schedule: {
      create: createSchedule,
      update: updateSchedule,
      submit: submitAvailability,
      getAggregated: getAggregatedTimeSlots,
      getByEvent: getSchedulesByEvent,
      getByEventAndUser: getScheduleByEventAndUser,
      delete: deleteSchedule,
    },
  };
  
  return (
    <ActionsProvider value={actions}>
      {children}
    </ActionsProvider>
  );
}