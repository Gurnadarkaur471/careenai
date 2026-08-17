import React, { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import api from "../services/api";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  const load = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.data.notifications);
      setUnreadCount(res.data.data.unreadCount);
    } catch {
      // silently ignore — notification bell is non-critical
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    await api.patch("/notifications/read-all");
    load();
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="relative p-2 rounded-lg hover:bg-slate-100">
        <Bell size={20} className="text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="font-semibold text-sm">Notifications</span>
            <button onClick={markAllRead} className="text-xs text-brand-600 hover:underline">Mark all read</button>
          </div>
          {notifications.length === 0 && <p className="text-sm text-slate-400 p-4">No notifications yet.</p>}
          {notifications.map((n) => (
            <div key={n._id} className={`px-4 py-3 border-b border-slate-50 text-sm ${!n.read ? "bg-brand-50/40" : ""}`}>
              <p className="font-medium text-slate-800">{n.title}</p>
              <p className="text-slate-500 text-xs mt-0.5">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
