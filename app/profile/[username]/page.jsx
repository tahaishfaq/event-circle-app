"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventCard from "../../../components/events/EventCard";
import { Users, Calendar, Settings, UserPlus, UserMinus } from "lucide-react";


export default function ProfilePage() {
  const router = useRouter();
  const { username } = useParams();
  console.log("Username from search params:", username);
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch user profile and events
   */
  const fetchUserProfile = useCallback(async () => {
    if (!username) return;

    setLoading(true);
    setError(null);

    try {
      const [userResponse, eventsResponse] = await Promise.all([
        axios.get(`/api/users/${username}`),
        axios.get(`/api/users/${username}/events`),
      ]);

      console.log("User Response:", userResponse.data);
      console.log("Events Response:", eventsResponse.data);

      setUser(userResponse.data);
      setUserEvents(eventsResponse.data || []);
      setFollowers(userResponse.data.followers || []);
      setFollowing(userResponse.data.following || []);

      if (session?.user?.id) {
        setIsFollowing(
          userResponse.data.followers?.some(
            (follower) => follower._id === session.user.id
          )
        );
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError("Failed to load profile. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [username]);

  /**
   * Handle follow/unfollow action
   */
  const handleFollow = useCallback(async () => {
    if (!session) {
      alert("Please login to follow users");
      router.push("/login");
      return;
    }

    try {
      if (isFollowing) {
        await axios.post(`/api/users/${username}/unfollow`);
        setIsFollowing(false);
        setFollowers((prev) =>
          prev.filter((f) => f._id !== session.user.id)
        );
      } else {
        await axios.post(`/api/users/${username}/follow`);
        setIsFollowing(true);
        setFollowers((prev) => [
          ...prev,
          { _id: session.user.id, fullName: session.user.fullName },
        ]);
      }
    } catch (err) {
      console.error("Error following/unfollowing user:", err);
      alert("Failed to update follow status");
    }
  }, [isFollowing, username, router]);

  // Fetch profile when username or session changes
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
          role="status"
          aria-label="Loading profile"
        ></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || "User Not Found"}
            </h1>
            <p className="text-gray-600 mb-4">
              {error
                ? "An error occurred while loading the profile."
                : "The user you're looking for doesn't exist."}
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwnProfile = session?.user?.username === username;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-32 w-32">
                <AvatarImage
                  src={user.profilePicture || "/placeholder.svg"}
                  alt={`${user.fullName}'s profile picture`}
                />
                <AvatarFallback className="text-2xl">
                  {user.fullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {user.fullName}
                </h1>
                <p className="text-gray-600 mb-4">@{user.username}</p>

                <div className="flex justify-center md:justify-start space-x-6 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {userEvents.length}
                    </div>
                    <div className="text-sm text-gray-600">Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {followers.length}
                    </div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {following.length}
                    </div>
                    <div className="text-sm text-gray-600">Following</div>
                  </div>
                </div>

                <div className="flex justify-center md:justify-start space-x-4">
                  {isOwnProfile ? (
                    <Button
                      onClick={() => router.push("/settings")}
                      aria-label="Edit profile"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <Button
                      onClick={handleFollow}
                      aria-label={isFollowing ? "Unfollow user" : "Follow user"}
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="mt-6">
            {userEvents.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar
                    className="h-12 w-12 text-gray-400 mx-auto mb-4"
                    aria-hidden="true"
                  />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No events yet
                  </h3>
                  <p className="text-gray-600">
                    {isOwnProfile
                      ? "You haven't created any events yet. Create your first event!"
                      : `${user.fullName} hasn't created any events yet.`}
                  </p>
                  {isOwnProfile && (
                    <Button
                      className="mt-4"
                      onClick={() => router.push("/events/create")}
                    >
                      Create Event
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userEvents.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="followers" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Followers ({followers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {followers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users
                      className="h-12 w-12 text-gray-400 mx-auto mb-4"
                      aria-hidden="true"
                    />
                    <p className="text-gray-600">No followers yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {followers.map((follower) => (
                      <div
                        key={follower._id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={follower.profilePicture || "/placeholder.svg"}
                              alt={`${follower.fullName}'s profile picture`}
                            />
                            <AvatarFallback>
                              {follower.fullName?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{follower.fullName}</p>
                            <p className="text-sm text-gray-600">
                              @{follower.username}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/profile/${follower.username}`)
                          }
                          aria-label={`View ${follower.fullName}'s profile`}
                        >
                          View Profile
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="following" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Following ({following.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {following.length === 0 ? (
                  <div className="text-center py-8">
                    <Users
                      className="h-12 w-12 text-gray-400 mx-auto mb-4"
                      aria-hidden="true"
                    />
                    <p className="text-gray-600">Not following anyone yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {following.map((followedUser) => (
                      <div
                        key={followedUser._id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={
                                followedUser.profilePicture || "/placeholder.svg"
                              }
                              alt={`${followedUser.fullName}'s profile picture`}
                            />
                            <AvatarFallback>
                              {followedUser.fullName?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {followedUser.fullName}
                            </p>
                            <p className="text-sm text-gray-600">
                              @{followedUser.username}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/profile/${followedUser.username}`
                            )
                          }
                          aria-label={`View ${followedUser.fullName}'s profile`}
                        >
                          View Profile
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}