import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  BACKEND_API_URL,
  GITHUB_IMAGE,
  INTERNET_IMAGE,
  LINKEDIN_IMAGE,
  TWITTER_IMAGE,
} from "@/constant";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import parse from "html-react-parser";
import { ContributionChart } from "../Profile/ContributionChart";

// Mock activity data for the contribution chart
const activityData = {
  "2024-10-15": 53,
  "2024-10-16": 25,
  "2024-10-17": 20,
  "2024-09-01": 10,
  "2024-09-02": 40,
  "2024-08-15": 60,
  "2024-08-16": 60,
  "2024-03-16": 60,
  "2025-01-01": 1,
};

// Component to render social links
const renderSocialLink = (url, imgurl, label) => {
  return url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-primary hover:text-primary/80"
    >
      <img src={imgurl || "/placeholder.svg"} alt={label} className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </a>
  ) : null;
};

// Main Profile Component
export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${BACKEND_API_URL}/profile/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        setUser(response.data.data); // Set user data from the response
      } catch (error) {
        if (error.response && error.response.status === 403) {
          setError("This profile is private.");
        } else {
          console.error("Error fetching profile:", error);
          setError("Failed to fetch profile data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  // Show error message if fetching fails or profile is private
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <ScrollArea className="h-screen w-full">
      <div className="w-full p-2 sm:h-[125vh] md:h-[100vh] lg:h-[100vh] xl:h-[100vh] animate-in fade-in duration-700">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>

        {/* Profile Header Card */}
        <Card className="mb-8 overflow-hidden">
          <CardHeader className="p-6 sm:p-8 bg-muted-foreground">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="animate-in zoom-in duration-700">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-background">
                  <AvatarImage src={user?.picture} alt={user?.name} />
                  <AvatarFallback>
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-background">
                      {user?.name}
                    </h1>
                    <p className="text-lg text-background/80">{user?.role}</p>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                  <Badge variant="secondary" className="text-xs">
                    Member since{" "}
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-wrap justify-center sm:justify-start gap-6">
              {renderSocialLink(user?.linkedinUrl, LINKEDIN_IMAGE, "LinkedIn")}
              {renderSocialLink(user?.githubUrl, GITHUB_IMAGE, "GitHub")}
              {renderSocialLink(user?.twitterUrl, TWITTER_IMAGE, "Twitter")}
              {renderSocialLink(
                user?.portfolioUrl,
                INTERNET_IMAGE,
                "Portfolio"
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats and About Section */}
        <div className="grid gap-6 md:grid-cols-2 mt-0 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="font-medium">Questions Asked:</dt>
                  <dd>{user?.questionsAsked}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium">Answers Provided:</dt>
                  <dd>{user?.answersProvided}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium">Location:</dt>
                  <dd>{user?.location || "Not specified"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {parse(user?.about || "No description provided.")}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contribution Chart */}
        <div className="animate-in fade-in mt-8 slide-in-from-bottom duration-700 delay-300">
          <ContributionChart activityData={activityData} />
        </div>
      </div>
    </ScrollArea>
  );
}
