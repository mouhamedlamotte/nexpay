"use client";

import { use, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, MoreVertical, Pencil, Eye, Trash, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

import { formatDate } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { User, UsersApi } from "@/lib/api/users.query";
import { CreateUserDialog } from "@/features/users/components/create-user-dialog";
import { EditUserDialog } from "@/features/users/components/edit-user-dialog";
import { ViewUserDialog } from "@/features/users/components/view-user-dialog";
import { DeleteUserDialog } from "@/features/users/components/delete-user-dialog";
import { useAuthStore } from "../stores/auth/auth-store";

export default function UsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const currentUserId = useAuthStore((state) => state.user?.id);
  const isSuperUser = useAuthStore((state) => state.user?.isSuperUser);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["users", page],
    queryFn: () => UsersApi.getAll({ page, limit: 10 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => UsersApi.delete(id),
    onSuccess: () => {
      toast.warning("User deleted successfully");
      setDeleteUser(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete user");
    },
  });

  const handleDeleteUser = () => {
    if (deleteUser) {
      deleteMutation.mutate(deleteUser.id);
    }
  };

  const handleEditClick = (user: User) => {
    if (user.id === currentUserId) {
      router.push("/admin/settings");
    } else if (isSuperUser) {
      setEditUser(user);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage your users and their access
            </p>
          </div>
          {isSuperUser && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New User
            </Button>
          )}
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((user) => {
                  const isCurrentUser = user.id === currentUserId;
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                        {isCurrentUser && (
                          <Badge variant="secondary" className="ml-2">
                            You
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {user.email}
                        {user.deletedAt &&
                          (() => {
                            try {
                              const deletedAt = new Date(user.deletedAt);
                              if (isNaN(deletedAt.getTime())) {
                                throw new Error("Invalid date");
                              }

                              // Suppression définitive après 30 jours
                              const permanentDeletionDate = new Date(
                                deletedAt.getTime() + 30 * 24 * 60 * 60 * 1000
                              );
                              const now = new Date();

                              const diffMs =
                                permanentDeletionDate.getTime() - now.getTime();
                              const diffDays = Math.ceil(
                                diffMs / (1000 * 60 * 60 * 24)
                              );

                              // Si déjà expiré
                              if (diffDays <= 0) {
                                return (
                                  <p className="text-xs text-destructive">
                                    ⚠️ Ce compte est en attente de suppression
                                    définitive
                                  </p>
                                );
                              }

                              return (
                                <p className="text-xs text-destructive">
                                  Va être définitivement supprimé dans{" "}
                                  {diffDays} jour{diffDays > 1 ? "s" : ""}
                                </p>
                              );
                            } catch {
                              return null;
                            }
                          })()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isSuperUser ? "default" : "outline"}
                        >
                          {user.isSuperUser ? "Super User" : "User"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isActive ? "default" : "secondary"}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt, "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        {isCurrentUser ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/admin/settings")}
                          >
                            <UserIcon className="h-4 w-4" />
                          </Button>
                        ) : isSuperUser ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setViewUser(user)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditClick(user)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              {!user.deletedAt && (
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => setDeleteUser(user)}
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>

        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {data.pagination.currentPage} of {data.pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data.pagination.hasPreviousPage}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.pagination.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {isSuperUser && (
        <CreateUserDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={() => {
            refetch();
            setCreateDialogOpen(false);
            toast.success("User created successfully");
          }}
        />
      )}
      {editUser && isSuperUser && (
        <EditUserDialog
          user={editUser}
          open={!!editUser}
          onOpenChange={(open) => !open && setEditUser(null)}
          onSuccess={() => {
            refetch();
            setEditUser(null);
          }}
        />
      )}
      {viewUser && isSuperUser && (
        <ViewUserDialog
          user={viewUser}
          open={!!viewUser}
          onOpenChange={(open) => !open && setViewUser(null)}
        />
      )}
      {deleteUser && (
        <DeleteUserDialog
          userName={`${deleteUser.firstName} ${deleteUser.lastName}`}
          open={!!deleteUser}
          onOpenChange={(open) => !open && setDeleteUser(null)}
          onConfirm={handleDeleteUser}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
