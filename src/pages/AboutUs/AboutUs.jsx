import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Github, Linkedin, Bell, Send, ThumbsUp, MessageCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import { BACKEND_API_URL } from "@/constant";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/redux/auth/authSlice";
import SuccessToast from "@/components/Toast/SuccessToast";

const AboutUs = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSubscribing, setIsSubscribing] = useState(false); // New state for subscription process
  const isNewsLetterSubscribed = useSelector(
    (state) => state.auth.user?.isNewsLetterSubscribed
  );
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

    const getNotificationIcon = (notification) => {
      if (notification.message.includes("has received a new answer")) {
        return <Send size={18} />; // Use the Send icon for answers
      } else if (notification.message.includes("has received a like")) {
        return <ThumbsUp size={18} />; // Use the ThumbsUp icon for likes
      } else if (notification.message.includes("has been commented on")) {
        return <MessageCircle size={18} />; // Use the MessageCircle icon for comments
      }
      return null; // Default icon
    };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 6000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${BACKEND_API_URL}/notifications`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      setNotifications(response.data.data);
      setUnreadCount(response.data.data.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const formatCreatedAt = (createdAt) => {
    return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  };

  const markAsRead = async () => {
    try {
      await axios.post(
        `${BACKEND_API_URL}/notifications/mark-all-as-read`,
        {},
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      await fetchNotifications();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleNewsletter = async () => {
    setIsSubscribing(true); // Set subscribing state to true
    try {
      await axios.patch(
        `${BACKEND_API_URL}/newsletter`,
        {},
        { withCredentials: true }
      );
      dispatch(setUser({ ...user, isNewsLetterSubscribed: true }));
      SuccessToast("Subscribed to newsletter successfully");
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
    } finally {
      setIsSubscribing(false); // Reset subscribing state
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="hidden 2xl:flex sticky top-0 z-10 bg-background justify-between items-center px-4 py-2 h-[57px] border-b animate-in fade-in duration-300">
        <div className="container mx-auto  py-2 flex justify-between items-center">
          <img
            src="https://res.cloudinary.com/vanshstorage/image/upload/v1738212405/12200605_sbzf8a.svg"
            alt="BugBee Logo"
            height={100}
            width={100}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold">Notifications</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAsRead}
                  disabled={unreadCount === 0}
                >
                  Mark all as read
                </Button>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="p-4">
                  {notifications.length === 0 ? (
                    <p className="text-center text-muted-foreground">
                      No notifications
                    </p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-4 rounded-md p-3 mb-2 transition-colors cursor-pointer ${
                          notification.read ? "bg-background" : "bg-muted"
                        }`}
                      >
                        <div className="mt-1 h-5 w-5 text-primary shrink-0">
                          {getNotificationIcon(notification)}
                        </div>
                        <div className="grid gap-1 overflow-hidden">
                          <p className="text-sm leading-none truncate">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatCreatedAt(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      <ScrollArea className="flex-grow">
        <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
          <h1 className="text-4xl font-bold text-center mb-8 flex items-center justify-center">
            About BugBee 🐞
          </h1>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Our Mission 🚀</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">
                BugBee is dedicated to solving developers' problems with tedious
                tasks. We provide a collaborative platform where developers can
                help each other, share knowledge, and find solutions to common
                coding challenges. Our mission is to foster a supportive
                community that accelerates problem-solving and boosts
                productivity in the world of software development.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What BugBee Offers 🛠️</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  A forum-like platform for developers to ask and answer
                  questions
                </li>
                <li>Collaborative problem-solving for tedious coding tasks</li>
                <li>
                  Knowledge sharing and best practices from experienced
                  developers
                </li>
                <li>Categorized discussions for easy navigation and search</li>
                <li>
                  Reputation system to recognize helpful community members
                </li>
                <li>
                  Integration with popular development tools and version control
                  systems
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Newsletter 📰</CardTitle>
              <CardDescription>
                Stay updated with the latest discussions, features, and
                developer tips
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isNewsLetterSubscribed ? (
                <Button
                  type="submit"
                  onClick={handleNewsletter}
                  disabled={isSubscribing} // Disable button while subscribing
                >
                  {isSubscribing ? "Subscribing..." : "Subscribe"}
                </Button>
              ) : (
                <Button disabled>Subscribed</Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Developed By 👨‍💻</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DeveloperCard
                  name="Vansh kumar"
                  role="Front-end Developer"
                  bio="A tech enthusiast who loves to explore new technologies and leverage them to solve real-life problems 🌟. With a strong foundation in both front-end and back-end development, I aim to create seamless and efficient applications that provide an exceptional user experience.👨‍💻"
                  github="Vansh16aug"
                  linkedin="vansh-kumar16aug"
                />
                <DeveloperCard
                  name="Harshit kumar Mishra"
                  role="Back-end Developer"
                  bio="Crafting needs into reality through my code. ❤️
My expertise spans from the front-end to the back-end.
I love working on web-based technologies and their underlying internals. 👨🏻‍💻"
                  github="Zack-Dx"
                  linkedin="harshit-kr-mishra09"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                © 2023 BugBee. All rights reserved.
              </p>
            </CardFooter>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

const DeveloperCard = ({ name, role, bio, github, linkedin }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{role}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{bio}</p>
        <div className="flex space-x-2">
          <a
            href={`https://github.com/${github}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="icon">
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Button>
          </a>
          <a
            href={`https://linkedin.com/in/${linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="icon">
              <Linkedin className="h-4 w-4" />
              <span className="sr-only">LinkedIn</span>
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default AboutUs;
