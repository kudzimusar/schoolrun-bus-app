import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { UserButton, useUser as useClerkUser } from "@clerk/clerk-react";
import { useAuth0 } from "@auth0/auth0-react";

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
}

export default function Header({ title, children }: HeaderProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const clerkUser = useClerkUser?.();
  const auth0 = useAuth0?.();

  const handleLogout = async () => {
    await logout();
    toast({ title: "Logged out" });
  };

  return (
    <div className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        <div className="flex items-center gap-3">
          {children}
          {auth0 && (auth0.isLoading ? null : auth0.isAuthenticated ? (
            <Button variant="outline" onClick={() => auth0.logout({ logoutParams: { returnTo: window.location.origin } })}>
              Logout
            </Button>
          ) : auth0.loginWithRedirect ? (
            <Button onClick={() => auth0.loginWithRedirect()}>Login</Button>
          ) : null)}
          {!auth0?.isAuthenticated && clerkUser && clerkUser.isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : !auth0?.isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">{user?.name || "Account"}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
