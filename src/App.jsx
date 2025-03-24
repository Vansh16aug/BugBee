import { lazy, Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "./redux/auth/authSlice";
import {
  createBrowserRouter,
  Link,
  Outlet,
  useLocation,
} from "react-router-dom";
import UserProfile from "./pages/Profile/UserProfile";
import "./App.css";
import axios from "axios";
import MyQuestion from "./pages/MyQuestions/MyQuestion";
import { BACKEND_API_URL } from "./constant";
import {
  Bell,
  File,
  Inbox,
  Loader2,
  Menu,
  MessageCircle,
  Send,
  SquarePen,
  ThumbsUp,
} from "lucide-react";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  fetchQuesSuccess,
  questionCreatedByMe,
  setLoading,
} from "./redux/ques/quesSlice";
import Sidebar from "./components/Sidebar.jsx";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toggleSidebar } from "./redux/app/appSlice";
import TipTap from "./components/TipTap";
import { AccountSwitcher } from "./components/Ques/account-switcher";
import { Nav } from "./components/Ques/nav";
import { Toaster } from "react-hot-toast";
import LoadingScreen from "./pages/LoadingScreen";
import Profile from "./pages/UserProfile/Profile";

// Lazy load the pages
const Body = lazy(() => import("./pages/Body"));
const AboutUs = lazy(() => import("./pages/AboutUs/AboutUs"));
const Contact = lazy(() => import("./pages/Contact/Contact"));

const TOGGLE_THRESHOLD = 10;
const NAV_COLLAPSED_SIZE = 4;

