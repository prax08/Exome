"use client";

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "@/contexts/SessionContext";
import { Loading } from "@/components/Loading";
import { Card, CardTitle, CardDescription } from "@/components/Card";

interface ProtectedRouteProps {
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRoles }) => {
  const { user, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading count={5} className="w-64" />
      </div>
    );
  }

  if (!user) {
    // User is not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // If roles are required, check if the user has any of them
  if (requiredRoles && requiredRoles.length > 0) {
    // Assuming user role is stored in user_metadata or fetched from profiles table
    // For this example, we'll fetch the role from the profiles table
    // In a real app, you might store this in session or user_metadata after login
    // For now, we'll assume a simple check.
    // A more robust solution would involve fetching the profile role here or
    // ensuring it's part of the `useSession` context.
    // For demonstration, we'll assume `user.user_metadata.role` for simplicity,
    // but ideally, you'd fetch it from the `profiles` table.
    const userRole = user.user_metadata?.role || 'user'; // Default to 'user' if not set

    if (!requiredRoles.includes(userRole)) {
      // User does not have the required role, redirect to a forbidden page or home
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md text-center p-6">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription className="mt-2">You do not have permission to view this page.</CardDescription>
          </Card>
        </div>
      );
    }
  }

  // User is authenticated and has required roles (if any), render the child routes
  return <Outlet />;
};

export { ProtectedRoute };