
import React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Notification } from "@/types";
import { NotificationItem } from "./NotificationItem";

export function NotificationPopover() {
  // Mock notifications - in a real app, these would come from an API
  const mockNotifications: Notification[] = [
    {
      id: "1",
      type: "invite",
      userId: "user1",
      title: "New invitation",
      message: "John invited you to join 'Movie Night' watchlist",
      read: false,
      data: { watchlistId: "123" },
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: "2",
      type: "comment",
      userId: "user2",
      title: "New comment",
      message: "Sarah commented on 'Inception' in your watchlist",
      read: true,
      data: { watchlistId: "123", itemId: "456" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: "3",
      type: "release",
      userId: "system",
      title: "New release",
      message: "A movie from your watchlist is now available",
      read: true,
      data: { movieId: "789" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
  ];
  
  const unreadCount = mockNotifications.filter(n => !n.read).length;
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-pastel text-primary rounded-full text-xs flex items-center justify-center transform translate-x-1 -translate-y-1">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 max-h-96 overflow-auto" align="end">
        <div className="p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
        </div>
        {mockNotifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No notifications
          </div>
        ) : (
          <div className="divide-y">
            {mockNotifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
              />
            ))}
          </div>
        )}
        <div className="p-2 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-center text-sm h-8"
            disabled={mockNotifications.length === 0}
          >
            Mark all as read
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
