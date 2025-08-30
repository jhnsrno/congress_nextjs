"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "",
  });
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: "",
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setSuccess(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage("Profile updated successfully!");
        setSuccess(true);
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to update profile");
        setSuccess(false);
      }
    } catch (error) {
      setMessage("Something went wrong");
      setSuccess(false);
    }
  };

  if (!user) return <p>Loading...</p>;

  // Avatar fallback initials
  const initials = `${formData.first_name?.[0] || ""}${formData.last_name?.[0] || ""}`.toUpperCase();

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <Card className="shadow-xl border border-gray-200">
        <CardHeader className="flex flex-col items-center space-y-3">
          <Avatar className="h-20 w-20 text-xl">
            <AvatarFallback>{initials || "U"}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <CardTitle className="text-2xl font-bold">
              {formData.first_name} {formData.last_name}
            </CardTitle>
            <CardDescription>
              Manage your personal details and account settings.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {message && (
            <Alert
              className={`mb-6 ${
                success
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-red-100 text-red-800 border-red-300"
              }`}
            >
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
              />
            </div>

            {/* Email - readonly */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter first name"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter last name"
              />
            </div>

            {/* Password */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
              />
            </div>

            {/* Role - readonly */}
            <div className="space-y-2 md:col-span-2">
              <Label>Role</Label>
              <p className="text-sm font-medium px-3 py-2 bg-gray-100 rounded-md border text-gray-700">
                {formData.role}
              </p>
            </div>
          </form>
        </CardContent>

        <CardFooter>
          <Button type="submit" onClick={handleSubmit} className="w-full md:w-auto">
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
