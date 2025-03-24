import { useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Bell,
  File,
  Inbox,
  Loader2,
  MessageCircle,
  Search,
  Send,
  SquarePen,
  ThumbsUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuesDisplay } from "@/components/Ques/ques-display";
import { QuesList } from "@/components/Ques/ques-list";
import { fetchQuesSuccess } from "@/redux/ques/quesSlice";
import axios from "axios";
import Tiptap from "../TipTap";
import { BACKEND_API_URL } from "@/constant";
import { formatDistanceToNow } from "date-fns";
import SignIn from "../auth/SignIn";
import SuccessToast from "../Toast/SuccessToast";
import ErrorToast from "../Toast/ErrorToast";
import { useDebounce } from "use-debounce";
import { Link } from "react-router-dom";

export function Ques() {
  const [selectedQues, setSelectedQues] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchInput] = useDebounce(searchInput, 300);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quesData, setQuesData] = useState({
    title: "",
    content: "",
    tags: [],
  });
  const [quesPostLoading, setQuesPostLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [marking, setMarking] = useState(false);
  const [tiptapContent, setTiptapContent] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dispatch = useDispatch();
  const isSidebarCollapsed = useSelector(
    (store) => store.app.isSidebarCollapsed
  );
  const user = useSelector((store) => store.auth.user);

  const numberOfQuestions = useSelector(
    (state) => state.questions.questionCreatedByMe
  );
  const quesCount = useSelector((store) => store.questions.questions.length);

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

  const fetchSelectedQues = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_API_URL}/questions/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching question:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleQuesSelection = async (quesId) => {
    const data = await fetchSelectedQues(quesId);
    if (data) {
      setSelectedQues(data);
      setIsQuestionModalOpen(true);
    }
  };

  const handleQuesFieldChange = (e) => {
    const { id, value } = e.target;
    setQuesData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handlePanelResize = useCallback((sizes) => {
    document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
  }, []);

  const handleEditorSaveContent = (content) => {
    setTiptapContent(content);
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
      SuccessToast("Question posted successfully");
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
        ErrorToast(
          "The content is too large. Please reduce the size and try again."
        );
      } else if (error.response && error.response.status === 401) {
        setError("You need to be logged in to create a question.");
        ErrorToast("You need to be logged in to create a question.");
      } else if (error.response && error.response.status === 400) {
        setError("Please provide a title and content for the question.");
        ErrorToast("Please provide a title and content for the question.");
      } else {
        setError(
          "An error occurred while creating the question. Please try again."
        );
        ErrorToast(
          "An error occurred while creating the question. Please try again."
        );
      }
    } finally {
      setQuesPostLoading(false);
    }
  };

  const handleCreateQues = () => {
    setIsDialogOpen(true);
  };

  const handleNotifications = async () => {
    try {
      const response = await axios.get(`${BACKEND_API_URL}/notifications`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setNotifications(response.data.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const formatCreatedAt = (createdAt) => {
    const date = new Date(createdAt);
    return formatDistanceToNow(date, { addSuffix: true });
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
      await handleNotifications();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    } finally {
      setMarking(false);
    }
  };

  const handleRedirectMessage = async (questionId) => {
    // Implement redirection logic here
    console.log("Redirecting to question:", questionId);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && !isSidebarCollapsed) {
        dispatch(toggleSidebar());
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch, isSidebarCollapsed]);

  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        handleNotifications();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    // This effect will run whenever the debounced search input changes
    // You can implement the search logic here if needed
    // console.log("Searching for:", debouncedSearchInput);
  }, [debouncedSearchInput]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <TooltipProvider delayDuration={0} className="h-screen">
      <div className="flex lg:hidden h-screen flex-col animate-in slide-in-from-top duration-300 overflow-y-hidden">
        <div className="flex flex-col ">
          <div className="px-4 py-2 ">
            <div className="relative flex gap-2 items-center justify-center">
              <Search className="absolute left-2 top-3.4 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                className="pl-8"
                value={searchInput}
                onChange={handleSearchInputChange}
              />
            </div>
          </div>

          <div className="lg:hidden flex justify-center">
            {!user && <SignIn />}
          </div>
          <main className="flex-grow overflow-y-auto mt-2 min-h-0">
            <Tabs defaultValue="all" className="h-full">
              <TabsContent value="all" className="h-full m-0">
                <QuesList
                  onQuesSelect={handleQuesSelection}
                  searchInput={debouncedSearchInput}
                />
              </TabsContent>
            </Tabs>
          </main>

          {isMobile && (
            <Dialog
              open={isQuestionModalOpen}
              onOpenChange={setIsQuestionModalOpen}
            >
              <DialogContent className="sm:max-w-[100%] w-full h-screen max-h-[100vh] m-0 p-0 flex flex-col rounded-none">
                <DialogHeader className="flex-shrink-0 px-4 py-2 border-b">
                  <DialogTitle className="text-lg font-semibold">
                    Question Details
                  </DialogTitle>
                </DialogHeader>
                <div className="flex-grow overflow-y-scroll">
                  <QuesDisplay selectedQues={selectedQues} loading={loading} />
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-[90vw] w-[50vw] max-h-[85vh] min-h-[70vh] flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                    quesData?.title.trim() === ""
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                >
                  <Label htmlFor="content" className="mb-2 block">
                    Content
                  </Label>
                  <div className="border rounded-md p-2">
                    <Tiptap
                      key={quesData.title}
                      onEditorContentSave={handleEditorSaveContent}
                      editable={quesData?.title.trim() !== ""}
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
      </div>

      <div className="hidden md:hidden md:h-screen animate-in fade-in duration-500 lg:flex overflow-y-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          onLayout={handlePanelResize}
          className="h-full items-stretch"
        >
          <ResizablePanel minSize={40} className={`flex flex-col`}>
            <Tabs defaultValue="all">
              <div
                className={`${
                  window.innerWidth <= 1300 ? "hidden" : "flex"
                } justify-between h-[56px] items-center px-4 py-2`}
              >
                <Link to="/">
                  <img
                    className=" "
                    src="https://res.cloudinary.com/vanshstorage/image/upload/v1738212405/12200605_sbzf8a.svg"
                    alt=""
                    height={100}
                    width={100}
                  />
                </Link>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="relative animate-in fade-in zoom-in loop "
                      onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                    >
                      <Bell className="h-5 w-5 " />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-80 p-0"
                    align="end"
                    hidden={!isPopoverOpen}
                  >
                    <div className="flex items-center justify-between p-4 ">
                      <h2 className="font-semibold">Notifications</h2>
                      {marking ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAsRead}
                          disabled={unreadCount === 0}
                        >
                          Marking...
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAsRead}
                          disabled={unreadCount === 0}
                        >
                          Mark all as read
                        </Button>
                      )}
                    </div>
                    <ScrollArea className="h-[300px]">
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
                                  handleRedirectMessage(notification.questionId)
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
                                    {formatCreatedAt(notification.createdAt)}
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
              <Separator />
              <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="relative flex gap-2 items-center justify-center">
                  <Search className="absolute left-2 top-3.4 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search"
                    className="pl-8"
                    value={searchInput}
                    onChange={handleSearchInputChange}
                  />
                  <div
                    className={`${
                      window.innerWidth <= 1300 ? "hidden" : "flex"
                    } relative group`}
                  >
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
                </div>
              </div>
              <TabsContent
                value="all"
                className="m-0 flex-grow overflow-y-auto"
              >
                <QuesList
                  onQuesSelect={handleQuesSelection}
                  searchInput={debouncedSearchInput}
                />
              </TabsContent>
            </Tabs>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            minSize={35}
            className="flex flex-col overflow-hidden"
          >
            <QuesDisplay selectedQues={selectedQues} loading={loading} />
          </ResizablePanel>
        </ResizablePanelGroup>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-[90vw] w-[50vw] max-h-[85vh] min-h-[70vh] flex flex-col overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                <div className="border rounded-md p-2">
                  <Tiptap
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
    </TooltipProvider>
  );
}
