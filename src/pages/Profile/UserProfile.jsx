import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/redux/auth/authSlice";
import {
  BACKEND_API_URL,
  GITHUB_IMAGE,
  INTERNET_IMAGE,
  LINKEDIN_IMAGE,
  TWITTER_IMAGE,
} from "@/constant";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import parse from "html-react-parser";
import { ContributionChart } from "./ContributionChart";
import SignIn from "@/components/auth/SignIn";
import SuccessToast from "@/components/Toast/SuccessToast";
import ErrorToast from "@/components/Toast/ErrorToast";

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

export default function UserProfile() {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.auth.user);
  const [editedProfile, setEditedProfile] = useState({
    name: user?.name || "",
    location: user?.location || "",
    portfolioUrl: user?.portfolioUrl || "",
    twitterUrl: user?.twitterUrl || "",
    githubUrl: user?.githubUrl || "",
    linkedinUrl: user?.linkedinUrl || "",
    about: user?.about || "",
    isPublic: user?.isPublic || false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await axios.get(BACKEND_API_URL + "/profile", {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        dispatch(setUser(response.data.data));
        setEditedProfile(response.data.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to fetch profile. Please try again.");
      }
    }
    fetchProfile();
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({ ...prev, [name]: value }));
  };

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      const allowedFields = [
        "name",
        "location",
        "portfolioUrl",
        "twitterUrl",
        "githubUrl",
        "linkedinUrl",
        "about",
        "isPublic",
      ];
      const filteredProfile = Object.fromEntries(
        Object.entries(editedProfile).filter(([key]) =>
          allowedFields.includes(key)
        )
      );
      const response = await axios.patch(
        BACKEND_API_URL + "/profile",
        filteredProfile,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      dispatch(setUser(response.data.data));
      SuccessToast("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      ErrorToast("Failed to save profile. Please try again.");
      console.error("Error saving profile:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("Failed to save profile. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const renderSocialLink = (url, imgurl, label) => {
    return url ? (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-primary hover:text-primary/80"
      >
        <img
          src={imgurl || "/placeholder.svg"}
          alt={label}
          className="w-5 h-5 "
        />
        <span className="text-sm font-medium">{label}</span>
      </a>
    ) : null;
  };

  const handleTogglePublic = async (checked) => {
    setIsSaving(true);
    try {
      const response = await axios.patch(
        BACKEND_API_URL + "/profile",
        { isPublic: checked },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      dispatch(setUser(response.data.data));
      setEditedProfile((prev) => ({ ...prev, isPublic: checked }));
    } catch (error) {
      console.error("Error updating profile visibility:", error);
      setError("Failed to update profile visibility. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Welcome to BugBee
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Please log in or sign up to view and manage your profile.
            </p>
            <div className="flex justify-center">
              <SignIn />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ScrollArea className="h-screen w-full">
      <div className="w-full p-2 sm:h-[125vh] md:h-[100vh] lg:h-[100vh] xl:h-[100vh] animate-in fade-in duration-700">
        <Card className="mb-8 overflow-hidden">
          <CardHeader className="p-6 sm:p-8  bg-muted-foreground">
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
                  <div className="flex items-center justify-center sm:justify-end space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isPublic"
                        checked={editedProfile.isPublic}
                        onCheckedChange={handleTogglePublic}
                        disabled={isSaving}
                      />
                      <Label
                        htmlFor="isPublic"
                        className="text-sm text-background/80"
                      >
                        {editedProfile.isPublic ? "Public" : "Private"}
                      </Label>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => setIsEditing(!isEditing)}
                      disabled={isSaving}
                    >
                      {isEditing ? "Cancel" : "Edit Profile"}
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                  <Badge variant="secondary" className="text-xs">
                    Member for {user?.accountAge} days
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

        {isEditing && (
          <div className="mt-8 animate-in slide-in-from-top duration-300">
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Display Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={editedProfile.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={editedProfile.location}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Social Links</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        "portfolioUrl",
                        "twitterUrl",
                        "githubUrl",
                        "linkedinUrl",
                      ].map((field) => (
                        <div key={field} className="space-y-2">
                          <Label htmlFor={field}>
                            {field === "portfolioUrl"
                              ? "Portfolio URL"
                              : field.replace("Url", " URL")}
                          </Label>
                          <Input
                            id={field}
                            name={field}
                            value={editedProfile[field]}
                            onChange={handleInputChange}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="about">Bio</Label>
                    <Textarea
                      id="about"
                      name="about"
                      value={stripHtml(editedProfile.about)}
                      onChange={handleInputChange}
                      rows={6}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {!isEditing && (
          <>
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
                      <dt className="font-medium">Account Age:</dt>
                      <dd>{user?.accountAge} days</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Location:</dt>
                      <dd>{user?.location}</dd>
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
                    {parse(user?.about || "")}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="animate-in fade-in mt-8 slide-in-from-bottom duration-700 delay-300">
              <ContributionChart activityData={activityData} />
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
}
