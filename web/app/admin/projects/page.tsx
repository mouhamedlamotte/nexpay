// app/app/organizations/page.tsx
"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { EditProjectDialog } from "@/components/projects/edit-project-dialog";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api/projects";
import { Project } from "@/lib/types";
import { ProjectList } from "@/components/projects/project.list";
import { useAuthStore } from "../(dashboard)/stores/auth/auth-store";

export default function OrganizationsPage() {
  const user = useAuthStore((state) => state.user);
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [editProject, setEditProject] = useState<Project | null>(null)
    const [deleteProject, setDeleteProject] = useState<Project | null>(null)


  const { data, isLoading, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsApi.getAll(),
  })
  return (
    <>
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="md:flex items-center justify-between mb-6">
        <div className="max-w-lg mb-8">
          <h2 className="text-3xl font-medium text-balance">
            Bonjour {user?.firstName}
          </h2>
          <p className="text-muted-foreground text-pretty">
            Voici la liste de vos project
          </p>
        </div>
          <Button className=""
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Nouveau project
          </Button>
      </div>

      <ProjectList data={data?.data || []} isLoading={isLoading} setCreateDialogOpen={setCreateDialogOpen} setDeleteProject={setDeleteProject} setEditProject={setEditProject} />
    </div>
          {/* Dialogs */}
          <CreateProjectDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onSuccess={() => {
              refetch()
              setCreateDialogOpen(false)
            }}
          />
          {editProject && (
            <EditProjectDialog
              project={editProject}
              open={!!editProject}
              onOpenChange={(open) => !open && setEditProject(null)}
              onSuccess={() => {
                refetch()
                setEditProject(null)
              }}
            />
          )}
          {deleteProject && (
            <DeleteProjectDialog
              project={deleteProject}
              open={!!deleteProject}
              onOpenChange={(open) => !open && setDeleteProject(null)}
              onSuccess={() => {
                refetch()
                setDeleteProject(null)
              }}
            />
          )}
    </>
  );
}