const App = () => {
  const [sidebarSize, setSidebarSize] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [marking, setMarking] = useState(false);
  const [tiptapContent, setTiptapContent] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [quesData, setQuesData] = useState({
    title: "",
    content: "",
    tags: [],
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [componentsLoaded, setComponentsLoaded] = useState(false);
  const [dataFetched, setDataFetched] = useState({
    user: false,
    questions: false,
    notifications: false,
  });

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

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

  const handleLoadingComplete = () => {
    if (componentsLoaded) {
      setIsLoading(false);
    } else {
      const checkInterval = setInterval(() => {
        if (componentsLoaded) {
          setIsLoading(false);
          clearInterval(checkInterval);
        }
      }, 100);
    }
  };

  const [quesPostLoading, setQuesPostLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const location = useLocation();
  const quesCount = useSelector((store) => store.questions.questions.length);
  const user = useSelector((store) => store.auth.user);
  const isSidebarCollapsed = useSelector(
    (store) => store.app.isSidebarCollapsed
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1300);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleQuesFieldChange = (e) => {
    const { id, value } = e.target;
    setQuesData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleEditorSaveContent = (content) => {
    setTiptapContent(content);
  };

  const numberOfQuestions = useSelector(
    (state) => state.questions.questionCreatedByMe
  );

  const fetchUserData = async () => {
    try {
      const response = await axios.get(BACKEND_API_URL + "/profile", {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      dispatch(setUser(response.data.data));
      setDataFetched((prev) => ({ ...prev, user: true }));
    } catch (error) {
      dispatch(setUser(null));
      console.log("Error fetching user profile:", error);
      setDataFetched((prev) => ({ ...prev, user: true }));
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleSidebarResize = (sizes) => {
    const newSize = sizes[0];
    setSidebarSize(newSize);
    if (newSize <= TOGGLE_THRESHOLD && !isSidebarCollapsed) {
      dispatch(toggleSidebar());
    } else if (newSize > TOGGLE_THRESHOLD && isSidebarCollapsed) {
      dispatch(toggleSidebar());
    }
  };

  const toggleSidebar2 = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCreateQues = () => {
    setIsDialogOpen(true);
  };

  const markAsRead = async () => {
    try {
      setMarking(true);
      await axios.post(
        `${BACKEND_API_URL}/notifications/mark-all-as-read`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      await fetchNotifications();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    } finally {
      setMarking(false);
    }
  };

  const handleSaveQuestion = async () => {
    try {
      setQuesPostLoading(true);
      setError(null);
      await axios.post(
        `${BACKEND_API_URL}/questions`,
        {
          ...quesData,
          content: tiptapContent,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setIsDialogOpen(false);
      setQuesData({ title: "", content: "", tags: [] });
      setTiptapContent("");
      const response = await axios.get(`${BACKEND_API_URL}/questions`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      dispatch(fetchQuesSuccess(response.data.data));
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 413) {
        setError(
          "The content is too large. Please reduce the size and try again."
        );
      } else if (error.response && error.response.status === 401) {
        setError("You need to be logged in to create a question.");
      } else if (error.response && error.response.status === 400) {
        setError("Please provide a title and content for the question.");
      } else {
        setError(
          "An error occurred while creating the question. Please try again."
        );
      }
    } finally {
      setQuesPostLoading(false);
    }
  };

  const handleRedirectMessage = async (questionId) => {
    // navigate(`/question/${questionId}`);
    console.log(questionId);
    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/questions/${questionId}`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      console.log(response.data.data);
    } catch (error) {
      console.log(error);
    }
    // setIsPopoverOpen(false);
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${BACKEND_API_URL}/notifications`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setNotifications(response.data.data);
      setUnreadCount(response.data.data.filter((n) => !n.read).length);
      setDataFetched((prev) => ({ ...prev, notifications: true }));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setDataFetched((prev) => ({ ...prev, notifications: true }));
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 6000);
      return () => clearInterval(interval);
    } else {
      setDataFetched((prev) => ({ ...prev, notifications: true }));
    }
  }, [user]);

  const formatCreatedAt = (createdAt) => {
    return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  };

  const fetchQuestions = async () => {
    try {
      dispatch(setLoading(true));
      const response = await axios.get(BACKEND_API_URL + "/questions", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      dispatch(fetchQuesSuccess(response.data.data));
      dispatch(setLoading(false));
      setDataFetched((prev) => ({ ...prev, questions: true }));
    } catch (error) {
      dispatch(setError(error.message));
      console.error("Error fetching questions:", error);
      setDataFetched((prev) => ({ ...prev, questions: true }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchLoggedInUserQuestions = async () => {
    try {
      const response = await axios.get(BACKEND_API_URL + "/questions/mine", {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      dispatch(questionCreatedByMe(response.data.data));
    } catch (error) {
      console.log(error);
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    fetchLoggedInUserQuestions();
  }, [user, questionCreatedByMe]);

  const navLinks = [
    {
      title: "Explore Questions",
      label: quesCount.toString(),
      icon: Inbox,
      variant: "ghost",
      href: "/",
    },
  ];

  if (user) {
    navLinks.push({
      title: "My Questions",
      label: numberOfQuestions?.length.toString() || "0",
      icon: File,
      variant: "ghost",
      href: "/myquestions",
    });
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen && !event.target.closest(".sidebar")) {
        closeSidebar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  useEffect(() => {
    const checkComponentsLoaded = () => {
      if (document.readyState === "complete") {
        setComponentsLoaded(true);
      } else {
        window.addEventListener("load", () => setComponentsLoaded(true));
      }
    };

    checkComponentsLoaded();

    return () => {
      window.removeEventListener("load", () => setComponentsLoaded(true));
    };
  }, []);

  useEffect(() => {
    if (
      dataFetched.user &&
      dataFetched.questions &&
      dataFetched.notifications
    ) {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  }, [dataFetched]);

  return (
    <>
      {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}
      {!isLoading && (
        <div className="flex flex-col animate-in fade-in duration-500">
          {isMobile ? (
            <div className="h-screen overflow-hidden">
              {/* Sidebar */}
              <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar2}
                navLinks={navLinks}
                navLinkClick={closeSidebar}
              />
              <div className="flex flex-col">
                {/* Header */}
                <header className="sticky top-0 z-10 bg-background flex justify-between items-center px-4 py-2 h-[56px] border-b animate-in slide-in-from-top duration-300">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleSidebar2}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                  <Link to="/">
                    <img
                      className="animate-in zoom-in duration-300 delay-150"
                      src="https://res.cloudinary.com/vanshstorage/image/upload/v1738212405/12200605_sbzf8a.svg"
                      alt=""
                      height={100}
                      width={100}
                    />
                  </Link>
                  <div className="flex items-center gap-2">
                    {/* Create Post Button */}
                    <div className="relative group animate-in slide-in-from-right duration-300 delay-200">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCreateQues}
                      >
                        <SquarePen className="h-5 w-5" />
                      </Button>
                      <span className="absolute left-1/2 top-full transform -translate-x-1/2 mt-2 bg-[#090909] border border-[#252525] text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-[9999]">
                        Create Post
                      </span>
                    </div>
                    {/* Notifications */}
                    <Popover
                      open={isPopoverOpen}
                      onOpenChange={setIsPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="relative animate-in slide-in-from-right duration-300 delay-300"
                        >
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
                            disabled={unreadCount === 0 || marking}
                          >
                            {marking ? "Marking..." : "Mark all as read"}
                          </Button>
                        </div>
                        <ScrollArea className="max-h-[300px] overflow-y-auto">
                          {user ? (
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
                                      notification.read
                                        ? "bg-background"
                                        : "bg-muted"
                                    }`}
                                    onClick={() =>
                                      handleRedirectMessage(
                                        notification.questionId
                                      )
                                    }
                                  >
                                    <div className="mt-1 h-5 w-5 text-primary shrink-0">
                                      {getNotificationIcon(notification)}
                                    </div>
                                    <div className="grid gap-1 overflow-hidden">
                                      <p className="text-sm leading-none truncate">
                                        {notification.message}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {formatCreatedAt(
                                          notification.createdAt
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          ) : (
                            <div className="p-4 text-center flex items-center justify-center text-muted-foreground">
                              Please login to view notifications
                            </div>
                          )}
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                  </div>
                </header>
                {/* Main Content */}
                <div className="animate-in fade-in duration-500 delay-300">
                  <Toaster position="top-right" />
                  <Outlet
                    context={{
                      user,
                      notifications,
                      unreadCount,
                      handleCreateQues,
                      markAsRead,
                      handleRedirectMessage,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex h-screen animate-in fade-in duration-500">
              <ResizablePanelGroup
                direction="horizontal"
                onLayout={handleSidebarResize}
                className="h-full"
              >
                <ResizablePanel
                  collapsedSize={NAV_COLLAPSED_SIZE}
                  collapsible={true}
                  minSize={NAV_COLLAPSED_SIZE}
                  maxSize={14}
                  className={cn(
                    "bg-background animate-in slide-in-from-left duration-300",
                    isSidebarCollapsed &&
                      "min-w-[50px] transition-all duration-300 ease-in-out"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-[56px] items-center justify-start",
                      isSidebarCollapsed
                        ? "h-[56px] flex justify-center"
                        : "px-2"
                    )}
                  >
                    <AccountSwitcher isCollapsed={isSidebarCollapsed} />
                  </div>
                  <Separator />
                  <Nav links={navLinks} isCollapsed={isSidebarCollapsed} />
                  <Separator />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel minSize={30}>
                  <div className="overflow-hidden animate-in fade-in duration-500 delay-200">
                    <Toaster position="top-right" />
                    <Outlet
                      context={{
                        user,
                        notifications,
                        unreadCount,
                        handleCreateQues,
                        markAsRead,
                        handleRedirectMessage,
                      }}
                    />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          )}

          {/* Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-[90vw] w-[90vw] max-h-[85vh] min-h-[70vh] flex flex-col overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
              <DialogHeader>
                <DialogTitle>Create Question</DialogTitle>
                <DialogDescription>
                  Create a new question here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="flex-grow overflow-y-auto pr-4 p-2">
                <div className="flex flex-col items-start gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    className="border"
                    value={quesData.title}
                    onChange={handleQuesFieldChange}
                  />
                </div>
                <div
                  className={`mt-5 ${
                    quesData.title.trim() === ""
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                >
                  <Label htmlFor="content" className="mb-2 block">
                    Content
                  </Label>
                  <div className="border rounded-md p-2 h-[60vh] overflow-y-auto">
                    <TipTap
                      key={quesData.title}
                      onEditorContentSave={handleEditorSaveContent}
                      editable={quesData.title.trim() !== ""}
                      content={tiptapContent}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                {error && <p className="text-red-500">{error}</p>}
                <Button
                  type="submit"
                  onClick={handleSaveQuestion}
                  disabled={quesPostLoading}
                >
                  {quesPostLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post Question"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
};

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: (
          <Suspense>
            <Body />
          </Suspense>
        ),
      },
      {
        path: "aboutus",
        element: (
          <Suspense>
            <AboutUs />
          </Suspense>
        ),
      },
      {
        path: "contact",
        element: (
          <Suspense>
            <Contact />
          </Suspense>
        ),
      },
      {
        path: "profile",
        element: (
          <Suspense>
            <UserProfile />
          </Suspense>
        ),
      },
      {
        path: "myquestions",
        element: (
          <Suspense>
            <MyQuestion />
          </Suspense>
        ),
      },
      {
        path: "profile/:id",
        element: (
          <Suspense>
            <Profile />
          </Suspense>
        ),
      },
    ],
  },
]);

export default App;
