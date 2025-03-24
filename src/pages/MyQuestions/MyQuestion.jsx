import { useState, useEffect } from "react";
import axios from "axios";
import { formatDistanceToNow, isValid } from "date-fns";
import {
  Pen,
  Trash2,
  Clipboard,
  CheckCheck,
  Bell,
  SquarePen,
  Send,
  ChevronRight,
  Loader2,
  Search,
  ThumbsUp,
  MessageCircle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Tiptap from "../../components/TipTap";
import parse, { domToReact } from "html-react-parser";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BACKEND_API_URL } from "@/constant";
import { useDispatch, useSelector } from "react-redux";
import { questionCreatedByMe, setLoading } from "@/redux/ques/quesSlice";
import SuccessToast from "@/components/Toast/SuccessToast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link, useOutletContext } from "react-router-dom";
import { cn } from "@/lib/utils";
import ErrorToast from "@/components/Toast/ErrorToast";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function MyQuestion() {
  const {
    user,
    notifications,
    unreadCount,
    handleCreateQues,
    markAsRead,
    handleRedirectMessage,
  } = useOutletContext();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [expandedTags, setExpandedTags] = useState({});
  const [answers, setAnswers] = useState([]);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [answerError, setAnswerError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialFetch, setIsInitialFetch] = useState(true); // Track initial fetch

  const dispatch = useDispatch();
  const {
    questionCreatedByMe: questions,
    loading,
    error: questionsError,
  } = useSelector((state) => state.questions);

  const options = {
    replace: (domNode) => {
      if (domNode instanceof Element) {
        switch (domNode.name) {
          case "ul":
            return (
              <ul className="list-disc pl-5">
                {domToReact(domNode.children, options)}
              </ul>
            );
          case "ol":
            return (
              <ol className="list-decimal pl-5">
                {domToReact(domNode.children, options)}
              </ol>
            );
          case "li":
            return <li>{domToReact(domNode.children, options)}</li>;
          case "blockquote":
            return (
              <blockquote className="border-l-4 border-slate-400 pl-4 italic text-slate-300">
                {domToReact(domNode.children, options)}
              </blockquote>
            );
          case "img":
            return (
              <img
                src={domNode.attribs.src}
                alt={domNode.attribs.alt || "Image"}
                className="max-w-xl h-auto rounded-md"
              />
            );
          case "a":
            return (
              <a
                href={domNode.attribs.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {domToReact(domNode.children, options)}
              </a>
            );
        }
      }
    },
  };

  const Badges = [
    {
      name: "css",
      aliases: ["css3", "styling"],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740912214/w3_css-icon_old_cllr3z.svg",
    },
    {
      name: "image",
      aliases: ["Base64", "image testing"],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740911931/picture-photo-svgrepo-com_lmkvwi.svg",
    },
    {
      name: "react.js",
      aliases: ["reactjs", "react"],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1728738191/react-2_c6jrrj.svg",
    },
    {
      name: "node.js",
      aliases: ["nodejs", "node"],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1728738192/nodejs-icon_z8mjxz.svg",
    },
    {
      name: "javascript",
      aliases: ["js"],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1728738190/logo-javascript_jxymx6.svg",
    },
    {
      name: "python",
      aliases: [],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1728738250/python-icon_ihlzuk.svg",
    },
    {
      name: "java",
      aliases: [],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1728738362/java-icon_adjtgl.svg",
    },
    {
      name: "c++",
      aliases: ["cpp"],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1728738190/c_ojh7bw.svg",
    },
    {
      name: "html",
      aliases: ["html5"],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1728738191/html-1_xz62kl.svg",
    },
    {
      name: "angular",
      aliases: ["angularjs"],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1728738190/angular-icon-1_aiwgpq.svg",
    },
    {
      name: "digitalocean",
      aliases: [],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1728738191/digitalocean-icon_u3tnrl.svg",
    },
    {
      name: "aws",
      aliases: ["amazon web services"],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1728738913/icons8-aws_llolqc.svg",
    },
    {
      name: "next.js",
      aliases: ["nextjs"],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1728739011/nextjs-icon_cbafxp.svg",
    },
    {
      name: "typescript",
      aliases: ["ts"],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250169/typescript-icon-svgrepo-com_bfafaw.svg",
    },
    {
      name: "go",
      aliases: ["golang"],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250169/go-svgrepo-com_r3sgdm.svg",
    },
    {
      name: "ruby",
      aliases: [],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250168/ruby-svgrepo-com_kmqkbz.svg",
    },
    {
      name: "swift",
      aliases: [],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250168/swift-svgrepo-com_sivm0e.svg",
    },
    {
      name: "kotlin",
      aliases: [],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250168/kotlin-svgrepo-com_xo0s9k.svg",
    },
    {
      name: "rust",
      aliases: [],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250168/rust-svgrepo-com_h3tubm.svg",
    },
    {
      name: "php",
      aliases: [],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250167/php-svgrepo-com_s3om4c.svg",
    },
    {
      name: "c#",
      aliases: ["csharp"],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250165/c--4_tkfunq.svg",
    },
    {
      name: "r",
      aliases: [],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250164/r-lang-svgrepo-com_fif9ng.svg",
    },
    {
      name: "vue.js",
      aliases: ["vuejs", "vue"],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250162/vue-js-svgrepo-com_mqhp8l.svg",
    },
    {
      name: "svelte",
      aliases: [],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250162/svelte-icon-svgrepo-com_kxmjly.svg",
    },
    {
      name: "bootstrap",
      aliases: [],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250167/bootstrap-svgrepo-com_t8zqrl.svg",
    },
    {
      name: "tailwind css",
      aliases: ["tailwindcss", "tailwind"],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250166/tailwind-svgrepo-com_rslfdz.svg",
    },
    {
      name: "express.js",
      aliases: ["expressjs", "express"],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250166/express-svgrepo-com_juzt7u.svg",
    },
    {
      name: "django",
      aliases: [],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250166/django-svgrepo-com_uwpint.svg",
    },
    {
      name: "laravel",
      aliases: [],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250166/laravel-svgrepo-com_ael0jl.svg",
    },
    {
      name: "mysql",
      aliases: [],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250165/mysql-logo-svgrepo-com_x0nodu.svg",
    },
    {
      name: "postgresql",
      aliases: ["postgres"],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250164/postgresql-svgrepo-com_g2tlss.svg",
    },
    {
      name: "mongodb",
      aliases: ["mongo"],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250164/mongodb-svgrepo-com_rnft5p.svg",
    },
    {
      name: "docker",
      aliases: [],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250163/docker-svgrepo-com_ccoqmc.svg",
    },
    {
      name: "kubernetes",
      aliases: ["k8s"],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250163/kubernetes-svgrepo-com_munrul.svg",
    },
    {
      name: "pandas",
      aliases: [],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250163/pandas-svgrepo-com_rd0owi.svg",
    },
    {
      name: "flutter",
      aliases: [],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250163/flutter-svgrepo-com_r2emx4.svg",
    },
    {
      name: "react native",
      aliases: ["reactnative"],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250161/preact-svgrepo-com_kycciw.svg",
    },
    {
      name: "git",
      aliases: [],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250161/git-svgrepo-com_mqap7j.svg",
    },
    {
      name: "nginx",
      aliases: [],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250161/nginx-logo-svgrepo-com_dv5ev4.svg",
    },
    {
      name: "figma",
      aliases: [],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250161/figma-svgrepo-com_wqdiou.svg",
    },
    {
      name: "linux",
      aliases: [],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250161/linux-svgrepo-com_xevtrj.svg",
    },
    {
      name: "Gitlab",
      aliases: [],
      logo: "https://res.cloudinary.com/vanshstorage/image/upload/v1740250161/gitlab-svgrepo-com_ok9wjq.svg",
    },
  ];

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

  const getBadgeLogo = (tag) => {
    const normalizedTag = tag.trim().toLowerCase();
    const badge = Badges.find(
      (badge) =>
        badge.name.toLowerCase() === normalizedTag ||
        badge.aliases.some((alias) => alias.toLowerCase() === normalizedTag)
    );
    return badge
      ? badge.logo
      : "https://res.cloudinary.com/vanshstorage/image/upload/v1729884943/download_m2eu84.png";
  };

  const toggleShowMore = (id) => {
    setExpandedTags((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Fetch questions created by the user
  const fetchQuestions = async () => {
    try {
      dispatch(setLoading(true));
      const response = await axios.get(`${BACKEND_API_URL}/questions/mine`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      dispatch(questionCreatedByMe(response.data.data));
    } catch (error) {
      dispatch(setError(error.message));
      console.error("Error fetching questions:", error);
    } finally {
      dispatch(setLoading(false));
      setIsInitialFetch(false); // Set to false after the first fetch
    }
  };

  // Fetch answers for a specific question
  const handleGetAnswer = async (questionId) => {
    setAnswerLoading(true);
    setAnswerError(null);
    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/questions/${questionId}/answers`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      setAnswers(response.data.data);
    } catch (error) {
      setAnswerError("Failed to fetch answers");
      ErrorToast("Failed to fetch answers");
    } finally {
      setAnswerLoading(false);
    }
  };

  // Open the edit dialog for a question
  const handleOpenEditDialog = (question) => {
    setSelectedQuestion(question);
    setEditedTitle(question.title);
    setEditedContent(question.content);
    setIsDialogOpen(true);
  };

  // Handle saving the edited question
  const handleEditQuestion = async () => {
    if (!editedTitle.trim() || !editedContent.trim()) {
      setError("Title and content cannot be empty.");
      return;
    }
    setIsEditing(true);
    setError(null);
    try {
      const payload = { title: editedTitle, content: editedContent };
      console.log("Payload being sent to backend:", payload); // Log the payload

      await axios.patch(
        `${BACKEND_API_URL}/questions/${selectedQuestion.id}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      setIsDialogOpen(false);
      fetchQuestions();
      SuccessToast("Question updated successfully!");
    } catch (error) {
      console.error("Error editing question:", error.response?.data); // Log the error response
      setError("Failed to edit question. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  // Handle deleting a question
  const handleDeleteQuestion = (id) => {
    setQuestionToDelete(id);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${BACKEND_API_URL}/questions/${questionToDelete}`, {
        withCredentials: true,
      });
      fetchQuestions();
      SuccessToast("Question deleted successfully!");
    } catch (error) {
      console.error("Error deleting question:", error);
      dispatch(setError("Failed to delete question. Please try again."));
    } finally {
      setShowDeleteAlert(false);
      setQuestionToDelete(null);
    }
  };

  // Format the createdAt date
  const formatCreatedAt = (createdAt) => {
    const date = new Date(createdAt);
    if (!isValid(date)) return "Invalid date";
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Fetch questions on component mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  // Fetch answers when a question is selected
  useEffect(() => {
    if (selectedQuestion) {
      handleGetAnswer(selectedQuestion.id);
    }
  }, [selectedQuestion]);

  return (
    <div className="h-full overflow-hidden">
      {/* Header */}
      <header className="sticky hidden 2xl:flex top-0 z-10 bg-background justify-between items-center px-4 py-2 h-[57px] border-b animate-in slide-in-from-top duration-300">
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
          <Button variant="outline" size="icon" onClick={handleCreateQues}>
            <SquarePen className="h-5 w-5" />
          </Button>
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
                            notification.read ? "bg-background" : "bg-muted"
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
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 p-4 animate-in slide-in-from-right duration-300">
        {/* Left Column: Questions List */}
        <div className="lg:w-1/2">
          <div className="mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-140px)]">
            {loading && isInitialFetch ? ( // Show shimmer only during initial fetch
              <div className="flex flex-col gap-4">
                {[...Array(5)].map((_, index) => (
                  <Skeleton
                    key={index}
                    className={cn(
                      "flex flex-col animate-in fade-in duration-500 slide-in-from-right items-start gap-3 rounded-lg border p-4 text-left text-sm transition-all hover:bg-accent"
                    )}
                  >
                    <Skeleton className="flex w-full flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full" />
                        <div className="flex w-full font-bold justify-between items-center">
                          <div className="flex gap-3">
                            <Skeleton className="h-4 w-24 bg-gray-300 dark:bg-gray-600" />
                          </div>
                          <Skeleton className="h-4 w-16 bg-gray-300 dark:bg-gray-600" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-48 bg-gray-300 dark:bg-gray-600" />
                      </div>
                      <Skeleton className="h-10 w-full bg-gray-300 dark:bg-gray-600" />
                    </Skeleton>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[...Array(4)].map((_, index) => (
                        <Skeleton
                          key={index}
                          className="flex w-20 items-center gap-1 px-2 py-1 bg-gray-300 dark:bg-gray-600"
                        >
                          <Skeleton className="w-4 h-4 bg-gray-400 dark:bg-gray-500" />
                          <Skeleton className="w-12 h-4 bg-gray-400 dark:bg-gray-500" />
                        </Skeleton>
                      ))}
                    </div>
                  </Skeleton>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {questions
                  .filter((question) =>
                    question.title
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                  .map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex flex-col items-start gap-3 rounded-lg border p-4 text-left text-sm transition-all hover:bg-accent cursor-pointer"
                      )}
                      onClick={() => {
                        setSelectedQuestion(item);
                        handleGetAnswer(item.id);
                      }}
                    >
                      <div className="flex w-full flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={item.user?.picture}
                              alt={`Profile picture of ${item.user?.name}`}
                            />
                            <AvatarFallback>
                              {item.user?.name?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex w-full font-bold justify-between items-center">
                            <div className="flex gap-3">
                              <div className="text-[14px]">
                                {item.user?.name}
                              </div>
                              <div className="flex items-center">
                                {!item.read && (
                                  <span className="h-2 w-2 rounded-full bg-blue-300" />
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground font-bold">
                              {formatCreatedAt(item.updatedAt)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-sm">
                            {item.title}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.slice(0, 5).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="flex items-center gap-1 px-2 py-1 text-xs"
                          >
                            <img
                              src={getBadgeLogo(tag)}
                              alt={`${tag} logo`}
                              className="w-3 h-3"
                            />
                            <span>{tag}</span>
                          </Badge>
                        ))}
                        {item.tags.length > 5 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleShowMore(item.id);
                            }}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {expandedTags[item.id] ? (
                              <span>Show Less</span>
                            ) : (
                              <>
                                <span>{item.tags.length - 5} more</span>
                                <ChevronRight className="w-3 h-3" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          className="border"
                          onClick={() => handleOpenEditDialog(item)}
                        >
                          <Pen className="h-5 w-5 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          className="border"
                          onClick={() => handleDeleteQuestion(item.id)}
                        >
                          <Trash2 className="h-5 w-5 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right Column: Selected Question and Answers */}
        <div className="lg:w-1/2 mb-4">
          {selectedQuestion ? (
            <div className="bg-background rounded-lg border p-6 h-[calc(100vh-80px)] overflow-hidden">
              <h3 className="text-xl font-semibold mb-4">
                Answers ({answers.length})
              </h3>
              {answerLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin">
                    <Loader2 className="w-8 h-8 text-primary" />
                  </div>
                </div>
              ) : answers?.length > 0 ? (
                <ScrollArea className="h-full">
                  {answers?.map((answer) => (
                    <div
                      key={answer.id}
                      className="bg-background border rounded-lg p-6 mb-4"
                    >
                      <div className="flex items-center gap-3 mb-2 p-1">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={answer.user?.picture}
                            alt={`Profile picture of ${answer.user?.name}`}
                          />
                          <AvatarFallback>
                            {answer.user?.name?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-sm">
                            {answer.user?.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatCreatedAt(answer.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="prose dark:prose-invert max-w-none text-sm mt-2">
                        {parse(answer.content, options)}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground">No answers yet.</p>
              )}
            </div>
          ) : (
            <div className="flex justify-center items-center h-[calc(100vh-80px)] text-muted-foreground border rounded-lg">
              Select a question to view answers
            </div>
          )}
        </div>
      </div>

      {/* Edit Question Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[1200px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Edit your question here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow pr-4">
            <div className="flex flex-col p-4">
              {selectedQuestion && (
                <>
                  <div className="flex items-start gap-4 text-sm">
                    <Avatar>
                      <AvatarImage
                        src={selectedQuestion.user?.picture}
                        alt={selectedQuestion.user?.name}
                      />
                      <AvatarFallback>
                        {selectedQuestion.user?.name
                          ?.split(" ")
                          ?.map((chunk) => chunk[0])
                          ?.join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="font-semibold">
                        {selectedQuestion.user?.name}
                      </div>
                      {selectedQuestion.updatedAt && (
                        <div className="line-clamp-1 text-xs font-normal">
                          <span className="font-medium">Updated:</span>{" "}
                          {formatCreatedAt(selectedQuestion.updatedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator className="my-4" />
                </>
              )}
              <div className="flex justify-between space-x-8 p-6">
                <div className="flex flex-col w-1/2 space-y-6">
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Title
                    </Label>
                    <Input
                      id="title"
                      className="border"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col space-y-2 flex-grow">
                    <Label htmlFor="content" className="text-sm font-medium">
                      Content
                    </Label>
                    <div className="border rounded-md p-2 flex-grow">
                      <Tiptap
                        onEditorContentSave={setEditedContent}
                        initialContent={editedContent}
                        editable={true}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col w-1/2 space-y-2">
                  <Label className="text-sm font-medium">Preview</Label>
                  <div className="border rounded-md p-4 flex-grow overflow-auto">
                    <h2 className="text-xl font-bold mb-4">{editedTitle}</h2>
                    <div className="mycontent font-normal whitespace-pre-wrap text-sm">
                      {parse(editedContent, options)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            {error && <p className="text-red-500">{error}</p>}
            <Button
              type="submit"
              onClick={handleEditQuestion}
              disabled={isEditing}
            >
              {isEditing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Question Alert */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this question?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              question.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteAlert(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-white hover:bg-slate-200"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default MyQuestion;
