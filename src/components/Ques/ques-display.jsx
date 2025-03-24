import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatDistanceToNow, parseISO } from "date-fns";
import {
  Archive,
  ArchiveX,
  Clipboard,
  Clock,
  Loader2,
  Trash2,
  MoreVertical,
  Edit,
  Trash,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  FileCode,
  X,
} from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";
import axios from "axios";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import SignIn from "../auth/SignIn";
import { BACKEND_API_URL } from "@/constant";
import EditorDialogWithoutTitle from "../Editor/EditorDialogWithoutTitle";
import Tiptap from "../TipTap";
import SuccessToast from "../Toast/SuccessToast";
import ErrorToast from "../Toast/ErrorToast";
import EditorComponent from "../Editor/EditorContent";
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import parse, { domToReact } from "html-react-parser";
import { Skeleton } from "../ui/skeleton";
import {
  fetchAnsSuccess,
  addAnswer,
  updateAnswer,
  deleteAnswer,
  updateVotes,
  setLoading,
  setError,
} from "@/redux/ans/ansSlice";
import { Link } from "react-router-dom";
import { updateQuesVotes } from "@/redux/ques/quesSlice";
import ImageBlock from "../ImageBlock";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

// Component to render code with a file icon and dialog
const CodeBlock = ({ codeString, language }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getLanguageIcon = () => {
    switch (language) {
      case "jsx":
      case "tsx":
        return <FileCode className="w-4 h-4 text-blue-400" />;
      case "js":
        return <FileCode className="w-4 h-4 text-yellow-400" />;
      case "css":
        return <FileCode className="w-4 h-4 text-blue-500" />;
      case "html":
        return <FileCode className="w-4 h-4 text-orange-500" />;
      default:
        return (
          <div className="flex items-center gap-1 border border-gray-500 rounded-md p-1">
            <FileCode className="w-4 h-4 text-orange-500" />
            <p className="text-gray-500">Code file</p>
          </div>
        );
    }
  };

  return (
    <>
      <button
        onClick={() => setIsDialogOpen(true)}
        className="hover:bg-gray-700 p-1 rounded transition-colors"
        title="Open in dialog"
      >
        {getLanguageIcon()}
      </button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden">
          <AlertDialogCancel className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-700 transition-colors">
            <X className="h-4 w-4" />
          </AlertDialogCancel>

          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              Code
            </AlertDialogTitle>
          </AlertDialogHeader>

          <ScrollArea className="h-[70vh] pr-4">
            <div className="bg-[#1e1e1e] rounded-md overflow-hidden">
              <div className="flex justify-between px-4 py-2 bg-[#2d2d2d] text-white text-xs items-center">
                <p className="text-sm">{language.toUpperCase()}</p>
                <button
                  className="py-1 inline-flex items-center gap-1"
                  onClick={() => {
                    navigator.clipboard.writeText(codeString);
                    SuccessToast("Code copied to clipboard");
                  }}
                >
                  <span className="text-base">
                    <Clipboard className="w-4 h-4" />
                  </span>
                  Copy code
                </button>
              </div>
              <SyntaxHighlighter
                language={language}
                style={vs2015}
                customStyle={{ padding: "25px" }}
                wrapLongLines={true}
                showLineNumbers={true}
              >
                {codeString}
              </SyntaxHighlighter>
            </div>
          </ScrollArea>

          <AlertDialogFooter></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const ImageDialog = ({ src, alt }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className="max-w-full h-auto rounded-md cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setIsDialogOpen(true)}
      />

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="max-w-[50vw] max-h-[80vh] overflow-hidden">
          <AlertDialogCancel className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-700 transition-colors">
            <X className="h-4 w-4" />
          </AlertDialogCancel>

          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              Image Preview
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="flex justify-center items-center">
            <img
              src={src || "/placeholder.svg"}
              alt={alt}
              className="max-w-full max-h-[70vh] rounded-md object-contain"
            />
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export function QuesDisplay({ selectedQues, loading }) {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.user);
  const user = useSelector((state) => state.auth.user);
  const {
    answers,
    loading: loadingAnswers,
    error,
  } = useSelector((state) => state.answers);
  const [editingAnswer, setEditingAnswer] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [answerToDelete, setAnswerToDelete] = useState(null);
  const [isVoteLoading, setVoteLoading] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [questionData, setQuestionData] = useState(selectedQues);
  const [votedItems, setVotedItems] = useState({
    questions: {},
    answers: {},
  });
  const [userProfile, setUserProfile] = useState(null);
  const [isProfilePrivate, setIsProfilePrivate] = useState(false);

  // Update local state when selectedQues changes
  useEffect(() => {
    if (selectedQues) {
      setQuestionData((prevData) => ({
        ...selectedQues,
        votes: prevData?.votes || selectedQues.votes,
      }));
    }
  }, [selectedQues]);

  // Fetch user profile
  const fetchUserProfile = async (userId) => {
    if (!userId) return;

    try {
      const response = await axios.get(`${BACKEND_API_URL}/profile/${userId}`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      if (response.data && response.data.data) {
        setUserProfile(response.data.data);
        setIsProfilePrivate(false); // Reset private profile state
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setIsProfilePrivate(true); // Set private profile state
      } else {
        console.error("Error fetching user profile:", error);
      }
    }
  };
  const handleSaveEdit = async (editedContent) => {
    try {
      const response = await axios.put(
        `${BACKEND_API_URL}/answers/${editingAnswer.id}`,
        { content: editedContent.content },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      dispatch(updateAnswer(response.data.data));
      setEditingAnswer(null);
      setIsDialogOpen(false);
      SuccessToast("Answer updated successfully");
    } catch (error) {
      console.error("Error saving edited answer:", error);
      ErrorToast("Failed to update answer");
    }
  };

  useEffect(() => {
    if (questionData?.user?.id) {
      fetchUserProfile(questionData.user.id);
    }
  }, [questionData?.user?.id]);

  // Format createdAt time
  const formatCreatedAt = (createdAt) => {
    if (!createdAt) return "unknown time";
    try {
      const date = parseISO(createdAt);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "unknown time";
    }
  };

  // Handle answer submission
  const handleAnswerSubmit = async (content) => {
    try {
      const response = await axios.post(
        `${BACKEND_API_URL}/questions/${questionData?.id}/answers`,
        { content: typeof content === "string" ? content : "" },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (response.data && response.data.data) {
        dispatch(addAnswer(response.data.data));
        setEditorContent("");
        setIsEditorOpen(false);
        SuccessToast("Answer created successfully");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error answering question:", error);
      ErrorToast("Failed to create answer");
    }
  };

  // Handle editing an answer
  const handleEditAnswer = (ans) => {
    setEditingAnswer(ans);
    setIsDialogOpen(true);
  };

  // Handle deleting an answer
  const handleDeleteAnswer = (ansId) => {
    setAnswerToDelete(ansId);
    setIsDeleteDialogOpen(true);
  };

  // Confirm deletion of an answer
  const confirmDeleteAnswer = async () => {
    try {
      await axios.delete(`${BACKEND_API_URL}/answers/${answerToDelete}`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      dispatch(deleteAnswer(answerToDelete));
      setIsDeleteDialogOpen(false);
      SuccessToast("Answer deleted successfully");
    } catch (error) {
      console.error("Error deleting answer:", error);
      ErrorToast("Failed to delete answer");
    }
  };

  // Handle voting on an answer
  const handleVote = async (ansId, type) => {
    try {
      setVoteLoading(true);
      const response = await axios.post(
        `${BACKEND_API_URL}/vote`,
        { type, answerId: ansId },
        {
          withCredentials: true,
        }
      );
      if (response.data) {
        dispatch(updateVotes({ id: ansId, votes: response.data.data.votes }));
        setVotedItems((prev) => ({
          ...prev,
          answers: {
            ...prev.answers,
            [ansId]: type,
          },
        }));
        SuccessToast(
          `Vote ${type === "upvote" ? "up" : "downvote"} registered`
        );
      } else {
        throw new Error(response.data.message || "Invalid response format");
      }
    } catch (error) {
      console.error(
        `Error ${type === "upvote" ? "upvoting" : "downvoting"} answer:`,
        error
      );
      ErrorToast(
        `Failed to ${type === "upvote" ? "upvote" : "downvote"} answer: ${
          error.message
        }`
      );
    } finally {
      setVoteLoading(false);
    }
  };

  const upVote = (ansId) => handleVote(ansId, "upvote");
  const downVote = (ansId) => handleVote(ansId, "downvote");

  // Handle voting on a question
  const handleQuesVote = async (quesId, type) => {
    try {
      setVoteLoading(true);
      const originalVotes = { ...questionData.votes };
      const updatedVotes = {
        ...originalVotes,
        [type === "upvote" ? "upvotes" : "downvotes"]:
          originalVotes[type === "upvote" ? "upvotes" : "downvotes"] + 1,
      };
      setQuestionData((prevData) => ({
        ...prevData,
        votes: updatedVotes,
      }));
      dispatch(
        updateQuesVotes({
          id: quesId,
          votes: updatedVotes,
        })
      );
      const response = await axios.post(
        `${BACKEND_API_URL}/vote`,
        { type, questionId: quesId },
        {
          withCredentials: true,
        }
      );
      if (response.data && response.data.data) {
        const { votes } = response.data.data;
        setQuestionData((prevData) => ({
          ...prevData,
          votes: votes,
        }));
        dispatch(
          updateQuesVotes({
            id: quesId,
            votes: votes,
          })
        );
        setVotedItems((prev) => ({
          ...prev,
          questions: {
            ...prev.questions,
            [quesId]: type,
          },
        }));
        SuccessToast(
          `Vote ${type === "upvote" ? "up" : "downvote"} registered`
        );
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      setQuestionData((prevData) => ({
        ...prevData,
        votes: selectedQues?.votes || { upvotes: 0, downvotes: 0 },
      }));
      if (selectedQues) {
        dispatch(
          updateQuesVotes({
            id: quesId,
            votes: selectedQues.votes,
          })
        );
      }
      if (error.response && error.response.status === 403) {
        ErrorToast("You can't vote on your own question");
      } else if (error.response && error.response.status === 404) {
        ErrorToast("Question not found");
      } else if (error.response && error.response.status === 400) {
        ErrorToast("Invalid request");
      } else {
        console.error(
          `Error ${type === "upvote" ? "upvoting" : "downvoting"} question:`,
          error
        );
        ErrorToast(
          `Failed to ${type === "upvote" ? "upvote" : "downvote"} question: ${
            error.message || "Unknown error"
          }`
        );
      }
    } finally {
      setVoteLoading(false);
    }
  };

  const upVoteQues = (quesId) => handleQuesVote(quesId, "upvote");
  const downVoteQues = (quesId) => handleQuesVote(quesId, "downvote");

  // Check if user has already voted on a question
  const hasVotedOnQuestion = (quesId) => {
    return votedItems.questions[quesId] !== undefined;
  };

  // Check if user has already voted on an answer
  const hasVotedOnAnswer = (ansId) => {
    return votedItems.answers[ansId] !== undefined;
  };

  // Add periodic sync with server for background updates
  useEffect(() => {
    if (questionData?.id) {
      const fetchUpdatedQuestion = async () => {
        try {
          const response = await axios.get(
            `${BACKEND_API_URL}/questions/${questionData.id}`,
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          );
          if (response.data && response.data.data) {
            const serverQuestion = response.data.data;
            if (
              JSON.stringify(serverQuestion.votes) !==
              JSON.stringify(questionData.votes)
            ) {
              setQuestionData((prevData) => ({
                ...prevData,
                votes: serverQuestion.votes,
              }));
              dispatch(
                updateQuesVotes({
                  id: serverQuestion.id,
                  votes: serverQuestion.votes,
                })
              );
            }
          }
        } catch (error) {
          console.error("Error fetching updated question:", error);
        }
      };

      // Only sync occasionally to avoid unnecessary requests
      const syncInterval = setInterval(fetchUpdatedQuestion, 60000); // Once per minute
      return () => clearInterval(syncInterval);
    }
  }, [questionData?.id, dispatch]);

  const options = {
    replace: ({ name, children, attribs }) => {
      if (name === "code") {
        const codeString = domToReact(children);
        const language = "code";
        return <CodeBlock codeString={codeString} language={language} />;
      }
      if (name === "ul") {
        return <ul className="list-disc pl-5">{domToReact(children)}</ul>;
      }
      if (name === "ol") {
        return <ol className="list-decimal pl-5">{domToReact(children)}</ol>;
      }
      if (name === "li") {
        return <li>{domToReact(children)}</li>;
      }
      if (name === "blockquote") {
        return (
          <blockquote className="border-l-4 border-slate-400 pl-4 italic text-slate-300">
            {domToReact(children)}
          </blockquote>
        );
      }
      if (name === "img" && attribs?.src) {
        return (
          <ImageBlock
            src={attribs.src || "/placeholder.svg"}
            alt={attribs.alt || "Image"}
          />
        );
      }
      if (name === "a" && attribs?.href) {
        return (
          <a
            href={attribs.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            {domToReact(children)}
          </a>
        );
      }
    },
  };

  const Preview = ({ content }) => (
    <div>
      <div className="mycontent font-normal whitespace-pre-wrap text-sm">
        {typeof content === "string" ? parse(content, options) : ""}
      </div>
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8 h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Welcome to BugBee
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-base text-muted-foreground">
              Please log in or sign up to view question
            </p>
            <div className="flex justify-center">
              <SignIn />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col">
        <div className="flex items-center p-2">
          <div className="flex items-center gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-full" />
            ))}
          </div>
        </div>
        <Separator />
        <ScrollArea className="flex-1">
          <div className="flex flex-col p-4">
            <div className="sticky top-0 z-10 bg-background shadow-sm">
              <div className="flex items-start p-4">
                <div className="flex items-start gap-4 text-sm">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="grid gap-1">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-3 w-[200px]" />
                    <Skeleton className="h-3 w-[180px]" />
                  </div>
                </div>
                <Skeleton className="ml-auto h-3 w-[100px]" />
              </div>
              <Separator />
            </div>
            <Separator />
            <div className="mt-5 p-2 pr-10">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Separator className="mt-10" />
            <div className="mt-5">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-[150px]" />
              </div>
              <ScrollArea className="h-[500px] pr-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="mb-4">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-[100px] mb-1" />
                            <Skeleton className="h-3 w-[80px]" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                      <div className="mt-4 flex items-start justify-between">
                        <div className="w-[700px]">
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                        <div className="flex flex-col items-center">
                          <Skeleton className="h-10 w-10 rounded-full mb-2" />
                          <Skeleton className="h-4 w-6 mb-2" />
                          <Skeleton className="h-10 w-10 rounded-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </ScrollArea>
            </div>
          </div>
        </ScrollArea>
        <Skeleton className="fixed bottom-4 right-4 h-10 w-10 rounded-full" />
      </div>
    );
  }

  if (!selectedQues || !questionData) {
    return (
      <div className="flex justify-center items-center h-screen w-full text-muted-foreground">
        No question selected
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-full w-full flex-col">
        <div className="hidden md:flex items-center ">
          <div className="flex items-center gap-2 xl:p-7 "></div>
        </div>
        <Separator className="hidden xl:flex" />
        <ScrollArea className="flex w-full">
          <div className="flex flex-col p-2 md:p-4">
            <div className="bg-background shadow-sm">
              <div className="flex flex-row items-start gap-4">
                {/* Left side - Vote buttons */}
                <div className="flex flex-col items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => upVoteQues(questionData?.id)}
                    className="text-muted-foreground hover:text-foreground rounded-full h-10"
                    disabled={
                      isVoteLoading || hasVotedOnQuestion(questionData?.id)
                    }
                  >
                    <ChevronUp className="w-4" />
                  </Button>
                  <span className="text-sm font-medium mt-2 mb-2">
                    {questionData?.votes?.upvotes}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downVoteQues(questionData?.id)}
                    className="text-muted-foreground hover:text-foreground rounded-full h-10"
                    disabled={
                      isVoteLoading || hasVotedOnQuestion(questionData?.id)
                    }
                  >
                    <ChevronDown className="w-4" />
                  </Button>
                </div>

                {/* Middle - Question content */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-lg mb-2">
                    {questionData?.title}
                  </div>
                  <div className="mycontent font-normal text-sm break-words whitespace-normal overflow-wrap-anywhere">
                    {questionData?.content &&
                    typeof questionData.content === "string"
                      ? parse(questionData.content, options)
                      : ""}
                  </div>
                </div>

                {/* Right side - User info and timestamp */}
                <div className="flex flex-col items-end min-w-[100px] border-l border-slate-400 pl-4">
                  <div className="text-xs font-normal text-muted-foreground mt-auto">
                    asked{" "}
                    {questionData?.createdAt
                      ? formatCreatedAt(questionData.createdAt)
                      : "recently"}
                  </div>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="flex items-center gap-2 mt-2">
                        <Link
                          to={
                            isProfilePrivate
                              ? "#"
                              : `/profile/${questionData.user?.id || "unknown"}`
                          }
                          onClick={(e) => {
                            if (isProfilePrivate) {
                              e.preventDefault(); // Prevent redirection
                              ErrorToast("This profile is private."); // Show toast notification
                            }
                          }}
                        >
                          <Avatar>
                            <AvatarImage
                              src={questionData.user?.picture}
                              alt={questionData.user?.name || "Unknown user"}
                            />
                            <AvatarFallback>
                              {questionData.user?.name
                                ?.split(" ")
                                ?.map((chunk) => chunk[0])
                                ?.join("") || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="text-sm text-left hidden md:flex">
                          {questionData.user?.name || "Unknown user"}
                        </div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="flex justify-start space-x-4">
                        <Avatar>
                          <AvatarImage
                            src={
                              userProfile?.picture || questionData.user?.picture
                            }
                            alt={
                              userProfile?.name ||
                              questionData.user?.name ||
                              "Unknown user"
                            }
                          />
                          <AvatarFallback>
                            {userProfile?.name
                              ?.split(" ")
                              ?.map((chunk) => chunk[0])
                              ?.join("") || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold">
                            {userProfile?.name ||
                              questionData.user?.name ||
                              "Unknown user"}
                          </h4>
                          {isProfilePrivate ? (
                            <p className="text-sm text-muted-foreground">
                              This profile is private.
                            </p>
                          ) : (
                            <>
                              <p className="text-sm font-light">
                                {userProfile?.about || "No bio available"}
                              </p>
                              <p className="text-sm font-light">
                                Question Asked :{" "}
                                {userProfile?.questionsAsked || "0"}{" "}
                              </p>
                              <p className="text-sm font-light">
                                Question Answered :{" "}
                                {userProfile?.answersProvided || "0"}{" "}
                              </p>
                              <div className="flex items-center pt-2">
                                <span className="text-xs text-muted-foreground">
                                  Joined{" "}
                                  {formatCreatedAt(userProfile?.createdAt)}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </div>
              <Separator className="mt-4" />
            </div>
            <Separator />
            <div className="mt-5">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-xl font-semibold">
                  {answers.length} Answer{answers.length !== 1 ? "s" : ""}
                </Label>
              </div>
              <div className="pr-4">
                {loadingAnswers ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin">
                      <Loader2 className="w-10 h-10 text-primary" />
                    </div>
                  </div>
                ) : (
                  answers.map((ans) => (
                    <Card key={ans.id} className="mb-4">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage
                                src={ans.user?.picture}
                                alt={ans.user?.name}
                              />
                              <AvatarFallback>
                                {ans.user?.name
                                  ?.split(" ")
                                  ?.map((chunk) => chunk[0])
                                  ?.join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-sm">
                                {ans.user?.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {ans?.updatedAt
                                  ? formatCreatedAt(ans.updatedAt)
                                  : "recently"}
                              </div>
                            </div>
                          </div>
                          {ans.userId === isLoggedIn.id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onClick={() => handleEditAnswer(ans)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteAnswer(ans.id)}
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>

                        <div className="mt-4 flex items-start justify-between">
                          <div className="mycontent mt-4 text-base w-[700px]">
                            {typeof ans.content === "string"
                              ? parse(ans.content, options)
                              : ""}
                          </div>
                          {ans.userId !== isLoggedIn.id ? (
                            <div className="flex flex-col items-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => upVote(ans.id)}
                                className="text-muted-foreground hover:text-foreground rounded-full h-10"
                                disabled={
                                  isVoteLoading || hasVotedOnAnswer(ans.id)
                                }
                              >
                                <ChevronUp className="w-4" />
                              </Button>
                              <span className="text-sm font-medium mt-2 mb-2">
                                {ans?.votes?.upvotes}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downVote(ans.id)}
                                className="text-muted-foreground hover:text-foreground rounded-full h-10"
                                disabled={
                                  isVoteLoading || hasVotedOnAnswer(ans.id)
                                }
                              >
                                <ChevronDown className="w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-muted-foreground hover:bg-transparent rounded-full h-10 cursor-default"
                              >
                                <div className="w-4" />
                              </Button>
                              <span className="text-sm font-medium mt-2 mb-2"></span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-muted-foreground hover:bg-transparent rounded-full h-10 cursor-default"
                              >
                                <div className="w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {isLoggedIn.id !== selectedQues.userId && (
          <AlertDialog
            open={isEditorOpen}
            onOpenChange={setIsEditorOpen}
            className="overflow-hidden"
          >
            <AlertDialogTrigger asChild className="overflow-hidden">
              <Button className="fixed bottom-4 right-4 rounded-lg">
                Answer this question <MessageSquare className="ml-2 h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-[900px] max-w-[95vw] overflow-hidden">
              <AlertDialogHeader>
                <AlertDialogTitle>Answer this question</AlertDialogTitle>
              </AlertDialogHeader>
              <div className="max-w-[900px] max-h-[85vh] flex flex-col overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                <EditorComponent
                  initialContent={editorContent}
                  onSubmit={handleAnswerSubmit}
                  onCancel={() => setIsEditorOpen(false)}
                />
              </div>
            </AlertDialogContent>
          </AlertDialog>
        )}

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this answer. This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteAnswer}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <EditorDialogWithoutTitle
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title="Edit Answer"
          description="Edit your answer here. Click save when you're done."
          initialContent={
            editingAnswer
              ? {
                  content: editingAnswer.content,
                }
              : { content: "" }
          }
          user={editingAnswer?.user}
          updatedAt={editingAnswer?.updatedAt}
          onSave={handleSaveEdit}
          showPreview={true}
          previewComponent={Preview}
          contentComponent={Tiptap}
        />
      </div>
    </TooltipProvider>
  );
}
