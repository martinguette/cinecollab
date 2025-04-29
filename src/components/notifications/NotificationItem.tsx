
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Notification } from "@/types";
import { Check, MessageSquare, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { type, title, message, read, createdAt } = notification;
  
  const getIcon = () => {
    switch (type) {
      case "invite":
        return <Users className="h-4 w-4" />;
      case "comment":
        return <MessageSquare className="h-4 w-4" />;
      case "release":
        return <Calendar className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app, this would call an API
    console.log("Marking notification as read:", notification.id);
  };
  
  const handleClick = () => {
    // In a real app, this would navigate to the relevant page
    console.log("Clicked on notification:", notification.id);
  };
  
  return (
    <div
      className={cn(
        "p-3 hover:bg-muted/50 cursor-pointer flex gap-3",
        !read && "bg-accent/30"
      )}
      onClick={handleClick}
    >
      <div className={cn("rounded-full p-2 h-8 w-8 flex items-center justify-center", 
        type === "invite" ? "bg-blue-100 text-blue-600" : 
        type === "comment" ? "bg-green-100 text-green-600" : 
        "bg-amber-100 text-amber-600"
      )}>
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium line-clamp-1">{title}</p>
          {!read && (
            <button 
              onClick={handleMarkAsRead}
              className="rounded-full p-1 hover:bg-background flex items-center justify-center"
              aria-label="Mark as read"
            >
              <Check className="h-3 w-3" />
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(createdAt, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
