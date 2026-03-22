import { useEffect } from "react";
import { generateNotifications } from "@/lib/notifications";

type NotificationState = {
  spending: number;
  income: number;
  cash: number;
};

export function useNotifications(state: NotificationState) {
  useEffect(() => {
    const alerts = generateNotifications(state);

    alerts.forEach((msg) => {
      console.log("NOTIFICATION:", msg);
    });
  }, [state]);
}
