"use client";

import { Building2, Plus, Users, MoreHorizontal, LogOut, Trash, Star, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import Link from "next/link";
import { Project } from "@/lib/types";
import { useProjectStore } from "@/stores/project.store";
import { Dispatch } from "react";

interface ProjectListProps {
  data: Project[];
  isLoading: boolean;
  setCreateDialogOpen: Dispatch<boolean>;
  setDeleteProject: Dispatch<Project>;
  setEditProject: Dispatch<Project>;
}



export function ProjectList({data, isLoading, setDeleteProject, setEditProject, setCreateDialogOpen}: ProjectListProps) {

  const setCurrentProject = useProjectStore(
    (state) => state.setCurrentProject,
  );
  const currentProjectId = useProjectStore(
    (state) => state.currentProject?.id,
  )
    const handleProjectChange = (project: Project) => {
        setCurrentProject(project);
        window.location.href = '/admin';
    };

  return (
    <div className="space-y-4">
      <span className="text-xl font-bold inline-flex items-center gap-2">
        Mes Projects{" "}
        {data?.length !== 0 && <Badge>{data?.length}</Badge>}
      </span>
      <div className="grid grid-cols-1 gap-6">
        {data?.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg inline-flex items-center gap-2">
                      {project.name}
                      {project.id === currentProjectId && (
                          <Star className="h-4 w-4 text-yellow-500" />
                      )}
                    </CardTitle>
                    <CardDescription>{project.name}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">

              <Button onClick={() => handleProjectChange(project)} size="sm" >
                <span>Accéder</span>
              </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="cursor-pointer"
                      onClick={() => setEditProject(project)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Modier
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer"
                    variant="destructive"
                      onClick={() => setDeleteProject(project)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {data.length === 0 && !isLoading && (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Aucun Projet trouvée
            </h3>
            <p className="text-muted-foreground mb-4">
              Commencez par créer votre premièr Projet
            </p>
              <Button
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Nouveau Projet
              </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
